import { useState } from 'react';
import { X, Calendar, MapPin, CreditCard, IndianRupee, Shield, Users, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BookingModal = ({ isOpen, onClose, vehicle, onBookingSuccess }) => {
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    specialRequests: '',
    paymentMethod: 'card',
    isSharedRide: false,
    sharedWithCount: 1,
  });
  const [loading, setLoading] = useState(false);
  const [showSmartPricing, setShowSmartPricing] = useState(false);
  const [smartPrice, setSmartPrice] = useState(null);

  const calculateDays = () => {
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateBaseTotal = () => {
    const days = calculateDays();
    let total = days * vehicle.pricePerDay;
    if (vehicle.driverRequired && vehicle.driverPrice) {
      total += days * vehicle.driverPrice;
    }
    return total;
  };

  const calculateSharedDiscount = () => {
    if (bookingData.isSharedRide && bookingData.sharedWithCount > 1) {
      return 0.3; // 30% discount for ride sharing
    }
    return 0;
  };

  const calculateGST = (amount) => {
    return amount * 0.18;
  };

  const calculateTotal = () => {
    let total = calculateBaseTotal();
    const sharedDiscount = calculateSharedDiscount();
    total = total * (1 - sharedDiscount);
    const gst = calculateGST(total);
    return { subtotal: total, gst, total: total + gst };
  };

  const fetchSmartPricing = async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/pricing/calculate`,
        {
          vehicleId: vehicle._id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          isPeakHour: false,
          isSharedRide: bookingData.isSharedRide,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSmartPrice(data);
      setShowSmartPricing(true);
    } catch (error) {
      toast.error('Failed to fetch smart pricing');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a vehicle');
      onClose();
      return;
    }

    setLoading(true);
    try {
      const { subtotal, gst, total } = calculateTotal();
      const response = await axios.post(`${API_URL}/bookings`, {
        vehicleId: vehicle._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod,
        isSharedRide: bookingData.isSharedRide,
        sharedWith: bookingData.isSharedRide ? bookingData.sharedWithCount : 1,
        totalDays: calculateDays(),
        basePrice: vehicle.pricePerDay,
        driverPrice: vehicle.driverPrice || 0,
        taxAmount: gst,
        discountAmount: calculateBaseTotal() * calculateSharedDiscount(),
        totalPrice: total,
      });
      toast.success('Booking confirmed successfully!');
      onBookingSuccess(response.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, gst, total } = calculateTotal();
  const days = calculateDays();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Book {vehicle.name}</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.startDate}
                      onChange={(e) => {
                        setBookingData({ ...bookingData, startDate: e.target.value });
                        fetchSmartPricing();
                      }}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      required
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      value={bookingData.endDate}
                      onChange={(e) => {
                        setBookingData({ ...bookingData, endDate: e.target.value });
                        fetchSmartPricing();
                      }}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Ride Sharing Option */}
              {vehicle.allowRideSharing && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Ride Sharing</span>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        checked={bookingData.isSharedRide}
                        onChange={(e) => setBookingData({ ...bookingData, isSharedRide: e.target.checked })}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </label>
                  {bookingData.isSharedRide && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-2">Number of people sharing</label>
                      <select
                        value={bookingData.sharedWithCount}
                        onChange={(e) => setBookingData({ ...bookingData, sharedWithCount: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value={2}>2 people (30% discount)</option>
                        <option value={3}>3 people (40% discount)</option>
                        <option value={4}>4 people (50% discount)</option>
                      </select>
                      <p className="text-xs text-purple-600 mt-1">
                        Save up to 50% by sharing your ride!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Location Fields */}
              <div>
                <label className="block text-sm font-medium mb-2">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter pickup location"
                    value={bookingData.pickupLocation}
                    onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dropoff Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter dropoff location"
                    value={bookingData.dropoffLocation}
                    onChange={(e) => setBookingData({ ...bookingData, dropoffLocation: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={bookingData.paymentMethod}
                    onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI (Google Pay, PhonePe, Paytm)</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="cash">Cash on Pickup</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium mb-2">Special Requests</label>
                <textarea
                  rows="3"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Any special requests? (e.g., child seat, extra luggage space)"
                />
              </div>

              {/* Price Breakdown */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold mb-2 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  Price Breakdown
                </h3>
                <div className="flex justify-between text-sm">
                  <span>Vehicle Rental ({days} days × ₹{vehicle.pricePerDay}/day)</span>
                  <span>₹{(days * vehicle.pricePerDay).toLocaleString('en-IN')}</span>
                </div>
                {vehicle.driverRequired && vehicle.driverPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Driver Charges ({days} days × ₹{vehicle.driverPrice}/day)</span>
                    <span>₹{(days * vehicle.driverPrice).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {bookingData.isSharedRide && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Ride Sharing Discount ({calculateSharedDiscount() * 100}%)</span>
                    <span>-₹{(calculateBaseTotal() * calculateSharedDiscount()).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>GST (18%)</span>
                  <span>₹{Math.round(gst).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{Math.round(total).toLocaleString('en-IN')}</span>
                </div>
                {vehicle.securityDeposit > 0 && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2 pt-2 border-t">
                    <Shield className="h-3 w-3" />
                    <span>Security Deposit: ₹{vehicle.securityDeposit.toLocaleString('en-IN')} (Refundable)</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Free cancellation up to 24 hours before pickup</span>
                </div>
              </div>

              {/* Smart Pricing Info */}
              {showSmartPricing && smartPrice && (
                <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-teal-600" />
                    <span className="font-semibold">Smart Pricing Applied</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {smartPrice.discounts.advanceBooking !== 'None' && `✓ Advance booking discount: ${smartPrice.discounts.advanceBooking}\n`}
                    {smartPrice.discounts.rideSharing !== 'None' && `✓ ${smartPrice.discounts.rideSharing} discount for ride sharing`}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Confirm Booking • ₹${Math.round(total).toLocaleString('en-IN')}`}
              </button>

              <p className="text-xs text-center text-gray-500">
                By confirming, you agree to our Terms of Service and Cancellation Policy
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;