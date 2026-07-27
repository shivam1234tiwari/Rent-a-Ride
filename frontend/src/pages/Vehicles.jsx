import { useState, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/vehicles`);
      
      let vehicleData = [];
      if (Array.isArray(response.data)) {
        vehicleData = response.data;
      } else if (response.data && Array.isArray(response.data.vehicles)) {
        vehicleData = response.data.vehicles;
      } else if (response.data && Array.isArray(response.data.data)) {
        vehicleData = response.data.data;
      }

      setVehicles(vehicleData);
      setFilteredVehicles(vehicleData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    if (!filters) return;
    const { category, search } = filters;

    let result = [...vehicles];

    if (category && category !== 'all') {
      result = result.filter(
        (v) => v.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.name?.toLowerCase().includes(term) ||
          v.brand?.toLowerCase().includes(term) ||
          v.location?.toLowerCase().includes(term)
      );
    }

    setFilteredVehicles(result);
  };

  if (loading) return <Loader />;

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white">
          Available Vehicles ({filteredVehicles.length})
        </h1>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
            <p className="text-lg font-bold text-gray-500">No vehicles match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id || vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;