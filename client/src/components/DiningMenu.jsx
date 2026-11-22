import React, { useState, useEffect } from 'react';
import { Utensils, ShoppingBag, Plus, Minus, Trash2, X, Check, Coffee } from 'lucide-react';
import { api } from '../services/api';

export default function DiningMenu({ currentUser }) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliverTo, setDeliverTo] = useState('Table 1');
  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');
  const [specialRequest, setSpecialRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  const categories = ['All', 'Breakfast', 'Seafood', 'Coffee', 'Drinks'];

  useEffect(() => {
    fetchFood();
  }, [category]);

  useEffect(() => {
    if (currentUser) {
      if (!guestName && currentUser.name) setGuestName(currentUser.name);
      if (!guestPhone && currentUser.phone) setGuestPhone(currentUser.phone);
    }
  }, [currentUser]);

  async function fetchFood() {
    setLoading(true);
    try {
      const data = await api.getFoodItems(category);
      setItems(data);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      if (existing) {
        return prev.map((x) => (x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function updateQuantity(id, delta) {
    setCart((prev) =>
      prev
        .map((x) => {
          if (x.id === id) {
            const newQ = x.quantity + delta;
            return newQ > 0 ? { ...x, quantity: newQ } : null;
          }
          return x;
        })
        .filter(Boolean)
    );
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((x) => x.id !== id));
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function handleCheckoutOrder(e) {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      alert('Please provide your name and phone number for delivery.');
      return;
    }
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const orderData = {
        guest_name: guestName,
        guest_phone: guestPhone,
        items: cart.map((c) => ({
          id: c.id,
          name: c.name,
          quantity: c.quantity,
          price: c.price,
          image_url: c.image_url
        })),
        deliver_to: deliverTo,
        special_request: specialRequest,
        total_amount: cartTotal
      };

      const result = await api.createFoodOrder(orderData);
      setLastPlacedOrder(result);
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="food-and-drink" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#142821] mb-3">
          Dining & Beverages
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          Fresh local seafood, hot breakfast plates, and cold drinks, served at the bistro and on the rooftop deck.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#e2a63b] text-[#142821] font-semibold shadow-sm'
                    : 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500 text-sm">Loading bistro menu...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#1f3b31] text-white rounded-3xl overflow-hidden border border-emerald-800 shadow-lg flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative h-56 w-full overflow-hidden bg-stone-900">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-md text-emerald-100 border border-white/20">
                  {item.category}
                </span>
                <span className="absolute top-3 right-3 px-3.5 py-1 rounded-full text-xs font-bold bg-[#e2a63b] text-[#142821] shadow">
                  ₱{item.price} {item.price_unit}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-emerald-100/80 text-xs sm:text-sm line-clamp-3 mb-6 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className="w-full py-2.5 rounded-full bg-[#e2a63b] hover:bg-[#d4962c] text-[#142821] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Cart Trigger Pill */}
      {cartItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#183429] text-white shadow-2xl hover:bg-[#12281f] border border-emerald-600 transition-all scale-105"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Bistro Order ({cartItemCount})</span>
            <span className="bg-amber-400 text-emerald-950 font-bold text-xs px-2.5 py-1 rounded-full">
              ₱{cartTotal.toLocaleString()}
            </span>
          </button>
        </div>
      )}

      {/* Slide-over Cart / Ordering Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#1f3b31] text-white">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-lg font-bold">Your Bistro Order</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200">
                  <div className="flex items-center gap-3">
                    <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-medium text-xs sm:text-sm text-stone-800">{c.name}</h4>
                      <p className="text-xs text-emerald-800 font-semibold">₱{c.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(c.id, -1)}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{c.quantity}</span>
                    <button
                      onClick={() => updateQuantity(c.id, 1)}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromCart(c.id)}
                      className="ml-1 text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Order Info Form */}
              <form id="bistro-order-form" onSubmit={handleCheckoutOrder} className="pt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Deliver To:</label>
                  <select
                    value={deliverTo}
                    onChange={(e) => setDeliverTo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Table 1">Table 1 (Indoor Bistro)</option>
                    <option value="Table 2">Table 2 (Indoor Bistro)</option>
                    <option value="Table 3">Table 3 (Rooftop Deck)</option>
                    <option value="Table 4">Table 4 (Rooftop Deck)</option>
                    <option value="Room 101">Room 101 (Room Service)</option>
                    <option value="Room 102">Room 102 (Room Service)</option>
                    <option value="Room 103">Room 103 (Room Service)</option>
                    <option value="Takeout / Front Desk">Takeout / Pick up at Front Desk</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Your Name:</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Carl Faa"
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Phone Number:</label>
                    <input
                      type="text"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. 09141278921"
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Special Request (Optional):</label>
                  <input
                    type="text"
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="e.g. EXTRA RICE, less sugar, serve drinks first"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-stone-200 bg-stone-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-stone-600 font-medium">Order Subtotal:</span>
                <span className="text-lg font-bold text-emerald-950">₱{cartTotal.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                form="bistro-order-form"
                disabled={submitting}
                className="w-full py-3 rounded-full bg-[#e2a63b] hover:bg-[#d4962c] text-[#142821] font-bold text-sm shadow transition-colors"
              >
                {submitting ? 'Placing Order...' : `Place Bistro Order • ₱${cartTotal.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Placed Success Confirmation Dialog */}
      {lastPlacedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-stone-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-1">Order Received!</h3>
            <p className="text-xs text-stone-600 mb-4">
              Your order has been sent to the bistro kitchen and is being prepared.
            </p>
            <div className="p-3 bg-white rounded-2xl border border-stone-200 mb-5 text-left text-xs space-y-1">
              <div><strong className="text-stone-700">Order ID:</strong> <span className="font-mono text-emerald-900 font-semibold">{lastPlacedOrder.order_id}</span></div>
              <div><strong className="text-stone-700">Deliver To:</strong> {lastPlacedOrder.deliver_to}</div>
              <div><strong className="text-stone-700">Total:</strong> ₱{lastPlacedOrder.total_amount}</div>
              <div><strong className="text-stone-700">Status:</strong> <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">{lastPlacedOrder.status}</span></div>
            </div>
            <button
              onClick={() => setLastPlacedOrder(null)}
              className="w-full py-2.5 rounded-full bg-[#183429] text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
