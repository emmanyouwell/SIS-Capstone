import { useState, useEffect, useCallback } from 'react';
import styles from './StudentSubjects.module.css';

// Sample data for subject resources
const subjectResources = {
  'Mathematics': [
    {
      type: 'pdf',
      label: 'PDF Resource',
      uploader: 'Admin',
      time: '12 hrs ago',
      title: 'Algebra: Solving Linear Equations',
      name: 'Algebra_Linear_Equations.pdf',
      size: '2.1 MB',
      url: '#',
      duration: '1 hour, 10 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/pdf.png',
    },
    {
      type: 'file',
      label: 'Class File',
      uploader: 'Admin',
      time: '10 hrs ago',
      title: 'Math Worksheet - Fractions',
      name: 'Fractions_Worksheet.docx',
      size: '1.3 MB',
      url: '#',
      duration: '30 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/ms-word.png',
    },
    {
      type: 'link',
      label: 'Math Website',
      uploader: 'Teacher',
      time: '8 hrs ago',
      title: 'Khan Academy: Geometry',
      name: 'Khan Academy Geometry',
      url: 'https://www.khanacademy.org/math/geometry',
      duration: 'Self-paced',
      thumbnail: 'https://cdn.kastatic.org/images/khan-logo-vertical-transparent.png',
    },
    {
      type: 'url',
      label: 'YouTube Video',
      uploader: 'TED-Ed',
      time: '7 min ago',
      title: 'The Infinite Hotel Paradox',
      url: 'https://www.youtube.com/watch?v=Uj3_KqkI9Zo',
      duration: '7 minutes',
    },
    {
      type: 'url',
      label: 'YouTube Video',
      uploader: 'Numberphile',
      time: '17 min ago',
      title: 'Why do prime numbers matter?',
      url: 'https://www.youtube.com/watch?v=EK32jo7i5LQ',
      duration: '10 minutes',
    },
    {
      type: 'pdf',
      label: 'PDF Resource',
      uploader: 'Admin',
      time: '8 min ago',
      title: 'Geometry: Area and Perimeter',
      name: 'Geometry_Area_Perimeter.pdf',
      size: '1.8 MB',
      url: '#',
      duration: '50 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/pdf.png',
    },
    {
      type: 'file',
      label: 'Class File',
      uploader: 'Admin',
      time: '6 min ago',
      title: 'Trigonometry: Sine and Cosine',
      name: 'Trigonometry_Sine_Cosine.pptx',
      size: '2.5 MB',
      url: '#',
      duration: '1 hour',
      thumbnail: 'https://img.icons8.com/color/96/000000/ms-powerpoint.png',
    },
    {
      type: 'link',
      label: 'Math Blog',
      uploader: 'Teacher',
      time: '5 min ago',
      title: 'Understanding Derivatives',
      name: 'Math is Fun: Derivatives',
      url: 'https://www.mathsisfun.com/calculus/derivatives-introduction.html',
      duration: 'Article',
      thumbnail: 'https://www.mathsisfun.com/images/logo.png',
    },
  ],
  'Science': [
    {
      type: 'pdf',
      label: 'PDF Resource',
      uploader: 'Admin',
      time: '10 hrs ago',
      title: 'Biology: Cell Structure',
      name: 'Biology_Cell_Structure.pdf',
      size: '2.0 MB',
      url: '#',
      duration: '1 hour',
      thumbnail: 'https://img.icons8.com/color/96/000000/pdf.png',
    },
    {
      type: 'file',
      label: 'Lab File',
      uploader: 'Admin',
      time: '8 hrs ago',
      title: 'Chemistry Lab Report Template',
      name: 'Chem_Lab_Report.docx',
      size: '1.1 MB',
      url: '#',
      duration: '30 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/ms-word.png',
    },
    {
      type: 'link',
      label: 'Science Website',
      uploader: 'Teacher',
      time: '6 hrs ago',
      title: 'NASA Climate Kids',
      name: 'NASA Climate Kids',
      url: 'https://climatekids.nasa.gov/',
      duration: 'Self-paced',
      thumbnail: 'https://climatekids.nasa.gov/images/earth.png',
    },
    {
      type: 'url',
      label: 'YouTube Video',
      uploader: 'CrashCourse',
      time: '2 hrs ago',
      title: 'Photosynthesis Explained',
      url: 'https://www.youtube.com/watch?v=UPBMG5EYydo',
      duration: '8 minutes',
    },
  ],
  'English': [
    {
      type: 'pdf',
      label: 'PDF Resource',
      uploader: 'Admin',
      time: '9 hrs ago',
      title: 'Grammar: Parts of Speech',
      name: 'Grammar_Parts_of_Speech.pdf',
      size: '1.5 MB',
      url: '#',
      duration: '45 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/pdf.png',
    },
    {
      type: 'file',
      label: 'Essay File',
      uploader: 'Admin',
      time: '7 hrs ago',
      title: 'Sample Literary Essay',
      name: 'Literary_Essay.docx',
      size: '0.9 MB',
      url: '#',
      duration: '20 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/ms-word.png',
    },
    {
      type: 'link',
      label: 'English Website',
      uploader: 'Teacher',
      time: '5 hrs ago',
      title: 'Purdue OWL Writing Lab',
      name: 'Purdue OWL',
      url: 'https://owl.purdue.edu/owl/purdue_owl.html',
      duration: 'Self-paced',
      thumbnail: 'https://owl.purdue.edu/images/owl-logo.png',
    },
    {
      type: 'url',
      label: 'YouTube Video',
      uploader: 'TED-Ed',
      time: '1 hr ago',
      title: 'The Art of Storytelling',
      url: 'https://www.youtube.com/watch?v=Nj6x01wg2WA',
      duration: '6 minutes',
    },
  ],
  'MAPEH': [
    {
      type: 'pdf',
      label: 'PDF Resource',
      uploader: 'Admin',
      time: '8 hrs ago',
      title: 'Music: Elements of Rhythm',
      name: 'Music_Elements_of_Rhythm.pdf',
      size: '1.2 MB',
      url: '#',
      duration: '35 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/pdf.png',
    },
    {
      type: 'file',
      label: 'Art File',
      uploader: 'Admin',
      time: '6 hrs ago',
      title: 'Art Project Template',
      name: 'Art_Project_Template.pptx',
      size: '2.0 MB',
      url: '#',
      duration: '40 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/ms-powerpoint.png',
    },
    {
      type: 'link',
      label: 'PE Website',
      uploader: 'Teacher',
      time: '4 hrs ago',
      title: 'PE Central',
      name: 'PE Central',
      url: 'https://www.pecentral.org/',
      duration: 'Self-paced',
      thumbnail: 'https://www.pecentral.org/images/pecentral_logo.png',
    },
    {
      type: 'url',
      label: 'YouTube Video',
      uploader: 'Art for Kids Hub',
      time: '2 hrs ago',
      title: 'How to Draw a Cartoon',
      url: 'https://www.youtube.com/watch?v=2gq8xg5P4pA',
      duration: '12 minutes',
    },
  ],
  'Filipino': [
    {
      type: 'pdf',
      label: 'PDF Resource',
      uploader: 'Admin',
      time: '7 hrs ago',
      title: 'Panitikan: Mga Anyong Patula',
      name: 'Panitikan_Patula.pdf',
      size: '1.1 MB',
      url: '#',
      duration: '30 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/pdf.png',
    },
    {
      type: 'file',
      label: 'Worksheet',
      uploader: 'Admin',
      time: '5 hrs ago',
      title: 'Pagsasanay sa Wika',
      name: 'Pagsasanay_Wika.docx',
      size: '0.8 MB',
      url: '#',
      duration: '25 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/ms-word.png',
    },
    {
      type: 'link',
      label: 'Filipino Website',
      uploader: 'Teacher',
      time: '3 hrs ago',
      title: 'Balarila ng Wikang Filipino',
      name: 'Balarila',
      url: 'https://www.balarila.com/',
      duration: 'Self-paced',
      thumbnail: 'https://www.balarila.com/images/logo.png',
    },
    {
      type: 'url',
      label: 'YouTube Video',
      uploader: 'Pinoy Historian',
      time: '1 hr ago',
      title: 'Kasaysayan ng Wikang Filipino',
      url: 'https://www.youtube.com/watch?v=Qw3PpQ1hA1A',
      duration: '9 minutes',
    },
  ],
  'Araling Panlipunan': [
    {
      type: 'pdf',
      label: 'PDF Resource',
      uploader: 'Admin',
      time: '6 hrs ago',
      title: 'Kasaysayan: Unang Yugto',
      name: 'Kasaysayan_Unang_Yugto.pdf',
      size: '1.3 MB',
      url: '#',
      duration: '40 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/pdf.png',
    },
    {
      type: 'file',
      label: 'Project File',
      uploader: 'Admin',
      time: '4 hrs ago',
      title: 'Timeline Project',
      name: 'Timeline_Project.pptx',
      size: '1.7 MB',
      url: '#',
      duration: '35 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/ms-powerpoint.png',
    },
    {
      type: 'link',
      label: 'AP Website',
      uploader: 'Teacher',
      time: '2 hrs ago',
      title: 'National Historical Commission',
      name: 'NHCP',
      url: 'https://nhcp.gov.ph/',
      duration: 'Self-paced',
      thumbnail: 'https://nhcp.gov.ph/wp-content/uploads/2019/10/nhcp-logo.png',
    },
    {
      type: 'url',
      label: 'YouTube Video',
      uploader: 'History Channel',
      time: '1 hr ago',
      title: 'Philippine Revolution Documentary',
      url: 'https://www.youtube.com/watch?v=8Z8li-F9M9A',
      duration: '15 minutes',
    },
  ],
  'Values Education': [
    {
      type: 'pdf',
      label: 'PDF Resource',
      uploader: 'Admin',
      time: '5 hrs ago',
      title: 'Values: Honesty and Integrity',
      name: 'Values_Honesty_Integrity.pdf',
      size: '1.0 MB',
      url: '#',
      duration: '25 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/pdf.png',
    },
    {
      type: 'file',
      label: 'Worksheet',
      uploader: 'Admin',
      time: '3 hrs ago',
      title: 'Character Building Worksheet',
      name: 'Character_Building.docx',
      size: '0.7 MB',
      url: '#',
      duration: '20 minutes',
      thumbnail: 'https://img.icons8.com/color/96/000000/ms-word.png',
    },
    {
      type: 'link',
      label: 'Values Website',
      uploader: 'Teacher',
      time: '2 hrs ago',
      title: 'Good Character',
      name: 'Good Character',
      url: 'https://www.goodcharacter.com/',
      duration: 'Self-paced',
      thumbnail: 'https://www.goodcharacter.com/wp-content/uploads/2019/06/gc-logo.png',
    },
    {
      type: 'url',
      label: 'YouTube Video',
      uploader: 'The School of Life',
      time: '1 hr ago',
      title: 'What is Integrity?',
      url: 'https://www.youtube.com/watch?v=U5dF6G6Cw8Q',
      duration: '11 minutes',
    },
  ],
};

const subjects = [
  { name: 'Mathematics', class: 'math', icon: '🧮' },
  { name: 'Science', class: 'science', icon: '🔬' },
  { name: 'English', class: 'english', icon: '📚' },
  { name: 'MAPEH', class: 'mapeh', icon: '🎨' },
  { name: 'Filipino', class: 'filipino', icon: '📝' },
  { name: 'Araling Panlipunan', class: 'ap', icon: '🌏' },
  { name: 'Values Education', class: 'values', icon: '💡' },
];

function getYoutubeThumbnail(url) {
  const match = url.match(/[?&]v=([^&#]+)/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return '';
}

function getCardThumbnail(resource) {
  if (resource.type === 'url' && resource.url.includes('youtube.com')) {
    return (
      <img
        src={getYoutubeThumbnail(resource.url)}
        alt="YouTube thumbnail"
        className={styles.modalThumb}
      />
    );
  } else if (resource.thumbnail) {
    return (
      <img
        src={resource.thumbnail}
        alt="Resource thumbnail"
        className={styles.modalThumb}
      />
    );
  } else if (resource.type === 'link') {
    return (
      <span className={styles.modalThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: '#f7f7f7' }}>
        <svg width="32" height="32" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M10 14l2-2 2 2"/>
        </svg>
      </span>
    );
  }
  return null;
}

function StudentSubjects() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubjectClick = (subjectName) => {
    setSelectedSubject(subjectName);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSubject(null);
  }, []);

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleResourceClick = (resource) => {
    if (resource.url && resource.url !== '#') {
      window.open(resource.url, '_blank');
    }
  };

  const currentResources = selectedSubject ? (subjectResources[selectedSubject] || []) : [];

  // Close modal on Escape key
  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen, handleCloseModal]);

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.subjectsGrid}>
          {subjects.map((subject) => (
            <div
              key={subject.name}
              className={`${styles.subjectCard} ${styles[subject.class]}`}
              onClick={() => handleSubjectClick(subject.name)}
            >
              {subject.name}
              <span className={styles.subjectIcon}>{subject.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Modal */}
      {isModalOpen && selectedSubject && (
        <div className={styles.modalOverlay} onClick={handleModalOverlayClick}>
          <div className={styles.modalContent}>
            <button
              className={styles.modalClose}
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className={styles.modalTitle}>
              Welcome to {selectedSubject}!
            </div>
            <div className={styles.modalGrid}>
              {currentResources.map((resource, index) => (
                <div
                  key={index}
                  className={styles.modalCard}
                  onClick={() => handleResourceClick(resource)}
                  style={{ cursor: resource.url ? 'pointer' : 'default' }}
                >
                  {getCardThumbnail(resource)}
                  <div className={styles.modalLabel}>{resource.label}</div>
                  <div className={styles.modalTitle2}>{resource.title}</div>
                  <div className={styles.modalMeta}>{resource.duration}</div>
                  <div className={styles.modalMenu}>
                    <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>&#8942;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentSubjects;

