import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-spotify-black flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <span className="text-8xl mb-6 block">🛒</span>
          <h1 className="text-4xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-spotify-text mb-8">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link
            to="/products"
            className="inline-block bg-spotify-green text-black font-bold px-8 py-3 rounded-full hover:bg-green-400 transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-black p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-spotify-gray p-6 rounded-lg flex gap-6"
            >
              <div className="bg-spotify-lightgray w-24 h-24 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-4xl">📦</span>
              </div>

              <div className="flex-1">
                <Link
                  to={`/products/${item.product.id}`}
                  className="text-white font-bold text-lg hover:text-spotify-green"
                >
                  {item.product.name}
                </Link>

                {item.product.description && (
                  <p className="text-spotify-text text-sm mt-1 line-clamp-2">
                    {item.product.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="bg-spotify-lightgray text-white w-8 h-8 rounded-full hover:bg-spotify-black"
                  >
                    -
                  </button>
                  <span className="text-white font-bold">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="bg-spotify-lightgray text-white w-8 h-8 rounded-full hover:bg-spotify-black"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="ml-auto text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-spotify-green font-bold text-xl">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-spotify-text text-sm mt-1">
                  ${item.product.price.toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-spotify-gray p-6 rounded-lg sticky top-8">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-white">
                <span>Items ({getTotalItems()})</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="border-t border-spotify-lightgray pt-3 flex justify-between text-white font-bold text-xl">
                <span>Total</span>
                <span className="text-spotify-green">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-green-400 transition"
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>

            <Link
              to="/products"
              className="block text-center text-spotify-text hover:text-white mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;