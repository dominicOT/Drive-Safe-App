import React, { useState } from 'react';
import emergencyCenters from './emergencyCenters'; // Mock data

function App() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [errorMessage, setErrorMessage] = useState('');
  const [nearestCenter, setNearestCenter] = useState(null);
  const [helpRequested, setHelpRequested] = useState(false); // New state to track help request

  // Haversine formula to calculate distance between two points
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

  // Function to get user's current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(userLocation);
          findNearestCenter(userLocation.lat, userLocation.lng); // Find nearest center after getting location
        },
        (error) => {
          setErrorMessage('Location access denied. Please allow location access.');
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by this browser.');
    }
  };

  // Find nearest emergency center based on user's location
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

  // Handle the help request (for now, just log or display a message)
  const requestHelp = () => {
    const message = `Emergency! Please help at Latitude: ${location.lat}, Longitude: ${location.lng}. Nearest Center: ${nearestCenter.name}`;
  
    // Send SMS using the backend
    fetch('http://localhost:5000/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+23280174187',
        message: message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setHelpRequested(true);
          console.log('Help request sent:', data.messageSid);
        } else {
          console.error('Failed to send help request:', data.error);
        }
      })
      .catch((error) => {
        console.error('Error sending help request:', error);
      });
  };
  

  return (
    <div className="App">
      <h1>Emergency Help App</h1>
      <p>Get instant help with just two clicks!</p>
      <button onClick={getLocation}>Get My Location</button>

      {location.lat && location.lng ? (
        <div>
          <p>Your location: Latitude {location.lat}, Longitude {location.lng}</p>
          {nearestCenter ? (
            <>
              <p>
                Nearest Emergency Center: {nearestCenter.name} <br />
                Located at: Latitude {nearestCenter.lat}, Longitude {nearestCenter.lng}
              </p>
              {/* Second button for confirming help request */}
              {!helpRequested ? (
                <button onClick={requestHelp}>Send Help Request</button>
              ) : (
                <p>Help request sent to {nearestCenter.name}!</p>
              )}
            </>
          ) : (
            <p>Finding nearest emergency center...</p>
          )}
        </div>
      ) : (
        <p>{errorMessage}</p>
      )}
    </div>
  );
}

export default App;
