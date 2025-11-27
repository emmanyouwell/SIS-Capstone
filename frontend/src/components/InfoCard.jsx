import styles from './InfoCard.module.css';

function InfoCard({ icon, title, number, subtext }) {
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoTitle}>{title}</div>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.infoNumber}>{number}</div>
      <div className={styles.infoSubtext}>{subtext}</div>
    </div>
  );
}

export default InfoCard;

