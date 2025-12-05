import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import styles from './TeacherLogin.module.css';

function TeacherLogin() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authError = useSelector((state) => state.auth.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowProgress(true);

    try {
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) {
        // Check if user is Admin
        if (result.payload.user.role === 'Teacher') {
          setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            navigate('/teacher/dashboard');
          }, 500);
        } else {
          setError('Access denied. Please check your credentials.');
          setIsLoading(false);
          setShowProgress(false);
        }
      } else {
        setError(result.payload || 'Login failed');
        setIsLoading(false);
        setShowProgress(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
      setShowProgress(false);
    }
  };

  return (
    <>
      <div className={`${styles.loginProgress} ${showProgress ? styles.start : ''}`}></div>
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
              {error || authError && (
                <div className={`alert alert-danger ${styles.alert}`} role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error || authError || 'Invalid credentials'}
                </div>
              )}
              <form onSubmit={handleSubmit} className={`${styles.loginForm} needs-validation`} noValidate>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="teacher-id"
                    placeholder="Enter EID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="teacher-id">
                    <i className="fas fa-id-card me-2"></i>
                    Email Address
                  </label>
                  <div className="invalid-feedback">
                    Please enter your email address.
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

