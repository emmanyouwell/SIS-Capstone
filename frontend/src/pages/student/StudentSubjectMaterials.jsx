import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './StudentSubjectMaterials.module.css';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { fetchAllMaterials } from '../../store/slices/materialsSlice';

const ITEMS_PER_PAGE = 12;

function formatTimeAgo(date) {
  if (!date) return 'just now';
  const now = new Date();
  const uploaded = new Date(date);
  const diffInSeconds = Math.floor((now - uploaded) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return uploaded.toLocaleDateString();
}

function getYoutubeThumbnail(url) {
  const match = url.match(/[?&]v=([^&#]+)/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return '';
}

function getDefaultThumbnail(type, url) {
  if (url && url.includes('youtube.com')) {
    return getYoutubeThumbnail(url);
  }
  if (type === 'pdf' || url?.includes('.pdf')) {
    return 'https://img.icons8.com/color/96/000000/pdf.png';
  }
  if (type === 'file' || url?.includes('.doc') || url?.includes('.docx')) {
    return 'https://img.icons8.com/color/96/000000/ms-word.png';
  }
  if (url?.includes('.ppt') || url?.includes('.pptx')) {
    return 'https://img.icons8.com/color/96/000000/ms-powerpoint.png';
  }
  return 'https://img.icons8.com/color/96/000000/file.png';
}

function getResourceType(url) {
  if (!url) return 'file';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'url';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('.pdf')) return 'pdf';
    return 'link';
  }
  return 'file';
}

function StudentSubjectMaterials() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjectId } = useParams();
  
  const { subjects } = useSelector((state) => state.subjects);
  const { materials, loading: materialsLoading } = useSelector((state) => state.materials);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Find the selected subject
  const selectedSubject = subjects.find((s) => s._id === subjectId);

  // Fetch subject if not in store
  useEffect(() => {
    if (!selectedSubject && subjectId) {
      dispatch(fetchAllSubjects());
    }
  }, [dispatch, subjectId, selectedSubject]);

  // Fetch materials for the subject
  useEffect(() => {
    if (subjectId) {
      dispatch(fetchAllMaterials({ subjectId }));
    }
  }, [dispatch, subjectId]);

  // Filter materials by search term
  const filteredMaterials = useMemo(() => {
    if (!materials || materials.length === 0) return [];
    
    return materials.filter((material) => {
      if (!searchTerm.trim()) return true;
      
      const term = searchTerm.toLowerCase().trim();
      const title = (material.title || '').toLowerCase();
      const description = (material.description || '').toLowerCase();
      const uploader = material.uploadedById?.firstName && material.uploadedById?.lastName
        ? `${material.uploadedById.firstName} ${material.uploadedById.lastName}`.toLowerCase()
        : '';
      
      return title.includes(term) || description.includes(term) || uploader.includes(term);
    });
  }, [materials, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleBack = () => {
    navigate('/student/subjects');
  };

  const handleResourceClick = (material) => {
    const url = material.file?.url;
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Back to Subjects
        </button>
        <h1>{selectedSubject?.subjectName || 'Subject Materials'}</h1>
        {selectedSubject && (
          <p className={styles.subtitle}>Grade {selectedSubject.gradeLevel} • View all materials posted by your teacher</p>
        )}
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search materials by title, description, or teacher name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <div className={styles.searchResults}>
            {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Materials Grid */}
      {materialsLoading ? (
        <div className={styles.loadingState}>
          <p>Loading materials...</p>
        </div>
      ) : paginatedMaterials.length === 0 ? (
        <div className={styles.emptyState}>
          {searchTerm ? (
            <>
              <p>No materials found matching "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')} className={styles.clearButton}>
                Clear search
              </button>
            </>
          ) : (
            <p>No materials available for this subject yet.</p>
          )}
        </div>
      ) : (
        <>
          <div className={styles.materialsGrid}>
            {paginatedMaterials.map((material) => {
              const resourceType = getResourceType(material.file?.url);
              const thumbnail = getDefaultThumbnail(resourceType, material.file?.url);
              const uploaderName = material.uploadedById?.firstName && material.uploadedById?.lastName
                ? `${material.uploadedById.firstName} ${material.uploadedById.lastName}`
                : 'Teacher';
              const timeAgo = formatTimeAgo(material.dateUploaded);

              return (
                <div
                  key={material._id}
                  className={styles.materialCard}
                  onClick={() => handleResourceClick(material)}
                >
                  <div className={styles.materialThumbnail}>
                    {resourceType === 'url' && material.file?.url?.includes('youtube.com') ? (
                      <img
                        src={thumbnail}
                        alt="YouTube thumbnail"
                        className={styles.thumbnailImage}
                      />
                    ) : thumbnail ? (
                      <img
                        src={thumbnail}
                        alt="Material thumbnail"
                        className={styles.thumbnailImage}
                      />
                    ) : (
                      <div className={styles.thumbnailPlaceholder}>
                        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                      </div>
                    )}
                    {resourceType === 'url' && (
                      <div className={styles.resourceTypeBadge}>
                        {material.file?.url?.includes('youtube.com') ? 'YouTube' : 'Link'}
                      </div>
                    )}
                  </div>
                  <div className={styles.materialContent}>
                    <h3 className={styles.materialTitle}>{material.title}</h3>
                    {material.description && (
                      <p className={styles.materialDescription}>{material.description}</p>
                    )}
                    <div className={styles.materialMeta}>
                      <span className={styles.materialUploader}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {uploaderName}
                      </span>
                      <span className={styles.materialTime}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Previous
              </button>
              <div className={styles.paginationNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    
                    return (
                      <span key={page}>
                        {showEllipsis && <span className={styles.paginationEllipsis}>...</span>}
                        <button
                          className={`${styles.paginationNumber} ${
                            currentPage === page ? styles.active : ''
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}
              </div>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentSubjectMaterials;

