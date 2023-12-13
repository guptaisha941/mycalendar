import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import './App.css';

const WeeklyScheduler = () => {
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [workingDays, setWorkingDays] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadWeeklySchedule(currentWeek, selectedTimezone);
    loadEvents();
  }, [currentWeek, selectedTimezone]);

  const loadWeeklySchedule = (week, timezone) => {
    const startOfWeek = week.clone().startOf('isoWeek');
    const endOfWeek = week.clone().endOf('isoWeek');
    const today = moment().startOf('day');
    const days = [];

    for (let day = startOfWeek.clone(); day.isSameOrBefore(endOfWeek); day.add(1, 'day')) {
      const workingHoursStart = day.clone().set({ hour: 8, minute: 0 });
      const workingHoursEnd = day.clone().set({ hour: 23, minute: 0 });

      const isToday = today.isSame(day, 'day');
      const isTodayOrFuture = isToday || day.isSameOrAfter(today);
      const isPast = !isTodayOrFuture && today.isAfter(day, 'day');

      const intervals = isPast
        ? [{ time: 'Passed', isPast: true }]
        : generateTimeSlots(workingHoursStart, workingHoursEnd, timezone);

      days.push({
        date: day.clone(),
        dayName: day.format('dddd'),
        intervals,
        isTodayOrFuture,
      });
    }

    setWorkingDays(days);
  };

  const generateTimeSlots = (start, end, timezone) => {
    const timeSlots = [];
    const currentTime = moment().tz(timezone);

    for (let time = start.clone(); time.isBefore(end); time.add(30, 'minutes')) {
      const formattedTime = time.tz(timezone).format('HH:mm');
      const isPast = currentTime.isAfter(time);
      timeSlots.push({ time: formattedTime, isPast });
    }

    return timeSlots.filter((slot) => !slot.isPast); // Filter out past time slots
  };

  const loadEvents = () => {
    // Load events from a JSON file or an API endpoint
    const eventData = [
      {
        Id: 101,
        Name: 'test',
        Date: '2023-12-14',
        Time: '11:30',
      },
      {
        Id: 102,
        Name: 'test 1',
        Date: '2023-12-14',
        Time: '09:00',
      },
    ];

    setEvents(eventData);
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setCurrentWeek(currentWeek.clone().add(1, 'week'));
  };

  const handleTimezoneChange = (e) => {
    setSelectedTimezone(e.target.value);
  };

  const handleCheckboxChange = (dayIndex, timeIndex) => {
    const updatedDays = [...workingDays];
    updatedDays[dayIndex].intervals[timeIndex].isChecked = !updatedDays[dayIndex].intervals[timeIndex].isChecked;
    setWorkingDays(updatedDays);
  };

  const eventsAtTime = (date, time) => {
    const event = events.find((e) => e.Date === date.format('YYYY-MM-DD') && e.Time === time);
    return !!event;
  };

  const getEventName = (date, time) => {
    const event = events.find((e) => e.Date === date.format('YYYY-MM-DD') && e.Time === time);
    return event ? event.Name : '';
  };

  return (
    <div className="weekly-scheduler">
      <div className="week-controls">
        <button onClick={handlePreviousWeek}>Previous</button>
        <span>{currentWeek.format('DD MMMM YYYY')}</span>
        <button onClick={handleNextWeek}>Next</button>
      </div>
      <div className="timezone-selector">
        <label>Timezone:</label>
        <select value={selectedTimezone} onChange={handleTimezoneChange}>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
        </select>
      </div>
      <div>
        {workingDays.map((day, dayIndex) => (
          <div key={dayIndex} className="day">
            <span>{day.dayName}</span>
            <span>{day.date.format('DD MMMM YYYY')}</span>
            <p className="intervals">
              {day.intervals.map((interval, timeIndex) => (
                <span key={timeIndex} className={interval.isPast ? 'past-interval' : ''}>
                  {interval.isPast ? (
                    <span>Passed</span>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={interval.isChecked || eventsAtTime(day.date, interval.time)}
                        onChange={() => handleCheckboxChange(dayIndex, timeIndex)}
                      />
                      <span>{interval.time}</span>
                      {eventsAtTime(day.date, interval.time) && (
                        <span  style={{ fontWeight: 'bold', color: 'blue' }} className="event-name">{getEventName(day.date, interval.time)}</span>
                      )}
                    </>
                  )}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyScheduler;
