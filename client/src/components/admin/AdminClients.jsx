import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Bed, Calendar, Users, History, X, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'with_companions', 'repeat'
  const [loading, setLoading] = useState(true);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [search]);

  async function fetchClients() {
    setLoading(true);
    try {
      const data = await api.getClients(search);
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load clients:', err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  const safeClients = Array.isArray(clients) ? clients : [];
  const filteredClients = safeClients.filter(c => {
    if (filterType === 'with_companions') {
      return c.companions && c.companions.length > 0;
    }
    if (filterType === 'repeat') {
      return c.total_bookings > 1;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Title Pill */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#142821]">Clients & Guest Directory</h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Registered guests, verified companions (mga kasama), and reservation histories.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 bg-white/70 p-1 rounded-2xl border border-stone-200 text-xs">
          {[
            { id: 'all', label: 'All Clients' },
            { id: 'with_companions', label: 'With Companions' },
            { id: 'repeat', label: 'Repeat Guests' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                filterType === f.id
                  ? 'bg-[#183429] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#142821]">Client Directory</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing {filteredClients.length} of {clients.length} registered guests
            </p>
          </div>

          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by guest name, phone, email, or companion..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-300 bg-stone-50 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-stone-900"
            />
          </div>
        </div>

        {/* Clients Cards Grid / List */}
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs">Loading clients directory...</div>
        ) : filteredClients.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">No client records found matching search.</div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#fcfbf7] border border-stone-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif text-lg font-bold text-stone-900">{client.name}</h4>
                    {client.total_bookings > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {client.total_bookings} stays
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-emerald-950 font-medium">{client.email}</span>
                    {client.phone && <span>• Phone: <strong className="text-stone-800">{client.phone}</strong></span>}
                  </p>

                  {/* Companions / Kasama List (Requirement 6) */}
                  <div className="pt-1">
                    {client.companions && client.companions.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-800" /> Kasama / Companions:
                        </span>
                        {client.companions.map((comp, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200/60"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">No companions registered on record</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
                  {client.last_room && client.last_room !== 'None' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                      Last: {client.last_room}
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedClientForHistory(client)}
                    className="px-4 py-2 rounded-full bg-[#183429] hover:bg-[#12281f] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Stay History</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client Booking History Modal (Requirement 6) */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in fade-in duration-200 flex flex-col max-h-[85vh]">
            <div className="p-5 bg-[#183429] text-white flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold block">
                  Client Booking History
                </span>
                <h3 className="font-serif text-xl font-bold">{selectedClientForHistory.name}</h3>
                <p className="text-xs text-emerald-100 font-mono">{selectedClientForHistory.email}</p>
              </div>
              <button
                onClick={() => setSelectedClientForHistory(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 text-stone-600">
                <span>Total Reservations: <strong>{selectedClientForHistory.total_bookings}</strong></span>
                <span>Contact: <strong>{selectedClientForHistory.phone || 'N/A'}</strong></span>
              </div>

              {/* All Companions Summary */}
              {selectedClientForHistory.companions?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                  <span className="font-semibold text-emerald-950 block mb-1">
                    All Companions Recorded ({selectedClientForHistory.companions.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClientForHistory.companions.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 text-[11px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking List */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-stone-900">Reservations Breakdown:</h4>
                {selectedClientForHistory.booking_history?.length === 0 ? (
                  <p className="text-stone-400 italic">No past reservations recorded.</p>
                ) : (
                  selectedClientForHistory.booking_history?.map(b => (
                    <div key={b.id} className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5 shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-stone-900">{b.reference_id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="font-serif font-bold text-sm text-stone-800">{b.room_name}</p>
                      <p className="text-stone-500 text-[11px]">
                        {b.check_in} → {b.check_out} ({b.nights} night{b.nights > 1 ? 's' : ''}) • {b.guest_count} guest{b.guest_count > 1 ? 's' : ''}
                      </p>
                      {b.companions && b.companions.length > 0 && (
                        <p className="text-stone-700 text-[11px]">
                          Kasama: <strong className="text-emerald-900">{b.companions.join(', ')}</strong>
                        </p>
                      )}
                      <p className="font-semibold text-emerald-950 pt-1 border-t border-stone-100">
                        Total: ₱{Number(b.total_amount).toLocaleString()} ({b.payment_method} - {b.payment_status})
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
