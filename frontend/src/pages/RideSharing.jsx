import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, DollarSign, Share2, UserPlus, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RideSharing = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableRides, setAvailableRides] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [showCreateRide, setShowCreateRide] = useState(false);
  const [newRide, setNewRide] = useState({
    startLocation: '',
    endLocation: '',
    date: '',
    time: '',
    seatsAvailable: 2,
    pricePerSeat: 0,
  });

  useEffect(() => {
    fetchRideData();
  }, []);

  const fetchRideData = async () => {
    try {
      const [availableRes, myRidesRes] = await Promise.all([
        axios.get(`${API_URL}/rides/available`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/rides/my-rides`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setAvailableRides(availableRes.data);
      setMyRides(myRidesRes.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load ride data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRide = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/rides/create`, newRide, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Ride created successfully!');
      setShowCreateRide(false);
      fetchRideData();
    } catch (error) {
      toast.error('Failed to create ride');
    }
  };

  const handleJoinRide = async (rideId) => {
    try {
      await axios.post(`${API_URL}/rides/${rideId}/join`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Successfully joined the ride!');
      fetchRideData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join ride');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Ride Sharing</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share your ride and save up to 50%
            </p>
          </div>
          <button
            onClick={() => setShowCreateRide(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="h-5 w-5" />
            <span>Create Ride</span>
          </button>
        </motion.div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Available Rides</p>
                <p className="text-2xl font-bold">{availableRides.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Share2 className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Save up to</p>
                <p className="text-2xl font-bold">50%</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Your Rides</p>
                <p className="text-2xl font-bold">{myRides.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Rides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Available Rides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableRides.length === 0 ? (
              <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No rides available at the moment</p>
                <button
                  onClick={() => setShowCreateRide(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Create a ride →
                </button>
              </div>
            ) : (
              availableRides.map((ride) => (
                <motion.div
                  key={ride._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{ride.user?.name}</h3>
                      <p className="text-sm text-gray-500">⭐ {ride.user?.rating || '4.5'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">₹{ride.pricePerSeat}</p>
                      <p className="text-xs text-gray-500">per seat</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{ride.startLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{ride.endLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{new Date(ride.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {ride.seatsAvailable} seats available
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoinRide(ride._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Join Ride
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* My Rides */}
        {myRides.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Rides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myRides.map((ride) => (
                <div key={ride._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">
                      {ride.isDriver ? 'Driver' : 'Passenger'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{ride.startLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{ride.endLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{new Date(ride.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{ride.passengers?.length || 0} passengers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Ride Modal */}
      {showCreateRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create a Ride</h2>
            <form onSubmit={handleCreateRide} className="space-y-4">
              <input
                type="text"
                placeholder="Starting Location"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                value={newRide.startLocation}
                onChange={(e) => setNewRide({...newRide, startLocation: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Destination"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                value={newRide.endLocation}
                onChange={(e) => setNewRide({...newRide, endLocation: e.target.value})}
                required
              />
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                value={newRide.date}
                onChange={(e) => setNewRide({...newRide, date: e.target.value})}
                required
              />
              <input
                type="time"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                value={newRide.time}
                onChange={(e) => setNewRide({...newRide, time: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Seats Available"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                value={newRide.seatsAvailable}
                onChange={(e) => setNewRide({...newRide, seatsAvailable: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Price per Seat (₹)"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                value={newRide.pricePerSeat}
                onChange={(e) => setNewRide({...newRide, pricePerSeat: e.target.value})}
                required
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateRide(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Create Ride
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideSharing;