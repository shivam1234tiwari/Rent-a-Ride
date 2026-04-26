import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, Fuel, Users, Gauge, Calendar, 
  Check, Wifi, Coffee, Wind, Music, Shield,
  ArrowLeft, Clock, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const features = [
    { icon: Wifi, name: 'WiFi Hotspot' },
    { icon: Coffee, name: 'Coffee Machine' },
    { icon: Wind, name: 'AC Climate Control' },
    { icon: Music, name: 'Premium Sound System' },
    { icon: Shield, name: 'Airbags' },
    { icon: Clock, name: '24/7 Support' },
  ];

  useEffect(() => {
    fetchVehicleDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/vehicles/${id}`);
      setVehicle(data);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast.error('Vehicle not found');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = (booking) => {
    toast.success('Booking confirmed! Check your dashboard for details.');
    navigate('/dashboard');
  };

  if (loading) return <Loader />;
  if (!vehicle) return null;

  const galleryImages = [
    vehicle.image,
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7fa0ac7',
  ].filter(Boolean);

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Vehicles</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-2xl overflow-hidden mb-4 h-96 bg-gray-200 dark:bg-gray-700">
              <img
                src={galleryImages[selectedImage]}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden h-24 transition-all duration-300 ${
                    selectedImage === index ? 'ring-2 ring-blue-600 scale-95' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Vehicle Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h1 className="text-3xl font-bold">{vehicle.name}</h1>
                  <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{vehicle.rating}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">(128 reviews)</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {vehicle.brand} {vehicle.model} • {vehicle.year}
                </p>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                {vehicle.available ? (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                    Available Now
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                    Currently Booked
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                  {vehicle.type?.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {vehicle.description}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Fuel className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Fuel Type</p>
                    <p className="font-semibold">{vehicle.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Seats</p>
                    <p className="font-semibold">{vehicle.seats} People</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Gauge className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-semibold">{vehicle.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Model Year</p>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <feature.icon className="h-5 w-5 text-green-500" />
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and Booking */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                    <div className="text-3xl font-bold text-blue-600">
                      ${vehicle.pricePerDay}
                      <span className="text-base font-normal text-gray-600 dark:text-gray-400">/day</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error('Please login to book this vehicle');
                        navigate('/login');
                        return;
                      }
                      setShowBookingModal(true);
                    }}
                    disabled={!vehicle.available}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                      vehicle.available
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {vehicle.available ? 'Book Now' : 'Not Available'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Free cancellation up to 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Best price guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        vehicle={vehicle}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default VehicleDetails;