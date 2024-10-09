import React, { useState } from 'react';
import emergencyCenters from './emergencyCenters'; // Mock data

function App() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [errorMessage, setErrorMessage] = useState('');
  const [nearestCenter, setNearestCenter] = useState(null);
  const [helpRequested, setHelpRequested] = useState(false);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(userLocation);
          findNearestCenter(userLocation.lat, userLocation.lng);
        },
        () => {
          setErrorMessage('Location access denied. Please allow location access.');
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by this browser.');
    }
  };

  const findNearestCenter = (userLat, userLng) => {
    let closestCenter = null;
    let minDistance = Infinity;

    emergencyCenters.forEach((center) => {
      const distance = calculateDistance(userLat, userLng, center.lat, center.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCenter = center;
      }
    });

    setNearestCenter(closestCenter);
  };

  const requestHelp = () => {
    const message = `Emergency! Help needed at Latitude: ${location.lat}, Longitude: ${location.lng}. Nearest Center: ${nearestCenter.name}`;

    fetch('http://localhost:5000/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+1234567890', // Replace with the actual emergency contact number
        message: message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setHelpRequested(true);
        }
      })
      .catch((error) => console.error('Error sending help request:', error));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-red-600">Emergency Help App</h1>
        <p className="text-center text-gray-700 mb-4">Get instant help with just two clicks!</p>
        <div className="text-center">
          <button
            onClick={getLocation}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Get My Location
          </button>

          {location.lat && location.lng && (
            <div className="mt-6">
              <p className="text-gray-800">Your location: Latitude {location.lat}, Longitude {location.lng}</p>

              {nearestCenter ? (
                <>
                  <p className="mt-2 text-green-500 font-semibold">
                    Nearest Emergency Center: {nearestCenter.name}
                  </p>
                  <p className="text-gray-700">
                    Located at: Latitude {nearestCenter.lat}, Longitude {nearestCenter.lng}
                  </p>
                  {!helpRequested ? (
                    <button
                      onClick={requestHelp}
                      className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Send Help Request
                    </button>
                  ) : (
                    <p className="mt-4 text-green-600 font-semibold">Help request sent!</p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-gray-600">Finding nearest emergency center...</p>
              )}
            </div>
          )}

          {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
