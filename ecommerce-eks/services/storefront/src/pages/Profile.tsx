import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-spotify-black p-8">
      <h1 className="text-4xl font-bold text-white mb-8">My Profile</h1>

      <div className="max-w-2xl">
        <div className="bg-spotify-gray p-8 rounded-lg mb-6">
          <div className="flex items-center mb-6">
            <div className="bg-spotify-lightgray w-24 h-24 rounded-full flex items-center justify-center text-5xl mr-6">
              👤
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{user.fullName}</h2>
              <p className="text-spotify-text">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-spotify-lightgray pt-6">
            <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>
            <div className="space-y-3 text-white">
              <div>
                <span className="text-spotify-text">Full Name:</span> {user.fullName}
              </div>
              <div>
                <span className="text-spotify-text">Email:</span> {user.email}
              </div>
            </div>
          </div>

          <div className="border-t border-spotify-lightgray pt-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4">Shipping Address</h3>
            <div className="text-white space-y-2">
              <p>{user.street}</p>
              <p>
                {user.city}, {user.state} {user.postalCode}
              </p>
              <p>{user.country}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-3 rounded-full hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;