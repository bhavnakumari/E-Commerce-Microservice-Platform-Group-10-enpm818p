import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/ordersApi';
import { OrderItem } from '../types';

const Checkout: React.FC = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to checkout');
      setLoading(false);
      return;
    }

    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const order = await ordersService.createOrder({
        userId: user.id,
        items: orderItems,
        payment: {
          amount: getTotalPrice(),
          cardNumber: paymentData.cardNumber,
          expiryMonth: parseInt(paymentData.expiryMonth),
          expiryYear: parseInt(paymentData.expiryYear),
          cvv: paymentData.cvv,
          currency: 'USD',
        },
      });

      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to process order. Please check your payment details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const useTestCard = () => {
    setPaymentData({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2030',
      cvv: '123',
    });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-spotify-black p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-spotify-gray p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Shipping Address</h2>
            <div className="text-white space-y-2">
              <p className="font-semibold">{user.fullName}</p>
              <p>{user.street}</p>
              <p>
                {user.city}, {user.state} {user.postalCode}
              </p>
              <p>{user.country}</p>
            </div>
          </div>

          <div className="bg-spotify-gray p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Payment Information</h2>

            <div className="bg-spotify-lightgray p-4 rounded mb-4">
              <p className="text-spotify-text text-sm mb-2">
                For testing, use card: <span className="text-white font-mono">4242 4242 4242 4242</span>
              </p>
              <button
                type="button"
                onClick={useTestCard}
                className="text-spotify-green hover:underline text-sm"
              >
                Fill with test card
              </button>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleChange}
                  required
                  maxLength={16}
                  pattern="\d{16}"
                  className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                  placeholder="1234567890123456"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Exp. Month
                  </label>
                  <input
                    type="text"
                    name="expiryMonth"
                    value={paymentData.expiryMonth}
                    onChange={handleChange}
                    required
                    maxLength={2}
                    pattern="\d{1,2}"
                    className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Exp. Year
                  </label>
                  <input
                    type="text"
                    name="expiryYear"
                    value={paymentData.expiryYear}
                    onChange={handleChange}
                    required
                    maxLength={4}
                    pattern="\d{4}"
                    className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                    placeholder="2030"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleChange}
                    required
                    maxLength={3}
                    pattern="\d{3}"
                    className="w-full px-4 py-3 bg-spotify-lightgray text-white rounded border border-gray-600 focus:outline-none focus:border-spotify-green"
                    placeholder="123"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-green-400 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay $${getTotalPrice().toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-spotify-gray p-6 rounded-lg sticky top-8">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-white">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-spotify-lightgray pt-4 space-y-2">
              <div className="flex justify-between text-white">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between text-white font-bold text-xl">
                <span>Total</span>
                <span className="text-spotify-green">${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;