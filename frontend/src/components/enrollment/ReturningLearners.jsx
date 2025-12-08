import styles from './ReturningLearners.module.css';

function ReturningLearners({ formData, handleInputChange, errors = {} }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>RETURNING LEARNER INFORMATION</div>
      <div className={styles.formContent}>
        <div className={styles.formRow}>
          <label>Last Grade Level Completed</label>
          <input
            type="number"
            name="lastGradeLevelCompleted"
            value={formData.lastGradeLevelCompleted || ''}
            onChange={handleInputChange}
            min="1"
            max="10"
            className={errors.lastGradeLevelCompleted ? styles.inputError : ''}
            required
          />
          {errors.lastGradeLevelCompleted && (
            <span className={styles.errorText}>{errors.lastGradeLevelCompleted}</span>
          )}
        </div>
        <div className={styles.formRow}>
          <label>Last School Year Completed</label>
          <input
            type="text"
            name="lastSchoolYearCompleted"
            value={formData.lastSchoolYearCompleted || ''}
            onChange={handleInputChange}
            placeholder="e.g., 2023-2024"
            className={errors.lastSchoolYearCompleted ? styles.inputError : ''}
            required
          />
          {errors.lastSchoolYearCompleted && (
            <span className={styles.errorText}>{errors.lastSchoolYearCompleted}</span>
          )}
        </div>
        <div className={styles.formRow}>
          <label>Last School Enrolled</label>
          <input
            type="text"
            name="lastSchoolEnrolled"
            value={formData.lastSchoolEnrolled || ''}
            onChange={handleInputChange}
            placeholder="School name"
            className={errors.lastSchoolEnrolled ? styles.inputError : ''}
            required
          />
          {errors.lastSchoolEnrolled && (
            <span className={styles.errorText}>{errors.lastSchoolEnrolled}</span>
          )}
        </div>
        <div className={styles.formRow}>
          <label>School ID</label>
          <input
            type="text"
            name="schoolId"
            value={formData.schoolId || ''}
            onChange={handleInputChange}
            placeholder="School ID"
            className={errors.schoolId ? styles.inputError : ''}
            required
          />
          {errors.schoolId && (
            <span className={styles.errorText}>{errors.schoolId}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReturningLearners;


