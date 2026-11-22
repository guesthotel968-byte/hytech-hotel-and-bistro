import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Pause, Play, Calendar } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDiscounts() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form fields matching screenshot
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  async function fetchVouchers() {
    setLoading(true);
    try {
      const data = await api.getVouchers();
      setVouchers(data);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateVoucher(e) {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setSubmitting(true);
    try {
      await api.createVoucher({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        valid_until: validUntil ? validUntil : null
      });
      setCode('');
      setDiscountValue('');
      setValidUntil('');
      fetchVouchers();
    } catch (err) {
      alert('Failed to create voucher: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(voucher) {
    const nextStatus = voucher.status === 'Active' ? 'Paused' : 'Active';
    try {
      await api.toggleVoucherStatus(voucher.id, nextStatus);
      fetchVouchers();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this voucher?')) return;
    try {
      await api.deleteVoucher(id);
      fetchVouchers();
    } catch (err) {
      alert('Failed to delete voucher: ' + err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title Pill */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10">
        <h2 className="font-serif text-2xl font-bold text-[#142821]">Discounts</h2>
      </div>

      {/* Main Container matching screenshot */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-8">
        
        <div className="text-center">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821]">
            Discount Vouchers
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create promotional discount codes for direct bookings.
          </p>
        </div>

        {/* Voucher Creation Form matching screenshot */}
        <form onSubmit={handleCreateVoucher} className="p-6 rounded-2xl bg-[#fcfbf7] border border-stone-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Code:</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER10"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Type:</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs font-medium"
              >
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount off (₱)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {discountType === 'percent' ? 'Percent (%):' : 'Amount (₱):'}
              </label>
              <input
                type="number"
                required
                min={1}
                max={discountType === 'percent' ? 100 : 10000}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percent' ? 'e.g. 15' : 'e.g. 200'}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Valid until (optional):
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
              <span className="text-[10px] text-stone-400 block mt-1">Leave blank for no expiry.</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#234739] hover:bg-[#1a352a] text-white text-xs sm:text-sm font-semibold shadow transition-colors"
            >
              {submitting ? 'Creating...' : 'Create voucher'}
            </button>
          </div>
        </form>

        {/* Vouchers Table matching screenshot */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-[#24483b] text-white text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Valid until</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">Loading vouchers...</td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">No vouchers created yet.</td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {v.code}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-950">
                      {v.discount_type === 'percent' ? `${v.discount_value}% off` : `₱${v.discount_value} off`}
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">
                      {v.valid_until ? v.valid_until : 'No expiry'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {v.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(v)}
                          className="px-3 py-1 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px] font-medium"
                        >
                          {v.status === 'Active' ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
