import { useState } from 'react';
import { Search, Car, Bike, Zap, Crown, Navigation, Filter } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Fleet', icon: Filter },
    { id: 'car', label: 'Cars', icon: Car },
    { id: 'bike', label: 'Bikes', icon: Bike },
    { id: 'electric', label: 'EVs', icon: Zap },
    { id: 'luxury', label: 'Luxury', icon: Crown },
    { id: 'self-driving', label: 'Self-Drive', icon: Navigation },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ category, search: searchTerm });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto">
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                category === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Input Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vehicle name, city, or brand (e.g. Pune, Thar, BMW)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;