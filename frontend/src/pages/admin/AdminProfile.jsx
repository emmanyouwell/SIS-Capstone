import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminProfile.module.css';
import api from '../../utils/api';
import { getMe } from '../../store/slices/authSlice';
import { updateUser } from '../../store/slices/userSlice';

function AdminProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

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

      setFormData({
        fullName,
        email: user.email || '',
        contact: user.contactNumber || '',
        dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
        emergencyContact: '',
      });
    }
  }, [user]);

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
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

    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      // Check image dimensions (max 2000x2000)
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
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      showMessage('Invalid image file', 'error');
    };

    img.src = objectUrl;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    // Reset form data to current user data
    if (user) {
      const fullName = `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}${user.extensionName ? ` ${user.extensionName}` : ''}`.trim();

      setFormData({
        fullName,
        email: user.email || '',
        contact: user.contactNumber || '',
        dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
        emergencyContact: '',
      });
    }
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
        throw new Error('Please enter a valid Philippine phone number (e.g., +63 900 000 0000)');
      }

      // Parse full name into components
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts[nameParts.length - 1] || '';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

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

      // Refresh user data
      await dispatch(getMe()).unwrap();

      setIsEditing(false);
      showMessage('Changes saved successfully!', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || error.message || 'An error occurred while saving. Please try again.', 'error');
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
      year: 'numeric',
    });
  };

  // Get display values
  const displayName = user
    ? `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}${user.extensionName ? ` ${user.extensionName}` : ''}`.trim()
    : '';
  const profileImageUrl = user?.profileImage || 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png';

  return (
    <div className={styles.mainContent}>
      <div className={styles.profileContainer}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileCover}></div>
          <div className={styles.profileInfo}>
            <div className={styles.profileAvatar}>
              <img src={profileImageUrl} alt="Profile Picture" id="profile-image" />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <button
                className={styles.changeAvatarBtn}
                onClick={handleChangePhoto}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
            <div className={styles.profileDetails}>
              <h2>{displayName}</h2>
              <p className={styles.role}>Administrator</p>
              <p className={styles.department}>{user?.roleData?.department || 'School Administration'}</p>
            </div>
          </div>
        </div>

        <div className={styles.profileContent}>
          {/* Personal Information Section */}
          <div className={styles.profileSection}>
            <h3>Personal Information</h3>

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
                    <p>{user?.dateOfBirth ? formatDisplayDate(user.dateOfBirth) : ''}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Address</label>
                    <p>{formData.address || user?.address || ''}</p>
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

          {/* Admin Information Section */}
          <div className={styles.profileSection}>
            <h3>Admin Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Employee ID</label>
                <p>{user?.roleData?.employeeId || 'N/A'}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Department</label>
                <p>{user?.roleData?.department || 'N/A'}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Position</label>
                <p>{user?.roleData?.position || 'N/A'}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Date Joined</label>
                <p>{user?.roleData?.createdAt ? formatDisplayDate(user.roleData.createdAt) : 'N/A'}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Admin Level</label>
                <p>Super Admin</p>
              </div>
              <div className={styles.infoItem}>
                <label>Assigned Office</label>
                <p>{user?.roleData?.assignedOffice || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
