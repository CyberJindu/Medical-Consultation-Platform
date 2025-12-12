import { useState, useCallback, useRef } from 'react';
import { chatAPI, specialistAPI } from '../services/api.js';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [specialistRecommendation, setSpecialistRecommendation] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
      // Send message to backend (real AI)
      const response = await chatAPI.sendMessage(messageText, currentConversationId);
      const { conversationId, userMessage: savedUserMsg, aiMessage, needsSpecialist } = response.data.data;

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

      // Check if specialist recommendation is needed
      if (needsSpecialist && !specialistRecommendation) {
        // Get specialist recommendations based on conversation
        const conversationContext = [...messages, userMessage, aiMessageWithId]
          .map(msg => msg.text)
          .join(' ');
          
        try {
          const specialistResponse = await specialistAPI.getRecommendations({ conversationContext });
          setSpecialistRecommendation({
            triggered: true,
            specialists: specialistResponse.data.data.specialists,
            analysis: specialistResponse.data.data.analysis
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
        text: "I apologize, but I'm having trouble connecting to MediBot. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentConversationId, specialistRecommendation]);

  // NEW: Send message with image
  const sendMessageWithImage = useCallback(async (messageText, imageFile) => {
    if (!imageFile) return;

    // Create temporary URL for immediate preview
    const tempImageUrl = URL.createObjectURL(imageFile);
    
    const userMessage = {
      id: Date.now().toString(),
      text: messageText || 'Image uploaded',
      isUser: true,
      timestamp: new Date(),
      hasImage: true,
      imageUrl: tempImageUrl
    };

    // Add user message immediately with image preview
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('message', messageText || '');
      formData.append('image', imageFile);
      if (currentConversationId) {
        formData.append('conversationId', currentConversationId);
      }

      // Send image message to backend
      const response = await chatAPI.sendMessageWithImage(formData);
      const { conversationId, aiMessage, needsSpecialist } = response.data.data;

      // Update conversation ID if this is a new conversation
      if (conversationId && !currentConversationId) {
        setCurrentConversationId(conversationId);
      }

      // Add AI response
      const aiMessageWithId = {
        ...aiMessage,
        id: (Date.now() + 1).toString(),
        isImageAnalysis: true
      };
      
      setMessages(prev => [...prev, aiMessageWithId]);

      // Check if specialist recommendation is needed from image analysis
      if (needsSpecialist && !specialistRecommendation) {
        try {
          const conversationContext = [...messages, userMessage, aiMessageWithId]
            .map(msg => msg.text)
            .join(' ');
            
          const specialistResponse = await specialistAPI.getRecommendations({ conversationContext });
          setSpecialistRecommendation({
            triggered: true,
            specialists: specialistResponse.data.data.specialists,
            analysis: specialistResponse.data.data.analysis,
            fromImage: true
          });
        } catch (error) {
          console.error('Failed to get specialist recommendations from image:', error);
        }
      }

      // Update conversation history
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
  }, [messages, currentConversationId, specialistRecommendation]);

  const startNewChat = useCallback(() => {
    // Clear current conversation
    setMessages([]);
    setConversationHistory([]);
    setSpecialistRecommendation(null);
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
    sendMessage,
    sendMessageWithImage, // NEW: Export the image function
    startNewChat,
    loadChat,
    clearRecommendation,
    messagesEndRef,
    scrollToBottom
  };
};
