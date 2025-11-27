import { useState } from 'react';
import styles from './Help.module.css';

/**
 * Reusable Help component that displays help content based on provided data
 * @param {Object} props
 * @param {Array} props.helpCards - Array of help card objects with title, icon, and items
 * @param {Array} props.faqs - Array of FAQ objects with question and answer
 * @param {Object} props.supportChannels - Object with email and phone support information
 */
function Help({ helpCards = [], faqs = [], supportChannels = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => {
    const searchLower = searchTerm.toLowerCase();
    return faq.question.toLowerCase().includes(searchLower) ||
           faq.answer.toLowerCase().includes(searchLower);
  });

  const filteredHelpCards = helpCards.filter(card => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return card.title.toLowerCase().includes(searchLower) ||
           card.items.some(item => item.toLowerCase().includes(searchLower));
  });

  return (
    <div className={styles.helpContainer}>
      <div className={styles.helpHeader}>
        <h1>How can we help you?</h1>
        <div className={styles.searchBox}>
          <svg 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            viewBox="0 0 24 24"
            className={styles.searchIcon}
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search for help topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.helpGrid}>
        {filteredHelpCards.map((card, index) => (
          <div key={index} className={styles.helpCard}>
            <h3>
              <img src={card.icon} alt={card.title} className={styles.cardIcon} />
              {card.title}
            </h3>
            <ul>
              {card.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${activeFaq === index ? styles.active : ''}`}
            >
              <div
                className={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  className={styles.chevronIcon}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div className={styles.faqAnswer}>
                {faq.answer}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No results found for "{searchTerm}"</p>
        )}
      </div>

      <div className={styles.supportChannels}>
        <h2>Need More Help?</h2>
        <p>Contact us through any of these channels</p>
        <div className={styles.channelGrid}>
          <div className={styles.channelItem}>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <polyline points="3 7 12 13 21 7"/>
            </svg>
            <h4>Email Support</h4>
            <p>{supportChannels.email || 'support@school.edu'}</p>
          </div>
          <div className={styles.channelItem}>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <h4>Phone Support</h4>
            <p>{supportChannels.phone || '+1 234 567 8900'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;

