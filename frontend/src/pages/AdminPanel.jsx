import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, Users, Calendar, DollarSign, 
  TrendingUp, AlertCircle, CheckCircle, 
  XCircle, Plus, Edit2, Trash2, Eye,
  BarChart3, UserCheck, UserX, Clock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    completedBookings: 0,
  });
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    brand: '',
    model: '',
    year: 2023,
    category: 'car',
    pricePerDay: 1000,
    image: '',
    description: '',
    features: [],
    transmission: 'Manual',
    seats: 5,
    fuelType: 'Petrol',
    available: true,
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      window.location.href = '/';
    } else {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [vehiclesRes, usersRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/admin/bookings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const vehiclesData = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data.vehicles || [];
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || [];
      const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];

      setVehicles(vehiclesData);
      setUsers(usersData);
      setBookings(bookingsData);

      // Calculate statistics
      const totalRevenue = bookingsData.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      const activeBookings = bookingsData.filter(b => b.status === 'confirmed' || b.status === 'in-progress').length;
      const completedBookings = bookingsData.filter(b => b.status === 'completed').length;

      setStats({
        totalVehicles: vehiclesData.length,
        totalUsers: usersData.length,
        totalBookings: bookingsData.length,
        totalRevenue,
        activeBookings,
        completedBookings,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/vehicles`, newVehicle, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Vehicle added successfully');
      setShowAddVehicle(false);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`${API_URL}/vehicles/${vehicleId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Vehicle deleted successfully');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`${API_URL}/admin/bookings/${bookingId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`Booking ${status} successfully`);
      fetchDashboardData();
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
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage vehicles, users, and bookings
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Vehicles</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalVehicles}</p>
              </div>
              <Car className="h-12 w-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
              </div>
              <Users className="h-12 w-12 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-12 w-12 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-orange-600">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-orange-200" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'overview'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Overview
            {activeTab === 'overview' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'vehicles'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Vehicles
            {activeTab === 'vehicles' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'bookings'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Bookings
            {activeTab === 'bookings' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'users'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Users
            {activeTab === 'users' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Active Bookings</h3>
                </div>
                <p className="text-2xl font-bold">{stats.activeBookings}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Completed Bookings</h3>
                </div>
                <p className="text-2xl font-bold">{stats.completedBookings}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Revenue This Month</h3>
                </div>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowAddVehicle(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-5 w-5" />
                <span>Add Vehicle</span>
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img src={vehicle.image} alt={vehicle.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium">{vehicle.name}</p>
                              <p className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize">{vehicle.category}</td>
                        <td className="px-6 py-4">₹{vehicle.pricePerDay.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            vehicle.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.available ? 'Available' : 'Booked'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-6 py-4">{booking.user?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{booking.vehicle?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">₹{booking.totalPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 dark:bg-gray-700"
                          defaultValue={booking.status}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Vehicle Name"
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700"
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Brand"
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Model"
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Year"
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                    required
                  />
                  <select
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700"
                    value={newVehicle.category}
                    onChange={(e) => setNewVehicle({...newVehicle, category: e.target.value})}
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="suv">SUV</option>
                    <option value="luxury">Luxury</option>
                    <option value="electric">Electric</option>
                    <option value="truck">Truck</option>
                    <option value="self-driving">Self-Driving</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price per day (₹)"
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700"
                    value={newVehicle.pricePerDay}
                    onChange={(e) => setNewVehicle({...newVehicle, pricePerDay: e.target.value})}
                    required
                  />
                </div>
                <textarea
                  placeholder="Description"
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  value={newVehicle.description}
                  onChange={(e) => setNewVehicle({...newVehicle, description: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  value={newVehicle.image}
                  onChange={(e) => setNewVehicle({...newVehicle, image: e.target.value})}
                  required
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;