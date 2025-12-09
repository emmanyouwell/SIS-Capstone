import { useState } from 'react';
import styles from './ChatBot.module.css';

/**
 * ChatBot Component
 * A floating chatbot widget that appears at the bottom right of all pages.
 * Users can select from pre-defined questions and receive conversational responses.
 */
function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder for pre-defined questions - will be replaced with actual questions
  const predefinedQuestions = [
    'How do I enroll?',
    'What are the enrollment requirements?',
    'How do I view my grades?',
    'How do I access my schedule?',
    'How do I contact my teacher?',
    'What is the enrollment period?',
  ];

  /**
   * Handles question selection and fetches response
   * @param {string} question - The selected question
   */
  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    setResponse(null);
    setIsLoading(true);

    // TODO: Replace with actual API call to fetch response from database
    // Simulating API call delay
    setTimeout(() => {
      setResponse({
        question,
        answer: `This is a placeholder response for: "${question}". The actual response will be fetched from the database based on the selected question.`,
      });
      setIsLoading(false);
    }, 1000);
  };

  /**
   * Resets the chat to show questions again
   */
  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
    setResponse(null);
  };

  /**
   * Closes the chat window
   */
  const handleClose = () => {
    setIsOpen(false);
    // Reset chat state when closing
    setTimeout(() => {
      setSelectedQuestion(null);
      setResponse(null);
    }, 300); // Wait for animation to complete
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className={styles.chatButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
              fill="currentColor"
            />
            <path
              d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderContent}>
              <div className={styles.chatHeaderIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className={styles.chatHeaderText}>
                <h3>Help Assistant</h3>
                <p>Ask me anything</p>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close chatbot"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {/* Chat Body */}
          <div className={styles.chatBody}>
            {!selectedQuestion ? (
              // Questions List View
              <div className={styles.questionsView}>
                <div className={styles.questionsHeader}>
                  <p>Select a question to get started:</p>
                </div>
                <div className={styles.questionsList}>
                  {predefinedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className={styles.questionButton}
                      onClick={() => handleQuestionClick(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Chat Conversation View
              <div className={styles.conversationView}>
                {/* User Question */}
                <div className={styles.messageContainer}>
                  <div className={styles.userMessage}>
                    <div className={styles.messageContent}>
                      <p>{selectedQuestion}</p>
                    </div>
                    <div className={styles.messageAvatar}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bot Response */}
                <div className={styles.messageContainer}>
                  <div className={styles.botMessage}>
                    <div className={styles.messageAvatar}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div className={styles.messageContent}>
                      {isLoading ? (
                        <div className={styles.loadingIndicator}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : response ? (
                        <p>{response.answer}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Footer */}
          <div className={styles.chatFooter}>
            {selectedQuestion && (
              <button
                className={styles.backButton}
                onClick={handleBackToQuestions}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
                    fill="currentColor"
                  />
                </svg>
                Back to Questions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;

