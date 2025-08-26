import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface MissionSearchProps {
  onSearch: (query: string) => void;
}

const MissionSearch: React.FC<MissionSearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="py-2 px-4 text-white bg-[#F15A24] rounded-md text-base font-normal">
          Rechercher
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une mission..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="flex justify-center items-center py-2 px-4 text-white bg-[#F15A24] rounded-md text-base font-normal hover:bg-[#d94e1f]"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
          Rechercher
        </button>
      </form>
    </div>
  );
};

export default MissionSearch; 