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

  // Build conversation context safely
  const buildConversationContext = (allMessages) => {
    const validMessages = allMessages
      .filter(
        (msg) =>
          msg &&
          msg.text &&
          typeof msg.text === 'string' &&
          msg.text.trim()
      )
      .map((msg) => msg.text.trim());

    if (validMessages.length === 0) return '';

    const context = validMessages.join('. ');
    return context.length < 10
      ? validMessages[validMessages.length - 1]
      : context;
  };

  // =========================
  // SEND TEXT MESSAGE
  // =========================
  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim()) return;

      const userMessage = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await chatAPI.sendMessage(
          messageText,
          currentConversationId
        );

        const {
          conversationId,
          aiMessage,
          needsSpecialist,
          extractedTopics: aiExtractedTopics,
        } = response.data.data;

        if (conversationId && !currentConversationId) {
          setCurrentConversationId(conversationId);
        }

        const aiMessageWithId = {
          ...aiMessage,
          id: (Date.now() + 1).toString(),
        };

        setMessages((prev) => [...prev, aiMessageWithId]);

        // -------------------------
        // TOPIC HANDLING (SAFE)
        // -------------------------
        if (aiExtractedTopics && aiExtractedTopics.length > 0) {
          setExtractedTopics((prev) => [
            ...prev,
            ...aiExtractedTopics,
          ]);
        }

        if (aiExtractedTopics && aiExtractedTopics.length > 0) {
          try {
            await healthFeedAPI.updateUserTopics(
              aiExtractedTopics,
              `From chat: ${messageText.substring(0, 50)}`
            );
          } catch (saveError) {
            console.error('❌ Failed to save topics:', saveError);
          }
        }

        // -------------------------
        // SPECIALIST RECOMMENDATION
        // -------------------------
        if (needsSpecialist && !specialistRecommendation) {
          const allMessages = [
            ...messages,
            userMessage,
            aiMessageWithId,
          ];

          let conversationContext =
            buildConversationContext(allMessages);

          if (!conversationContext || conversationContext.length < 20) {
            conversationContext = `User: ${messageText}. Assistant: ${aiMessageWithId.text.substring(
              0,
              200
            )}`;
          }

          try {
            const specialistResponse =
              await specialistAPI.getRecommendations({
                conversationContext,
              });

            setSpecialistRecommendation({
              triggered: true,
              specialists:
                specialistResponse.data.data.specialists,
              analysis: specialistResponse.data.data,
              conversationContext,
            });
          } catch (error) {
            console.error(
              '❌ Specialist recommendation failed:',
              error
            );
          }
        }

        setConversationHistory((prev) => [
          ...prev,
          userMessage,
          aiMessageWithId,
        ]);
      } catch (error) {
        let errorText =
          'I am having trouble connecting right now. Please try again.';

        if (
          error.code === 'ECONNABORTED' ||
          error.message?.includes('timeout')
        ) {
          errorText =
            'MediBot is still analyzing your message. Please wait...';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: errorText,
            isUser: false,
            isError: true,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, currentConversationId, specialistRecommendation, userId]
  );

  // =========================
  // SEND MESSAGE WITH IMAGE
  // =========================
  const sendMessageWithImage = useCallback(
    async (messageText, imageFile) => {
      if (!imageFile) return;

      const tempImageUrl = URL.createObjectURL(imageFile);

      const userMessage = {
        id: Date.now().toString(),
        text: messageText || 'Image uploaded',
        isUser: true,
        timestamp: new Date(),
        hasImage: true,
        imageUrl: tempImageUrl,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append('message', messageText || '');
        formData.append('image', imageFile);
        if (currentConversationId) {
          formData.append(
            'conversationId',
            currentConversationId
          );
        }

        const response =
          await chatAPI.sendMessageWithImage(formData);

        const {
          conversationId,
          aiMessage,
          needsSpecialist,
          extractedTopics: imageTopics,
        } = response.data.data;

        if (conversationId && !currentConversationId) {
          setCurrentConversationId(conversationId);
        }

        const aiMessageWithId = {
          ...aiMessage,
          id: (Date.now() + 1).toString(),
          isImageAnalysis: true,
        };

        setMessages((prev) => [...prev, aiMessageWithId]);

        if (imageTopics && imageTopics.length > 0) {
          setExtractedTopics((prev) => [
            ...prev,
            ...imageTopics,
          ]);
        }

        if (needsSpecialist && !specialistRecommendation) {
          const allMessages = [
            ...messages,
            userMessage,
            aiMessageWithId,
          ];

          let conversationContext =
            buildConversationContext(allMessages);

          if (!conversationContext || conversationContext.length < 20) {
            conversationContext = `Image analysis: ${
              messageText || 'Medical image uploaded'
            }. ${aiMessageWithId.text.substring(0, 200)}`;
          }

          try {
            const specialistResponse =
              await specialistAPI.getRecommendations({
                conversationContext,
              });

            setSpecialistRecommendation({
              triggered: true,
              specialists:
                specialistResponse.data.data.specialists,
              analysis: specialistResponse.data.data,
              fromImage: true,
              conversationContext,
            });
          } catch (error) {
            console.error(
              '❌ Image specialist recommendation failed:',
              error
            );
          }
        }

        setConversationHistory((prev) => [
          ...prev,
          userMessage,
          aiMessageWithId,
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text:
              'There was a problem analyzing this image. Please try again.',
            isUser: false,
            isError: true,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, currentConversationId, specialistRecommendation, userId]
  );

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
    scrollToBottom,
  };
};
