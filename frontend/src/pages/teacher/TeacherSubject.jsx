import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './TeacherSubject.module.css';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { fetchAllMaterials, createMaterial } from '../../store/slices/materialsSlice';
import api from '../../utils/api';

function TeacherSubject() {
  const dispatch = useDispatch();
  const { subjects, loading: subjectsLoading } = useSelector((state) => state.subjects);
  const { materials, loading: materialsLoading } = useSelector((state) => state.materials);
  const { user } = useSelector((state) => state.auth);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [uploadType, setUploadType] = useState(null); // 'file' or 'link'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLink, setUploadLink] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch teacher's subjects on mount
  useEffect(() => {
    dispatch(fetchAllSubjects());
  }, [dispatch]);

  // Set first subject as selected when subjects are loaded
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  // Fetch materials when subject is selected
  useEffect(() => {
    if (selectedSubject?._id) {
      dispatch(fetchAllMaterials({ subjectId: selectedSubject._id }));
    }
  }, [selectedSubject?._id, dispatch]);

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

  // Filter materials for the selected subject
  const subjectMaterials = materials.filter((material) => {
    if (!selectedSubject?._id) return false;
    const materialSubjectId = material.subjectId?._id || material.subjectId;
    return materialSubjectId?.toString() === selectedSubject._id.toString();
  });

  const handleFileSelect = () => {
    setUploadType('file');
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadLink('');
    }
  };

  const handleLinkSelect = () => {
    setUploadType('link');
    const link = prompt('Paste the URL (YouTube, website, etc.):');
    if (link) {
      setUploadLink(link);
      setUploadFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject) {
      setErrorMessage('Please select a subject');
      return;
    }

    if (!formData.title.trim()) {
      setErrorMessage('Please enter a title');
      return;
    }

    if (!uploadFile && !uploadLink) {
      setErrorMessage('Please attach a file or link');
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      let fileUrl = '';
      let publicId = null;

      if (uploadFile) {
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
      } else if (uploadLink) {
        // For links, just use the URL
        fileUrl = uploadLink.trim();
      }

      // Create material using materials API
      const materialData = {
        subjectId: selectedSubject._id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        file: {
          url: fileUrl,
          ...(publicId && { public_id: publicId }),
        },
      };

      await dispatch(createMaterial(materialData)).unwrap();

      // Refresh materials list
      await dispatch(fetchAllMaterials({ subjectId: selectedSubject._id }));

      // Reset form
      setFormData({ title: '', description: '' });
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

  const handleResourceClick = (material) => {
    const url = material.file?.url;
    if (!url) return;

    if (isLink(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(url, '_blank');
    }
  };

  const isLink = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  const getLinkSource = (url) => {
    if (!url) return '';
    if (/youtube\.com|youtu\.be/i.test(url)) return 'YouTube';
    if (/drive\.google\.com/i.test(url)) return 'Google Drive';
    if (/res\.cloudinary\.com|cloudinary\.com/i.test(url)) return 'File';
    return 'Website';
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

  const loading = subjectsLoading || materialsLoading;

  return (
      <div className={styles.mainContent}>
        {/* Success Message */}
        {successMessage && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            borderRadius: '4px' 
          }}>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            borderRadius: '4px' 
          }}>
            {errorMessage}
          </div>
        )}

        <div className={styles.subjectMain}>
          {/* On mobile, upload form first, then list. On desktop, keep original order. */}
          <div className={styles.subjectRight + ' ' + styles.mobileOrderTop}>
            <div className={styles.uploadCard}>
              <h2>Add Title</h2>
              <form onSubmit={handleUpload}>
                <input
                  type="text"
                  placeholder="Add Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Add description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <label>Attach:</label>
                <div className={styles.attachBtns}>
                  <button type="button" onClick={handleFileSelect}>
                    File
                  </button>
                  <button type="button" onClick={handleLinkSelect}>
                    Link
                  </button>
                </div>
                {uploadFile && (
                  <div className={styles.selectedFile}>
                    Selected: {uploadFile.name}
                  </div>
                )}
                {uploadLink && (
                  <div className={styles.selectedLink}>
                    Link: {uploadLink.substring(0, 40)}...
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button 
                  type="submit" 
                  className={styles.uploadBtn}
                  disabled={uploading || !selectedSubject || !formData.title.trim() || (!uploadFile && !uploadLink)}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>
          </div>
          <div className={styles.subjectLeft + ' ' + styles.mobileOrderBottom}>
            <h1>
              {selectedSubject 
                ? `Subject - ${selectedSubject.subjectName || selectedSubject.name}` 
                : 'Subject Materials'}
            </h1>
            <div className={styles.sectionSelect}>
              <select
                value={selectedSubject?._id || ''}
                onChange={(e) => {
                  const subject = subjects.find(s => s._id === e.target.value);
                  setSelectedSubject(subject);
                }}
                disabled={loading || subjects.length === 0}
              >
                {subjects.length === 0 ? (
                  <option value="">No subjects available</option>
                ) : (
                  <>
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subjectName || subject.name} - Grade {subject.gradeLevel}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : subjectMaterials.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                {selectedSubject ? 'No materials uploaded yet' : 'Please select a subject'}
              </div>
            ) : (
              <div className={styles.resourcesGrid + ' ' + styles.centeredGrid}>
                {subjectMaterials
                  .sort((a, b) => new Date(b.dateUploaded || b.createdAt) - new Date(a.dateUploaded || a.createdAt))
                  .map((material) => {
                    const url = material.file?.url;
                    const isLinkUrl = isLink(url);
                    return (
                      <div key={material._id} className={styles.resourceCard}>
                        <div className={styles.resourceThumbnail}>
                          {isLinkUrl && /youtube\.com|youtu\.be/i.test(url) ? (
                            (() => {
                              const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
                              const videoId = match && match[1];
                              return videoId ? (
                                <img 
                                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                                  alt={material.title} 
                                />
                              ) : (
                                <div className={styles.thumbnailPlaceholder}>
                                  <svg width="48" height="48" fill="none" stroke="#a1c8b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20v13H6.5A2.5 2.5 0 0 1 4 17.5z"/>
                                  </svg>
                                </div>
                              );
                            })()
                          ) : (
                            <div className={styles.thumbnailPlaceholder}>
                              <svg width="48" height="48" fill="none" stroke="#a1c8b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20v13H6.5A2.5 2.5 0 0 1 4 17.5z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className={styles.resourceContent}>
                          <div className={styles.resourceMeta}>
                            {isLinkUrl ? getLinkSource(url) : 'File'} • {formatTimeAgo(material.dateUploaded)}
                          </div>
                          <div className={styles.resourceTitle}>{material.title}</div>
                          {material.description && (
                            <div className={styles.resourceDuration}>{material.description}</div>
                          )}
                          <div className={styles.resourceActions}>
                            <button
                              className={styles.resourceButton}
                              onClick={() => handleResourceClick(material)}
                              title={isLinkUrl ? 'Open' : 'Download'}
                            >
                              {isLinkUrl ? (
                                <>
                                  <span>🔗</span> Open Resource
                                </>
                              ) : (
                                <>
                                  <span>📎</span> Download
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default TeacherSubject;

