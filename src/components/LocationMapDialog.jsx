import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navigation, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

const LocationMapDialog = ({ isOpen, onOpenChange, onLocationSelect, initialLocation = "" }) => {
  const [selectedLocation, setSelectedLocation] = useState({ lat: null, lng: null, address: "" });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load Leaflet CSS and JS
  useEffect(() => {
    if (isOpen && !mapLoaded) {
      // Load Leaflet CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        if (markerRef.current) {
          markerRef.current = null;
        }
      };
    } else if (isOpen && mapLoaded) {
      initializeMap();
    } else {
      // Reset state when dialog closes
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setSelectedLocation({ lat: null, lng: null, address: "" });
      setSearchQuery("");
      setSearchSuggestions([]);
      setShowSuggestions(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  }, [isOpen, mapLoaded]);

  // Initialize map function
  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstanceRef.current) return;

    const defaultLat = selectedLocation.lat || initialLocation ? null : 20.5937;
    const defaultLng = selectedLocation.lng || initialLocation ? null : 78.9629;
    const centerLat = defaultLat || 20.5937;
    const centerLng = defaultLng || 78.9629;

    // Initialize map
    const map = window.L.map(mapRef.current).setView([centerLat, centerLng], 10);

    // Add OpenStreetMap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // If there's an initial location with coordinates, set it
    let initialLat = centerLat;
    let initialLng = centerLng;
    
    if (initialLocation) {
      // Try to parse coordinates or geocode the address
      const coordMatch = initialLocation.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
        initialLat = parseFloat(coordMatch[1]);
        initialLng = parseFloat(coordMatch[2]);
      }
    }

    // If selected location has coordinates, use those
    if (selectedLocation.lat && selectedLocation.lng) {
      initialLat = selectedLocation.lat;
      initialLng = selectedLocation.lng;
    }

    // Create draggable marker at initial position
    const marker = window.L.marker([initialLat, initialLng], {
      draggable: true,
      autoPan: true
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker drag end - when user moves the pointer
    marker.on("dragend", async (e) => {
      const { lat, lng } = marker.getLatLng();
      await handleMapClick(lat, lng);
    });

    // Handle map click - move marker to clicked location
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      await handleMapClick(lat, lng);
    });

    // Initialize with current marker position - use setTimeout to ensure map is fully rendered
    setTimeout(() => {
      if (initialLocation || selectedLocation.lat) {
        handleMapClick(initialLat, initialLng);
      } else {
        // Show marker at center, let user drag it
        handleMapClick(centerLat, centerLng);
      }
    }, 100);
  };

  // Update map marker position
  const updateMapMarker = (map, lat, lng) => {
    if (!map) return;
    
    const validLat = parseFloat(lat);
    const validLng = parseFloat(lng);
    
    if (isNaN(validLat) || isNaN(validLng)) {
      console.error("Invalid coordinates in updateMapMarker:", lat, lng);
      return;
    }

    // Move existing draggable marker to new position if it exists
    if (markerRef.current) {
      markerRef.current.setLatLng([validLat, validLng]);
    }
    
    // Center map on location with zoom level 15 for better accuracy
    map.setView([validLat, validLng], 15, { animate: true });
  };

  // Handle map click
  const handleMapClick = async (lat, lng) => {
    // Ensure coordinates are valid numbers
    const validLat = parseFloat(lat);
    const validLng = parseFloat(lng);
    
    if (isNaN(validLat) || isNaN(validLng)) {
      console.error("Invalid coordinates:", lat, lng);
      return;
    }

    // Update map marker first - ensure marker exists
    if (mapInstanceRef.current && markerRef.current) {
      // Move marker to exact position
      markerRef.current.setLatLng([validLat, validLng]);
      // Center map on marker with appropriate zoom
      mapInstanceRef.current.setView([validLat, validLng], 15, { animate: true });
    }

    // Reverse geocode to get address (but don't update parent yet - wait for confirmation)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${validLat}&lon=${validLng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': '10000hearts-partner-form'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      const address = data.display_name || `${validLat.toFixed(6)}, ${validLng.toFixed(6)}`;

      setSelectedLocation({ lat: validLat, lng: validLng, address });
      // Don't call onLocationSelect here - wait for user to confirm
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      const address = `${validLat.toFixed(6)}, ${validLng.toFixed(6)}`;
      setSelectedLocation({ lat: validLat, lng: validLng, address });
      // Don't call onLocationSelect here - wait for user to confirm
    }
  };

  // Handle confirm location button click
  const handleConfirmMapLocation = () => {
    const locationToConfirm = selectedLocation.address || 
      (selectedLocation.lat && selectedLocation.lng ? 
        `${selectedLocation.lat}, ${selectedLocation.lng}` : null);
    
    if (locationToConfirm) {
      onLocationSelect(locationToConfirm);
      toast.success("Location confirmed and updated");
      onOpenChange(false);
    } else {
      toast.error("Please select a location on the map first");
    }
  };

  // Get current location using geolocation API
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          toast.error("Invalid location received. Please try again or select manually.");
          setIsGettingLocation(false);
          return;
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': '10000hearts-partner-form'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.status}`);
          }

          const data = await response.json();
          const address = data.display_name || `${latitude}, ${longitude}`;

          setSelectedLocation({ lat: latitude, lng: longitude, address });
          updateMapAndSelectLocation(latitude, longitude, address, accuracy);
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          const address = `${latitude}, ${longitude}`;
          setSelectedLocation({ lat: latitude, lng: longitude, address });
          updateMapAndSelectLocation(latitude, longitude, address, accuracy, true);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Failed to get your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. Please try again or select manually.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "Please allow location access or select manually.";
            break;
        }

        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      geolocationOptions
    );
  };

  // Update map and select location
  const updateMapAndSelectLocation = (lat, lng, address, accuracy = null, isCoordinatesOnly = false) => {
    // Update map marker if map is initialized
    if (mapInstanceRef.current) {
      updateMapMarker(mapInstanceRef.current, lat, lng);
    }

    // Update selected location state
    setSelectedLocation({ lat, lng, address });

    // Call the callback to update parent component
    onLocationSelect(address);

    // Show success message
    if (isCoordinatesOnly) {
      toast.success(`Location retrieved (coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}) and added`);
    } else {
      toast.success(`Location retrieved (Accuracy: ${accuracy ? Math.round(accuracy) : 'N/A'}m) and added successfully`);
    }

    // Automatically close the dialog after a short delay
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  // Fetch search suggestions with debounce
  const fetchSearchSuggestions = async (query) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': '10000hearts-partner-form'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setSearchSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchInputChange = (value) => {
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the suggestion fetch
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSearchSuggestions(value);
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const address = suggestion.display_name || searchQuery;

    // Update search input
    setSearchQuery(address);
    setSearchSuggestions([]);
    setShowSuggestions(false);

    // Move marker to selected location
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
    }

    // Update location
    await handleMapClick(lat, lng);
    toast.success("Location selected");
  };

  // Handle search location
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);
    const address = searchQuery.trim();

    // If address looks like coordinates, parse them
    const coordMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        // Move marker to coordinates with proper zoom
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
        }
        await handleMapClick(lat, lng);
        setIsSearching(false);
        return;
      }
    }

    // Try to geocode the address (forward geocoding)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': '10000hearts-partner-form'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const foundAddress = data[0].display_name || address;

        // Move marker to searched location with proper zoom
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
        }

        // Update location
        await handleMapClick(lat, lng);
        toast.success("Location found");
      } else {
        toast.error("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search geocoding error:", error);
      toast.error("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input keypress (Enter key)
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      handleSearchLocation();
    }
  };

  // Handle manual address input change and geocode it
  const handleAddressInputChange = async (address) => {
    setSelectedLocation((prev) => ({ ...prev, address }));

    // If address looks like coordinates, parse them
    const coordMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      setSelectedLocation({ lat, lng, address });

      if (lat && lng) {
        onLocationSelect(address);
        toast.success("Location coordinates added");
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
    } else if (address.trim().length > 5) {
      // Try to geocode the address (forward geocoding)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const foundAddress = data[0].display_name || address;
          setSelectedLocation({ lat, lng, address: foundAddress });

          // Update the parent component
          onLocationSelect(foundAddress);

          // Update map marker if map is initialized
          if (mapInstanceRef.current) {
            updateMapMarker(mapInstanceRef.current, lat, lng);
          }

          toast.success("Location found and added");

          // Automatically close the dialog after a short delay
          setTimeout(() => {
            onOpenChange(false);
          }, 1000);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    } else {
      // Update parent component in real-time as user types
      onLocationSelect(address);
    }
  };

  // Confirm selected location
  const confirmLocation = () => {
    const locationToConfirm = selectedLocation.address || (selectedLocation.lat && selectedLocation.lng ? `${selectedLocation.lat}, ${selectedLocation.lng}` : null);
    
    if (locationToConfirm) {
      onLocationSelect(locationToConfirm);
      onOpenChange(false);
      toast.success("Location confirmed");
    } else {
      toast.error("Please select a location from the map or enter it manually");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>
            Drag the pointer on the map to your desired location, or click on the map to move it. Then click "Confirm Location" to update the field. You can also enter address manually or use your current location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Location Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                onFocus={() => {
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Search for a location (e.g., Delhi, Mumbai, or address)"
                className="w-full pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSearchLocation}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.place_id || suggestion.osm_id || index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.preventDefault()}
                      className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors border-b border-border last:border-b-0"
                    >
                      <p className="text-sm font-medium">{suggestion.display_name}</p>
                      {suggestion.address && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[suggestion.address.city, suggestion.address.state, suggestion.address.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current Location Button */}
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isGettingLocation ? "Getting location..." : "Current Location"}
          </Button>

          {/* Map Container */}
          <div className="relative w-full h-[500px] border rounded-lg overflow-hidden">
            <div 
              ref={mapRef} 
              id="location-map"
              className="w-full h-full"
              style={{ zIndex: 0 }}
            />
            <div className="absolute top-2 left-2 bg-white/90 px-3 py-2 rounded-md text-xs shadow-md max-w-xs z-10">
              <p className="font-semibold flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location Selection
              </p>
              {selectedLocation.address ? (
                <p className="text-muted-foreground mt-1 break-words">{selectedLocation.address}</p>
              ) : selectedLocation.lat && selectedLocation.lng ? (
                <p className="text-muted-foreground mt-1">
                  Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-muted-foreground mt-1">Drag the pointer or click on the map to select location</p>
              )}
            </div>
            
            {/* Confirm Location Popup - Shows at bottom when location is selected */}
            {selectedLocation.lat && selectedLocation.lng && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-border p-4 z-20 min-w-[300px] max-w-[90%]">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold mb-1">Selected Location:</p>
                    <p className="text-xs text-muted-foreground break-words">
                      {selectedLocation.address || 
                        `Coordinates: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleConfirmMapLocation}
                    className="w-full"
                  >
                    Confirm Location
                  </Button>
                </div>
              </div>
            )}
            
            {!selectedLocation.lat && !selectedLocation.lng && (
              <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs shadow-md z-10">
                <p className="text-muted-foreground">Click on map to select location</p>
              </div>
            )}
          </div>

          {/* Manual Location Input */}
          <div className="space-y-2">
            <Label>Location Address</Label>
            <Input
              type="text"
              value={initialLocation || selectedLocation.address || (selectedLocation.lat && selectedLocation.lng ? `${selectedLocation.lat}, ${selectedLocation.lng}` : "")}
              onChange={(e) => handleAddressInputChange(e.target.value)}
              placeholder="Enter location address or coordinates (e.g., Delhi, India or 28.6139, 77.2090)"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter address manually or click "Current Location" to use your GPS location. Location will be automatically added to the form.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmLocation}
              disabled={!selectedLocation.address && !(selectedLocation.lat && selectedLocation.lng) && !initialLocation}
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationMapDialog;

