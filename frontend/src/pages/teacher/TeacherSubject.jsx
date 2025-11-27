import { useState, useRef } from 'react';
import styles from './TeacherSubject.module.css';

function TeacherSubject() {
  const [selectedSection, setSelectedSection] = useState('g8-lilac');
  const [uploadType, setUploadType] = useState(null); // 'file' or 'link'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLink, setUploadLink] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const fileInputRef = useRef(null);

  // Section materials data
  const [sectionMaterials, setSectionMaterials] = useState({
    'g8-lilac': [
      {
        id: 1,
        meta: 'PDF Resource',
        title: 'Algebra: Solving Linear Equations',
        type: 'pdf',
        url: '#',
        duration: '1 hour, 10 minutes',
        thumbnail: '',
      },
      {
        id: 2,
        meta: 'Class File',
        title: 'Math Worksheet - Fractions',
        type: 'file',
        url: '#',
        duration: '30 minutes',
        thumbnail: '',
      },
      {
        id: 3,
        meta: 'Math Website',
        title: 'Khan Academy: Geometry',
        type: 'website',
        url: 'https://www.khanacademy.org/math/geometry',
        duration: 'Self-paced',
        thumbnail: 'https://cdn.kastatic.org/images/lohp/ka-logo-2017.png',
      },
      {
        id: 4,
        meta: 'YouTube Video',
        title: 'The Infinite Hotel Paradox',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=Uj3_KqkI9Zo',
        duration: '7 minutes',
        thumbnail: 'https://img.youtube.com/vi/Uj3_KqkI9Zo/hqdefault.jpg',
      },
      {
        id: 5,
        meta: 'YouTube Video',
        title: 'Why do prime numbers matter?',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=EK32jo7i5LQ',
        duration: '10 minutes',
        thumbnail: 'https://img.youtube.com/vi/EK32jo7i5LQ/hqdefault.jpg',
      },
      {
        id: 6,
        meta: 'PDF Resource',
        title: 'Geometry: Area and Perimeter',
        type: 'pdf',
        url: '#',
        duration: '50 minutes',
        thumbnail: '',
      },
    ],
    'g8-tulip': [
      {
        id: 7,
        meta: 'PDF Resource',
        title: 'Quadratic Equations Practice',
        type: 'pdf',
        url: '#',
        duration: '1 hour',
        thumbnail: '',
      },
      {
        id: 8,
        meta: 'Class File',
        title: 'Math Worksheet - Decimals',
        type: 'file',
        url: '#',
        duration: '25 minutes',
        thumbnail: '',
      },
      {
        id: 9,
        meta: 'Math Website',
        title: 'Desmos Graphing Calculator',
        type: 'website',
        url: 'https://www.desmos.com/calculator',
        duration: 'Self-paced',
        thumbnail: 'https://www.desmos.com/assets/img/logos/og-image.png',
      },
      {
        id: 10,
        meta: 'YouTube Video',
        title: 'What is a function?',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=ke5MjeK2E2A',
        duration: '8 minutes',
        thumbnail: 'https://img.youtube.com/vi/ke5MjeK2E2A/hqdefault.jpg',
      },
    ],
    'g9-daisy': [
      {
        id: 11,
        meta: 'PDF Resource',
        title: 'Trigonometry Basics',
        type: 'pdf',
        url: '#',
        duration: '1 hour, 20 minutes',
        thumbnail: '',
      },
      {
        id: 12,
        meta: 'Class File',
        title: 'Math Worksheet - Polynomials',
        type: 'file',
        url: '#',
        duration: '40 minutes',
        thumbnail: '',
      },
      {
        id: 13,
        meta: 'Math Website',
        title: 'Brilliant: Math and Logic',
        type: 'website',
        url: 'https://brilliant.org/courses/math/',
        duration: 'Self-paced',
        thumbnail: 'https://brilliant.org/site_media/version-1/images/brilliant-fb-og.png',
      },
      {
        id: 14,
        meta: 'YouTube Video',
        title: 'Visualizing the Riemann Hypothesis',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=sD0NjbwqlYw',
        duration: '12 minutes',
        thumbnail: 'https://img.youtube.com/vi/sD0NjbwqlYw/hqdefault.jpg',
      },
    ]
  });

  const sections = [
    { value: 'g8-lilac', label: 'Grade 8 (Year III - Lilac)' },
    { value: 'g8-tulip', label: 'Grade 8 (Year III - Tulip)' },
    { value: 'g9-daisy', label: 'Grade 9 (Year IV - Daisy)' },
  ];

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

  const handleUpload = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a title.');
      return;
    }

    if (!uploadFile && !uploadLink) {
      alert('Please attach a file or link.');
      return;
    }

    const newResource = {
      id: Date.now(),
      meta: '',
      title: formData.title,
      type: '',
      url: '',
      duration: formData.description || '',
      thumbnail: ''
    };

    if (uploadFile) {
      newResource.meta = 'Class File';
      newResource.type = 'file';
      newResource.url = URL.createObjectURL(uploadFile); // Create object URL for local file
    } else if (uploadLink) {
      // Detect YouTube
      if (/youtube\.com|youtu\.be/.test(uploadLink)) {
        newResource.meta = 'YouTube Video';
        newResource.type = 'youtube';
        newResource.url = uploadLink;
        // Extract YouTube video ID for thumbnail
        const match = uploadLink.match(/[?&]v=([^&#]+)/) || uploadLink.match(/youtu\.be\/([^?&#]+)/);
        if (match && match[1]) {
          newResource.thumbnail = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
      } else {
        newResource.meta = 'Website Link';
        newResource.type = 'website';
        newResource.url = uploadLink;
      }
    }

    // Add to current section
    setSectionMaterials(prev => ({
      ...prev,
      [selectedSection]: [newResource, ...prev[selectedSection]]
    }));

    // Reset form
    setFormData({ title: '', description: '' });
    setUploadType(null);
    setUploadFile(null);
    setUploadLink('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResourceClick = (resource) => {
    if (resource.type === 'file' || resource.type === 'pdf') {
      // For files, trigger download or open
      if (resource.url && resource.url !== '#') {
        const link = document.createElement('a');
        link.href = resource.url;
        link.download = resource.title;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (resource.type === 'youtube' || resource.type === 'website') {
      // For links, open in new tab
      if (resource.url && resource.url !== '#') {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const currentMaterials = sectionMaterials[selectedSection] || [];

  return (
      <div className={styles.mainContent}>
        <div className={styles.subjectMain}>
          <div className={styles.subjectLeft}>
            <h1>Subject - Mathematics</h1>
            <div className={styles.sectionSelect}>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {sections.map(section => (
                  <option key={section.value} value={section.value}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.resourcesGrid}>
              {currentMaterials.map((resource) => (
                <div key={resource.id} className={styles.resourceCard}>
                  <div className={styles.resourceThumbnail}>
                    {resource.thumbnail ? (
                      <img src={resource.thumbnail} alt={resource.title} />
                    ) : (
                      <div className={styles.thumbnailPlaceholder}>
                        <svg width="48" height="48" fill="none" stroke="#a1c8b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20v13H6.5A2.5 2.5 0 0 1 4 17.5z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.resourceContent}>
                    <div className={styles.resourceMeta}>{resource.meta}</div>
                    <div className={styles.resourceTitle}>{resource.title}</div>
                    {resource.duration && (
                      <div className={styles.resourceDuration}>{resource.duration}</div>
                    )}
                    <div className={styles.resourceActions}>
                      <button
                        className={styles.resourceButton}
                        onClick={() => handleResourceClick(resource)}
                        title={resource.type === 'file' || resource.type === 'pdf' ? 'Download' : 'Open'}
                      >
                        {resource.type === 'file' || resource.type === 'pdf' ? (
                          <>
                            <span>📎</span> Download
                          </>
                        ) : (
                          <>
                            <span>🔗</span> Open Resource
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.subjectRight}>
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
                <button type="submit" className={styles.uploadBtn}>
                  Upload
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default TeacherSubject;

