import { useEffect, useRef } from 'react';
import styles from './StudentSchedule.module.css';

// Sample schedule data
const scheduleData = [
  {
    time: '7:00AM - 8:00AM',
    monday: 'Math',
    tuesday: 'MAPEH',
    wednesday: 'English',
    thursday: 'Filipino',
    friday: 'Science',
  },
  {
    time: '8:00AM - 9:00AM',
    monday: 'Science',
    tuesday: 'Math',
    wednesday: 'Science',
    thursday: 'English',
    friday: 'Math',
  },
  {
    time: '9:00AM - 9:15AM',
    isBreak: true,
  },
  {
    time: '9:15AM - 10:15AM',
    monday: 'English',
    tuesday: 'TLE',
    wednesday: 'MAPEH',
    thursday: 'Math',
    friday: 'ESP',
  },
  {
    time: '10:15AM - 11:15AM',
    monday: 'A.P.',
    tuesday: 'English',
    wednesday: 'A.P.',
    thursday: 'Science',
    friday: 'English',
  },
  {
    time: '11:15AM - 12:15PM',
    monday: 'Filipino',
    tuesday: 'Science',
    wednesday: 'TLE',
    thursday: 'ESP',
    friday: 'Filipino',
  },
];

function StudentSchedule() {
  const calendarRef = useRef(null);
  const flatpickrInstance = useRef(null);

  useEffect(() => {
    // Dynamically load flatpickr CSS and JS
    const loadFlatpickr = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="flatpickr"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.flatpickr) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
        script.async = true;
        script.onload = () => {
          if (calendarRef.current && window.flatpickr) {
            flatpickrInstance.current = window.flatpickr(calendarRef.current, {
              inline: true,
              defaultDate: '2025-06-01',
              minDate: '2025-06-01',
              maxDate: '2026-03-31',
              locale: {
                firstDayOfWeek: 1, // Monday
              },
            });
          }
        };
        document.body.appendChild(script);
      } else if (calendarRef.current) {
        flatpickrInstance.current = window.flatpickr(calendarRef.current, {
          inline: true,
          defaultDate: '2025-06-01',
          minDate: '2025-06-01',
          maxDate: '2026-03-31',
          locale: {
            firstDayOfWeek: 1, // Monday
          },
        });
      }
    };

    loadFlatpickr();

    // Cleanup
    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className={styles.mainContent}>
        <div className={styles.scheduleLayout}>
          <div className={styles.scheduleTableCard}>
            <div className={styles.scheduleTitleRow}>
              <span className={styles.scheduleTitle}>Weekly Class Schedule</span>
            </div>
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
                {scheduleData.map((row, index) => {
                  if (row.isBreak) {
                    return (
                      <tr key={index}>
                        <td>{row.time}</td>
                        <td colSpan="5" className={styles.breakRow}>
                          <span className={styles.breakLabel}>BREAK TIME</span>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={index}>
                      <td>{row.time}</td>
                      <td>
                        <span className={styles.classPill}>{row.monday}</span>
                      </td>
                      <td>
                        <span className={styles.classPill}>{row.tuesday}</span>
                      </td>
                      <td>
                        <span className={styles.classPill}>{row.wednesday}</span>
                      </td>
                      <td>
                        <span className={styles.classPill}>{row.thursday}</span>
                      </td>
                      <td>
                        <span className={styles.classPill}>{row.friday}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className={styles.scheduleSidePanel}>
            <div className={styles.calendarBox}>
              <input
                ref={calendarRef}
                id="real-calendar"
                className={styles.realCalendarInput}
                placeholder="Select date..."
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
  );
}

export default StudentSchedule;

