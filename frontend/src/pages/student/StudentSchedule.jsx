import { useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './StudentSchedule.module.css';
import { fetchAllSchedules, clearError } from '../../store/slices/scheduleSlice';

const times = [
  '7:00-8:00 AM',
  '8:00-9:00 AM',
  'BREAK',
  '9:15-10:15 AM',
  '10:15-11:15 AM',
  '11:15-12:15 PM',
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function StudentSchedule() {
  const dispatch = useDispatch();
  const { schedules, loading, error } = useSelector((state) => state.schedules);
  const calendarRef = useRef(null);
  const flatpickrInstance = useRef(null);

  // Fetch schedules on mount
  useEffect(() => {
    dispatch(fetchAllSchedules());
  }, [dispatch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Transform schedules to table format
  const scheduleData = useMemo(() => {
    const tableData = [];

    times.forEach((time) => {
      if (time === 'BREAK') {
        tableData.push({
          time: '9:00AM - 9:15AM',
          isBreak: true,
        });
        return;
      }

      const [startTime, endTime] = time.replace(' AM', '').replace(' PM', '').split('-');
      const dayData = {
        time: `${startTime.trim()} - ${endTime.trim()}`,
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
      };

      days.forEach((day) => {
        const matchingSchedule = schedules.find((s) => {
          const scheduleDay = s.day;
          const scheduleStartTime = s.startTime?.trim() || '';
          const scheduleEndTime = s.endTime?.trim() || '';
          // Normalize times for comparison (remove AM/PM, handle variations)
          const normalizeTime = (t) => t.replace(/AM|PM|am|pm/gi, '').trim();
          const normalizedStart = normalizeTime(startTime);
          const normalizedEnd = normalizeTime(endTime);
          const normalizedScheduleStart = normalizeTime(scheduleStartTime);
          const normalizedScheduleEnd = normalizeTime(scheduleEndTime);
          
          const timeMatch =
            normalizedScheduleStart === normalizedStart &&
            normalizedScheduleEnd === normalizedEnd;
          return scheduleDay === day && timeMatch;
        });

        if (matchingSchedule && matchingSchedule.subjectId) {
          const subject = matchingSchedule.subjectId;
          const teacher = subject?.teacherId?.userId;
          const teacherName = teacher
            ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
            : '';
          const subjectName = subject?.subjectName || '';

          dayData[day.toLowerCase()] = {
            subject: subjectName,
            teacher: teacherName,
          };
        }
      });

      tableData.push(dayData);
    });

    return tableData;
  }, [schedules]);

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
      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
          }}
        >
          {error}
        </div>
      )}

      {loading && schedules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading schedule...</div>
      )}

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
                    {days.map((day) => {
                      const dayData = row[day.toLowerCase()];
                      if (dayData && dayData.subject) {
                        return (
                          <td key={day}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className={styles.classPill}>{dayData.subject}</span>
                              {dayData.teacher && (
                                <span
                                  style={{
                                    fontSize: '0.85rem',
                                    color: '#666',
                                    fontStyle: 'italic',
                                    marginTop: '2px',
                                  }}
                                >
                                  {dayData.teacher}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      }
                      return <td key={day}>-</td>;
                    })}
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

