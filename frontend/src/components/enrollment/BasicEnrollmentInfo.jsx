import styles from './BasicEnrollmentInfo.module.css';

function BasicEnrollmentInfo({ formData, handleInputChange, handleCheckboxChange, errors = {} }) {
  return (
    <div className={styles.section}>
      <div className={styles.formContent}>
        <div className={styles.formRow}>
          <label>School Year *</label>
          <input
            type="text"
            name="schoolYear"
            value={formData.schoolYear || ''}
            onChange={handleInputChange}
            placeholder="e.g., 2024-2025"
            className={errors.schoolYear ? styles.inputError : ''}
            required
          />
          {errors.schoolYear && (
            <span className={styles.errorText}>{errors.schoolYear}</span>
          )}
        </div>
        <div className={styles.formRow}>
          <label>Grade Level to Enroll *</label>
          <select
            name="gradeLevelToEnroll"
            value={formData.gradeLevelToEnroll || ''}
            onChange={handleInputChange}
            className={errors.gradeLevelToEnroll ? styles.inputError : ''}
            required
          >
            <option value="">Select Grade Level</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
          </select>
          {errors.gradeLevelToEnroll && (
            <span className={styles.errorText}>{errors.gradeLevelToEnroll}</span>
          )}
        </div>
        <div className={styles.checkboxRow}>
          <label>
            <input
              type="checkbox"
              name="withLRN"
              checked={formData.withLRN || false}
              onChange={handleCheckboxChange}
            />
            With LRN
          </label>
          <label>
            <input
              type="checkbox"
              name="returning"
              checked={formData.returning || false}
              onChange={handleCheckboxChange}
            />
            Returning Learner
          </label>
        </div>
      </div>
    </div>
  );
}

export default BasicEnrollmentInfo;


