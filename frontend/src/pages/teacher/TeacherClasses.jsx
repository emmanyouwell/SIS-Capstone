import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoCard from '../../components/InfoCard';
import styles from './TeacherClasses.module.css';
import { fetchAllSchedules, clearError } from '../../store/slices/scheduleSlice';

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

const times = [
  '7:00-8:00 AM',
  '8:00-9:00 AM',
  'BREAK',
  '9:15-10:15 AM',
  '10:15-11:15 AM',
  '11:15-12:15 PM',
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function TeacherClasses() {
  const dispatch = useDispatch();
  const { schedules, loading, error } = useSelector((state) => state.schedules);

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

        if (matchingSchedule && matchingSchedule.subjectId && matchingSchedule.sectionId) {
          const subject = matchingSchedule.subjectId;
          const section = matchingSchedule.sectionId;
          const sectionName = section?.sectionName || '';
          const gradeLevel = section?.gradeLevel || '';
          const subjectName = subject?.subjectName || '';
          const classLabel = `${gradeLevel} - ${sectionName}`;
          
          // Handle teacherId as array or single object
          let teacher = null;
          if (subject?.teacherId) {
            if (Array.isArray(subject.teacherId)) {
              // If it's an array, get the first teacher with userId populated
              teacher = subject.teacherId.find(t => t?.userId)?.userId || 
                       (subject.teacherId[0]?.userId || null);
            } else {
              teacher = subject.teacherId.userId || null;
            }
          }
          
          const teacherName = teacher
            ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
            : '';

          dayData[day.toLowerCase()] = {
            class: classLabel,
            type: sectionName.toLowerCase().replace(/\s+/g, ''),
            subject: subjectName,
            teacher: teacherName,
          };
        }
      });

      tableData.push(dayData);
    });

    return tableData;
  }, [schedules]);

  const getClassPillClassName = (type) => {
    const baseClass = styles.classPill;
    const typeClass = styles[`class${type.charAt(0).toUpperCase() + type.slice(1)}`];
    return `${baseClass} ${typeClass}`;
  };

  // Calculate stats from schedules
  const stats = useMemo(() => {
    const uniqueSections = new Set();
    const uniqueSubjects = new Set();
    
    schedules.forEach((schedule) => {
      if (schedule.sectionId?._id) {
        uniqueSections.add(schedule.sectionId._id.toString());
      }
      if (schedule.subjectId?._id) {
        uniqueSubjects.add(schedule.subjectId._id.toString());
      }
    });

    // Calculate total hours (assuming each schedule entry is 1 hour)
    const totalHours = schedules.length;

    return {
      classes: uniqueSections.size,
      subjects: uniqueSubjects.size,
      hours: totalHours,
    };
  }, [schedules]);

  return (
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Classes</h1>
        </div>

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
        
        <div className={styles.infoCards}>
          <InfoCard 
            icon={classesIcon} 
            title="Total Classes" 
            number={stats.classes.toString()} 
            subtext="Active Classes" 
          />
          <InfoCard 
            icon={studentsIcon} 
            title="Subjects" 
            number={stats.subjects.toString()} 
            subtext="Total Subjects" 
          />
          <InfoCard 
            icon={hoursIcon} 
            title="Hours" 
            number={stats.hours.toString()} 
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className={getClassPillClassName(row.monday.type)}>
                                {row.monday.class}
                              </span>
                              {row.monday.subject && (
                                <span
                                  style={{
                                    fontSize: '0.85rem',
                                    color: '#333',
                                    fontWeight: '500',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.monday.subject}
                                </span>
                              )}
                              {row.monday.teacher && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#666',
                                    fontStyle: 'italic',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.monday.teacher}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {row.tuesday && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className={getClassPillClassName(row.tuesday.type)}>
                                {row.tuesday.class}
                              </span>
                              {row.tuesday.subject && (
                                <span
                                  style={{
                                    fontSize: '0.85rem',
                                    color: '#333',
                                    fontWeight: '500',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.tuesday.subject}
                                </span>
                              )}
                              {row.tuesday.teacher && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#666',
                                    fontStyle: 'italic',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.tuesday.teacher}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {row.wednesday && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className={getClassPillClassName(row.wednesday.type)}>
                                {row.wednesday.class}
                              </span>
                              {row.wednesday.subject && (
                                <span
                                  style={{
                                    fontSize: '0.85rem',
                                    color: '#333',
                                    fontWeight: '500',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.wednesday.subject}
                                </span>
                              )}
                              {row.wednesday.teacher && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#666',
                                    fontStyle: 'italic',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.wednesday.teacher}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {row.thursday && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className={getClassPillClassName(row.thursday.type)}>
                                {row.thursday.class}
                              </span>
                              {row.thursday.subject && (
                                <span
                                  style={{
                                    fontSize: '0.85rem',
                                    color: '#333',
                                    fontWeight: '500',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.thursday.subject}
                                </span>
                              )}
                              {row.thursday.teacher && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#666',
                                    fontStyle: 'italic',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.thursday.teacher}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {row.friday && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className={getClassPillClassName(row.friday.type)}>
                                {row.friday.class}
                              </span>
                              {row.friday.subject && (
                                <span
                                  style={{
                                    fontSize: '0.85rem',
                                    color: '#333',
                                    fontWeight: '500',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.friday.subject}
                                </span>
                              )}
                              {row.friday.teacher && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#666',
                                    fontStyle: 'italic',
                                    marginTop: '2px',
                                  }}
                                >
                                  {row.friday.teacher}
                                </span>
                              )}
                            </div>
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

