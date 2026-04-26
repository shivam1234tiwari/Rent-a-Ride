import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Car, Clock, MapPin, CreditCard, User, Mail, Phone, Edit2, X, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/bookings`);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await axios.put(`${API_URL}/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await axios.put(`${API_URL}/user/profile`, profileData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Update user context
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your bookings and profile
          </p>
        </motion.div>

        <div className="flex space-x-4 mb-8 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'bookings'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            My Bookings
            {activeTab === 'bookings' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'profile'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Profile Settings
            {activeTab === 'profile' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>

        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't made any bookings yet. Start exploring our vehicles!
                </p>
              </div>
            ) : (
              bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="md:flex">
                    <div className="md:w-64 h-48 md:h-auto">
                      <img
                        src={booking.vehicle?.image}
                        alt={booking.vehicle?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{booking.vehicle?.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {booking.vehicle?.brand} {booking.vehicle?.model}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-5 w-5" />
                          <div>
                            <p className="text-sm">Booking Date</p>
                            <p className="font-semibold">
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <Clock className="h-5 w-5" />
                          <div>
                            <p className="text-sm">Duration</p>
                            <p className="font-semibold">{booking.totalDays} days</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-5 w-5" />
                          <div>
                            <p className="text-sm">Start Date</p>
                            <p className="font-semibold">
                              {new Date(booking.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <CreditCard className="h-5 w-5" />
                          <div>
                            <p className="text-sm">Total Price</p>
                            <p className="font-semibold text-blue-600">${booking.totalPrice}</p>
                          </div>
                        </div>
                      </div>
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Check className="h-4 w-4" />
                    <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: user?.name || '',
                        phone: user?.phone || '',
                      });
                    }}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold">{user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-semibold">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-semibold">{user?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;