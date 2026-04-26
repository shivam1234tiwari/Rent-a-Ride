import { Link } from 'react-router-dom';
import { Star, Fuel, Users, Gauge, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const VehicleCard = ({ vehicle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 px-2 py-1 rounded-lg text-sm font-semibold">
          {vehicle.type}
        </div>
        {vehicle.available ? (
          <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            Available
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            Booked
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{vehicle.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{vehicle.brand} {vehicle.model}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold">{vehicle.rating}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Fuel className="h-4 w-4" />
            <span className="text-sm">{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span className="text-sm">{vehicle.seats} Seats</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Gauge className="h-4 w-4" />
            <span className="text-sm">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{vehicle.year}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-blue-600">${vehicle.pricePerDay}</span>
              <span className="text-gray-600 dark:text-gray-400">/day</span>
            </div>
            <Link
              to={`/vehicle/${vehicle._id}`}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Rent Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;