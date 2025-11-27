import InfoCard from '../../components/InfoCard';
import styles from './TeacherClasses.module.css';

const classesIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/3388/3388614.png" 
    alt="Classes Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

const studentsIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/3426/3426653.png" 
    alt="Students Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

const hoursIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/2838/2838779.png" 
    alt="Hours Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

function TeacherClasses() {
  // Schedule data - can be moved to state or props later
  const scheduleData = [
    {
      time: '7:00 - 8:00',
      monday: { class: '8 - LILAC', type: 'lilac' },
      tuesday: { class: '8 - IRIS', type: 'iris' },
      wednesday: { class: '8 - LILAC', type: 'lilac' },
      thursday: { class: '8 - LILAC', type: 'lilac' },
      friday: { class: '8 - LILAC', type: 'lilac' },
    },
    {
      time: '8:00 - 9:00',
      monday: { class: '9 - DAISY', type: 'daisy' },
      tuesday: { class: '8 - TULIP', type: 'tulip' },
      wednesday: { class: '8 - TULIP', type: 'tulip' },
      thursday: { class: '8 - TULIP', type: 'tulip' },
      friday: { class: '8 - TULIP', type: 'tulip' },
    },
    {
      time: '9:00 - 9:15',
      isBreak: true,
    },
    {
      time: '9:15 - 10:15',
      monday: { class: '9 - DAISY', type: 'daisy' },
      tuesday: { class: '9 - DAISY', type: 'daisy' },
      wednesday: { class: '9 - DAISY', type: 'daisy' },
      thursday: { class: '9 - DAISY', type: 'daisy' },
      friday: { class: '9 - DAISY', type: 'daisy' },
    },
  ];

  const getClassPillClassName = (type) => {
    const baseClass = styles.classPill;
    const typeClass = styles[`class${type.charAt(0).toUpperCase() + type.slice(1)}`];
    return `${baseClass} ${typeClass}`;
  };

  return (
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Classes</h1>
        </div>
        
        <div className={styles.infoCards}>
          <InfoCard 
            icon={classesIcon} 
            title="Total Classes" 
            number="4" 
            subtext="Active Classes" 
          />
          <InfoCard 
            icon={studentsIcon} 
            title="Students" 
            number="40" 
            subtext="Total Students" 
          />
          <InfoCard 
            icon={hoursIcon} 
            title="Hours" 
            number="24" 
            subtext="Weekly Hours" 
          />
        </div>
        
        <div className={styles.scheduleContainer}>
          <div className={styles.scheduleCard}>
            <h2>Weekly Class Schedule</h2>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.time}</td>
                    {row.isBreak ? (
                      <td colSpan="5" className={styles.break}>
                        Break Time
                      </td>
                    ) : (
                      <>
                        <td>
                          {row.monday && (
                            <span className={getClassPillClassName(row.monday.type)}>
                              {row.monday.class}
                            </span>
                          )}
                        </td>
                        <td>
                          {row.tuesday && (
                            <span className={getClassPillClassName(row.tuesday.type)}>
                              {row.tuesday.class}
                            </span>
                          )}
                        </td>
                        <td>
                          {row.wednesday && (
                            <span className={getClassPillClassName(row.wednesday.type)}>
                              {row.wednesday.class}
                            </span>
                          )}
                        </td>
                        <td>
                          {row.thursday && (
                            <span className={getClassPillClassName(row.thursday.type)}>
                              {row.thursday.class}
                            </span>
                          )}
                        </td>
                        <td>
                          {row.friday && (
                            <span className={getClassPillClassName(row.friday.type)}>
                              {row.friday.class}
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

export default TeacherClasses;

