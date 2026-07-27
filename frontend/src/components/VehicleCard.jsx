import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Fuel, Users, Gauge, IndianRupee } from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800';

const VehicleCard = ({ vehicle, onSelect }) => {
  const [imgSrc, setImgSrc] = useState(vehicle?.image || DEFAULT_IMAGE);

  const handleCardClick = (e) => {
    if (typeof onSelect === 'function') {
      onSelect(vehicle);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
          <img
            src={imgSrc}
            alt={vehicle?.name || 'Vehicle'}
            onError={() => setImgSrc(DEFAULT_IMAGE)}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase">
            {vehicle?.category || 'Fleet'}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-snug">
              {vehicle?.name || 'Rental Vehicle'}
            </h3>
            <p className="text-xs text-gray-400">
              {vehicle?.brand || 'Brand'} • {vehicle?.year || '2024'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl">
            <div className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 text-blue-500" /> {vehicle?.fuelType || 'Petrol'}
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-blue-500" /> {vehicle?.transmission || 'Automatic'}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-500" /> {vehicle?.seats || 5} Seats
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-current" /> {vehicle?.rating || '4.5'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="flex justify-between items-center border-t dark:border-gray-700 pt-3">
          <div>
            <span className="text-xs text-gray-400 block">Daily Rate</span>
            <span className="text-xl font-black text-blue-600 flex items-center">
              <IndianRupee className="h-4 w-4" /> {vehicle?.pricePerDay || 1000}
            </span>
          </div>
          <Link
            to={vehicle?._id ? `/vehicle/${vehicle._id}` : '/vehicles'}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-95 transition shadow-md"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;