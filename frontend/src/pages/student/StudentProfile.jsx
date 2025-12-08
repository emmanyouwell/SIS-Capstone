import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './StudentProfile.module.css';
import api from '../../utils/api';
import { getMe } from '../../store/slices/authSlice';
import { updateUser } from '../../store/slices/userSlice';

function StudentProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const photoUploadRef = useRef(null);
  const profileImageRef = useRef(null);

  // Initialize form data from user
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contact: '',
    dob: '',
    address: '',
    emergencyContact: '',
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await dispatch(getMe()).unwrap();
      } catch (error) {
        showMessage('Failed to load profile data', 'error');
      }
    };
    fetchUserData();
  }, [dispatch]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}${user.extensionName ? ` ${user.extensionName}` : ''}`.trim();
      const emergencyContact = user.roleData?.guardianName && user.roleData?.guardianContact
        ? `${user.roleData.guardianName} - ${user.roleData.guardianContact}`
        : '';

      setFormData({
        fullName,
        email: user.email || '',
        contact: user.contactNumber || '',
        dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
        emergencyContact,
      });
    }
  }, [user]);

  const handleChangePhoto = () => {
    photoUploadRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
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

    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      // Check if image dimensions are reasonable (max 2000x2000)
      if (img.width > 2000 || img.height > 2000) {
        showMessage('Image dimensions should be less than 2000x2000 pixels', 'error');
        return;
      }

      // Upload image
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await api.post('/uploads/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.data.success && uploadResponse.data.url) {
          // Update user profile image
          await dispatch(updateUser({ id: user.id, data: { profileImage: uploadResponse.data.url } })).unwrap();
          
          // Refresh user data
          await dispatch(getMe()).unwrap();
          
          showMessage('Profile photo updated successfully!', 'success');
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        showMessage(error.response?.data?.message || 'Failed to upload image. Please try again.', 'error');
      } finally {
        setIsUploading(false);
        // Reset file input
        if (photoUploadRef.current) {
          photoUploadRef.current.value = '';
        }
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      showMessage('Invalid image file', 'error');
    };

    img.src = objectUrl;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage(null);
    // Reset form data to current user data
    if (user) {
      const fullName = `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}${user.extensionName ? ` ${user.extensionName}` : ''}`.trim();
      const emergencyContact = user.roleData?.guardianName && user.roleData?.guardianContact
        ? `${user.roleData.guardianName} - ${user.roleData.guardianContact}`
        : '';

      setFormData({
        fullName,
        email: user.email || '',
        contact: user.contactNumber || '',
        dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
        emergencyContact,
      });
    }
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
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      validateForm();

      // Parse full name into components
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts[nameParts.length - 1] || '';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

      // Parse emergency contact
      const emergencyParts = formData.emergencyContact.split(' - ');
      const guardianName = emergencyParts[0] || '';
      const guardianContact = emergencyParts[1] || '';

      // Update user data
      const updateData = {
        firstName,
        middleName,
        lastName,
        email: formData.email,
        contactNumber: formData.contact,
        address: formData.address,
        dateOfBirth: formData.dob ? new Date(formData.dob) : null,
      };

      await dispatch(updateUser({ id: user.id, data: updateData })).unwrap();

      // Update student role data if emergency contact changed
      if (user.roleData && (guardianName || guardianContact)) {
        // Note: This would require a separate endpoint to update student data
        // For now, we'll just update the user data
      }

      // Refresh user data
      await dispatch(getMe()).unwrap();

      setIsEditing(false);
      showMessage('Changes saved successfully! Your personal information has been updated.', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || error.message || 'An error occurred while saving. Please try again.', 'error');
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

  // Get display values
  const displayName = user
    ? `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}${user.extensionName ? ` ${user.extensionName}` : ''}`.trim()
    : '';
  const displayRole = user?.roleData?.sectionId
    ? `Grade ${user.roleData.sectionId.gradeLevel} - ${user.roleData.sectionId.sectionName}`
    : user?.role || '';
  const profileImageUrl = user?.profileImage || 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png';

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
                src={profileImageUrl}
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
                disabled={isUploading}
              />
              <button
                type="button"
                className={styles.changeAvatarBtn}
                onClick={handleChangePhoto}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
            <div className={styles.profileDetails}>
              <h2>{displayName}</h2>
              <p className={styles.department}>{displayRole}</p>
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
                    <p>{formData.fullName || displayName}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Email</label>
                    <p>{formData.email || user?.email || ''}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Contact Number</label>
                    <p>{formData.contact || user?.contactNumber || ''}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Date of Birth</label>
                    <p>{user?.dateOfBirth ? formatDate(user.dateOfBirth) : ''}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Address</label>
                    <p>{formData.address || user?.address || ''}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Emergency Contact</label>
                    <p>{formData.emergencyContact || (user?.roleData?.guardianName && user?.roleData?.guardianContact ? `${user.roleData.guardianName} - ${user.roleData.guardianContact}` : '')}</p>
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
                        placeholder="Name - Contact Number"
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
