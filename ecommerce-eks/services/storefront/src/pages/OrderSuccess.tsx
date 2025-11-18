import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersService } from '../services/ordersApi';
import { Order } from '../types';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const orderData = await ordersService.getOrder(parseInt(orderId));
        setOrder(orderData);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <div className="text-white text-xl">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center p-8">
      <div className="bg-spotify-gray p-8 rounded-lg max-w-2xl w-full text-center">
        <div className="text-8xl mb-6">✅</div>
        <h1 className="text-4xl font-bold text-white mb-4">Order Confirmed!</h1>
        <p className="text-spotify-text text-lg mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {order && (
          <div className="bg-spotify-lightgray p-6 rounded-lg mb-8 text-left">
            <h2 className="text-2xl font-bold text-white mb-4">Order Details</h2>
            <div className="space-y-2 text-white">
              <p>
                <span className="text-spotify-text">Order ID:</span> #{order.id}
              </p>
              <p>
                <span className="text-spotify-text">Status:</span> {order.status}
              </p>
              <p>
                <span className="text-spotify-text">Items:</span> {order.items.length}
              </p>
            </div>

            {order.shippingAddress && (
              <div className="mt-4 pt-4 border-t border-spotify-gray">
                <h3 className="text-white font-semibold mb-2">Shipping Address</h3>
                <div className="text-spotify-text text-sm">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link
            to="/orders"
            className="bg-spotify-green text-black font-bold px-8 py-3 rounded-full hover:bg-green-400 transition"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="bg-spotify-lightgray text-white font-bold px-8 py-3 rounded-full hover:bg-spotify-gray transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;