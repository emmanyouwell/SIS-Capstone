import Help from '../../components/Help';
import { teacherHelpData } from '../../data/helpData';
import styles from './TeacherHelp.module.css';

function TeacherHelp() {
  return (
    <div className={styles.mainContent}>
        <Help
          helpCards={teacherHelpData.helpCards}
          faqs={teacherHelpData.faqs}
          supportChannels={teacherHelpData.supportChannels}
        />
      </div>
  );
}

export default TeacherHelp;

