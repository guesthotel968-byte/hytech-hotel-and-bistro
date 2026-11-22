import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, Bed, Users, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Standard');
  const [price, setPrice] = useState(1000);
  const [capacity, setCapacity] = useState(2);
  const [inventory, setInventory] = useState(1);
  const [bedType, setBedType] = useState('1 Queen Bed');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setLoading(true);
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEdit(r) {
    setEditingRoom(r);
    setName(r.name);
    setType(r.type);
    setPrice(r.price);
    setCapacity(r.capacity);
    setInventory(r.inventory);
    setBedType(r.bed_type);
    setDescription(r.description || '');
    setAmenities(r.amenities || '');
    setImageUrl(r.image_url || '');
  }

  async function handleDeleteRoom(roomId, roomName) {
    if (!window.confirm(`Are you sure you want to delete ${roomName}? This will remove it from the available accommodations list.`)) {
      return;
    }
    try {
      await api.deleteRoom(roomId);
      fetchRooms();
      setEditingRoom(null);
    } catch (err) {
      alert('Failed to delete room: ' + err.message);
    }
  }

  async function handleSaveRoom(e) {
    e.preventDefault();
    const payload = {
      name,
      type,
      price: Number(price),
      capacity: Number(capacity),
      inventory: Number(inventory),
      bed_type: bedType,
      description: description || 'Clean and comfortable accommodations in Bongabong, Oriental Mindoro.',
      amenities: amenities || 'Air Conditioning, Free Wi-Fi, Private Bathroom, Hot Shower',
      image_url: imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    };

    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, payload);
        setEditingRoom(null);
      } else {
        await api.createRoom(payload);
        setIsAddModalOpen(false);
      }
      fetchRooms();
    } catch (err) {
      alert('Failed to save room: ' + err.message);
    }
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10 flex justify-between items-center">
        <h2 className="font-serif text-2xl font-bold text-[#142821]">Rooms</h2>
        <button
          onClick={() => {
            setEditingRoom(null);
            setName('');
            setType('Standard');
            setPrice(1200);
            setCapacity(2);
            setInventory(1);
            setBedType('1 Queen Bed');
            setDescription('');
            setAmenities('');
            setImageUrl('');
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-[#183429] text-white rounded-xl text-xs font-semibold hover:bg-[#12281f] flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room Type</span>
        </button>
      </div>

     
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center mb-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821]">Room Management</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Configure hotel room capacity and base prices.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs">Loading rooms configuration...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-[#fcfbf7] rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 w-full bg-stone-200 overflow-hidden">
                    <img
                      src={room.image_url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 text-center space-y-1">
                    <h4 className="font-serif text-xl font-bold text-[#142821]">{room.name}</h4>
                    <span className="text-xs text-stone-400 block pb-2">{room.type}</span>

                    <div className="space-y-1 text-xs text-stone-700 pt-2 border-t border-stone-200">
                      <p>
                        Price: <strong className="text-stone-900">₱{Number(room.price).toLocaleString()} / night</strong>
                      </p>
                      <p>
                        Capacity: <strong className="text-stone-900">{room.capacity} guests</strong>
                      </p>
                      <p>
                        Total inventory: <strong className="text-stone-900">{room.inventory} rooms</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="w-full py-2.5 rounded-xl bg-[#234739] hover:bg-[#1a352a] text-white text-xs font-semibold shadow transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      {(editingRoom || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-[#183429] text-white">
              <h3 className="font-serif text-lg font-bold">
                {editingRoom ? `Edit: ${editingRoom.name}` : 'Add Room Type'}
              </h3>
              <button
                onClick={() => { setEditingRoom(null); setIsAddModalOpen(false); }}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5 text-stone-300" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category / Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Family">Family</option>
                    <option value="Group">Group</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Price / night (₱)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Inventory</label>
                  <input
                    type="number"
                    min={1}
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    placeholder="1 Queen Bed"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="Aircon, Smart TV, Hot Shower, Wi-Fi"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex gap-2">
                {editingRoom && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(editingRoom.id, editingRoom.name)}
                    className="px-3 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold"
                  >
                    Delete Room
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setEditingRoom(null); setIsAddModalOpen(false); }}
                  className="flex-1 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#183429] text-white font-semibold"
                >
                  {editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
