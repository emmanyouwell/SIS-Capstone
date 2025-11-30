import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminSubjectEdit.module.css';
import { fetchAllSubjects, updateSubject, fetchSubjectById } from '../../store/slices/subjectSlice';
import { fetchAllUsers } from '../../store/slices/userSlice';
import api from '../../utils/api';

function AdminSubjectEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { grade } = useParams();
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSelector((state) => state.subjects);
  const { users: allUsers, loading: usersLoading } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);

  const [selectedSection, setSelectedSection] = useState('');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [uploadType, setUploadType] = useState(null); // 'file' or 'link'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLink, setUploadLink] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Get grade level number from grade param (e.g., "grade7" -> 7)
  const gradeLevel = grade ? parseInt(grade.replace(/\D/g, '')) : null;

  // Grade sections mapping (matching template)
  const gradeSections = {
    7: ['Dahlia', 'Rose', 'Lilac', 'Foxglove', 'Lily'],
    8: ['Sunflower', 'Tulip', 'Orchid', 'Peony', 'Daisy'],
    9: ['Jasmine', 'Magnolia', 'Azalea', 'Camellia', 'Begonia'],
    10: ['Iris', 'Poppy', 'Violet', 'Marigold', 'Petunia'],
  };

  const sections = gradeSections[gradeLevel] || [];

  // Filter subjects by grade level
  const gradeSubjects = subjects.filter(subject => subject.gradeLevel === gradeLevel);

  // Get available teachers (users with Teacher role)
  const availableTeachers = allUsers
    .filter(user => user.role === 'Teacher' && user.status === 'Active')
    .map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      fullName: `${user.firstName} ${user.lastName}`
    }));

  // Fetch subjects and teachers on mount
  useEffect(() => {
    if (gradeLevel) {
      dispatch(fetchAllSubjects({ gradeLevel }));
    }
    dispatch(fetchAllUsers({ role: 'Teacher', status: 'Active' }));
    if (sections.length > 0) {
      setSelectedSection(sections[0]);
    }
  }, [dispatch, gradeLevel]);

  // Fetch full subject data when modal opens
  useEffect(() => {
    if (showMaterialModal && selectedSubject?._id) {
      dispatch(fetchSubjectById(selectedSubject._id));
    }
  }, [showMaterialModal, selectedSubject?._id, dispatch]);

  // Update selectedSubject when subjects are updated in Redux
  useEffect(() => {
    if (!selectedSubject || !showMaterialModal) return;

    const updatedSubject = subjects.find(s => s._id === selectedSubject._id);

    // Prevent unnecessary re-renders
    if (updatedSubject && updatedSubject !== selectedSubject) {
      setSelectedSubject(updatedSubject);
    }
  }, [subjects, selectedSubject, showMaterialModal]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleBack = () => {
    navigate('/admin/subjects');
  };

  const handleVisitSubject = (subject) => {
    setSelectedSubject(subject);
    setShowMaterialModal(true);
    setMaterialTitle('');
    setMaterialDescription('');
    setUploadType(null);
    setUploadFile(null);
    setUploadLink('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadType('file');
      setUploadLink('');
    }
  };

  const handleLinkInput = () => {
    const link = prompt('Enter the link URL:');
    if (link) {
      setUploadLink(link);
      setUploadType('link');
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'just now';
    const now = new Date();
    const uploaded = new Date(date);
    const diffInSeconds = Math.floor((now - uploaded) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return uploaded.toLocaleDateString();
  };

  const getTeacherName = (teacher) => {
    if (typeof teacher === 'object' && teacher.firstName && teacher.lastName) {
      return `${teacher.firstName} ${teacher.lastName}`;
    }
    const teacherObj = availableTeachers.find(t => t.id === teacher);
    return teacherObj ? teacherObj.name : 'Unknown Teacher';
  };

  const getUploaderName = (uploadedBy) => {
    if (!uploadedBy) return 'Admin';
    if (typeof uploadedBy === 'object') {
      return `${uploadedBy.firstName} ${uploadedBy.lastName}`;
    }
    return 'Admin';
  };

  const handleUploadMaterial = async () => {
    if (!selectedSubject) return;

    if (!materialTitle.trim()) {
      setErrorMessage('Please enter a title');
      return;
    }

    if (!uploadType) {
      setErrorMessage('Please attach a file or link');
      return;
    }

    if (uploadType === 'file' && !uploadFile) {
      setErrorMessage('Please select a file');
      return;
    }

    if (uploadType === 'link' && !uploadLink.trim()) {
      setErrorMessage('Please enter a link URL');
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      // Get the latest subject data from Redux to ensure we have current materials
      const latestSubject = subjects.find(s => s._id === selectedSubject._id) || selectedSubject;

      let materialData = {
        name: materialTitle.trim(),
        url: '',
        cloudinaryId: null,
        uploadedBy: user?._id || user?.id || null,
      };

      if (uploadType === 'file') {
        // Upload file to Cloudinary
        const formData = new FormData();
        formData.append('file', uploadFile);

        const uploadResponse = await api.post('/uploads/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        materialData.url = uploadResponse.data.url;
        materialData.cloudinaryId = uploadResponse.data.public_id;
      } else {
        // For links, just use the URL
        materialData.url = uploadLink.trim();
      }

      // Send single material in array - backend will use $push to append
      // This ensures we don't lose any materials added by other users/sessions
      const updatedSubjectResult = await dispatch(updateSubject({
        id: latestSubject._id,
        data: { materials: [materialData] }
      })).unwrap();

      // Update selectedSubject with the new data
      if (updatedSubjectResult) {
        setSelectedSubject(updatedSubjectResult);
      }

      // Refresh subject data to get updated materials list
      await dispatch(fetchSubjectById(latestSubject._id));

      // Reset form
      setMaterialTitle('');
      setMaterialDescription('');
      setUploadType(null);
      setUploadFile(null);
      setUploadLink('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSuccessMessage('Material uploaded successfully!');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadMaterial = (material) => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  const handleOpenLink = (material) => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  const isLink = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  const getFileName = (url) => {
    if (!url) return 'Unknown file';
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop();
      return fileName || 'Unknown file';
    } catch {
      return url.split('/').pop() || 'Unknown file';
    }
  };

  const getFileSize = (file) => {
    if (!file) return '';
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return `${sizeInMB} MB`;
  };

  const getLinkSource = (url) => {
    if (!url) return '';

    if (/youtube\.com|youtu\.be/i.test(url)) return 'Youtube';
    if (/drive\.google\.com/i.test(url)) return 'Google Drive';
    if (/res\.cloudinary\.com|cloudinary\.com/i.test(url)) return 'File from Cloudinary';

    return 'Website';
  };

  // Get current subject with latest data
  const currentSubject = selectedSubject
    ? subjects.find(s => s._id === selectedSubject._id) || selectedSubject
    : null;

  const loading = subjectsLoading || usersLoading;

  return (
    <div className={styles.mainContent}>
      <div className={styles.pageTitle}>Subject Materials - {grade ? `Grade ${gradeLevel}` : ''}</div>

      {/* Success Message */}
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {(errorMessage || subjectsError) && (
        <div className={styles.errorMessage}>
          {errorMessage || subjectsError}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.contentLayout}>
          <div className={styles.sectionsListCard}>
            <div className={styles.listTitle}>Sections</div>
            <ul className={styles.sectionsList}>
              {sections.map((section) => (
                <li
                  key={section}
                  className={selectedSection === section ? styles.active : ''}
                  onClick={() => setSelectedSection(section)}
                >
                  {section}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.subjectsTable}>
              <thead>
                <tr>
                  <th>Subjects</th>
                  <th>Subject Teachers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {gradeSubjects.length === 0 ? (
                  <tr>
                    <td colSpan="3" className={styles.emptyState}>
                      No subjects found for this grade level
                    </td>
                  </tr>
                ) : (
                  gradeSubjects.map((subject) => (
                    <tr key={subject._id}>
                      <td>{subject.name}</td>
                      <td className={styles.teacherCell}>
                        {subject.teachers && subject.teachers.length > 0 ? (
                          subject.teachers.map((teacher, idx) => (
                            <button key={idx} className={styles.teacherPill}>
                              {getTeacherName(teacher)}
                            </button>
                          ))
                        ) : (
                          <span className={styles.noTeachers}>No teachers assigned</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={styles.visitBtn}
                          onClick={() => handleVisitSubject(subject)}
                        >
                          visit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && currentSubject && (
        <div className={styles.materialModalOverlay} onClick={() => setShowMaterialModal(false)}>
          <div className={styles.materialModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalFlexRow}>
              <div className={styles.modalFeed}>
                <div className={styles.modalWelcome}>
                  Welcome to {currentSubject.name}!
                </div>
                <div className={styles.modalMaterials}>
                  {currentSubject.materials && currentSubject.materials.length > 0 ? (
                    [...currentSubject.materials]   // ← creates a new array copy
                      .sort((a, b) => new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt))
                      .map((material, idx) => (
                        <div key={idx} className={styles.modalResourceCard}>
                          <div className={styles.modalResourceMeta}>
                            {getUploaderName(material.uploadedBy)} • {formatTimeAgo(material.uploadedAt)}
                          </div>
                          <div className={styles.modalResourceTitle}>{material.name}</div>
                          <div className={styles.modalResourceFileRow}>
                            <div className={styles.modalResourceFileInfo}>
                              <span className={styles.modalResourceFileIcon}>
                                {isLink(material.url) ? '🔗' : '📎'}
                              </span>
                              <span className={styles.modalResourceFileName}>
                                {isLink(material.url)
                                  ? (material.name || material.url)
                                  : (material.name || getFileName(material.url))
                                }
                              </span>
                              {isLink(material.url) ? (
                                <span className={styles.modalResourceFileSource}>
                                  {getLinkSource(material.url)}
                                </span>
                              ) : (
                                <span className={styles.modalResourceFileSize}>
                                  {uploadFile && uploadType === 'file' ? getFileSize(uploadFile) : 'N/A'}
                                </span>
                              )}
                            </div>
                            <button
                              className={isLink(material.url) ? styles.modalResourceLinkBtn : styles.modalResourceDownloadBtn}
                              onClick={() => isLink(material.url) ? handleOpenLink(material) : handleDownloadMaterial(material)}
                            >
                              {isLink(material.url) ? '↗️' : '⬇️'}
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className={styles.emptyState}>No materials uploaded yet</div>
                  )}
                </div>

              </div>
              <div className={styles.modalAdminPanel}>
                <div className={styles.modalAdmins}>
                  <div className={styles.modalAdminsLabel}><b>Admin:</b></div>
                  <div className={styles.modalAdminsList}>
                    <button className={styles.modalAdminPill}>
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : 'Admin'}
                    </button>
                  </div>
                </div>
                <div className={styles.modalManage}>
                  <div className={styles.modalManageLabel}><b>Manage:</b></div>
                  <button className={`${styles.modalManageBtn} ${styles.active}`}>Students</button>
                  <button className={styles.modalManageBtn}>Channel</button>
                </div>
                <div className={styles.modalAddCard}>
                  <div className={styles.modalAddTitleLabel}><b>Add Title</b></div>
                  <input
                    className={styles.modalAddTitle}
                    type="text"
                    placeholder="Enter material title"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                  />
                  <input
                    className={styles.modalAddDesc}
                    type="text"
                    placeholder="Add description"
                    value={materialDescription}
                    onChange={(e) => setMaterialDescription(e.target.value)}
                  />
                  <div className={styles.modalAttachLabel}><b>Attach:</b></div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="fileUpload"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <button
                    className={styles.modalAttachBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📎 File
                  </button>
                  <button
                    className={styles.modalAttachBtn}
                    onClick={handleLinkInput}
                  >
                    🔗 Link
                  </button>
                  {uploadFile && (
                    <div className={styles.uploadPreview}>
                      Selected: {uploadFile.name}
                    </div>
                  )}
                  {uploadLink && (
                    <div className={styles.uploadPreview}>
                      Link: {uploadLink}
                    </div>
                  )}
                  <button
                    className={styles.modalUploadBtn}
                    onClick={handleUploadMaterial}
                    disabled={uploading || !materialTitle.trim() || !uploadType}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setShowMaterialModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <button className={styles.backBtn} title="Back" onClick={handleBack}>
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export default AdminSubjectEdit;
