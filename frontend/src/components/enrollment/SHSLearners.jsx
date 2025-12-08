import styles from './SHSLearners.module.css';

function SHSLearners({ formData, handleInputChange, errors = {} }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>SENIOR HIGH SCHOOL INFORMATION</div>
      <div className={styles.formContent}>
        <div className={styles.formRow}>
          <label>Semester</label>
          <select
            name="semester"
            value={formData.semester || ''}
            onChange={handleInputChange}
            className={errors.semester ? styles.inputError : ''}
            required
          >
            <option value="">Select Semester</option>
            <option value="1st">1st Semester</option>
            <option value="2nd">2nd Semester</option>
          </select>
          {errors.semester && (
            <span className={styles.errorText}>{errors.semester}</span>
          )}
        </div>
        <div className={styles.formRow}>
          <label>Track</label>
          <select
            name="track"
            value={formData.track || ''}
            onChange={handleInputChange}
            className={errors.track ? styles.inputError : ''}
            required
          >
            <option value="">Select Track</option>
            <option value="Academic">Academic</option>
            <option value="Technical-Vocational-Livelihood">Technical-Vocational-Livelihood</option>
            <option value="Sports">Sports</option>
            <option value="Arts and Design">Arts and Design</option>
          </select>
          {errors.track && (
            <span className={styles.errorText}>{errors.track}</span>
          )}
        </div>
        {formData.track === 'Academic' && (
          <div className={styles.formRow}>
            <label>Strand</label>
            <select
              name="strand"
              value={formData.strand || ''}
              onChange={handleInputChange}
              className={errors.strand ? styles.inputError : ''}
              required
            >
              <option value="">Select Strand</option>
              <option value="STEM">STEM</option>
              <option value="ABM">ABM</option>
              <option value="HUMSS">HUMSS</option>
              <option value="GAS">GAS</option>
            </select>
            {errors.strand && (
              <span className={styles.errorText}>{errors.strand}</span>
            )}
          </div>
        )}
        <div className={styles.formRow}>
          <label>Other Learning Modalities (Optional)</label>
          <input
            type="text"
            name="otherLearningModalities"
            value={formData.otherLearningModalities || ''}
            onChange={handleInputChange}
            placeholder="e.g., Distance Learning, Blended Learning"
          />
        </div>
      </div>
    </div>
  );
}

export default SHSLearners;


