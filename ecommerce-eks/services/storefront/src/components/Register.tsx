import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-black px-4 py-8">
      <div className="bg-spotify-dark p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-spotify-text hover:text-white transition-colors mb-6 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-semibold">Back</span>
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Sign up to Shop</h1>
        <p className="text-spotify-text text-center mb-8">Create your account and start shopping</p>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-white text-sm font-semibold mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="Confirm your password"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="Enter your full name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white text-sm font-semibold mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="Enter your street address"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="Postal Code"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                placeholder="Country"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-green-400 transition disabled:opacity-50 mt-6"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-spotify-text">
            Already have an account?{' '}
            <Link to="/login" className="text-white underline hover:text-spotify-green">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;