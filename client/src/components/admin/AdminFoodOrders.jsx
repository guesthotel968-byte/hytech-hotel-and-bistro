import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, RefreshCw, CheckCircle2, Clock, AlertCircle, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminFoodOrders() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New item modal
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Breakfast');
  const [newItemPrice, setNewItemPrice] = useState(200);
  const [newItemUnit, setNewItemUnit] = useState('/ set');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImg, setNewItemImg] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchFoodItems();

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

  async function fetchFoodItems() {
    try {
      const data = await api.getFoodItems(null, false); // get all including unavailable
      setFoodItems(data);
    } catch (err) {
      console.error('Failed to load food items:', err);
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

  // Toggle item in stock / out of stock (Requirement 7)
  async function handleToggleStock(itemId) {
    try {
      await api.toggleFoodItem(itemId);
      fetchFoodItems();
    } catch (err) {
      alert('Failed to update stock status: ' + err.message);
    }
  }

  async function handleCreateItem(e) {
    e.preventDefault();
    try {
      await api.createFoodItem({
        name: newItemName,
        category: newItemCategory,
        price: Number(newItemPrice),
        price_unit: newItemUnit,
        description: newItemDesc,
        image_url: newItemImg || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        is_available: 1
      });
      setIsAddItemOpen(false);
      setNewItemName('');
      setNewItemDesc('');
      setNewItemImg('');
      fetchFoodItems();
    } catch (err) {
      alert('Failed to add food item: ' + err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title Pill */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#142821]">Food Orders & Bistro Menu</h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Monitor incoming dining requests and toggle menu item stock availability.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1.5 bg-white/70 p-1 rounded-2xl border border-stone-200 text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#183429] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Live Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'menu'
                ? 'bg-[#183429] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Menu Stock Control ({foodItems.length})
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Tab 1: Live Food Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#142821]">Live Dining Orders</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Guest orders placed from rooms, bistro tables, or online reservation. Auto-refreshes.
                </p>
              </div>

              <button
                onClick={() => fetchOrders()}
                className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-[#24483b] text-white text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Guest</th>
                    <th className="py-3.5 px-4">Items Ordered</th>
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
                        <td className="py-4 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                          {order.order_id}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-stone-900">{order.guest_name}</div>
                          <div className="text-stone-500 text-[11px]">{order.guest_phone}</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-1.5">
                            {order.items?.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="font-semibold text-stone-900">{it.name}</span>
                                <span className="text-stone-500 text-[11px]">x{it.quantity} (₱{it.price})</span>
                              </div>
                            ))}
                            {order.special_request && (
                              <div className="text-amber-800 text-[11px] font-semibold bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                                Note: {order.special_request}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-emerald-950 whitespace-nowrap">
                          {order.deliver_to}
                        </td>

                        <td className="py-4 px-4 font-bold text-[#b83824] text-sm whitespace-nowrap">
                          ₱{Number(order.total_amount).toLocaleString()}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
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
        )}

        {/* Tab 2: Menu Items & Out-of-Stock Toggle (Requirement 7) */}
        {activeTab === 'menu' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#142821]">Bistro Menu Stock Control</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Click the toggle to mark items as <span className="text-rose-600 font-bold">Out of Stock</span> or <span className="text-emerald-700 font-bold">Available</span>.
                </p>
              </div>

              <button
                onClick={() => setIsAddItemOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#183429] hover:bg-[#12281f] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Menu Dish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foodItems.map((item) => {
                const inStock = item.is_available === 1 || item.is_available === true;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      inStock 
                        ? 'bg-[#fcfbf7] border-stone-200' 
                        : 'bg-rose-50/40 border-rose-200 opacity-90'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] uppercase font-bold text-stone-400">
                            {item.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-stone-900">{item.name}</h4>
                        <p className="text-xs font-bold text-emerald-950 mt-0.5">
                          ₱{item.price} <span className="text-[10px] font-normal text-stone-500">{item.price_unit}</span>
                        </p>
                      </div>
                    </div>

                    {/* Out of Stock Toggle Button (Requirement 7) */}
                    <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-stone-600">Availability:</span>
                      <button
                        onClick={() => handleToggleStock(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          inStock
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                        }`}
                      >
                        {inStock ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Mark Out of Stock</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Available</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Add Menu Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <div className="p-5 bg-[#183429] text-white flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Add Bistro Menu Dish</h3>
              <button onClick={() => setIsAddItemOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Crispy Pata Mindoro Style"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Seafood">Seafood</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Main">Main Course</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Price (₱)</label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newItemImg}
                  onChange={(e) => setNewItemImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Ingredients and serving details..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#183429] text-white font-semibold shadow"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
