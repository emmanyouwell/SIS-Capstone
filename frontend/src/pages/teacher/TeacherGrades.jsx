import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './TeacherGrades.module.css';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { fetchMasterlists } from '../../store/slices/masterlistSlice';
import { fetchGrades, updateGrade, createGrade } from '../../store/slices/gradeSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { getAllSections } from '../../store/slices/sectionSlice';
import { fetchCurrentEnrollmentPeriod } from '../../store/slices/enrollmentPeriodSlice';

function TeacherGrades() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { subjects, loading: subjectsLoading } = useSelector((state) => state.subjects);
  const { masterlists, loading: masterlistsLoading } = useSelector((state) => state.masterlists);
  const { grades, loading: gradesLoading } = useSelector((state) => state.grades);
  const { students: allStudents } = useSelector((state) => state.students);
  const { data: allSections, loading: sectionsLoading } = useSelector((state) => state.section);
  const { currentPeriod } = useSelector((state) => state.enrollmentPeriod);

  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [currentTab, setCurrentTab] = useState('q1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGradeInputModal, setShowGradeInputModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentGradeRecord, setCurrentGradeRecord] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [gradeComment, setGradeComment] = useState('');
  const [gradeInputError, setGradeInputError] = useState('');
  const [pendingGrade, setPendingGrade] = useState(null);
  const [pendingComment, setPendingComment] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [fadeClass, setFadeClass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch subjects, masterlists, students, sections, and enrollment period on mount
  useEffect(() => {
    dispatch(fetchAllSubjects());
    dispatch(fetchAllStudents());
    dispatch(getAllSections());
    dispatch(fetchCurrentEnrollmentPeriod());
  }, [dispatch]);

  // Fetch masterlists with current school year
  useEffect(() => {
    if (currentPeriod?.schoolYear) {
      dispatch(fetchMasterlists({ schoolYear: currentPeriod.schoolYear }));
    } else {
      // Fallback: fetch without school year filter (backend will use latest enrollment period)
      dispatch(fetchMasterlists());
    }
  }, [dispatch, currentPeriod?.schoolYear]);

  // Fetch grades when subjects or masterlists change
  useEffect(() => {
    if (subjects.length > 0) {
      dispatch(fetchGrades());
    }
  }, [dispatch, subjects.length]);

  // Get grade levels from subjects the teacher teaches (for filtering subjects only)
  const teacherGradeLevels = useMemo(() => {
    const gradeLevels = new Set();
    subjects.forEach((subject) => {
      if (subject.gradeLevel !== null && subject.gradeLevel !== undefined) {
        // Ensure gradeLevel is a number for consistent comparison
        const gradeLevel = Number(subject.gradeLevel);
        if (!isNaN(gradeLevel)) {
          gradeLevels.add(gradeLevel);
        }
      }
    });
    return Array.from(gradeLevels).sort((a, b) => a - b);
  }, [subjects]);

  // Get sections that the teacher handles using masterlists (match by teacher's userId)
  const sections = useMemo(() => {
    if (!masterlists || masterlists.length === 0 || !user?.id) return [];

    const teacherUserId = (user.id || user._id)?.toString();
    if (!teacherUserId) return [];

    const sectionMap = new Map();

    masterlists.forEach((ml) => {
      const adviserUserId = ml.adviser?.userId?._id?.toString();

      const isAdviser = adviserUserId && adviserUserId === teacherUserId;

      const isSubjectTeacher = Array.isArray(ml.subjectTeachers) && ml.subjectTeachers.some((st) => {
        const stUserId = st.teacher?.userId?._id?.toString();
        return stUserId && stUserId === teacherUserId;
      });

      if (isAdviser || isSubjectTeacher) {
        const sectionId = ml.section?._id?.toString();
        if (sectionId && !sectionMap.has(sectionId)) {
          sectionMap.set(sectionId, {
            _id: ml.section?._id,
            sectionName: ml.section?.sectionName,
            gradeLevel: Number(ml.grade),
          });
        }
      }
    });

    return Array.from(sectionMap.values()).sort((a, b) => {
      if (a.gradeLevel !== b.gradeLevel) return a.gradeLevel - b.gradeLevel;
      return a.sectionName.localeCompare(b.sectionName);
    });
  }, [masterlists, user]);

  // Get subjects for selected section (filter by grade level of the section)
  const sectionSubjects = useMemo(() => {
    if (!selectedSectionId) return [];
    const selectedIdStr = selectedSectionId.toString();
    const selectedSection = sections.find((s) => {
      const sectionId = s._id?.toString();
      return sectionId === selectedIdStr;
    });
    
    if (!selectedSection) return [];
    
    // Get all subjects for the grade level of the selected section
    return subjects
      .filter((subject) => subject.gradeLevel === selectedSection.gradeLevel)
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [subjects, selectedSectionId, sections]);

  // Get masterlist for selected section
  const currentMasterlist = useMemo(() => {
    if (!selectedSectionId) return null;
    const selectedIdStr = selectedSectionId.toString();
    const section = sections.find((s) => {
      const sectionId = s._id?.toString();
      return sectionId === selectedIdStr;
    });
    if (!section) return null;
    
    // Match masterlist by section ID (ml.section is populated as an object with _id)
    return masterlists.find((ml) => {
      const mlSectionId = ml.section?._id?.toString() || ml.section?.toString();
      return ml.grade === section.gradeLevel && mlSectionId === selectedIdStr;
    });
  }, [masterlists, sections, selectedSectionId]);

  // Create mapping from User ID to Student ID using grades and students
  const userIdToStudentIdMap = useMemo(() => {
    const map = new Map();
    
    // First, add mappings from grades
    grades.forEach((grade) => {
      const studentId = grade.studentId?._id || grade.studentId;
      const userId = grade.studentId?.userId?._id || grade.studentId?.userId;
      if (studentId && userId) {
        map.set(userId.toString(), studentId.toString());
      }
    });
    
    // Then, add mappings from students list (for students without grades yet)
    allStudents.forEach((student) => {
      const studentId = student._id;
      const userId = student.userId?._id || student.userId;
      if (studentId && userId && !map.has(userId.toString())) {
        map.set(userId.toString(), studentId.toString());
      }
    });
    
    return map;
  }, [grades, allStudents]);

  // Get students for current section
  const students = useMemo(() => {
    if (!currentMasterlist) return [];
    return (currentMasterlist.students || []).map((student) => {
      const userId = student._id || student;
      const userIdStr = userId?.toString();
      // Find Student ID from mapping or grade record
      let studentModelId = userIdToStudentIdMap.get(userIdStr);
      
      // Find grade record for this student
      const gradeRecord = grades.find((g) => {
        const gUserId = g.studentId?.userId?._id || g.studentId?.userId;
        return gUserId?.toString() === userIdStr;
      });
      
      // If we found a grade record but no mapping, use the studentId from grade
      if (gradeRecord && !studentModelId) {
        studentModelId = gradeRecord.studentId?._id || gradeRecord.studentId;
        if (studentModelId) {
          userIdToStudentIdMap.set(userIdStr, studentModelId.toString());
        }
      }
      
      return {
        ...student,
        userId: userIdStr,
        studentId: studentModelId, // Student model _id (for grade creation)
        gradeRecord,
      };
    });
  }, [currentMasterlist, grades, userIdToStudentIdMap]);

  // Set default section when sections load
  useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      const firstSectionId = sections[0]._id?.toString() || sections[0]._id;
      setSelectedSectionId(firstSectionId);
    }
  }, [sections, selectedSectionId]);

  // Set default subject when section subjects load
  useEffect(() => {
    if (sectionSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(sectionSubjects[0]._id);
    }
  }, [sectionSubjects, selectedSubjectId]);

  // Get section display name
  const getSectionDisplayName = () => {
    if (!selectedSectionId) return 'Select Section';
    const selectedIdStr = selectedSectionId.toString();
    const section = sections.find((s) => {
      const sectionId = s._id?.toString();
      return sectionId === selectedIdStr;
    });
    if (!section) return 'Select Section';
    return `Grade ${section.gradeLevel} - ${section.sectionName}`;
  };

  // Format student name
  const formatStudentName = (student) => {
    if (!student) return '';
    const lastName = student.lastName || '';
    const firstName = student.firstName || '';
    const middleName = student.middleName || '';
    const extensionName = student.extensionName || '';
    
    let name = lastName;
    if (firstName) name += `, ${firstName}`;
    if (middleName) name += ` ${middleName.charAt(0)}.`;
    if (extensionName) name += ` ${extensionName}`;
    return name;
  };

  // Get grade for current student, subject, and quarter
  const getStudentGrade = (student) => {
    if (!student.gradeRecord || !selectedSubjectId) return null;
    const subjectGrade = student.gradeRecord.grades?.find((g) => {
      const subjId = g.subjectId?._id || g.subjectId;
      return subjId?.toString() === selectedSubjectId?.toString();
    });
    if (!subjectGrade) return null;
    return subjectGrade[currentTab] || null;
  };

  // Get final grade for student
  const getStudentFinalGrade = (student) => {
    if (!student.gradeRecord) return null;
    return student.gradeRecord.finalGrade || null;
  };

  // Get remarks for student
  const getStudentRemarks = (student) => {
    if (!student.gradeRecord) return '';
    return student.gradeRecord.remarks || '';
  };

  // Get comment for student
  const getStudentComment = (student) => {
    if (!student.gradeRecord) return '';
    return student.gradeRecord.comment || '';
  };

  // Handle section change
  const handleSectionChange = (e) => {
    setSelectedSectionId(e.target.value);
    setSelectedSubjectId(null);
    setSearchQuery('');
  };

  // Handle subject change
  const handleSubjectChange = (e) => {
    setSelectedSubjectId(e.target.value);
    setSearchQuery('');
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setFadeClass('fadeOut');
    setTimeout(() => {
      setCurrentTab(tab);
      setFadeClass('fadeIn');
      setTimeout(() => {
        setFadeClass('');
      }, 300);
    }, 150);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Open grade input modal
  const handleViewGrade = (student) => {
    setCurrentStudent(student);
    setCurrentGradeRecord(student.gradeRecord);
    const currentGrade = getStudentGrade(student);
    setGradeInput(currentGrade !== null && currentGrade !== undefined ? currentGrade.toString() : '');
    setGradeComment(getStudentComment(student));
    setGradeInputError('');
    setShowGradeInputModal(true);
  };

  // Close grade input modal
  const closeGradeInputModal = () => {
    setShowGradeInputModal(false);
    setCurrentStudent(null);
    setCurrentGradeRecord(null);
    setGradeInput('');
    setGradeComment('');
    setGradeInputError('');
  };

  // Open confirmation modal
  const openConfirmationModal = () => {
    const gradeValue = gradeInput.trim();
    const commentValue = gradeComment.trim();

    if (gradeValue === '') {
      setPendingGrade(null);
      setPendingComment(commentValue);
    } else {
      const gradeNum = parseFloat(gradeValue);
      if (isNaN(gradeNum) || gradeNum < 60 || gradeNum > 100) {
        setGradeInputError('Please enter a grade between 60 and 100.');
        return;
      }
      setPendingGrade(gradeNum);
      setPendingComment(commentValue);
    }

    setGradeInputError('');
    setShowConfirmationModal(true);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  // Submit grade
  const submitGrade = async () => {
    if (!currentStudent || !selectedSubjectId) return;

    setSubmitting(true);
    try {
      const gradeValue = pendingGrade;
      const commentValue = pendingComment.trim();

      // Find or create grade record
      let gradeRecord = currentGradeRecord;
      let updatedGrades = [];

      if (gradeRecord && gradeRecord.grades) {
        // Update existing grade record
        updatedGrades = gradeRecord.grades.map((g) => {
          const subjId = g.subjectId?._id || g.subjectId;
          if (subjId?.toString() === selectedSubjectId?.toString()) {
            return {
              ...g,
              [currentTab]: gradeValue !== null ? gradeValue : undefined,
            };
          }
          return g;
        });

        // Check if subject grade entry exists
        const hasSubject = updatedGrades.some((g) => {
          const subjId = g.subjectId?._id || g.subjectId;
          return subjId?.toString() === selectedSubjectId?.toString();
        });

        // Add subject if it doesn't exist
        if (!hasSubject && gradeValue !== null) {
          updatedGrades.push({
            subjectId: selectedSubjectId,
            [currentTab]: gradeValue,
          });
        }

        // Update grade record
        await dispatch(
          updateGrade({
            id: gradeRecord._id,
            data: {
              grades: updatedGrades,
              comment: commentValue,
            },
          })
        ).unwrap();
      } else {
        // Create new grade record
        const studentId = currentStudent.studentId;
        
        if (!studentId) {
          throw new Error('Student ID not found. Please refresh the page and try again.');
        }
        
        updatedGrades = [
          {
            subjectId: selectedSubjectId,
            [currentTab]: gradeValue !== null ? gradeValue : undefined,
          },
        ];

        const newGradeRecord = await dispatch(
          createGrade({
            studentId,
            grades: updatedGrades,
            comment: commentValue,
          })
        ).unwrap();
        gradeRecord = newGradeRecord;
      }

      // Refresh grades
      await dispatch(fetchGrades());

      closeConfirmationModal();
      closeGradeInputModal();
      setToastMessage(`Grade posted successfully for ${formatStudentName(currentStudent)}.`);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 2200);
    } catch (error) {
      setGradeInputError(error || 'Failed to update grade. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Enter key in grade input
  const handleGradeInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      openConfirmationModal();
    }
  };

  // Handle Enter key in comment input
  const handleCommentKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      openConfirmationModal();
    }
  };

  // Get filtered students
  const getFilteredStudents = () => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter((student) => {
      const name = formatStudentName(student).toLowerCase();
      const lrn = (student.learnerReferenceNo || '').toLowerCase();
      return name.includes(query) || lrn.includes(query);
    });
  };

  // Get confirmation summary
  const getConfirmationSummary = () => {
    const gradeValue = pendingGrade !== null ? pendingGrade.toString() : '-';
    const status = pendingGrade !== null ? (pendingGrade >= 75 ? 'PASSED' : 'FAILED') : '';
    const statusColor = status === 'PASSED' ? '#184d27' : status === 'FAILED' ? '#c53030' : '';
    
    return { gradeValue, status, statusColor };
  };

  // Get student info HTML
  const getStudentInfo = () => {
    if (!currentStudent) return '';
    const name = formatStudentName(currentStudent);
    const lrn = currentStudent.learnerReferenceNo || 'N/A';
    const selectedIdStr = selectedSectionId?.toString();
    const section = sections.find((s) => {
      const sectionId = s._id?.toString();
      return sectionId === selectedIdStr;
    });
    const gradeLevel = section?.gradeLevel || 'N/A';
    return `Name: <b>${name}</b><br>LRN: <b>${lrn}</b><br>Grade: <b>${gradeLevel}</b>`;
  };

  const filteredStudents = getFilteredStudents();
  const selectedSubject = sectionSubjects.find((s) => s._id === selectedSubjectId);
  const loading = subjectsLoading || masterlistsLoading || gradesLoading || sectionsLoading;

  if (loading && sections.length === 0 && allSections.length === 0) {
    return (
      <div className={styles.mainContent}>
        <h1 className={styles.gradesTitle}>Grades</h1>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading grades data...</p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className={styles.mainContent}>
        <h1 className={styles.gradesTitle}>Grades</h1>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No sections available. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  return (
      <div className={styles.mainContent}>
        <h1 className={styles.gradesTitle}>Grades - {getSectionDisplayName()}</h1>
        
        <div className={styles.sectionSelect}>
          <select
            id="sectionSelect"
            value={selectedSectionId || ''}
            onChange={handleSectionChange}
            className={styles.sectionSelectInput}
          >
            {sections.map((section) => {
              const sectionId = section._id?.toString() || section._id;
              return (
                <option key={sectionId} value={sectionId}>
                  Grade {section.gradeLevel} - {section.sectionName}
                </option>
              );
            })}
          </select>
        </div>

        {sectionSubjects.length > 0 && (
          <div className={styles.sectionSelect} style={{ marginTop: '1rem' }}>
            <select
              id="subjectSelect"
              value={selectedSubjectId || ''}
              onChange={handleSubjectChange}
              className={styles.sectionSelectInput}
            >
              {sectionSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.gradesCard}>
          <div className={styles.gradesTabs}>
            <button
              className={`${styles.gradesTab} ${currentTab === 'q1' ? styles.active : ''}`}
              onClick={() => handleTabChange('q1')}
            >
              First Quarter
            </button>
            <button
              className={`${styles.gradesTab} ${currentTab === 'q2' ? styles.active : ''}`}
              onClick={() => handleTabChange('q2')}
            >
              Second Quarter
            </button>
            <button
              className={`${styles.gradesTab} ${currentTab === 'q3' ? styles.active : ''}`}
              onClick={() => handleTabChange('q3')}
            >
              Third Quarter
            </button>
            <button
              className={`${styles.gradesTab} ${currentTab === 'q4' ? styles.active : ''}`}
              onClick={() => handleTabChange('q4')}
            >
              Fourth Quarter
            </button>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className={styles.gradesSearch}
              />
            </div>
          </div>

          <div className={`${styles.gradesTableContainer} ${fadeClass ? styles[fadeClass] : ''}`}>
            <table className={styles.gradesTable}>
              <thead>
                <tr>
                  <th className={`${styles.gradeCol}`}>Grade</th>
                  <th className={`${styles.subjectCol}`}>Subject</th>
                  <th className={`${styles.nameCol}`}>Name</th>
                  <th className={`${styles.qCol}`}>
                    {currentTab === 'q1' ? 'Q1 Grade' : 
                     currentTab === 'q2' ? 'Q2 Grade' : 
                     currentTab === 'q3' ? 'Q3 Grade' : 'Q4 Grade'}
                  </th>
                  <th className={`${styles.lrnCol}`}>LRN</th>
                  <th className={`${styles.finalCol}`}>Final Grade</th>
                  <th className={`${styles.editCol}`}>Edit Grades</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      {selectedSubjectId ? 'No students found in this section.' : 'Please select a subject.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => {
                    const studentGrade = getStudentGrade(student);
                    const finalGrade = getStudentFinalGrade(student);
                    const selectedIdStr = selectedSectionId?.toString();
                    const section = sections.find((s) => {
                      const sectionId = s._id?.toString();
                      return sectionId === selectedIdStr;
                    });
                    return (
                      <tr
                        key={student.studentId || index}
                      >
                        <td className={styles.gradeCol} style={{ textAlign: 'center' }}>{section?.gradeLevel || 'N/A'}</td>
                        <td className={styles.subjectCol} style={{ textAlign: 'center' }}>{selectedSubject?.subjectName || 'N/A'}</td>
                        <td className={styles.nameCol}>{formatStudentName(student)}</td>
                        <td className={styles.qCol} style={{ textAlign: 'center', fontWeight: studentGrade !== null && studentGrade !== undefined ? 600 : 400 }}>
                          {studentGrade !== null && studentGrade !== undefined ? Math.round(studentGrade) : '-'}
                        </td>
                        <td className={styles.lrnCol}>{student.learnerReferenceNo || 'N/A'}</td>
                        <td className={styles.finalCol}>{finalGrade !== null && finalGrade !== undefined ? Math.round(finalGrade) : '-'}</td>
                        <td className={styles.editCol}>
                          <button
                            onClick={() => handleViewGrade(student)}
                            className={styles.viewButton}
                            disabled={!selectedSubjectId}
                          >
                            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="12" r="4" />
                              <line x1="21" y1="12" x2="17" y2="12" />
                            </svg>
                            view
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

        {/* Grade Input Modal */}
        {showGradeInputModal && (
          <div
            className={styles.gradeInputModal}
            onClick={closeGradeInputModal}
          >
            <div
              className={styles.gradeInputModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src="/images/logo.jpg"
                alt="School Logo"
                className={styles.modalLogo}
              />
              <div className={styles.studentInfoContainer}>
                <div className={styles.studentInfoTitle}>Student Information</div>
                <div
                  className={styles.studentInfo}
                  dangerouslySetInnerHTML={{ __html: getStudentInfo() }}
                />
              </div>
              <h3 className={styles.modalTitle}>
                Insert Grade for <span>{currentStudent ? formatStudentName(currentStudent) : ''}</span>
              </h3>
              <input
                type="number"
                id="gradeInput"
                placeholder="Enter grade (60-100) or leave blank"
                min="60"
                max="100"
                value={gradeInput}
                onChange={(e) => {
                  setGradeInput(e.target.value);
                  setGradeInputError('');
                }}
                onKeyPress={handleGradeInputKeyPress}
                className={styles.modalInput}
              />
              <textarea
                id="gradeComment"
                placeholder="Add a comment (optional)"
                rows="2"
                value={gradeComment}
                onChange={(e) => setGradeComment(e.target.value)}
                onKeyPress={handleCommentKeyPress}
                className={styles.modalTextarea}
              />
              {gradeInputError && (
                <div className={styles.errorMessage}>{gradeInputError}</div>
              )}
              <div className={styles.modalButtons}>
                <button
                  className={styles.cancelBtn}
                  onClick={closeGradeInputModal}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={openConfirmationModal}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div
            className={styles.confirmationModal}
            onClick={closeConfirmationModal}
          >
            <div
              className={styles.confirmationModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src="/images/logo.jpg"
                alt="School Logo"
                className={styles.modalLogo}
              />
              <div className={styles.studentInfoContainer}>
                <div className={styles.studentInfoTitle}>Student Information</div>
                <div
                  className={styles.studentInfo}
                  dangerouslySetInnerHTML={{ __html: getStudentInfo() }}
                />
              </div>
              <div className={styles.confirmationSummary}>
                {(() => {
                  const summary = getConfirmationSummary();
                  return (
                    <div style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>
                      You are about to post grade <b>{summary.gradeValue}</b>{' '}
                      {summary.status && (
                        <span style={{ color: summary.statusColor, fontWeight: 700 }}>
                          {summary.status}
                        </span>
                      )}{' '}
                      for <b>{currentStudent ? formatStudentName(currentStudent) : ''}</b>.
                      <br />
                      {pendingComment && (
                        <>
                          Comment: <i>{pendingComment}</i>
                        </>
                      )}
                      <br />
                      Proceed?
                    </div>
                  );
                })()}
              </div>
              <div className={styles.confirmationModalButtons}>
                <button
                  className={styles.cancelBtn}
                  onClick={closeConfirmationModal}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={submitGrade}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className={styles.successToast}>{toastMessage}</div>
        )}
      </div>
  );
}

export default TeacherGrades;

