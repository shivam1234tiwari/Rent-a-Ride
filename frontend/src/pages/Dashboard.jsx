import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, User, Mail, Phone, Edit2, 
  X, Check, RefreshCw, ShieldCheck, MapPin, Building
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500';

const Dashboard = () => {
  const { user, updateUserState } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'profile'
  const [bookingFilter, setBookingFilter] = useState('all');

  // Edit Profile Form States
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Populate profile form whenever user context updates
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
      });
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const { data } = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to sync bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_URL}/user/profile`,
        {
          name: profileData.name,
          phone: profileData.phone,
          address: {
            street: profileData.street,
            city: profileData.city,
            state: profileData.state,
            pincode: profileData.pincode,
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Instantly sync response with AuthContext and Navbar
      if (updateUserState) {
        updateUserState(data);
      }

      toast.success('Profile details updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const filteredBookings = bookings.filter(
    b => bookingFilter === 'all' || b.status === bookingFilter
  );

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">My Dashboard</h1>
            <p className="text-gray-500 text-sm">Track active rides, manage rental history & profile details</p>
          </div>
          <button
            onClick={fetchBookings}
            className="p-2.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl hover:shadow-md transition flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4 text-blue-600" /> Sync Bookings
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b dark:border-gray-700 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'bookings' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'profile' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'
            }`}
          >
            Profile Settings
          </button>
        </div>

        {/* ================= BOOKINGS TAB ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setBookingFilter(status)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition ${
                    bookingFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-bold">No bookings found</p>
                <p className="text-xs text-gray-400 mt-1">Book a vehicle to see active trips here.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6"
                >
                  <img
                    src={booking.vehicle?.image || DEFAULT_IMAGE}
                    alt=""
                    className="w-full md:w-52 h-36 rounded-xl object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{booking.vehicle?.name || 'Rental Vehicle'}</h3>
                        <p className="text-xs text-gray-400">{booking.vehicle?.brand}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 uppercase">
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-sm bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-400">Rental Type</p>
                        <p className="font-semibold capitalize">{booking.bookingMode || 'Self-Drive'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="font-semibold">{booking.totalDays || 1} Day(s)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total Paid</p>
                        <p className="font-bold text-blue-600">₹{booking.totalPrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Start Date</p>
                        <p className="font-semibold">{new Date(booking.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= PROFILE SETTINGS TAB ================= */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4">
                <div>
                  <h2 className="text-xl font-bold">Personal Information</h2>
                  <p className="text-xs text-gray-400">Manage your account credentials and delivery location</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="Flat, House no., Building, Street"
                      value={profileData.street}
                      onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">State</label>
                      <input
                        type="text"
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pincode</label>
                      <input
                        type="text"
                        value={profileData.pincode}
                        onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                    >
                      <Check className="h-4 w-4" /> {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase font-bold">Full Name</p>
                        <p className="font-bold text-sm">{user?.name || 'Deepak Kumar'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase font-bold">Email Address</p>
                        <p className="font-bold text-sm">{user?.email || 'deepak@rentwheels.com'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase font-bold">Phone Number</p>
                        <p className="font-bold text-sm">{user?.phone || '+91 9876543210'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                      <Building className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase font-bold">Account Role</p>
                        <p className="font-bold text-sm uppercase text-purple-600">{user?.role || 'User'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase font-bold">Primary Address</p>
                      <p className="font-semibold text-sm mt-0.5">
                        {user?.address?.street 
                          ? `${user.address.street}, ${user.address.city}, ${user.address.state} - ${user.address.pincode}`
                          : 'No address added yet. Click Edit Profile to add.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Security Badge */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg space-y-3">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">Verified Customer</h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Your identity verification status is active for instant self-drive vehicle approvals.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;