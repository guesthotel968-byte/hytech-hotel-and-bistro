import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Search, Check, AlertTriangle, X, Shield, Lock } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminKeyManagement() {
  const [keys, setKeys] = useState([]);
  const [summary, setSummary] = useState({ total: 0, available: 0, assigned: 0, lost: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [loading, setLoading] = useState(true);

  // Add / Assign key modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('Room 101');
  const [newNotes, setNewNotes] = useState('RFID Smart Key Card');
  
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
      setKeys(data.keys || []);
      setSummary(data.summary || { total: 0, available: 0, assigned: 0, lost: 0 });
    } catch (err) {
      console.error('Failed to load keys:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey(e) {
    e.preventDefault();
    try {
      await api.createKey({
        key_name: newKeyName,
        room_number: newRoomNumber,
        status: 'Available',
        notes: newNotes
      });
      setIsAddModalOpen(false);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      alert('Failed to add key: ' + err.message);
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
        assigned_guest: assignedGuest,
        booking_id: assignedBookingId,
        notes: assigningKey.notes
      });
      setAssigningKey(null);
      fetchKeys();
    } catch (err) {
      alert('Failed to assign key: ' + err.message);
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
      alert('Failed to return key: ' + err.message);
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
      alert('Failed to mark key: ' + err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title Pill */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10">
        <h2 className="font-serif text-2xl font-bold text-[#142821]">Keys</h2>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* Banner matching screenshot */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#294c3f] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-emerald-200 font-semibold">
              Access Control
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-1 flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-amber-300" />
              <span>Key Management</span>
            </h3>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1">
              Issue and track room keys and access cards against guest reservations.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#f4ebd9] hover:bg-[#eae0cb] text-[#142821] text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add key</span>
          </button>
        </div>

        {/* 4 Counter Stat Cards matching screenshot */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center">
            <span className="text-xs text-stone-500 font-medium">Total keys</span>
            <div className="text-3xl font-bold text-stone-800 mt-2">{summary.total}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center">
            <span className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1">
              <span>Available</span>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </span>
            <div className="text-3xl font-bold text-emerald-700 mt-2">{summary.available}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center">
            <span className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1">
              <span>Assigned</span>
              <Lock className="w-3.5 h-3.5 text-amber-600" />
            </span>
            <div className="text-3xl font-bold text-amber-700 mt-2">{summary.assigned}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center">
            <span className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1">
              <span>Lost / damaged</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </span>
            <div className="text-3xl font-bold text-red-600 mt-2">{summary.lost}</div>
          </div>
        </div>

        {/* Search & Status Filter row matching screenshot */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search key, room, guest or booking..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-300 bg-white text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-stone-300 bg-white text-xs sm:text-sm font-medium text-stone-700"
          >
            <option value="All statuses">All statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Lost / damaged">Lost / damaged</option>
          </select>
        </div>

        {/* Keys Cards Grid */}
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs bg-white rounded-3xl border border-stone-200">
            No keys match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {keys.map((key) => {
              const isAssigned = key.status === 'Assigned';
              const isAvailable = key.status === 'Available';
              const isLost = key.status === 'Lost / damaged';

              return (
                <div
                  key={key.id}
                  className="p-6 rounded-3xl bg-[#fcfbf7] border border-stone-200/90 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Top row with Key icon and Status badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-800 flex items-center justify-center font-mono text-xs font-bold">
                        <KeyRound className="w-5 h-5 text-amber-600" />
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
                        {key.room_number || 'No room tied'}
                      </p>
                    </div>

                    {isAssigned && (
                      <div className="mt-3 p-3 rounded-xl bg-white border border-stone-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Guest:</span>
                          <span className="font-semibold text-stone-900">{key.assigned_guest}</span>
                        </div>
                        {key.booking_id && (
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-stone-500">Ref:</span>
                            <span className="text-emerald-900">{key.booking_id}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {key.notes && (
                      <p className="text-[11px] text-stone-500 italic mt-2 text-center">
                        {key.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-stone-200 flex gap-2">
                    {isAvailable && (
                      <button
                        onClick={() => {
                          setAssigningKey(key);
                          setAssignedGuest('Carl Faa');
                          setAssignedBookingId('RES-E6F42079C1FF43');
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#234739] hover:bg-[#1a352a] text-white text-xs font-semibold"
                      >
                        Assign Key
                      </button>
                    )}

                    {isAssigned && (
                      <button
                        onClick={() => handleReturnKey(key)}
                        className="flex-1 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
                      >
                        Return Key
                      </button>
                    )}

                    {!isLost && (
                      <button
                        onClick={() => handleMarkLost(key)}
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs"
                        title="Report lost"
                      >
                        Lost
                      </button>
                    )}

                    {isLost && (
                      <button
                        onClick={() => handleReturnKey(key)}
                        className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                      >
                        Mark Found / Available
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Key Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">Add Access Key</h3>
            <form onSubmit={handleCreateKey} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Key Name / Code</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Key 105 or Card B-3"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Assigned Room</label>
                <input
                  type="text"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  placeholder="e.g. Room 105"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Notes (Type / Material)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="RFID Card / Brass Key"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-full border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-[#183429] text-white font-semibold"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Key Modal */}
      {assigningKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">Assign {assigningKey.key_name}</h3>
            <p className="text-xs text-stone-500 mb-4">Attach key to guest reservation.</p>

            <form onSubmit={handleAssignKey} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  value={assignedGuest}
                  onChange={(e) => setAssignedGuest(e.target.value)}
                  placeholder="e.g. Marvin Digman"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Booking Reference ID</label>
                <input
                  type="text"
                  value={assignedBookingId}
                  onChange={(e) => setAssignedBookingId(e.target.value)}
                  placeholder="e.g. RES-8245281"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningKey(null)}
                  className="flex-1 py-2 rounded-full border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-[#183429] text-white font-semibold"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
