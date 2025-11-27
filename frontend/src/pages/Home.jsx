import { Link } from 'react-router-dom';
import styles from './Home.module.css';

function Home() {
  return (
    <div className={styles.loginMainPage}>
      <div className={styles.rectangle1}>
        <img src="/images/logo.png" alt="School Logo" className={styles.schoolLogo} />
        <div className={styles.coverTitle}>STO. NINO NATIONAL HIGH SCHOOL</div>
      </div>
      <div className={styles.rightContent}>
        <img src="/images/logo.png" alt="School Logo" className={styles.miniLogo} />
        <h1 className={styles.welcomeText}>Welcome</h1>
        <p className={styles.clickDestination}>Click your destination.</p>
        <Link to="/student/login" className={`${styles.btn} ${styles.btnStudent}`}>
          STUDENT
        </Link>
        <Link to="/teacher/login" className={`${styles.btn} ${styles.btnFaculty}`}>
          TEACHER
        </Link>
        <Link to="/admin/login" className={`${styles.btn} ${styles.btnAdmin}`}>
          ADMIN
        </Link>

        <p className={styles.termsConditions}>
          Terms and Conditions &amp; Privacy Policy
        </p>
        <div className={styles.footerIcons}>
          <a href="#" className={styles.footerIcon}>
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className={styles.footerIcon}>
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className={styles.footerIcon}>
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;

