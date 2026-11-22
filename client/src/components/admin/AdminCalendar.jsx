import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, X, Bed, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminCalendar() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(11); // November
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  useEffect(() => {
    fetchCalendar();
  }, [year, month]);

  async function fetchCalendar() {
    setLoading(true);
    try {
      const data = await api.getCalendar(year, month);
      setCalendarData(data);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setLoading(false);
    }
  }

  function changeMonth(delta) {
    let nextM = month + delta;
    let nextY = year;
    if (nextM > 12) {
      nextM = 1;
      nextY++;
    } else if (nextM < 1) {
      nextM = 12;
      nextY--;
    }
    setMonth(nextM);
    setYear(nextY);
  }

  function goToToday() {
    // Reference in screenshot is November 2026
    setYear(2026);
    setMonth(11);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Top Title Pill */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10">
        <h2 className="font-serif text-2xl font-bold text-[#142821]">Calendar</h2>
      </div>

      {/* Main Calendar Card matching screenshot */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold">
            Reservation Schedule
          </span>
          <h3 className="font-serif text-3xl font-bold text-[#142821] mt-1 mb-2">
            Room occupancy calendar
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Select a date to see guests staying that night. Check-out day is excluded.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-lg text-stone-900 px-2 min-w-[160px] text-center">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="ml-2 px-3 py-1 rounded-full border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-stone-700"
            >
              Today
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#df6653]"></span>
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#52a578]"></span>
              <span>Available</span>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center text-xs font-semibold text-stone-500 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Month Day Grid */}
        {loading || !calendarData ? (
          <div className="py-20 text-center text-stone-500 text-xs">Loading occupancy schedule...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {/* Blank offset days */}
            {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20 sm:h-24 rounded-2xl bg-stone-50/50 border border-transparent" />
            ))}

            {/* Days in month */}
            {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayInfo = calendarData.days[dayNum] || { status: 'available', count: 0, guests: [] };
              const isReserved = dayInfo.count > 0;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDayDetails(dayInfo)}
                  className={`h-20 sm:h-24 p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isReserved
                      ? 'bg-[#faeae7] border-[#f2b9b1] hover:border-[#df6653]'
                      : 'bg-[#edf6f0] border-[#cce4d4] hover:border-[#86c59f]'
                  }`}
                >
                  <span className="font-bold text-xs sm:text-sm text-stone-800">
                    {dayNum}
                  </span>

                  <div>
                    {isReserved ? (
                      <span className="text-[10px] sm:text-xs font-semibold text-[#b83824]">
                        {dayInfo.count} reservation{dayInfo.count > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-xs font-medium text-[#2d734e]">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day Details Modal */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-[#183429] text-white">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif text-lg font-bold">Night of {selectedDayDetails.date}</h3>
              </div>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="p-1 rounded-full hover:bg-white/10 text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {selectedDayDetails.guests?.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500">
                  All rooms are available on this night.
                </div>
              ) : (
                selectedDayDetails.guests?.map((g, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-stone-800">{g.reference_id}</span>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {g.status}
                      </span>
                    </div>
                    <div className="font-semibold text-stone-900 text-sm">{g.name}</div>
                    <div className="text-stone-600 flex items-center gap-2">
                      <Bed className="w-3.5 h-3.5 text-emerald-800" />
                      <span>{g.room} ({g.room_number || 'Room unassigned'})</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 text-center">
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="px-6 py-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
