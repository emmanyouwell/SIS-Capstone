import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminSubjectEdit.module.css';
import { fetchAllSubjects, updateSubject, fetchSubjectById } from '../../store/slices/subjectSlice';
import { fetchAllUsers } from '../../store/slices/userSlice';
import { getAllSections } from '../../store/slices/sectionSlice';
import { fetchAllMaterials, createMaterial } from '../../store/slices/materialsSlice';
import api from '../../utils/api';

function AdminSubjectEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { grade } = useParams();
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSelector((state) => state.subjects);
  const { users: allUsers, loading: usersLoading } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  const sectionsData = useSelector((state) => state.section.data);
  const { materials, loading: materialsLoading } = useSelector((state) => state.materials);

  const [selectedSection, setSelectedSection] = useState('');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [uploadType, setUploadType] = useState(null); // 'file' or 'link'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLink, setUploadLink] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Get grade level number from grade param (e.g., "grade7" -> 7)
  const gradeLevel = grade ? parseInt(grade.replace(/\D/g, '')) : null;

  // Get sections from API data
  const sections = sectionsData
    .filter((s) => s.gradeLevel === gradeLevel)
    .map((s) => s.sectionName || s.name)
    .sort();

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

  // Fetch subjects, teachers, and sections on mount
  useEffect(() => {
    if (gradeLevel) {
      dispatch(fetchAllSubjects({ gradeLevel }));
      dispatch(getAllSections({ gradeLevel }));
    }
    dispatch(fetchAllUsers({ role: 'Teacher', status: 'Active' }));
  }, [dispatch, gradeLevel]);

  // Initialize selected section when sections are loaded
  useEffect(() => {
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0]);
    }
  }, [sections, selectedSection]);

  // Fetch full subject data and materials when modal opens
  useEffect(() => {
    if (showMaterialModal && selectedSubject?._id) {
      dispatch(fetchSubjectById(selectedSubject._id));
      dispatch(fetchAllMaterials({ subjectId: selectedSubject._id }));
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
    setShowLinkModal(true);
    setLinkInput('');
    setLinkError(null);
  };

  const handleLinkSubmit = () => {
    let trimmedLink = linkInput.trim();
    
    if (!trimmedLink) {
      setLinkError('Please enter a link URL');
      return;
    }

    // Auto-add https:// if no protocol is provided
    if (!trimmedLink.startsWith('http://') && !trimmedLink.startsWith('https://')) {
      trimmedLink = `https://${trimmedLink}`;
    }

    // Basic URL validation
    try {
      new URL(trimmedLink);
    } catch {
      setLinkError('Please enter a valid URL (e.g., https://example.com or example.com)');
      return;
    }

    setUploadLink(trimmedLink);
    setUploadType('link');
    setUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowLinkModal(false);
    setLinkInput('');
    setLinkError(null);
  };

  const handleLinkCancel = () => {
    setShowLinkModal(false);
    setLinkInput('');
    setLinkError(null);
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
    if (!teacher) return 'Unknown Teacher';
    
    // Handle populated Teacher object from backend (teacherId array)
    // Backend populates: teacherId -> Teacher -> userId -> { firstName, lastName }
    if (typeof teacher === 'object') {
      // If teacher has userId populated (from backend populate)
      if (teacher.userId) {
        if (teacher.userId.firstName && teacher.userId.lastName) {
          return `${teacher.userId.firstName} ${teacher.userId.lastName}`;
        }
      }
      // If teacher has firstName/lastName directly (fallback)
      if (teacher.firstName && teacher.lastName) {
        return `${teacher.firstName} ${teacher.lastName}`;
      }
      // If it's just an ObjectId, try to find in availableTeachers
      if (teacher._id) {
        const teacherObj = availableTeachers.find(t => t.id === teacher._id);
        if (teacherObj) return teacherObj.name;
      }
    }
    
    // Handle string/ObjectId case
    if (typeof teacher === 'string' || (typeof teacher === 'object' && teacher.toString)) {
      const teacherObj = availableTeachers.find(t => t.id === teacher || t.id === teacher.toString());
      if (teacherObj) return teacherObj.name;
    }
    
    return 'Unknown Teacher';
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
      let fileUrl = '';
      let publicId = null;

      if (uploadType === 'file') {
        // Upload file to Cloudinary
        const formData = new FormData();
        formData.append('file', uploadFile);

        const uploadResponse = await api.post('/uploads/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        fileUrl = uploadResponse.data.url;
        publicId = uploadResponse.data.public_id;
      } else {
        // For links, just use the URL
        fileUrl = uploadLink.trim();
      }

      // Create material using materials API
      const materialData = {
        subjectId: selectedSubject._id,
        title: materialTitle.trim(),
        description: materialDescription.trim() || undefined,
        file: {
          url: fileUrl,
          ...(publicId && { public_id: publicId }),
        },
      };

      await dispatch(createMaterial(materialData)).unwrap();

      // Refresh materials list
      await dispatch(fetchAllMaterials({ subjectId: selectedSubject._id }));

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
      setErrorMessage(error?.payload || error?.response?.data?.message || 'Failed to upload material');
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

  // Filter materials for the selected subject
  const subjectMaterials = materials.filter((material) => {
    if (!selectedSubject?._id) return false;
    const materialSubjectId = material.subjectId?._id || material.subjectId;
    return materialSubjectId?.toString() === selectedSubject._id.toString();
  });

  const loading = subjectsLoading || usersLoading || materialsLoading;

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
            {sections.length === 0 ? (
              <div style={{ padding: '1rem', color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
                No sections found
              </div>
            ) : (
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
            )}
          </div>

          <div className={styles.tableCard}>
            <table className={styles.subjectsTable}>
              <thead>
                <tr>
                  <th>Subject & Section</th>
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
                  gradeSubjects.map((subject) => {
                    // Handle teacherId array (populated or not)
                    const teacherIds = Array.isArray(subject.teacherId)
                      ? subject.teacherId
                      : subject.teacherId
                      ? [subject.teacherId]
                      : [];
                    
                    // Get section name
                    const sectionName = subject.sectionId?.sectionName || subject.sectionId?.name || 'No section';
                    
                    return (
                      <tr key={subject._id}>
                        <td>
                          <div>{subject.subjectName || subject.name}</div>
                          {subject.sectionId && (
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                              Section: {sectionName}
                            </div>
                          )}
                        </td>
                        <td className={styles.teacherCell}>
                          {teacherIds.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {teacherIds.map((teacher, idx) => (
                                <button key={idx} className={styles.teacherPill}>
                                  {getTeacherName(teacher)}
                                </button>
                              ))}
                            </div>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Link Input Modal */}
      {showLinkModal && (
        <div className={styles.linkModalOverlay} onClick={handleLinkCancel}>
          <div className={styles.linkModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseBtn}
              onClick={handleLinkCancel}
            >
              &times;
            </button>
            <h2 className={styles.linkModalTitle}>Add Link</h2>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkInput}
              onChange={(e) => {
                setLinkInput(e.target.value);
                setLinkError(null);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLinkSubmit();
                }
              }}
              className={`${styles.linkModalInput} ${linkError ? styles.linkModalInputError : ''}`}
              autoFocus
            />
            <div className={styles.linkModalError}>
              {linkError || ''}
            </div>
            <div className={styles.linkModalButtons}>
              <button
                onClick={handleLinkCancel}
                className={styles.linkModalCancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleLinkSubmit}
                className={styles.linkModalSubmitBtn}
              >
                Add Link
              </button>
            </div>
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
                  Welcome to {currentSubject?.subjectName || currentSubject?.name || 'Subject'}!
                </div>
                <div className={styles.modalMaterials}>
                  {subjectMaterials.length > 0 ? (
                    [...subjectMaterials]
                      .sort((a, b) => new Date(b.dateUploaded || b.createdAt) - new Date(a.dateUploaded || a.createdAt))
                      .map((material) => (
                        <div key={material._id} className={styles.modalResourceCard}>
                          <div className={styles.modalResourceMeta}>
                            {getUploaderName(material.uploadedById)} • {formatTimeAgo(material.dateUploaded)}
                          </div>
                          <div className={styles.modalResourceTitle}>{material.title}</div>
                          {material.description && (
                            <div className={styles.modalResourceDescription}>{material.description}</div>
                          )}
                          <div className={styles.modalResourceFileRow}>
                            <div className={styles.modalResourceFileInfo}>
                              <span className={styles.modalResourceFileIcon}>
                                {isLink(material.file?.url) ? '🔗' : '📎'}
                              </span>
                              <span className={styles.modalResourceFileName}>
                                {isLink(material.file?.url)
                                  ? (material.title || material.file?.url)
                                  : (material.title || getFileName(material.file?.url))
                                }
                              </span>
                              {isLink(material.file?.url) ? (
                                <span className={styles.modalResourceFileSource}>
                                  {getLinkSource(material.file?.url)}
                                </span>
                              ) : (
                                <span className={styles.modalResourceFileSize}>
                                  File
                                </span>
                              )}
                            </div>
                            <button
                              className={isLink(material.file?.url) ? styles.modalResourceLinkBtn : styles.modalResourceDownloadBtn}
                              onClick={() => isLink(material.file?.url) ? handleOpenLink({ url: material.file?.url }) : handleDownloadMaterial({ url: material.file?.url })}
                            >
                              {isLink(material.file?.url) ? '↗️' : '⬇️'}
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
