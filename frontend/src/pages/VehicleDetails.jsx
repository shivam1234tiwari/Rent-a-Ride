import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, Fuel, Users, Gauge, Calendar, 
  Check, Wifi, Coffee, Wind, Music, Shield,
  ArrowLeft, Clock, AlertCircle, IndianRupee, 
  Bike, Car, Truck, Crown, Zap, Navigation,
  Wallet, ShieldCheck, Users as UsersIcon, Phone
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import BookingModal from '../components/BookingModal';
import DriverRecommendation from '../components/DriverRecommendation';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDriverSelection, setShowDriverSelection] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const getCategoryIcon = () => {
    switch (vehicle?.category) {
      case 'bike': return <Bike className="h-6 w-6" />;
      case 'car': return <Car className="h-6 w-6" />;
      case 'suv': return <Car className="h-6 w-6" />;
      case 'truck': return <Truck className="h-6 w-6" />;
      case 'self-driving': return <Navigation className="h-6 w-6" />;
      case 'luxury': return <Crown className="h-6 w-6" />;
      case 'electric': return <Zap className="h-6 w-6" />;
      default: return <Car className="h-6 w-6" />;
    }
  };

  const getCategoryColor = () => {
    switch (vehicle?.category) {
      case 'bike': return 'from-orange-500 to-red-500';
      case 'car': return 'from-blue-500 to-cyan-500';
      case 'suv': return 'from-green-500 to-teal-500';
      case 'truck': return 'from-purple-500 to-pink-500';
      case 'self-driving': return 'from-indigo-500 to-blue-500';
      case 'luxury': return 'from-yellow-500 to-orange-500';
      case 'electric': return 'from-teal-500 to-green-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

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
    if (vehicle.driverRequired) {
      setShowDriverSelection(true);
      setShowBookingModal(false);
    } else {
      toast.success('Booking confirmed! Check your dashboard for details.');
      navigate('/dashboard');
    }
  };

  if (loading) return <Loader />;
  if (!vehicle) return null;

  const galleryImages = [
    vehicle.image,
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7fa0ac7?w=800',
  ].filter(Boolean);

  const calculateWithGST = (price) => {
    const gst = price * 0.18;
    return price + gst;
  };

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
                <div className="flex items-center space-x-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    {vehicle.brand} {vehicle.model} • {vehicle.year}
                  </p>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor()}`}>
                    <span className="flex items-center space-x-1">
                      {getCategoryIcon()}
                      <span>{vehicle.category?.toUpperCase()}</span>
                    </span>
                  </div>
                </div>
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
                {vehicle.driverRequired && (
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                    👨‍✈️ Driver Included
                  </span>
                )}
                {vehicle.allowRideSharing && (
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-semibold">
                    🚗 Ride Sharing Available
                  </span>
                )}
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
                  {vehicle.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and Booking */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Base Price</p>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      <span className="font-semibold">{vehicle.pricePerDay.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-gray-600 ml-1">/day</span>
                    </div>
                  </div>
                  {vehicle.driverRequired && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Driver Charges</p>
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        <span className="font-semibold">{vehicle.driverPrice?.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-gray-600 ml-1">/day</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="font-semibold">Total with GST (18%)</p>
                    <div className="flex items-center">
                      <IndianRupee className="h-5 w-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.round(calculateWithGST(vehicle.pricePerDay + (vehicle.driverPrice || 0))).toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">/day</span>
                    </div>
                  </div>
                </div>

                {vehicle.securityDeposit > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <ShieldCheck className="h-4 w-4 text-yellow-600" />
                    <span>Security Deposit: ₹{vehicle.securityDeposit.toLocaleString('en-IN')} (Refundable)</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to book this vehicle');
                      navigate('/login');
                      return;
                    }
                    if (vehicle.available) {
                      setShowBookingModal(true);
                    } else {
                      toast.error('This vehicle is currently not available');
                    }
                  }}
                  disabled={!vehicle.available}
                  className={`w-full py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    vehicle.available
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {vehicle.available ? 'Book Now' : 'Not Available'}
                </button>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 mt-2 border-t">
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

        {/* Driver Selection Section */}
        {showDriverSelection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Select Your Driver</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Based on your preferences, we've found the best drivers for you
              </p>
              <DriverRecommendation 
                bookingId={showDriverSelection}
                pickupLocation={vehicle.currentLocation}
                onDriverSelected={(booking) => {
                  toast.success('Driver assigned successfully!');
                  navigate('/dashboard');
                }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
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