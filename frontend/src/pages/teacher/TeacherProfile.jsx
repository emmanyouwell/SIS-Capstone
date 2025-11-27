import { useState, useRef } from 'react';
import styles from './TeacherProfile.module.css';

function TeacherProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('https://cdn-icons-png.flaticon.com/128/3135/3135715.png');
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Angelica Nanas',
    email: 'angelica.nanas@stnhs.edu.ph',
    contact: '+63 912 345 6789',
    dob: '1990-03-15',
    address: '123 Main Street, Cebu City',
    emergencyContact: 'John Nanas (Spouse) - +63 923 456 7890'
  });
  const [formData, setFormData] = useState(personalInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image size should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Check image dimensions (max 2000x2000)
        if (img.width > 2000 || img.height > 2000) {
          showMessage('Image dimensions should be less than 2000x2000 pixels', 'error');
          return;
        }
        setProfileImage(e.target.result);
        showMessage('Profile photo updated successfully!', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(personalInfo);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(personalInfo);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate phone number format (Philippine format)
      const phoneRegex = /^\+63\s?\d{3}\s?\d{3}\s?\d{4}$/;
      if (!phoneRegex.test(formData.contact)) {
        throw new Error('Please enter a valid Philippine phone number (e.g., +63 912 345 6789)');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update personal info
      setPersonalInfo(formData);
      setIsEditing(false);
      showMessage('Changes saved successfully!', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Profile</h1>
        </div>

        <div className={styles.profileContainer}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.profileCover}></div>
            <div className={styles.profileInfo}>
              <div className={styles.profileAvatar}>
                <img src={profileImage} alt="Profile Picture" />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button className={styles.changeAvatarBtn} onClick={handleChangePhoto}>
                  Change Photo
                </button>
              </div>
              <div className={styles.profileDetails}>
                <h2>{personalInfo.fullName}</h2>
                <p className={styles.role}>Science Teacher</p>
                <p className={styles.department}>Science Department</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className={styles.profileContent}>
            {/* Personal Information Section */}
            <div className={styles.profileSection}>
              <h3>Personal Information</h3>
              
              {!isEditing ? (
                <>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label>Full Name</label>
                      <p>{personalInfo.fullName}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Email</label>
                      <p>{personalInfo.email}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Contact Number</label>
                      <p>{personalInfo.contact}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Date of Birth</label>
                      <p>{personalInfo.dob ? formatDisplayDate(personalInfo.dob) : ''}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Address</label>
                      <p>{personalInfo.address}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Emergency Contact</label>
                      <p>{personalInfo.emergencyContact}</p>
                    </div>
                  </div>
                  <button className={styles.editBtn} onClick={handleEdit}>
                    Edit Personal Information
                  </button>
                </>
              ) : (
                <div className={styles.editForm}>
                  <h3>Edit Personal Information</h3>
                  {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                      <div className={styles.messageIcon}>
                        {message.type === 'success' ? '✓' : '!'}
                      </div>
                      <div className={styles.messageText}>
                        <h4>{message.type === 'success' ? 'Changes Saved Successfully!' : 'Error'}</h4>
                        <p>{message.text}</p>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="fullName">Full Name</label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="contact">Contact Number</label>
                        <input
                          type="tel"
                          id="contact"
                          name="contact"
                          value={formData.contact}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="dob">Date of Birth</label>
                        <input
                          type="date"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="address">Address</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="emergencyContact">Emergency Contact</label>
                        <input
                          type="text"
                          id="emergencyContact"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.formButtons}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className={styles.saveBtn}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Teaching Information Section */}
            <div className={styles.profileSection}>
              <h3>Teaching Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Employee ID</label>
                  <p>TCH-2023-0123</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Department</label>
                  <p>Science Department</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Position</label>
                  <p>Senior Science Teacher</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Date Joined</label>
                  <p>June 15, 2018</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Teaching Load</label>
                  <p>24 hours/week</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Advisory Class</label>
                  <p>Grade 8 - Lilac</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default TeacherProfile;

