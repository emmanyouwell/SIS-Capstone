import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TeacherLogin.module.css';

function TeacherLogin() {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validUsername = 'admin';
    const validPassword = '12345';

    if (teacherId.trim() === validUsername && password.trim() === validPassword) {
      setError(false);
      setIsLoading(true);
      
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        
        setTimeout(() => {
          navigate('/teacher/dashboard');
        }, 1000);
      }, 1500);
    } else {
      setError(true);
    }
  };

  return (
    <>
      <div className={styles.loginProgress}></div>
      <div className="container-fluid vh-100 p-0">
        <div className="row g-0 h-100">
          <div className={`col-lg-8 ${styles.rectangle1}`}>
            <div className={styles.schoolCard}>
              <img src="/images/logo.jpg" alt="School Logo" className={styles.schoolLogo} />
              <div className={styles.coverTitle}>STO. NIÑO NATIONAL HIGH SCHOOL</div>
            </div>
          </div>
          <div className={`col-lg-4 ${styles.rightContent}`}>
            <div className={styles.loginWrapper}>
              <div className="text-center">
                <h2 className={styles.welcomeText}>Welcome back, Teacher!</h2>
                <p className={styles.textGray}>Access your teacher portal</p>
              </div>
              {error && (
                <div className={`alert alert-danger ${styles.alert}`} role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  Invalid Employee ID or Password.
                </div>
              )}
              <form onSubmit={handleSubmit} className={`${styles.loginForm} needs-validation`} noValidate>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="teacher-id"
                    placeholder="Enter EID"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    required
                  />
                  <label htmlFor="teacher-id">
                    <i className="fas fa-id-card me-2"></i>
                    Employee Number
                  </label>
                  <div className="invalid-feedback">
                    Please enter your Employee Number.
                  </div>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="teacher-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="teacher-password">
                    <i className="fas fa-lock me-2"></i>
                    Password
                  </label>
                  <div className="invalid-feedback">
                    Please enter your password.
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="remember-me" />
                    <label className="form-check-label" htmlFor="remember-me">Remember me</label>
                  </div>
                  <a href="#" className={styles.forgotLink}>Forgot Password?</a>
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg w-100 ${styles.btnLogin} ${isLoading ? styles.loading : ''} ${isSuccess ? styles.success : ''}`}
                >
                  <div className={styles.buttonContent}>
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Sign In</span>
                  </div>
                </button>
                <div className="text-center">
                  <p className={styles.termsConditions}>
                    By signing in, you agree to our
                    <a href="#" className="text-decoration-none"> Terms</a> and
                    <a href="#" className="text-decoration-none"> Privacy Policy</a>
                  </p>
                </div>
              </form>
              <div className="mt-4">
                <div className={styles.divider}>
                  <span>Need Help?</span>
                </div>
                <div className="d-flex justify-content-center gap-3 mt-3">
                  <a href="#" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-book-open me-2"></i>
                    User Guide
                  </a>
                  <a href="#" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-headset me-2"></i>
                    Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TeacherLogin;

