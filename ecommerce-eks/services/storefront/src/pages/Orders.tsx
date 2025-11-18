import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/ordersApi';
import { Order } from '../types';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const ordersData = await ordersService.getUserOrders(user.id);
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-black p-8">
      <h1 className="text-4xl font-bold text-white mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-8xl mb-6 block">📦</span>
          <h2 className="text-2xl font-bold text-white mb-4">No orders yet</h2>
          <p className="text-spotify-text mb-8">
            Start shopping to see your orders here
          </p>
          <Link
            to="/products"
            className="inline-block bg-spotify-green text-black font-bold px-8 py-3 rounded-full hover:bg-green-400 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-spotify-gray p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-bold text-xl">Order #{order.id}</h3>
                  <p className="text-spotify-text text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    order.status === 'CONFIRMED'
                      ? 'bg-spotify-green text-black'
                      : 'bg-spotify-lightgray text-white'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-white">
                  <span className="text-spotify-text">Items:</span> {order.items.length}
                </p>
                {order.shippingAddress && (
                  <p className="text-white">
                    <span className="text-spotify-text">Shipping to:</span>{' '}
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                )}
              </div>

              <Link
                to={`/order-success/${order.id}`}
                className="text-spotify-green hover:underline"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;