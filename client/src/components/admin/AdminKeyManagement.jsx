import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Search, Check, AlertTriangle, X, Shield, Lock, RotateCcw, UserPlus } from 'lucide-react';
import { api } from '../../services/api';

const DEFAULT_KEYS = [
  { id: 1, key_name: 'Key 1', status: 'Assigned', room_number: 'Room 101', assigned_guest: 'Marvin Digman', booking_id: 'RES-8245281', notes: 'Physical brass room key + magnetic power card' },
  { id: 2, key_name: 'Key 2', status: 'Assigned', room_number: 'Room 102', assigned_guest: 'Carl Faa', booking_id: 'RES-E6F42079C1FF43', notes: 'RFID Smart Card' },
  { id: 3, key_name: 'Key 3', status: 'Available', room_number: 'Room 103', assigned_guest: null, booking_id: null, notes: 'RFID Smart Card' },
  { id: 4, key_name: 'Key 4', status: 'Available', room_number: 'Room 104', assigned_guest: null, booking_id: null, notes: 'Physical key' },
  { id: 5, key_name: 'Key 5', status: 'Lost / damaged', room_number: 'Room 201', assigned_guest: null, booking_id: null, notes: 'Reported lost Oct 2026, replacement ordered' },
  { id: 6, key_name: 'Key 6', status: 'Available', room_number: 'Room 202', assigned_guest: null, booking_id: null, notes: 'RFID Smart Card' },
  { id: 7, key_name: 'Key 7', status: 'Available', room_number: 'Room 203', assigned_guest: null, booking_id: null, notes: 'RFID Smart Card' },
  { id: 8, key_name: 'Key 8', status: 'Available', room_number: 'Room 204', assigned_guest: null, booking_id: null, notes: 'RFID Smart Card' },
  { id: 9, key_name: 'Key 9', status: 'Available', room_number: 'Room 301', assigned_guest: null, booking_id: null, notes: 'RFID Master Card' },
  { id: 10, key_name: 'Key 10', status: 'Available', room_number: 'Room 302', assigned_guest: null, booking_id: null, notes: 'RFID Smart Card' }
];

export default function AdminKeyManagement() {
  const [keys, setKeys] = useState(DEFAULT_KEYS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [loading, setLoading] = useState(false);

  // Add Key Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('Room 105');
  const [newNotes, setNewNotes] = useState('RFID Smart Key Card');
  
  // Assign Key Modal
  const [assigningKey, setAssigningKey] = useState(null);
  const [assignedGuest, setAssignedGuest] = useState('');
  const [assignedBookingId, setAssignedBookingId] = useState('');

  useEffect(() => {
    fetchKeys();
  }, [search, statusFilter]);

  async function fetchKeys() {
    setLoading(true);
    try {
      const data = await api.getKeys({
        search,
        status: statusFilter
      });
      if (data && Array.isArray(data.keys) && data.keys.length > 0) {
        setKeys(data.keys);
      } else if (!search && statusFilter === 'All statuses') {
        setKeys(DEFAULT_KEYS);
      } else {
        setKeys(data?.keys || []);
      }
    } catch (err) {
      console.warn('Using default keys due to connection notice:', err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate dynamic summary counters from keys
  const totalKeys = keys.length;
  const availableKeys = keys.filter(k => k.status === 'Available').length;
  const assignedKeys = keys.filter(k => k.status === 'Assigned').length;
  const lostKeys = keys.filter(k => k.status === 'Lost / damaged').length;

  async function handleCreateKey(e) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      await api.createKey({
        key_name: newKeyName.trim(),
        room_number: newRoomNumber,
        status: 'Available',
        notes: newNotes
      });
      setIsAddModalOpen(false);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      // Local optimistic update
      const newKey = {
        id: Date.now(),
        key_name: newKeyName.trim(),
        room_number: newRoomNumber,
        status: 'Available',
        assigned_guest: null,
        booking_id: null,
        notes: newNotes
      };
      setKeys([newKey, ...keys]);
      setIsAddModalOpen(false);
      setNewKeyName('');
    }
  }

  async function handleAssignKey(e) {
    e.preventDefault();
    if (!assigningKey) return;
    try {
      await api.updateKey(assigningKey.id, {
        key_name: assigningKey.key_name,
        room_number: assigningKey.room_number,
        status: 'Assigned',
        assigned_guest: assignedGuest.trim(),
        booking_id: assignedBookingId.trim(),
        notes: assigningKey.notes
      });
      setAssigningKey(null);
      fetchKeys();
    } catch (err) {
      // Optimistic local update
      setKeys(keys.map(k => k.id === assigningKey.id ? {
        ...k,
        status: 'Assigned',
        assigned_guest: assignedGuest.trim(),
        booking_id: assignedBookingId.trim()
      } : k));
      setAssigningKey(null);
    }
  }

  async function handleReturnKey(key) {
    try {
      await api.updateKey(key.id, {
        key_name: key.key_name,
        room_number: key.room_number,
        status: 'Available',
        assigned_guest: null,
        booking_id: null,
        notes: key.notes
      });
      fetchKeys();
    } catch (err) {
      // Optimistic local update
      setKeys(keys.map(k => k.id === key.id ? {
        ...k,
        status: 'Available',
        assigned_guest: null,
        booking_id: null
      } : k));
    }
  }

  async function handleMarkLost(key) {
    try {
      await api.updateKey(key.id, {
        key_name: key.key_name,
        room_number: key.room_number,
        status: 'Lost / damaged',
        assigned_guest: null,
        booking_id: null,
        notes: 'Reported lost/damaged'
      });
      fetchKeys();
    } catch (err) {
      // Optimistic local update
      setKeys(keys.map(k => k.id === key.id ? {
        ...k,
        status: 'Lost / damaged',
        assigned_guest: null,
        booking_id: null
      } : k));
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">Access Control</span>
          <h2 className="font-serif text-2xl font-bold text-[#142821]">Room Keys & Access Cards</h2>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-[#183429] hover:bg-[#12281f] text-[#f4ebd9] text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Key</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#294c3f] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-emerald-200 font-semibold">
              Live Key Status
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-1 flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-amber-300" />
              <span>Key Inventory & Assignments</span>
            </h3>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1">
              Issue and track room brass keys, master cards, and RFID tags for verified guest reservations.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#f4ebd9] hover:bg-[#eae0cb] text-[#142821] text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Key</span>
          </button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
            <span className="text-xs text-stone-500 font-medium">Total keys</span>
            <div className="text-3xl font-bold text-stone-800 mt-2">{totalKeys}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
            <span className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1">
              <span>Available</span>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </span>
            <div className="text-3xl font-bold text-emerald-700 mt-2">{availableKeys}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
            <span className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1">
              <span>Assigned</span>
              <Lock className="w-3.5 h-3.5 text-amber-600" />
            </span>
            <div className="text-3xl font-bold text-amber-700 mt-2">{assignedKeys}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
            <span className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1">
              <span>Lost / damaged</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </span>
            <div className="text-3xl font-bold text-red-600 mt-2">{lostKeys}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search key name, room, guest, or reference ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-stone-300 bg-white text-xs sm:text-sm font-medium text-stone-700 focus:outline-none"
          >
            <option value="All statuses">All statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Lost / damaged">Lost / damaged</option>
          </select>
        </div>

        {/* Keys Grid */}
        {keys.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs bg-white rounded-3xl border border-stone-200">
            No keys match your current filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {keys.map((key) => {
              const isAssigned = key.status === 'Assigned';
              const isAvailable = key.status === 'Available';
              const isLost = key.status === 'Lost / damaged';

              return (
                <div
                  key={key.id}
                  className="p-5 sm:p-6 rounded-3xl bg-[#fcfbf7] border border-stone-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Top row with Key icon and Status badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-800 flex items-center justify-center font-mono text-xs font-bold shadow-2xs">
                        <KeyRound className="w-5 h-5 text-amber-700" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isAssigned ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        isAvailable ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                        'bg-red-100 text-red-900 border border-red-200'
                      }`}>
                        {key.status}
                      </span>
                    </div>

                    <div className="text-center py-2">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">
                        Access Key
                      </span>
                      <h4 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                        {key.key_name}
                      </h4>
                      <p className="text-xs font-semibold text-emerald-900 mt-1">
                        {key.room_number || 'Room unassigned'}
                      </p>
                      {key.notes && (
                        <p className="text-[11px] text-stone-500 mt-0.5 italic">
                          {key.notes}
                        </p>
                      )}
                    </div>

                    {isAssigned && (
                      <div className="mt-3 p-3 rounded-2xl bg-white border border-stone-200 text-xs space-y-1.5 shadow-2xs">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500 font-medium">Guest:</span>
                          <span className="font-bold text-stone-900">{key.assigned_guest || 'Guest'}</span>
                        </div>
                        {key.booking_id && (
                          <div className="flex justify-between items-center font-mono text-[11px]">
                            <span className="text-stone-500 font-sans">Booking:</span>
                            <span className="text-emerald-900 font-bold">{key.booking_id}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                    {isAvailable && (
                      <button
                        onClick={() => {
                          setAssigningKey(key);
                          setAssignedGuest('');
                          setAssignedBookingId('');
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#183429] hover:bg-[#12281f] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                        <span>Assign to Guest</span>
                      </button>
                    )}

                    {isAssigned && (
                      <button
                        onClick={() => handleReturnKey(key)}
                        className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return Key</span>
                      </button>
                    )}

                    {!isLost && (
                      <button
                        onClick={() => handleMarkLost(key)}
                        className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-medium transition-colors cursor-pointer"
                        title="Mark Lost or Damaged"
                      >
                        Mark Lost
                      </button>
                    )}

                    {isLost && (
                      <button
                        onClick={() => handleReturnKey(key)}
                        className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Mark Replaced / Available
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add New Key */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-left mb-5">
              <span className="text-[10px] uppercase tracking-widest text-[#b58c4f] font-bold block mb-1">
                Access Control
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#142821]">
                Add Room Key
              </h3>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Key Name / Identifier</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Key 11, RFID Master 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Room Assignment</label>
                <input
                  type="text"
                  required
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  placeholder="e.g. Room 105, Room 201"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Key Type / Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="RFID Card, Brass key, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#183429] hover:bg-[#12281f] text-white font-semibold shadow-sm"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Key to Guest */}
      {assigningKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in duration-150">
            <button
              onClick={() => setAssigningKey(null)}
              className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-left mb-5">
              <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold block mb-1">
                Key Assignment
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#142821]">
                Assign {assigningKey.key_name}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Assigned to {assigningKey.room_number}
              </p>
            </div>

            <form onSubmit={handleAssignKey} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  value={assignedGuest}
                  onChange={(e) => setAssignedGuest(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Booking Reference ID (Optional)</label>
                <input
                  type="text"
                  value={assignedBookingId}
                  onChange={(e) => setAssignedBookingId(e.target.value)}
                  placeholder="e.g. RES-8245281"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-mono text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssigningKey(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
