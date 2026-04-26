import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VehicleListing = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    available: searchParams.get('available') || 'all',
    sortBy: 'priceLow',
  });

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.available !== 'all' && { available: filters.available }),
        sortBy: filters.sortBy
      });
      
      const response = await axios.get(`${API_URL}/vehicles?${params}`);
      // Handle both response formats
      const data = response.data;
      const vehiclesList = Array.isArray(data) ? data : data.vehicles || [];
      setVehicles(vehiclesList);
      setTotalPages(data.totalPages || Math.ceil(vehiclesList.length / 12));
      setTotalVehicles(data.totalVehicles || vehiclesList.length);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    setFilters(prev => ({ ...prev, ...searchFilters }));
    setCurrentPage(1);
    setSearchParams(searchFilters);
    fetchVehicles();
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      minPrice: '',
      maxPrice: '',
      available: 'all',
      sortBy: 'priceLow',
    });
    setCurrentPage(1);
    setSearchParams({});
    fetchVehicles();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Our Vehicle Fleet</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Choose from {totalVehicles}+ premium vehicles
          </p>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {vehicles.length} of {totalVehicles} vehicles
              </span>
              <select
                value={filters.sortBy}
                onChange={(e) => {
                  setFilters({ ...filters, sortBy: e.target.value });
                  setCurrentPage(1);
                  fetchVehicles();
                }}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => {
                    setFilters({ ...filters, type: e.target.value });
                    setCurrentPage(1);
                    fetchVehicles();
                  }}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Types</option>
                  <option value="car">Cars</option>
                  <option value="suv">SUVs</option>
                  <option value="luxury">Luxury</option>
                  <option value="electric">Electric</option>
                  <option value="bike">Bikes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <select
                  value={filters.available}
                  onChange={(e) => {
                    setFilters({ ...filters, available: e.target.value });
                    setCurrentPage(1);
                    fetchVehicles();
                  }}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All</option>
                  <option value="true">Available Only</option>
                  <option value="false">Booked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Price ($)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => {
                    setFilters({ ...filters, minPrice: e.target.value });
                    setCurrentPage(1);
                    fetchVehicles();
                  }}
                  placeholder="0"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Price ($)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => {
                    setFilters({ ...filters, maxPrice: e.target.value });
                    setCurrentPage(1);
                    fetchVehicles();
                  }}
                  placeholder="500"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Vehicles Grid */}
        {loading ? (
          <Loader />
        ) : vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl"
          >
            <p className="text-xl text-gray-600 dark:text-gray-400">No vehicles found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <VehicleCard vehicle={vehicle} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex space-x-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg transition ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleListing;