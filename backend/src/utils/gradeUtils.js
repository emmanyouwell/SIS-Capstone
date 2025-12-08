/**
 * Get grade descriptor and remarks based on final grade
 * Based on Table 10: Descriptors, Grading Scale, and Remarks
 * @param {number} finalGrade - The final grade (0-100)
 * @returns {Object} Object containing descriptor and remarks
 */
export const getGradeDescriptor = (finalGrade) => {
  if (finalGrade === null || finalGrade === undefined) {
    return {
      descriptor: 'Incomplete',
      remarks: 'Pending',
    };
  }

  const roundedGrade = Math.round(finalGrade);

  if (roundedGrade >= 90 && roundedGrade <= 100) {
    return {
      descriptor: 'Outstanding',
      remarks: 'Passed',
    };
  } else if (roundedGrade >= 85 && roundedGrade <= 89) {
    return {
      descriptor: 'Very Satisfactory',
      remarks: 'Passed',
    };
  } else if (roundedGrade >= 80 && roundedGrade <= 84) {
    return {
      descriptor: 'Satisfactory',
      remarks: 'Passed',
    };
  } else if (roundedGrade >= 75 && roundedGrade <= 79) {
    return {
      descriptor: 'Fairly Satisfactory',
      remarks: 'Passed',
    };
  } else {
    return {
      descriptor: 'Did Not Meet Expectations',
      remarks: 'Failed',
    };
  }
};

/**
 * Check if a grade record is complete (all quarters filled for all subjects)
 * @param {Array} grades - Array of subject grades
 * @returns {boolean} True if all quarters are filled for all subjects
 */
export const isGradeComplete = (grades) => {
  if (!grades || grades.length === 0) {
    return false;
  }

  return grades.every((subjectGrade) => {
    const quarters = ['q1', 'q2', 'q3', 'q4'];
    return quarters.every((q) => {
      const value = subjectGrade[q];
      return value !== null && value !== undefined && typeof value === 'number';
    });
  });
};

/**
 * Calculate subject final grade from quarters
 * @param {Object} subjectGrade - Subject grade object with q1, q2, q3, q4
 * @returns {number|null} Final grade or null if incomplete
 */
const calculateSubjectFinalGrade = (subjectGrade) => {
  const quarters = ['q1', 'q2', 'q3', 'q4'];
  const quarterGrades = quarters
    .map((q) => subjectGrade[q])
    .filter((val) => val !== null && val !== undefined && typeof val === 'number');
  
  if (quarterGrades.length === 0) {
    return null;
  }
  
  return quarterGrades.reduce((sum, val) => sum + val, 0) / quarterGrades.length;
};

/**
 * Check if student should be promoted based on grades
 * Promotion rules:
 * - All subject grades >= 75 AND final grade >= 75 → promoted
 * - Otherwise → not promoted
 * @param {Object} grade - Grade document with grades array and finalGrade
 * @returns {boolean} True if student should be promoted
 */
export const shouldPromoteStudent = (grade) => {
  if (!grade || !grade.grades || grade.grades.length === 0) {
    return false;
  }

  // Check if all quarters are complete for all subjects
  if (!isGradeComplete(grade.grades)) {
    return false;
  }

  // Check if final grade exists and is >= 75
  if (!grade.finalGrade || grade.finalGrade < 75) {
    return false;
  }

  // Check if all subject final grades are >= 75
  const allSubjectsPassed = grade.grades.every((subjectGrade) => {
    const subjectFinal = calculateSubjectFinalGrade(subjectGrade);
    return subjectFinal !== null && subjectFinal >= 75;
  });

  return allSubjectsPassed;
};

