"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabase/Clientsupabase";

export default function LocationSearch({
  onSelectLocation,
}: {
  onSelectLocation: (location: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("bill_boards")
      .select("location"); // Fetch only the 'location' column

    if (error) {
      console.error("Error fetching locations:", error);
      setLoading(false);
      return;
    }

    // Remove duplicates & store unique locations
    const uniqueLocations = Array.from(
      new Set(data.map((item) => item.location))
    );
    setLocations(uniqueLocations);
    setFilteredLocations(uniqueLocations);
    setLoading(false);
  };

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
          className="w-full outline-none px-2 text-gray-700 min-h-12"
        />
        <MapPin className="text-gray-500" size={20} />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute w-full bg-white border rounded-md shadow-md mt-1 p-2 text-gray-500">
          Loading locations...
        </div>
      )}

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

      {/* No Results Found */}
      {showDropdown && filteredLocations.length === 0 && query !== "" && (
        <div className="absolute w-full bg-white border rounded-md shadow-md mt-1 p-2 text-gray-500">
          No locations found
        </div>
      )}
    </div>
  );
}
