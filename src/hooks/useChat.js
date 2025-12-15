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

  // Extract topics from conversation text
  const extractTopicsFromConversation = useCallback(async (conversationText) => {
    if (!conversationText?.trim() || !userId) return;
    
    try {
      // Call backend to extract topics (you need to create this endpoint)
      const response = await chatAPI.extractTopics({
        conversationText,
        userId
      });
      
      if (response.data.success && response.data.topics) {
        setExtractedTopics(prev => [...prev, ...response.data.topics]);
        return response.data.topics;
      }
    } catch (error) {
      console.error('Failed to extract topics:', error);
    }
    return [];
  }, [userId]);

  // Update user health interests based on topics
  const updateUserHealthInterests = useCallback(async (topics) => {
    if (!topics.length || !userId) return;
    
    try {
      await chatAPI.updateHealthInterests({
        userId,
        topics
      });
    } catch (error) {
      console.error('Failed to update health interests:', error);
    }
  }, [userId]);

  // Send text-only message
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
      // Send message to backend
      const response = await chatAPI.sendMessage(messageText, currentConversationId);
      const { 
        conversationId, 
        userMessage: savedUserMsg, 
        aiMessage, 
        needsSpecialist,
        extractedTopics: aiExtractedTopics // Backend should return this
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
      
      setMessages(prev => [...prev, aiMessageWithId]);

      // Store extracted topics from backend
      if (aiExtractedTopics && aiExtractedTopics.length > 0) {
        setExtractedTopics(prev => [...prev, ...aiExtractedTopics]);
        await updateUserHealthInterests(aiExtractedTopics);
      } else {
        // Fallback: Extract topics from conversation
        const conversationText = [...messages, userMessage, aiMessageWithId]
          .map(msg => msg.text)
          .join(' ');
        const topics = await extractTopicsFromConversation(conversationText);
        await updateUserHealthInterests(topics);
      }

      // Check if specialist recommendation is needed
      if (needsSpecialist && !specialistRecommendation) {
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
        } catch (error) {
          console.error('Failed to get specialist recommendations:', error);
        }
      }

      // Update conversation history
      const updatedConversation = [...messages, userMessage, aiMessageWithId];
      setConversationHistory(updatedConversation);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: error.response?.data?.message || 
              "I apologize, but I'm having trouble connecting to MediBot. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentConversationId, specialistRecommendation, userId, extractTopicsFromConversation, updateUserHealthInterests]);

  // Send message with image
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

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', messageText || '');
      formData.append('image', imageFile);
      if (currentConversationId) {
        formData.append('conversationId', currentConversationId);
      }

      const response = await chatAPI.sendMessageWithImage(formData);
      const { 
        conversationId, 
        aiMessage, 
        needsSpecialist,
        isImageAnalysis,
        extractedTopics: imageTopics 
      } = response.data.data;

      if (conversationId && !currentConversationId) {
        setCurrentConversationId(conversationId);
      }

      const aiMessageWithId = {
        ...aiMessage,
        id: (Date.now() + 1).toString(),
        isImageAnalysis: isImageAnalysis || true
      };
      
      setMessages(prev => [...prev, aiMessageWithId]);

      // Store topics from image analysis
      if (imageTopics && imageTopics.length > 0) {
        setExtractedTopics(prev => [...prev, ...imageTopics]);
        await updateUserHealthInterests(imageTopics);
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
      console.error('Error sending image message:', error);
      
      let errorText = "I apologize, but I'm having trouble analyzing this image. ";
      
      if (error.response?.status === 413) {
        errorText = "The image is too large. Please upload an image smaller than 5MB.";
      } else if (error.response?.status === 415) {
        errorText = "Please upload a valid image file (JPEG, PNG, etc.).";
      } else {
        errorText += "Please try again or describe the issue in text.";
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
  }, [messages, currentConversationId, specialistRecommendation, userId, updateUserHealthInterests]);

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
