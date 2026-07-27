import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Fuel, Users, Gauge, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import BookingModal from '../components/BookingModal';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [rentalDays, setRentalDays] = useState(1);
  const [imgSrc, setImgSrc] = useState(DEFAULT_IMAGE);

  useEffect(() => {
    fetchVehicleDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/vehicles/${id}`);
      setVehicle(data);
      setImgSrc(data.image || DEFAULT_IMAGE);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast.error('Vehicle session expired or not found. Redirecting...');
      setTimeout(() => {
        navigate('/vehicles');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!vehicle) return null;

  const basePrice = (vehicle.pricePerDay || 0) * rentalDays;
  const gstPrice = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gstPrice;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Vehicles
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="relative h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
            <img 
              src={imgSrc} 
              alt={vehicle.name} 
              onError={() => setImgSrc(DEFAULT_IMAGE)}
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {vehicle.category}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-3xl font-extrabold">{vehicle.name}</h1>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" /> {vehicle.rating || '4.5'}
                </div>
              </div>
              <p className="text-gray-400 text-sm">{vehicle.brand} • {vehicle.model} ({vehicle.year || 2023})</p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {vehicle.description || 'Premium rental vehicle maintained in top condition with full insurance coverage.'}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Fuel className="h-4 w-4 text-blue-500" />
                <span>Fuel: <b>{vehicle.fuelType || 'Petrol'}</b></span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Gauge className="h-4 w-4 text-blue-500" />
                <span>Gear: <b>{vehicle.transmission || 'Manual'}</b></span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Seats: <b>{vehicle.seats || 5} Capacity</b></span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Deposit: <b>₹{vehicle.securityDeposit || 3000}</b></span>
              </div>
            </div>

            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Vehicle Features</h4>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, i) => (
                    <span key={i} className="text-[11px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Check className="h-3 w-3" /> {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3 shadow-md">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase">Simulate Rental Duration:</label>
                <span className="text-xs text-gray-500">Base: ₹{vehicle.pricePerDay}/day</span>
              </div>
              
              <input
                type="range" 
                min="1" 
                max="15" 
                value={rentalDays}
                onChange={(e) => setRentalDays(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />

              <div className="space-y-1.5 pt-2 border-t dark:border-gray-700 text-sm">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Rental Total ({rentalDays} Days)</span>
                  <span>₹{basePrice}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>GST (18%)</span>
                  <span>+₹{gstPrice}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base pt-1 text-blue-600">
                  <span>Grand Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                disabled={!vehicle.available}
                className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition text-white ${
                  vehicle.available 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {vehicle.available ? 'Proceed to Book Ride' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)} 
        vehicle={vehicle} 
      />
    </div>
  );
};

export default VehicleDetails;