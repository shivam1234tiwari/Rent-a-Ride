import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, Headphones, Award } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedVehicles();
  }, []);

  const fetchFeaturedVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching vehicles from:', `${API_URL}/vehicles`);
      
      const response = await axios.get(`${API_URL}/vehicles`);
      console.log('API Response:', response.data);
      
      // Handle different response formats
      let vehicles = [];
      if (Array.isArray(response.data)) {
        vehicles = response.data;
      } else if (response.data.vehicles && Array.isArray(response.data.vehicles)) {
        vehicles = response.data.vehicles;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        vehicles = response.data.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        vehicles = [];
      }
      
      // Take first 6 vehicles for featured section
      const featured = vehicles.slice(0, 6);
      setFeaturedVehicles(featured);
      
      if (featured.length === 0) {
        setError('No vehicles found. Please add vehicles to the database.');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      console.error('Error details:', error.response);
      
      let errorMessage = 'Failed to load vehicles. ';
      if (error.response?.status === 404) {
        errorMessage += 'API endpoint not found. Please check if backend is running on port 5000.';
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please check backend logs.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage += 'Cannot connect to server. Please make sure backend is running.';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    const query = new URLSearchParams(filters).toString();
    window.location.href = `/vehicles?${query}`;
  };

  const features = [
    { icon: Shield, title: 'Insurance Included', desc: 'Full coverage insurance with every rental' },
    { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock customer assistance' },
    { icon: Headphones, title: 'Free Cancellation', desc: 'Cancel up to 24 hours before pickup' },
    { icon: Award, title: 'Best Price Guarantee', desc: 'We match any legitimate offer' },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Drive Your Dream
            <span className="block text-blue-400">Rent the Best Vehicles</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Choose from our wide range of premium cars, bikes, and SUVs
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/vehicles"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl"
            >
              Explore Vehicles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Find Your Perfect Ride</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Search and book from hundreds of vehicles
            </p>
          </motion.div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose RentWheels?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              We provide the best rental experience in the industry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Featured Vehicles</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Our most popular vehicles this month
            </p>
          </motion.div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-2xl">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchFeaturedVehicles}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : featuredVehicles.length === 0 ? (
            <div className="text-center py-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl">
              <p className="text-yellow-600 dark:text-yellow-400 mb-4">
                No vehicles found. Please add vehicles to the database.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Run the seed script: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">node seedVehicles.js</code>
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredVehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <VehicleCard vehicle={vehicle} />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link
                  to="/vehicles"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  View All Vehicles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Hit the Road?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied customers who trust RentWheels for their travel needs
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;