import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

// Constants
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const NOMINATIM_HEADERS = { 'User-Agent': '10000hearts-partner-form' };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 10;
const MAP_ZOOM = 15;
const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 2;
const MIN_ADDRESS_LENGTH = 5;

// Placeholder addresses
const PLACEHOLDER_ADDRESSES = {
  FETCHING: "Fetching address...",
  MANUAL: "Please enter location address manually",
  SELECT: "Please select location on map",
  ENTER: "Please enter location address"
};

// Helper function to format address from Nominatim response
const formatAddress = (data) => {
  if (!data) return null;
  
  if (data.address) {
    const addr = data.address;
    const parts = [];
    
    // Street address
    if (addr.house_number && addr.road) {
      parts.push(`${addr.house_number}, ${addr.road}`);
    } else if (addr.road) {
      parts.push(addr.road);
    } else if (addr.house_number) {
      parts.push(addr.house_number);
    }
    
    // Area/Locality
    const areaFields = ['neighbourhood', 'suburb', 'locality', 'quarter', 'district'];
    const areaField = areaFields.find(field => addr[field]);
    if (areaField) parts.push(addr[areaField]);
    
    // City/Town
    const cityFields = ['city', 'town', 'village', 'municipality'];
    const cityField = cityFields.find(field => addr[field]);
    if (cityField) parts.push(addr[cityField]);
    
    // State
    if (addr.state) {
      parts.push(addr.state);
    } else if (addr.state_district) {
      parts.push(addr.state_district);
    }
    
    // Country
    if (addr.country) {
      parts.push(addr.country);
    }
    
    if (parts.length >= 1) {
      return parts.join(", ");
    }
  }
  
  // Fallback to display_name
  if (data.display_name) {
    const nameParts = data.display_name.split(',').map(p => p.trim()).filter(p => p.length > 0);
    if (nameParts.length > 0) {
      return nameParts.slice(0, 4).join(", ");
    }
    return data.display_name;
  }
  
  return null;
};

// Build minimal address from address components
const buildMinimalAddress = (addr, displayName = null) => {
  const nameParts = [];
  const areaFields = ['neighbourhood', 'suburb', 'locality'];
  const cityFields = ['city', 'town', 'village'];
  
  for (const field of areaFields) {
    if (addr[field]) {
      nameParts.push(addr[field]);
      break;
    }
  }
  
  for (const field of cityFields) {
    if (addr[field]) {
      nameParts.push(addr[field]);
      break;
    }
  }
  
  if (addr.state) nameParts.push(addr.state);
  if (addr.country) nameParts.push(addr.country);
  
  if (nameParts.length > 0) {
    return nameParts.join(", ");
  }
  
  if (displayName) {
    return displayName.split(',').slice(0, 3).join(',').trim();
  }
  
  return PLACEHOLDER_ADDRESSES.SELECT;
};

// Validate coordinates
const isValidCoordinates = (lat, lng) => {
  const validLat = parseFloat(lat);
  const validLng = parseFloat(lng);
  return !isNaN(validLat) && !isNaN(validLng) && 
         validLat >= -90 && validLat <= 90 && 
         validLng >= -180 && validLng <= 180;
};

// Parse coordinates from string
const parseCoordinates = (str) => {
  const match = str.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isValidCoordinates(lat, lng)) {
      return { lat, lng };
    }
  }
  return null;
};

// Check if address is valid (not coordinates or placeholder)
const isValidAddress = (address) => {
  if (!address) return false;
  if (address.match(/^\d+\.?\d*,\s*\d+\.?\d*$/)) return false;
  if (address.includes('Location at')) return false;
  if (Object.values(PLACEHOLDER_ADDRESSES).includes(address)) return false;
  if (address.includes('Fetching')) return false;
  return address.trim().length >= MIN_ADDRESS_LENGTH;
};

// Reverse geocode with retries
const reverseGeocode = async (lat, lng, retries = 3) => {
  const zoomLevels = [16, 14, null]; // null means no zoom parameter
  
  for (let i = 0; i < retries; i++) {
    try {
      const zoomParam = zoomLevels[i] !== null ? `&zoom=${zoomLevels[i]}` : '';
      const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}${zoomParam}&addressdetails=1&accept-language=en`;
      
      const response = await fetch(url, { headers: NOMINATIM_HEADERS });
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      const formattedAddress = formatAddress(data);
      
      if (formattedAddress && !formattedAddress.includes('undefined') && formattedAddress.trim().length >= MIN_ADDRESS_LENGTH) {
        return formattedAddress;
      }
      
      // Try building minimal address
      const minimalAddress = buildMinimalAddress(data.address || {}, data.display_name);
      if (minimalAddress && minimalAddress !== PLACEHOLDER_ADDRESSES.SELECT) {
        return minimalAddress;
      }
    } catch (error) {
      console.error(`Reverse geocoding attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        throw error;
      }
    }
  }
  
  return null;
};

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
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

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
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        markerRef.current = null;
      };
    } else if (isOpen && mapLoaded) {
      initializeMap();
    } else {
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
  const initializeMap = useCallback(() => {
    if (!window.L || !mapRef.current || mapInstanceRef.current) return;

    const coords = parseCoordinates(initialLocation);
    const centerLat = selectedLocation.lat || coords?.lat || DEFAULT_CENTER.lat;
    const centerLng = selectedLocation.lng || coords?.lng || DEFAULT_CENTER.lng;

    const map = window.L.map(mapRef.current).setView([centerLat, centerLng], DEFAULT_ZOOM);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    const marker = window.L.marker([centerLat, centerLng], {
      draggable: true,
      autoPan: true
    }).addTo(map);

    markerRef.current = marker;

    marker.on("dragend", async (e) => {
      const { lat, lng } = marker.getLatLng();
      await handleMapClick(lat, lng);
    });

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      await handleMapClick(lat, lng);
    });

    setTimeout(() => {
      handleMapClick(centerLat, centerLng);
    }, 100);
  }, [initialLocation, selectedLocation.lat, selectedLocation.lng]);

  // Update map marker position
  const updateMapMarker = useCallback((map, lat, lng) => {
    if (!map || !isValidCoordinates(lat, lng)) return;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    map.setView([lat, lng], MAP_ZOOM, { animate: true });
  }, []);

  // Handle map click
  const handleMapClick = useCallback(async (lat, lng) => {
    if (!isValidCoordinates(lat, lng)) {
      console.error("Invalid coordinates:", lat, lng);
      return;
    }

    const validLat = parseFloat(lat);
    const validLng = parseFloat(lng);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([validLat, validLng]);
      mapInstanceRef.current.setView([validLat, validLng], MAP_ZOOM, { animate: true });
    }

    try {
      const address = await reverseGeocode(validLat, validLng);
      setSelectedLocation({ 
        lat: validLat, 
        lng: validLng, 
        address: address || PLACEHOLDER_ADDRESSES.SELECT 
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setSelectedLocation({ 
        lat: validLat, 
        lng: validLng, 
        address: PLACEHOLDER_ADDRESSES.SELECT 
      });
    }
  }, []);

  // Handle confirm location button click
  const handleConfirmMapLocation = useCallback(() => {
    if (isValidAddress(selectedLocation.address)) {
      onLocationSelect(selectedLocation.address);
      toast.success("Location confirmed and updated");
      onOpenChange(false);
    } else {
      toast.error("Please wait for address to load or select a location on the map");
    }
  }, [selectedLocation.address, onLocationSelect, onOpenChange]);

  // Get current location using geolocation API
  const getCurrentLocation = useCallback(() => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    const geolocationOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (!isValidCoordinates(latitude, longitude)) {
          toast.error("Invalid location received. Please try again or select manually.");
          setIsGettingLocation(false);
          return;
        }

        try {
          setSelectedLocation({ lat: latitude, lng: longitude, address: PLACEHOLDER_ADDRESSES.FETCHING });
          
          const address = await reverseGeocode(latitude, longitude);
          
          if (address) {
            setSelectedLocation({ lat: latitude, lng: longitude, address });
            updateMapAndSelectLocation(latitude, longitude, address, accuracy);
          } else {
            toast.warning("Could not fetch address automatically. Please enter the location manually or select from map.");
            setSelectedLocation({ lat: latitude, lng: longitude, address: PLACEHOLDER_ADDRESSES.MANUAL });
            setIsGettingLocation(false);
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.warning("Could not fetch address automatically. Please enter the location manually or select from map.");
          setSelectedLocation({ lat: latitude, lng: longitude, address: PLACEHOLDER_ADDRESSES.MANUAL });
          setIsGettingLocation(false);
        }
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
  }, []);

  // Update map and select location
  const updateMapAndSelectLocation = useCallback((lat, lng, address, accuracy = null) => {
    if (mapInstanceRef.current) {
      updateMapMarker(mapInstanceRef.current, lat, lng);
    }

    if (!isValidAddress(address)) {
      toast.warning("Could not fetch address automatically. Please enter the location address manually or select from map.");
      setIsGettingLocation(false);
      return;
    }

    setSelectedLocation({ lat, lng, address });
    onLocationSelect(address);
    toast.success("Location retrieved and added successfully");
    
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  }, [updateMapMarker, onLocationSelect, onOpenChange]);

  // Fetch search suggestions with debounce
  const fetchSearchSuggestions = useCallback(async (query) => {
    if (!query.trim() || query.trim().length < MIN_SEARCH_LENGTH) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: NOMINATIM_HEADERS }
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
  }, []);

  // Handle search input change with debounce
  const handleSearchInputChange = useCallback((value) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= MIN_SEARCH_LENGTH) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSearchSuggestions(value);
      }, DEBOUNCE_DELAY);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [fetchSearchSuggestions]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(async (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const address = suggestion.display_name || searchQuery;

    if (!isValidCoordinates(lat, lng)) return;

    setSearchQuery(address);
    setSearchSuggestions([]);
    setShowSuggestions(false);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], MAP_ZOOM, { animate: true });
    }

    await handleMapClick(lat, lng);
    toast.success("Location selected");
  }, [searchQuery, handleMapClick]);

  // Handle search location
  const handleSearchLocation = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    const coords = parseCoordinates(searchQuery.trim());
    if (coords) {
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
        mapInstanceRef.current.setView([coords.lat, coords.lng], MAP_ZOOM, { animate: true });
      }
      await handleMapClick(coords.lat, coords.lng);
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1&addressdetails=1`,
        { headers: NOMINATIM_HEADERS }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        if (isValidCoordinates(lat, lng)) {
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.setView([lat, lng], MAP_ZOOM, { animate: true });
          }
          await handleMapClick(lat, lng);
          toast.success("Location found");
        } else {
          toast.error("Invalid location data received");
        }
      } else {
        toast.error("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search geocoding error:", error);
      toast.error("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, handleMapClick]);

  // Handle search input keypress (Enter key)
  const handleSearchKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      handleSearchLocation();
    }
  }, [handleSearchLocation]);

  // Handle manual address input change and geocode it
  const handleAddressInputChange = useCallback(async (address) => {
    setSelectedLocation((prev) => ({ ...prev, address }));

    const coords = parseCoordinates(address);
    if (coords) {
      setSelectedLocation({ lat: coords.lat, lng: coords.lng, address });
      onLocationSelect(address);
      toast.success("Location coordinates added");
      setTimeout(() => onOpenChange(false), 1000);
      return;
    }

    if (address.trim().length > MIN_ADDRESS_LENGTH) {
      try {
        const response = await fetch(
          `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
          { headers: NOMINATIM_HEADERS }
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const foundAddress = data[0].display_name || address;
          
          if (isValidCoordinates(lat, lng)) {
            setSelectedLocation({ lat, lng, address: foundAddress });
            onLocationSelect(foundAddress);

            if (mapInstanceRef.current) {
              updateMapMarker(mapInstanceRef.current, lat, lng);
            }

            toast.success("Location found and added");
            setTimeout(() => onOpenChange(false), 1000);
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    } else {
      onLocationSelect(address);
    }
  }, [onLocationSelect, onOpenChange, updateMapMarker]);

  // Confirm selected location
  const confirmLocation = useCallback(() => {
    if (isValidAddress(selectedLocation.address)) {
      onLocationSelect(selectedLocation.address);
      onOpenChange(false);
      toast.success("Location confirmed");
    } else {
      toast.error("Please wait for address to load, enter address manually, or select a location from the map");
    }
  }, [selectedLocation.address, onLocationSelect, onOpenChange]);

  // Memoized location display value
  const locationDisplayValue = useMemo(() => {
    return initialLocation || selectedLocation.address || 
           (selectedLocation.lat && selectedLocation.lng ? 
             `${selectedLocation.lat}, ${selectedLocation.lng}` : "");
  }, [initialLocation, selectedLocation]);

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
            
            {/* Confirm Location Popup */}
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
              value={locationDisplayValue}
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
              disabled={!isValidAddress(selectedLocation.address) && !(selectedLocation.lat && selectedLocation.lng) && !initialLocation}
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
