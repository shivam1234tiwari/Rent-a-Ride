import { useState, useEffect } from 'react';
import { 
  Car, Users, Calendar, DollarSign, 
  TrendingUp, CheckCircle, 
  Plus, Trash2, Search, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
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
    name: '', brand: '', model: '', year: 2026,
    category: 'car', pricePerDay: 1000, image: '',
    description: '', transmission: 'Automatic', seats: 5,
    fuelType: 'Petrol', available: true,
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      window.location.href = '/';
    } else {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [vehiclesRes, usersRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/vehicles`, { headers }),
        axios.get(`${API_URL}/admin/users`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/admin/bookings`, { headers }).catch(() => ({ data: [] }))
      ]);

      const vehiclesData = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data.vehicles || [];
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || [];
      const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];

      setVehicles(vehiclesData);
      setUsers(usersData);
      setBookings(bookingsData);

      const totalRevenue = bookingsData.reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0);
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
      console.error('Error fetching admin data:', error);
      toast.error('Loaded in offline/preview mode');
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
      setVehicles([...vehicles, { ...newVehicle, _id: Date.now().toString() }]);
      toast.success('Vehicle added (Preview Mode)');
      setShowAddVehicle(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`${API_URL}/vehicles/${vehicleId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Vehicle deleted successfully');
      } catch (error) {
        toast.success('Vehicle removed from view');
      }
      setVehicles(vehicles.filter(v => v._id !== vehicleId));
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-gray-500 text-sm">Real-time fleet, booking, and user management</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="p-2.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl hover:shadow-md transition flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4 text-blue-600" /> Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">Vehicles In Fleet</p>
                <p className="text-3xl font-black mt-1 text-blue-600">{stats.totalVehicles}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-xl">
                <Car className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">Registered Users</p>
                <p className="text-3xl font-black mt-1 text-emerald-600">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl">
                <Users className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">Total Reservations</p>
                <p className="text-3xl font-black mt-1 text-purple-600">{stats.totalBookings}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/40 rounded-xl">
                <Calendar className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">Total Revenue</p>
                <p className="text-3xl font-black mt-1 text-amber-500">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/40 rounded-xl">
                <DollarSign className="h-7 w-7 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 border-b dark:border-gray-700 mb-6 overflow-x-auto">
          {['overview', 'vehicles', 'bookings', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-semibold capitalize text-sm transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-emerald-500 h-5 w-5" />
                <h3 className="font-bold">Active Trips</h3>
              </div>
              <p className="text-2xl font-black">{stats.activeBookings}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-blue-500 h-5 w-5" />
                <h3 className="font-bold">Completed Trips</h3>
              </div>
              <p className="text-2xl font-black">{stats.completedBookings}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-amber-500 h-5 w-5" />
                <h3 className="font-bold">Monthly Target</h3>
              </div>
              <p className="text-2xl font-black">₹{(stats.totalRevenue * 1.2).toFixed(0)}</p>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by vehicle name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800"
                >
                  <option value="all">All Categories</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddVehicle(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-md hover:opacity-95 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Vehicle
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-4">Vehicle Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price/Day</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <td className="p-4 flex items-center gap-3">
                          <img src={vehicle.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold">{vehicle.name}</p>
                            <p className="text-xs text-gray-400">{vehicle.brand} {vehicle.model}</p>
                          </div>
                        </td>
                        <td className="p-4 uppercase text-xs font-bold text-gray-500">{vehicle.category}</td>
                        <td className="p-4 font-bold text-blue-600">₹{vehicle.pricePerDay}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${vehicle.available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                            {vehicle.available ? 'Available' : 'Rented'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => handleDeleteVehicle(vehicle._id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Add Fleet Vehicle</h2>
            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Vehicle Name" className="p-2.5 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600" onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} required />
                <input type="text" placeholder="Brand" className="p-2.5 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600" onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} required />
                <input type="number" placeholder="Price Per Day (₹)" className="p-2.5 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600" onChange={e => setNewVehicle({...newVehicle, pricePerDay: Number(e.target.value)})} required />
                <select className="p-2.5 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600" onChange={e => setNewVehicle({...newVehicle, category: e.target.value})}>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <input type="text" placeholder="Image URL" className="w-full p-2.5 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600" onChange={e => setNewVehicle({...newVehicle, image: e.target.value})} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddVehicle(false)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;