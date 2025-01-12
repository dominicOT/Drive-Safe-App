import React, { useState } from 'react';
import emergencyCenters from './emergencyCenters'; // Mock data

function App() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [errorMessage, setErrorMessage] = useState('');
  const [nearestCenter, setNearestCenter] = useState(null);
  const [helpRequested, setHelpRequested] = useState(false);

  const [selectedEmergencyType, setSelectedEmergencyType] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);
  

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
        to: '+23234872268',
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

  //constant to handle image added
  const handleAddPhoto = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setImage(file);

        //preview selected image
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };


  //###########################################################################
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-800">DriveSafe</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-red-600">Emergency Contacts</button>
              <button className="text-gray-600 hover:text-red-600">History</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Emergency Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Type Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Emergency Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Fire', 'Police', 'Accident', 'Break Down'].map((type) => (
                  <button
                    key={type}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      selectedEmergencyType === type
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-red-100 hover:bg-red-50 hover:border-red-500'
                    }`}
                    onClick={() => setSelectedEmergencyType(type)}
                  >
                    <div className="text-center">
                      <span className="block text-lg font-medium text-gray-900">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Emergency Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Your existing emergency location and center finding logic */}
              {/* ... existing content ... */}
            </div>

            {/* Additional Information Section */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Additional Details</h2>
              <textarea
                className="w-full p-3 border rounded-lg"
                placeholder="Describe your emergency situation..."
                rows="4"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
              />
              <div className="mt-4 flex space-x-4">
                <button
                  className="flex items-center space-x-2 text-blue-600"
                  onClick={handleAddPhoto}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>Add Photo</span>
                </button>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Selected Image:</h3>
                  <img
                    src={imagePreview}
                    alt="Selected"
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Quick Contacts */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4">Emergency Contacts</h2>
              <div className="space-y-3">
                {['Family Doctor', 'Next of Kin', 'Local Police'].map((contact) => (
                  <div key={contact} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{contact}</span>
                    <button className="text-red-600 hover:text-red-800">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Tips */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4">Emergency Tips</h2>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  Stay calm and provide clear information
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  Keep your phone line open
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  Follow emergency responder instructions
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Emergency Numbers</h3>
              <div className="space-y-2">
                <p>Police: 911</p>
                <p>Ambulance: 911</p>
                <p>Fire: 911</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <p>About Us</p>
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Download App</h3>
              <div className="space-y-2">
                <button className="bg-white text-gray-800 px-4 py-2 rounded">App Store</button>
                <button className="bg-white text-gray-800 px-4 py-2 rounded">Google Play</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
