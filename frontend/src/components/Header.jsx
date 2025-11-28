import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

function Header({ userName, userRole, notificationCount = 3 }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = async () => {
    
    const btn = document.querySelector(`.${styles.logoutBtn}`);
    const btnText = btn?.querySelector('span');
    const progressBar = document.querySelector(`.${styles.logoutProgress}`);
    
    if (btn && btnText && progressBar) {
      btn.classList.add(styles.btnLoading);
      btnText.textContent = 'Logging out...';
      progressBar.classList.add(styles.start);
      await dispatch(logout());
      setTimeout(() => {
        btn.classList.remove(styles.btnLoading);
        btn.classList.add(styles.btnSuccess, styles.animate);
        btnText.textContent = 'Goodbye!';
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }, 1500);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <div className={styles.logoutProgress}></div>
      <div className={styles.topHeader}>
        <div className={styles.schoolName}>
          Sto. Niño National High School
        </div>
        <div className={styles.headerControls}>
          <div className={styles.notifications}>
            <svg width="24" height="24" fill="none" stroke="#184d27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className={styles.badge}>{notificationCount}</span>
          </div>
          <div className={styles.userControls}>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userRole}>{userRole}</div>
            </div>
            <div className={styles.userAvatar}>
              <img src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png" alt="User Avatar" />
            </div>
            <button className={`${styles.logoutBtn} ${styles.btnSmartAnimate}`} onClick={handleLogout}>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;

