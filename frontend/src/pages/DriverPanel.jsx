import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation, CheckCircle, DollarSign, Star, Car, MapPin, Power } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DriverPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTrips, setActiveTrips] = useState([
    {
      _id: 'TRIP_101',
      vehicleName: 'Hyundai Creta SX',
      pickup: 'Koregaon Park, Pune',
      dropoff: 'Pune Airport (PNQ)',
      customer: 'Rahul Tiwari',
      amount: 1200,
      status: 'in-progress'
    }
  ]);

  const toggleShift = () => {
    setIsOnline(!isOnline);
    toast.success(!isOnline ? 'You are now ONLINE' : 'You are now OFFLINE');
  };

  const completeTrip = (id) => {
    setActiveTrips(activeTrips.filter(t => t._id !== id));
    toast.success('Trip Completed Successfully!');
  };

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Driver Status Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl">
              <Navigation className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-xl">{user?.name || 'Partner Driver'}</h2>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                {isOnline ? 'Duty Active (Receiving Trips)' : 'Duty Offline'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleShift}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition ${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            <Power className="h-4 w-4" /> {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Trips List */}
        <h3 className="text-xl font-bold mb-4">Assigned Active Trips</h3>
        <div className="space-y-4">
          {activeTrips.map((trip) => (
            <div key={trip._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
              <div className="space-y-2">
                <h4 className="font-bold text-lg">{trip.vehicleName}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-500" /> Pickup: {trip.pickup}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-500" /> Dropoff: {trip.dropoff}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-emerald-600">₹{trip.amount}</p>
                <button
                  onClick={() => completeTrip(trip._id)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                >
                  End Ride & Collect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverPanel;