import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VehicleListing = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState(25000);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, searchQuery, priceRange, vehicles]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/vehicles`);
      const vehicleList = Array.isArray(data) ? data : data.vehicles || [];
      setVehicles(vehicleList);
      setFilteredVehicles(vehicleList);
    } catch (error) {
      console.error('Error fetching vehicle list:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...vehicles];

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(v => v.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 2. Search Text Filter (Name, Brand, or Model)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        v =>
          v.name?.toLowerCase().includes(q) ||
          v.brand?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q)
      );
    }

    // 3. Price Filter
    result = result.filter(v => v.pricePerDay <= priceRange);

    setFilteredVehicles(result);
  };

  const handleSearchSubmit = ({ category, search }) => {
    setSelectedCategory(category);
    setSearchQuery(search);
  };

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">Explore Vehicle Fleet</h1>
          <p className="text-gray-400 text-sm">Filter through our wide range of cars, bikes, SUVs, EVs, and self-drive fleet</p>
        </div>

        {/* Search & Category Pills */}
        <SearchBar onSearch={handleSearchSubmit} />

        {/* Price Slider Filter */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 text-sm shadow-sm">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="font-bold text-xs uppercase text-gray-400">Max Price:</span>
            <input
              type="range"
              min="300"
              max="25000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="accent-blue-600 cursor-pointer flex-1 md:w-64"
            />
            <span className="font-black text-blue-600">₹{priceRange}/day</span>
          </div>
          <div className="text-xs text-gray-400">
            Showing <b>{filteredVehicles.length}</b> of <b>{vehicles.length}</b> Vehicles
          </div>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
            <p className="text-lg font-bold">No vehicles match your filter criteria.</p>
            <p className="text-xs text-gray-400 mt-1">Try resetting price range or category filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setPriceRange(25000);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleListing;