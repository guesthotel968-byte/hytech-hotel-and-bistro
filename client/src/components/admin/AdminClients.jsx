import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Bed, Calendar, UserCheck } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [search]);

  async function fetchClients() {
    setLoading(true);
    try {
      const data = await api.getClients(search);
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title Pill */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10">
        <h2 className="font-serif text-2xl font-bold text-[#142821]">Clients</h2>
      </div>

      {/* Main Container matching screenshot */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-serif text-2xl font-bold text-[#142821]">Client Directory</h3>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-stone-300 bg-stone-50 text-xs sm:text-sm focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Clients Cards Grid / List matching screenshot */}
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs">Loading clients directory...</div>
        ) : clients.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">No client records found.</div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="p-5 rounded-2xl bg-[#fcfbf7] border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-all"
              >
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900">{client.name}</h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    <span className="font-mono">{client.email}</span>
                    {client.phone && <span> | {client.phone}</span>}
                  </p>
                  {client.total_bookings > 0 && (
                    <p className="text-[11px] text-stone-400 mt-1">
                      {client.total_bookings} reservation{client.total_bookings > 1 ? 's' : ''} on record
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {client.last_room && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                      {client.last_room}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
