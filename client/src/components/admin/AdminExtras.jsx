import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Check, X, Edit, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminExtras() {
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState(300);
  const [billingUnit, setBillingUnit] = useState('per person / stay');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(1);

  useEffect(() => {
    fetchExtras();
  }, []);

  async function fetchExtras() {
    setLoading(true);
    try {
      const data = await api.getExtras();
      setExtras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load extras:', err);
      setExtras([]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenAdd() {
    setEditingExtra(null);
    setName('');
    setPrice(300);
    setBillingUnit('per person / stay');
    setDescription('');
    setIsAvailable(1);
    setIsModalOpen(true);
  }

  function handleOpenEdit(e) {
    setEditingExtra(e);
    setName(e.name);
    setPrice(e.price);
    setBillingUnit(e.billing_unit);
    setDescription(e.description || '');
    setIsAvailable(e.is_available);
    setIsModalOpen(true);
  }

  async function handleSaveExtra(e) {
    e.preventDefault();
    const payload = {
      name,
      price: Number(price),
      billing_unit: billingUnit,
      description,
      is_available: isAvailable
    };

    try {
      if (editingExtra) {
        await api.updateExtra(editingExtra.id, payload);
      } else {
        await api.createExtra(payload);
      }
      setIsModalOpen(false);
      fetchExtras();
    } catch (err) {
      alert('Failed to save service: ' + err.message);
    }
  }

  async function handleToggleAvailability(extra) {
    const nextAvail = extra.is_available ? 0 : 1;
    try {
      await api.updateExtra(extra.id, {
        ...extra,
        is_available: nextAvail
      });
      fetchExtras();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to remove this service?')) return;
    try {
      await api.deleteExtra(id);
      fetchExtras();
    } catch (err) {
      alert('Failed to delete service: ' + err.message);
    }
  }

  return (
    <div className="space-y-6">
     
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10">
        <h2 className="font-serif text-2xl font-bold text-[#142821]">Extras</h2>
      </div>

      
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        
       
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold">
            The Little Details
          </span>
          <h3 className="font-serif text-3xl font-bold text-[#142821] mt-1 mb-2">
            Extras & services
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Available services appear in the guest booking panel under Extras. Set a price and billing unit, then mark the service Available.
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-full bg-[#183429] hover:bg-[#12281f] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add service</span>
          </button>
        </div>

       
        <div className="p-6 rounded-2xl bg-[#fcfbf7] border border-stone-200 text-center max-w-2xl mx-auto space-y-2">
          <h4 className="font-serif font-bold text-sm text-stone-900">How guests use extras</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Guests choose optional services while reserving rooms. Each selection applies to every room in their checkout. Per stay is charged once per room; per night is charged each night; per person is charged once per guest for the stay; per item uses the guest's selected quantity per room. Chosen services appear under Bookings and in the guest receipt.
          </p>
        </div>

        
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs">Loading extras & services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {extras.map((extra) => (
              <div
                key={extra.id}
                className="p-6 rounded-3xl bg-[#fcfbf7] border border-stone-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>

                    <button
                      onClick={() => handleToggleAvailability(extra)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        extra.is_available
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {extra.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </div>

                  <h4 className="font-serif text-xl font-bold text-stone-900 mb-1">{extra.name}</h4>
                  <p className="text-xs font-semibold text-emerald-900 mb-3">
                    ₱{extra.price} <span className="font-normal text-stone-500">{extra.billing_unit}</span>
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {extra.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-200 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(extra)}
                    className="p-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(extra.id)}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

     
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-[#183429] text-white">
              <h3 className="font-serif text-lg font-bold">
                {editingExtra ? 'Edit Service' : 'Add Service / Extra'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-stone-300" />
              </button>
            </div>

            <form onSubmit={handleSaveExtra} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Massage Relaxation"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Price (₱)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Billing Unit</label>
                  <select
                    value={billingUnit}
                    onChange={(e) => setBillingUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="per person / stay">per person / stay</option>
                    <option value="per stay">per stay</option>
                    <option value="per night">per night</option>
                    <option value="per room">per room</option>
                    <option value="per item">per item</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details and what is included..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="avail-checkbox"
                  checked={Boolean(isAvailable)}
                  onChange={(e) => setIsAvailable(e.target.checked ? 1 : 0)}
                  className="w-4 h-4 rounded text-emerald-800 accent-[#183429]"
                />
                <label htmlFor="avail-checkbox" className="text-stone-700 font-medium">
                  Service is available for booking
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#183429] text-white font-semibold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
