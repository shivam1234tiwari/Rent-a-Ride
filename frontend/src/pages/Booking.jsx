import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: ''
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    calculateTotal();
  }, [bookingData.startDate, bookingData.endDate, vehicle]);

  const fetchVehicle = async () => {
    try {
      const response = await vehicleAPI.getById(id);
      setVehicle(response.data);
    } catch (error) {
      setError('Vehicle not found');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (bookingData.startDate && bookingData.endDate && vehicle) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setTotalDays(days);
        setTotalPrice(days * vehicle.pricePerDay);
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    }
  };

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (totalDays <= 0) {
      setError('Please select valid dates');
      return;
    }

    setLoading(true);
    try {
      const response = await bookingAPI.create({
        vehicleId: id,
        ...bookingData
      });
      navigate(`/payment/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="pt-20 text-center">Loading...</div>;
  if (error) return <div className="pt-20 text-center text-red-600">{error}</div>;
  if (!vehicle) return <div className="pt-20 text-center">Vehicle not found</div>;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Booking</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <img 
                src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'} 
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h2>
              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Year:</strong> {vehicle.year}</p>
                <p><strong>Transmission:</strong> {vehicle.transmission}</p>
                <p><strong>Seats:</strong> {vehicle.seats}</p>
                <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
                <p><strong>Price per day:</strong> ${vehicle.pricePerDay}</p>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      value={bookingData.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      required
                      value={bookingData.pickupLocation}
                      onChange={handleChange}
                      placeholder="Enter pickup location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drop-off Location
                    </label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      required
                      value={bookingData.dropoffLocation}
                      onChange={handleChange}
                      placeholder="Enter drop-off location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {totalDays > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Price Summary</h3>
                      <div className="space-y-1 text-sm">
                        <p>Rental Period: {totalDays} day(s)</p>
                        <p>Daily Rate: ${vehicle.pricePerDay}</p>
                        <p className="font-bold text-lg mt-2">Total: ${totalPrice}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={totalDays === 0 || loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;