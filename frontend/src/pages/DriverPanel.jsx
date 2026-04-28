import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Navigation, MapPin, CheckCircle, Clock, 
  Star, DollarSign, Calendar, Car, Users
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import LiveTracking from '../components/LiveTracking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DriverPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeBookings, setActiveBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
    rating: 0,
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (user?.role !== 'driver') {
      toast.error('Access denied. Driver only.');
      window.location.href = '/';
    } else {
      fetchDriverData();
      startLocationTracking();
    }
  }, [user]);

  const fetchDriverData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/drivers/my-data`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setActiveBookings(data.activeBookings || []);
      setCompletedBookings(data.completedBookings || []);
      setStats(data.stats);
      setIsAvailable(data.isAvailable);
    } catch (error) {
      console.error('Error fetching driver data:', error);
      toast.error('Failed to load driver data');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          
          // Update location to server
          await axios.post(`${API_URL}/drivers/update-location`, 
            { location },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, interval: 5000 }
      );
    }
  };

  const toggleAvailability = async () => {
    try {
      await axios.put(`${API_URL}/drivers/availability`, 
        { isAvailable: !isAvailable },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setIsAvailable(!isAvailable);
      toast.success(isAvailable ? 'You are now offline' : 'You are now online');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`${API_URL}/drivers/booking/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`Booking ${status} successfully`);
      fetchDriverData();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
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
          <h1 className="text-4xl font-bold mb-2">Driver Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your trips and track your earnings
          </p>
        </motion.div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Navigation className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-gray-500">Driver ID: {user?._id?.slice(-6)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-semibold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {isAvailable ? 'Online' : 'Offline'}
                </p>
              </div>
              <button
                onClick={toggleAvailability}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  isAvailable 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Trips</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTrips}</p>
              </div>
              <Car className="h-10 w-10 text-blue-200" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTrips}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-200" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{stats.totalEarnings?.toLocaleString('en-IN')}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-orange-200" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.rating}</p>
              </div>
              <Star className="h-10 w-10 text-yellow-200 fill-current" />
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Active Trips</h2>
          <div className="space-y-4">
            {activeBookings.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-500">No active trips at the moment</p>
              </div>
            ) : (
              activeBookings.map((booking) => (
                <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{booking.vehicle?.name}</h3>
                      <p className="text-gray-500">{booking.vehicle?.brand} {booking.vehicle?.model}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Pickup: {booking.pickupLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Dropoff: {booking.dropoffLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Customer: {booking.user?.name}</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'in-progress')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Start Trip
                      </button>
                    )}
                    {booking.status === 'in-progress' && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Complete Trip
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Bookings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Completed Trips</h2>
          <div className="space-y-4">
            {completedBookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{booking.vehicle?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-500 capitalize">{booking.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPanel;