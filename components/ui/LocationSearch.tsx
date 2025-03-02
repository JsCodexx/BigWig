"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

const locations = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Miami",
  "San Francisco",
  "Seattle",
  "Boston",
  "Dallas",
  "Denver",
];

export default function LocationSearch({
  onSelectLocation,
}: {
  onSelectLocation: (location: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setShowDropdown(true);
    setFilteredLocations(
      locations.filter((loc) => loc.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const handleSelect = (location: string) => {
    setQuery(location);
    setShowDropdown(false);
    onSelectLocation(location);
  };

  return (
    <div className="relative w-full">
      {/* Input Field with Icon */}
      <div className="flex items-center border rounded-lg p-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-red-500">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search location..."
          className="w-full outline-none px-2 text-gray-700 min-h-12 "
        />

        <MapPin className="text-gray-500" size={20} />
      </div>

      {/* Dropdown List */}
      {showDropdown && filteredLocations.length > 0 && query !== "" && (
        <ul className="absolute w-full bg-white border rounded-md shadow-md mt-1 z-10 max-h-40 overflow-y-auto">
          {filteredLocations.map((loc, index) => (
            <li
              key={index}
              className="px-3 text-start py-2 hover:bg-gray-100 text-black/70 cursor-pointer"
              onClick={() => handleSelect(loc)}
            >
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
