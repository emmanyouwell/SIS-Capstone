import { useState, useRef } from 'react';
import styles from './StudentProfile.module.css';

// Initial student data
const initialStudentData = {
  fullName: 'Kiana Mae L. Alvarez',
  email: 'kiana.alvarez@stnhs.edu.ph',
  contact: '+63 912 345 6789',
  dob: '2008-03-15',
  address: '123 Main Street, Paranaque City',
  emergencyContact: 'Jona Alvarez (Mother) - +63 923 456 7890',
  role: 'Grade 8 - Section Lilac',
  profileImage: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
};

function StudentProfile() {
  const [studentData, setStudentData] = useState(initialStudentData);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialStudentData);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success' or 'error'
  const photoUploadRef = useRef(null);
  const profileImageRef = useRef(null);

  const handleChangePhoto = () => {
    photoUploadRef.current?.click();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      showMessage('Please select an image file', 'error');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image size should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      // Create a temporary image to check dimensions
      const img = new Image();
      img.onload = () => {
        // Check if image dimensions are reasonable (max 2000x2000)
        if (img.width > 2000 || img.height > 2000) {
          showMessage('Image dimensions should be less than 2000x2000 pixels', 'error');
          return;
        }

        // Update profile image
        const newImageUrl = event.target.result;
        setStudentData((prev) => ({ ...prev, profileImage: newImageUrl }));
        showMessage('Profile photo updated successfully!', 'success');
      };
      img.onerror = () => {
        showMessage('Invalid image file', 'error');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      showMessage('Error reading file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = () => {
    // Convert formatted date back to YYYY-MM-DD for the input
    const editData = {
      ...studentData,
      dob: parseDateForInput(studentData.dob),
    };
    setFormData(editData);
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(studentData);
    setMessage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
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

    // Validate required fields
    if (!formData.fullName.trim()) {
      throw new Error('Full name is required');
    }
    if (!formData.address.trim()) {
      throw new Error('Address is required');
    }
    if (!formData.emergencyContact.trim()) {
      throw new Error('Emergency contact is required');
    }
  };

  const formatDate = (dateString) => {
    // If already formatted (contains comma), return as is
    if (typeof dateString === 'string' && dateString.includes(',')) {
      return dateString;
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const parseDateForInput = (dateString) => {
    // If already in YYYY-MM-DD format, return as is
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // If formatted date string, parse it back to YYYY-MM-DD
    if (typeof dateString === 'string' && dateString.includes(',')) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    // Default: try to parse as date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      validateForm();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update student data
      const updatedData = {
        ...formData,
        dob: formatDate(formData.dob),
      };
      setStudentData(updatedData);
      setIsEditing(false);
      showMessage('Changes saved successfully! Your personal information has been updated.', 'success');
    } catch (error) {
      showMessage(error.message || 'An error occurred while saving. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3000);
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
                <img
                  ref={profileImageRef}
                  src={studentData.profileImage}
                  alt="Profile Picture"
                  id="profile-image"
                />
                <input
                  ref={photoUploadRef}
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  className={styles.changeAvatarBtn}
                  onClick={handleChangePhoto}
                >
                  Change Photo
                </button>
              </div>
              <div className={styles.profileDetails}>
                <h2>{studentData.fullName}</h2>
                <p className={styles.department}>{studentData.role}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className={styles.profileContent}>
            <div className={styles.profileSection}>
              <h3>Personal Information</h3>

              {/* Success/Error Messages */}
              {message && (
                <div className={`${styles.message} ${styles[messageType]}`}>
                  <div className={styles.messageIcon}>
                    {messageType === 'success' ? '✓' : '!'}
                  </div>
                  <div className={styles.messageText}>
                    <h4>{messageType === 'success' ? 'Success' : 'Error'}</h4>
                    <p>{message}</p>
                  </div>
                </div>
              )}

              {!isEditing ? (
                <>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label>Full Name</label>
                      <p>{studentData.fullName}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Email</label>
                      <p>{studentData.email}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Contact Number</label>
                      <p>{studentData.contact}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Date of Birth</label>
                      <p>{formatDate(studentData.dob)}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Address</label>
                      <p>{studentData.address}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Emergency Contact</label>
                      <p>{studentData.emergencyContact}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={handleEditClick}
                  >
                    Edit Personal Information
                  </button>
                </>
              ) : (
                <div className={styles.editForm}>
                  <h3>Edit Personal Information</h3>
                  <form id="edit-personal-form" onSubmit={handleSubmit}>
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
                        onClick={handleCancelEdit}
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
          </div>
        </div>
      </div>
  );
}

export default StudentProfile;

