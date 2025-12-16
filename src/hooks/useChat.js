import { useState, useCallback, useRef } from 'react';
import { chatAPI, specialistAPI } from '../services/api.js';

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

      // Check if specialist recommendation is needed
      if (needsSpecialist && !specialistRecommendation) {
        console.log('🩺 Getting specialist recommendations...');
        const conversationContext = [...messages, userMessage, aiMessageWithId]
          .map(msg => msg.text)
          .join(' ');
          
        try {
          const specialistResponse = await specialistAPI.getRecommendations({ 
            conversationContext: conversationContext || ''
          });
          
          setSpecialistRecommendation({
            triggered: true,
            specialists: specialistResponse.data.data.specialists,
            analysis: specialistResponse.data.data,
            conversationContext
          });
          console.log('✅ Specialist recommendations loaded');
        } catch (error) {
          console.error('Failed to get specialist recommendations:', error);
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
        const conversationContext = [...messages, userMessage, aiMessageWithId]
          .map(msg => msg.text)
          .join(' ') || '';
        
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
          console.error('Failed to get specialist recommendations from image:', error);
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

  // REMOVED the extractTopicsFromConversation and updateUserHealthInterests functions
  // because your backend now handles this automatically

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
