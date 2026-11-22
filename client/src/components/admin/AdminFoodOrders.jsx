import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminFoodOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh to sha every 20 seconds 
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  async function fetchOrders(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await api.getFoodOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load food orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.updateFoodOrderStatus(orderId, newStatus);
      fetchOrders(true);
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title Pill */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10">
        <h2 className="font-serif text-2xl font-bold text-[#142821]">Food Orders</h2>
      </div>

      {/* Main Container matching screenshot */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header matching screenshot */}
        <div className="flex justify-between items-start">
          <div className="text-center flex-1">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821]">Food Orders</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Orders sent from the Dining & Beverages menu. Refreshes every 20 seconds.
            </p>
          </div>

          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

       
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#24483b] text-white text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Deliver to</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">No active food orders at the moment.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                   
                    <td className="py-4 px-4 font-mono font-bold text-stone-900">
                      {order.order_id}
                    </td>

                   
                    <td className="py-4 px-4">
                      <div className="font-semibold text-stone-900">{order.guest_name}</div>
                      <div className="text-stone-500 text-[11px]">{order.guest_phone}</div>
                    </td>

                   
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <img
                              src={it.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                              alt={it.name}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                            <div>
                              <div className="font-semibold text-stone-900">{it.name}</div>
                              <div className="text-stone-500 text-[11px]">
                                Quantity: {it.quantity} • ₱{it.price}
                              </div>
                            </div>
                          </div>
                        ))}

                        {order.special_request && (
                          <div className="text-amber-800 text-[11px] font-semibold bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                            Request: {order.special_request}
                          </div>
                        )}
                      </div>
                    </td>

                    
                    <td className="py-4 px-4 font-semibold text-emerald-950">
                      {order.deliver_to}
                    </td>

                    
                    <td className="py-4 px-4 font-bold text-[#b83824] text-sm">
                      ₱{order.total_amount}
                    </td>

                   
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                          order.status === 'Preparing'
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : order.status === 'Served'
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : order.status === 'Completed'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-stone-100 border-stone-300 text-stone-700'
                        }`}
                      >
                        <option value="Preparing">Preparing</option>
                        <option value="Served">Served</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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
