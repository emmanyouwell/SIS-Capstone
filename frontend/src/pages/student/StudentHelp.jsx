import Help from '../../components/Help';
import { studentHelpData } from '../../data/helpData';
import styles from './StudentHelp.module.css';

function StudentHelp() {
  return (
    <div className={styles.mainContent}>
        <Help
          helpCards={studentHelpData.helpCards}
          faqs={studentHelpData.faqs}
          supportChannels={studentHelpData.supportChannels}
        />
      </div>
  );
}

export default StudentHelp;

