import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, X, Bed, Calendar as CalendarIcon, Ban, CheckCircle2, AlertTriangle, Edit3 } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminCalendar() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(11); // November
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  // Date editing state
  const [blockReason, setBlockReason] = useState('Maintenance');
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    fetchCalendar();
  }, [year, month]);

  async function fetchCalendar(dateToReselect = null) {
    setLoading(true);
    try {
      const data = await api.getCalendar(year, month);
      setCalendarData(data);
      if (dateToReselect && data?.days) {
        // Find matching day and update selected modal
        const dayNumber = parseInt(dateToReselect.split('-')[2], 10);
        if (data.days[dayNumber]) {
          setSelectedDayDetails(data.days[dayNumber]);
        }
      }
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
    setYear(2026);
    setMonth(11);
  }

  async function handleToggleAvailability(newStatus) {
    if (!selectedDayDetails?.date) return;
    setUpdatingAvailability(true);
    setFeedbackMsg('');
    try {
      const res = await api.toggleCalendarDate({
        date: selectedDayDetails.date,
        status: newStatus,
        reason: newStatus === 'blocked' ? (blockReason || 'Unavailable') : ''
      });
      setFeedbackMsg(res.message || 'Availability updated successfully!');
      await fetchCalendar(selectedDayDetails.date);
    } catch (err) {
      alert('Failed to update date availability: ' + err.message);
    } finally {
      setUpdatingAvailability(false);
    }
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
            Reservation Schedule & Availability Management
          </span>
          <h3 className="font-serif text-3xl font-bold text-[#142821] mt-1 mb-2">
            Room occupancy calendar
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Click on any date to inspect guest bookings or edit availability (block for maintenance, private events, or open as available).
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-lg text-stone-900 px-2 min-w-[160px] text-center">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="ml-2 px-3 py-1 rounded-full border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#df6653]"></span>
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#eab308]"></span>
              <span>Blocked / Maintenance</span>
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
              const isReserved = dayInfo.count > 0 || dayInfo.status === 'reserved';
              const isBlocked = dayInfo.status === 'blocked' || dayInfo.status === 'unavailable';

              let cardStyle = 'bg-[#edf6f0] border-[#cce4d4] hover:border-[#86c59f]';
              if (isReserved) {
                cardStyle = 'bg-[#faeae7] border-[#f2b9b1] hover:border-[#df6653]';
              } else if (isBlocked) {
                cardStyle = 'bg-[#fef3c7] border-[#fcd34d] hover:border-[#f59e0b]';
              }

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setSelectedDayDetails(dayInfo);
                    setFeedbackMsg('');
                    if (dayInfo.reason) setBlockReason(dayInfo.reason);
                  }}
                  className={`h-20 sm:h-24 p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${cardStyle}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs sm:text-sm text-stone-800">
                      {dayNum}
                    </span>
                    {isBlocked && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Blocked by Admin" />
                    )}
                  </div>

                  <div>
                    {isReserved ? (
                      <span className="text-[10px] sm:text-xs font-semibold text-[#b83824] block truncate">
                        {dayInfo.count} booking{dayInfo.count > 1 ? 's' : ''}
                      </span>
                    ) : isBlocked ? (
                      <span className="text-[10px] sm:text-xs font-bold text-amber-800 block truncate">
                        {dayInfo.reason || 'Blocked'}
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

      {/* Day Details & Admin Availability Editing Modal */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-[#183429] text-white shrink-0">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-serif text-lg font-bold">Night of {selectedDayDetails.date}</h3>
                  <span className="text-xs text-emerald-200/90">Manage date availability & occupancy</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="p-1 rounded-full hover:bg-white/10 text-stone-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Current Status Banner */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                    Current Status
                  </span>
                  <div className="font-serif font-bold text-base text-stone-900 mt-0.5">
                    {selectedDayDetails.status === 'blocked' ? (
                      <span className="text-amber-800 flex items-center gap-1.5">
                        <Ban className="w-4 h-4 text-amber-600" /> Blocked / Unavailable
                      </span>
                    ) : selectedDayDetails.count > 0 ? (
                      <span className="text-rose-800 flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-rose-600" /> Reserved ({selectedDayDetails.count} guest stays)
                      </span>
                    ) : (
                      <span className="text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Available for Booking
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedDayDetails.status === 'blocked'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : selectedDayDetails.count > 0
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {selectedDayDetails.status === 'blocked' ? 'Closed' : selectedDayDetails.count > 0 ? 'Booked' : 'Open'}
                  </span>
                </div>
              </div>

              {/* ADMIN DATE AVAILABILITY CONTROLS */}
              <div className="p-4 rounded-2xl bg-[#f4f7f5] border border-emerald-900/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-800" />
                  <h4 className="font-serif font-bold text-sm text-[#142821]">
                    Admin Availability Control
                  </h4>
                </div>

                {feedbackMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}

                {selectedDayDetails.status === 'blocked' ? (
                  <div className="space-y-3">
                    <div className="text-xs text-stone-600">
                      This date is currently <strong>blocked</strong> ({selectedDayDetails.reason || 'Unavailable'}). Guests cannot book any rooms on this date.
                    </div>
                    <button
                      disabled={updatingAvailability}
                      onClick={() => handleToggleAvailability('available')}
                      className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{updatingAvailability ? 'Updating...' : 'Mark Date as Available (Open for Bookings)'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs text-stone-600">
                      Want to close this date for maintenance, renovations, or private functions? Mark it as blocked below:
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                        Reason for closure / blocking:
                      </label>
                      <input
                        type="text"
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                        placeholder="e.g. Maintenance, Renovation, Private Event"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                      />
                    </div>

                    {/* Quick reason presets */}
                    <div className="flex flex-wrap gap-1.5">
                      {['Maintenance', 'Private Event', 'Renovation', 'Hotel Closed', 'Holiday'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setBlockReason(p)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white border border-stone-200 text-stone-600 hover:border-emerald-700 transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={updatingAvailability}
                      onClick={() => handleToggleAvailability('blocked')}
                      className="w-full py-2.5 rounded-xl bg-[#c25341] hover:bg-[#a84232] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4" />
                      <span>{updatingAvailability ? 'Saving...' : 'Mark Date as Blocked / Unavailable'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Reserved Guests List */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                  Guest Stays on This Night ({selectedDayDetails.guests?.length || 0})
                </h4>

                {selectedDayDetails.guests?.length === 0 ? (
                  <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                    No approved guest stays booked on this night.
                  </div>
                ) : (
                  selectedDayDetails.guests?.map((g, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5 text-xs shadow-xs">
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

            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 text-center shrink-0">
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="px-8 py-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
