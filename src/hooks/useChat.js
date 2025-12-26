import { useState, useCallback, useRef } from 'react';
import { chatAPI, specialistAPI, healthFeedAPI } from '../services/api.js';

export const useChat = (userId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [specialistRecommendation, setSpecialistRecommendation] = useState(null);
  const [extractedTopics, setExtractedTopics] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Helper function to build valid conversation context
  const buildConversationContext = (allMessages) => {
    // Filter out invalid messages and extract text
    const validMessages = allMessages
      .filter(msg => msg && msg.text && typeof msg.text === 'string' && msg.text.trim())
      .map(msg => msg.text.trim());
    
    if (validMessages.length === 0) {
      return '';
    }
    
    // Join with proper formatting
    const context = validMessages.join('. ');
    
    // Ensure minimum length
    if (context.length < 10) {
      console.warn('⚠️ Conversation context too short:', context);
      return validMessages[validMessages.length - 1] || '';
    }
    
    return context;
  };

  // Send text-only message - UPDATED WITH TIMEOUT HANDLING
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('📤 Sending message to backend...');
      
      // Send message to backend with timeout tracking
      const response = await chatAPI.sendMessage(messageText, currentConversationId);
      
      console.log('✅ Backend response received:', response.status);
      
      const { 
        conversationId, 
        aiMessage, 
        needsSpecialist,
        extractedTopics: aiExtractedTopics
      } = response.data.data;

      // Update conversation ID if this is a new conversation
      if (conversationId && !currentConversationId) {
        setCurrentConversationId(conversationId);
      }

      // Add AI response
      const aiMessageWithId = {
        ...aiMessage,
        id: (Date.now() + 1).toString()
      };
      
      console.log('🤖 Adding AI response to chat');
      setMessages(prev => [...prev, aiMessageWithId]);

      // Store extracted topics from backend
      if (aiExtractedTopics && aiExtractedTopics.length > 0) {
        console.log('📊 Extracted topics from backend:', aiExtractedTopics.length);
        setExtractedTopics(prev => [...prev, ...aiExtractedTopics]);
      }

      // SAVE topics to user's profile in database
      try {
        await healthFeedAPI.updateUserTopics(aiExtractedTopics, `From chat: ${messageText.substring(0, 50)}`);
        console.log('✅ Topics saved to user profile');
      } catch (saveError) {
        console.error('❌ Failed to save topics:', saveError);
      }

      // Check if specialist recommendation is needed
      if (needsSpecialist && !specialistRecommendation) {
        console.log('🩺 Getting specialist recommendations...');
        
        // Build proper conversation context
        const allMessages = [...messages, userMessage, aiMessageWithId];
        let conversationContext = buildConversationContext(allMessages);
        
        // Fallback if context is still empty
        if (!conversationContext || conversationContext.trim().length < 20) {
          conversationContext = `User: ${messageText}. Assistant: ${aiMessageWithId.text.substring(0, 200)}`;
        }
        
        console.log('📋 Conversation context length:', conversationContext.length);
        console.log('📄 First 150 chars:', conversationContext.substring(0, 150));
        
        try {
          const specialistResponse = await specialistAPI.getRecommendations({ 
            conversationContext: conversationContext 
          });
          
          setSpecialistRecommendation({
            triggered: true,
            specialists: specialistResponse.data.data.specialists,
            analysis: specialistResponse.data.data,
            conversationContext
          });
          console.log('✅ Specialist recommendations loaded');
        } catch (error) {
          console.error('❌ Failed to get specialist recommendations:', error);
          console.error('🔧 Error details:', error.response?.data);
          
          // Don't show error to user if specialists fail - it's optional
          console.log('ℹ️ Specialist recommendations are optional, continuing chat...');
        }
      }

      // Update conversation history
      const updatedConversation = [...messages, userMessage, aiMessageWithId];
      setConversationHistory(updatedConversation);

      console.log('🎉 Message flow completed successfully');

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      let errorText;
      
      // DETECT TIMEOUT SPECIFICALLY
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorText = "MediBot is taking longer than usual to respond. Your message has been received and I'm analyzing it now. Please wait a moment...";
      } else if (error.response?.status === 504 || error.response?.status === 502) {
        errorText = "MediBot is currently processing your request. This might take a moment due to high demand. Please wait...";
      } else {
        errorText = error.response?.data?.message || 
                   "I apologize, but I'm having trouble connecting to MediBot. Please check your internet connection and try again.";
      }
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        isError: true,
        isProcessing: error.code === 'ECONNABORTED' // Mark as processing if timeout
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // If it was a timeout, the actual response might still come later
      // We'll handle that separately if needed
      
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentConversationId, specialistRecommendation, userId]);

  // Send message with image - UPDATED
  const sendMessageWithImage = useCallback(async (messageText, imageFile) => {
    if (!imageFile) return;

    const tempImageUrl = URL.createObjectURL(imageFile);
    
    const userMessage = {
      id: Date.now().toString(),
      text: messageText || 'Image uploaded',
      isUser: true,
      timestamp: new Date(),
      hasImage: true,
      imageUrl: tempImageUrl
    };

    console.log('📸 Starting image upload process...');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', messageText || '');
      formData.append('image', imageFile);
      if (currentConversationId) {
        formData.append('conversationId', currentConversationId);
      }

      console.log('📤 Sending image to backend...');
      const response = await chatAPI.sendMessageWithImage(formData);
      console.log('✅ Image response received');
      
      const { 
        conversationId, 
        aiMessage,
        needsSpecialist,
        extractedTopics: imageTopics 
      } = response.data.data;

      if (conversationId && !currentConversationId) {
        setCurrentConversationId(conversationId);
      }

      const aiMessageWithId = {
        ...aiMessage,
        id: (Date.now() + 1).toString(),
        isImageAnalysis: true
      };
      
      setMessages(prev => [...prev, aiMessageWithId]);

      // Store topics from image analysis
      if (imageTopics && imageTopics.length > 0) {
        setExtractedTopics(prev => [...prev, ...imageTopics]);
      }

      // Get specialist recommendations for image analysis
      if (needsSpecialist && !specialistRecommendation) {
        // Build proper conversation context
        const allMessages = [...messages, userMessage, aiMessageWithId];
        let conversationContext = buildConversationContext(allMessages);
        
        // Fallback for image analysis
        if (!conversationContext || conversationContext.trim().length < 20) {
          conversationContext = `Image analysis: ${messageText || 'Medical image uploaded'}. ${aiMessageWithId.text.substring(0, 200)}`;
        }
        
        console.log('📷 Image conversation context length:', conversationContext.length);
        
        try {
          const specialistResponse = await specialistAPI.getRecommendations({ 
            conversationContext 
          });
          
          setSpecialistRecommendation({
            triggered: true,
            specialists: specialistResponse.data.data.specialists,
            analysis: specialistResponse.data.data,
            fromImage: true,
            conversationContext
          });
        } catch (error) {
          console.error('❌ Failed to get specialist recommendations from image:', error);
          console.error('🔧 Error details:', error.response?.data);
          console.log('ℹ️ Specialist recommendations are optional, continuing chat...');
        }
      }

      const updatedConversation = [...messages, userMessage, aiMessageWithId];
      setConversationHistory(updatedConversation);

    } catch (error) {
      console.error('❌ Error sending image message:', error);
      
      let errorText;
      
      // SPECIFIC TIMEOUT HANDLING FOR IMAGES
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorText = "Analyzing this image is taking longer than expected. Your image has been received and MediBot is processing it. Please wait...";
      } else if (error.response?.status === 413) {
        errorText = "The image is too large. Please upload an image smaller than 5MB.";
      } else if (error.response?.status === 415) {
        errorText = "Please upload a valid image file (JPEG, PNG, etc.).";
      } else {
        errorText = "I apologize, but I'm having trouble analyzing this image. Please try again or describe the issue in text.";
      }
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentConversationId, specialistRecommendation, userId]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setConversationHistory([]);
    setSpecialistRecommendation(null);
    setExtractedTopics([]);
    setCurrentConversationId(null);
  }, []);

  const loadChat = useCallback((chatMessages) => {
    setMessages(chatMessages);
    setConversationHistory(chatMessages);
  }, []);

  const clearRecommendation = useCallback(() => {
    setSpecialistRecommendation(null);
  }, []);

  return {
    messages,
    isLoading,
    specialistRecommendation,
    extractedTopics,
    sendMessage,
    sendMessageWithImage,
    startNewChat,
    loadChat,
    clearRecommendation,
    messagesEndRef,
    scrollToBottom
  };
};
