import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Shield, Disc, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BookingModal = ({ isOpen, onClose, vehicle, onBookingSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingMode, setBookingMode] = useState('self-drive');
  const [isOutstation, setIsOutstation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    paymentMethod: 'upi',
  });

  const calculateDays = () => {
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 1;
    }
    return 1;
  };

  const days = calculateDays();
  const baseTotal = days * (vehicle?.pricePerDay || 0);
  const driverCharge = bookingMode === 'with-driver' ? days * (vehicle?.driverPrice || 800) : 0;
  const outstationAllowance = isOutstation ? days * 500 : 0;
  const subtotal = baseTotal + driverCharge + outstationAllowance;
  const gst = subtotal * 0.18;
  const grandTotal = Math.round(subtotal + gst);
  const securityDeposit = bookingMode === 'self-drive' ? (vehicle?.securityDeposit || 3000) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book a vehicle');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/bookings`,
        {
          vehicleId: vehicle._id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropoffLocation,
          paymentMethod: bookingData.paymentMethod,
          bookingMode,
          isOutstation,
          totalPrice: grandTotal,
          totalDays: days,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Booking confirmed successfully!');
      if (onBookingSuccess) onBookingSuccess(response.data);
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border dark:border-gray-700"
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-bold">Book {vehicle?.name || 'Vehicle'}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Rental Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookingMode('self-drive')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition ${
                    bookingMode === 'self-drive'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Disc className="h-5 w-5" />
                  <span className="text-sm">Self-Drive</span>
                  <span className="text-[11px] text-gray-500 font-normal">You drive the vehicle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('with-driver')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition ${
                    bookingMode === 'with-driver'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-600 font-bold'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <UserCheck className="h-5 w-5" />
                  <span className="text-sm">Chauffeur Driven</span>
                  <span className="text-[11px] text-gray-500 font-normal">Verified Driver +₹800/day</span>
                </button>
              </div>
            </div>

            {/* Outstation Trip Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="text-sm font-semibold">Outstation / Intercity Trip</p>
                <p className="text-xs text-gray-400">Includes highway permit & state toll allowance</p>
              </div>
              <input
                type="checkbox"
                checked={isOutstation}
                onChange={(e) => setIsOutstation(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  required
                  min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <input
                type="text"
                required
                placeholder="Pickup Location (e.g., Pune Station)"
                value={bookingData.pickupLocation}
                onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="text"
                required
                placeholder="Dropoff Location"
                value={bookingData.dropoffLocation}
                onChange={(e) => setBookingData({ ...bookingData, dropoffLocation: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rental Base ({days} days × ₹{vehicle?.pricePerDay || 0})</span>
                <span>₹{baseTotal}</span>
              </div>
              {bookingMode === 'with-driver' && (
                <div className="flex justify-between text-purple-600 font-medium">
                  <span>Driver Allowance ({days} days × ₹800)</span>
                  <span>+₹{driverCharge}</span>
                </div>
              )}
              {isOutstation && (
                <div className="flex justify-between text-indigo-600">
                  <span>Outstation State Pass</span>
                  <span>+₹{outstationAllowance}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500">
                <span>GST (18%)</span>
                <span>₹{Math.round(gst)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold border-t pt-2 text-blue-600">
                <span>Total Payable</span>
                <span>₹{grandTotal}</span>
              </div>
              {securityDeposit > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Refundable Security Deposit: ₹{securityDeposit} (Pay on vehicle hand-over)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Processing Booking...' : `Confirm Booking • ₹${grandTotal}`}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;