import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Award, CheckCircle, User, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DriverRecommendation = ({ bookingId, pickupLocation, onDriverSelected }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [recommendationId, setRecommendationId] = useState(null);

  useEffect(() => {
    fetchDriverRecommendations();
  }, []);

  const fetchDriverRecommendations = async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/drivers/recommend`,
        {
          bookingId,
          pickupLocation,
          userPreferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setRecommendations(data.recommendations);
      setRecommendationId(data.recommendationId);
    } catch (error) {
      toast.error('Failed to load driver recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDriver = async (driver) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/drivers/select`,
        {
          recommendationId,
          driverId: driver.driver._id,
          bookingId,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setSelectedDriver(driver);
      toast.success('Driver assigned successfully!');
      onDriverSelected(data.booking);
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Finding best drivers for you...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Recommended Drivers</h3>
      <p className="text-sm text-gray-600 mb-4">
        Based on rating, experience, distance, and your preferences
      </p>
      
      {recommendations.map((rec, idx) => (
        <motion.div
          key={rec.driver._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`border rounded-xl p-4 cursor-pointer transition-all ${
            selectedDriver?.driver._id === rec.driver._id
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'hover:shadow-lg border-gray-200 dark:border-gray-700'
          }`}
          onClick={() => handleSelectDriver(rec)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {rec.driver.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold">{rec.driver.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm ml-1">{rec.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">•</span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-1" />
                    <span>{rec.experience} years exp</span>
                  </div>
                </div>
                <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{Math.round(rec.distance)} km away</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    <span>{rec.completionRate}% completion rate</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{rec.score}%</div>
              <div className="text-xs text-gray-500">Match Score</div>
            </div>
          </div>
          
          {selectedDriver?.driver._id === rec.driver._id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 pt-3 border-t border-green-200 dark:border-green-800"
            >
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1 text-green-600" />
                  <span>{rec.driver.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-green-600" />
                  <span>{rec.driver.email}</span>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">✓ Driver assigned to your booking</p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default DriverRecommendation;