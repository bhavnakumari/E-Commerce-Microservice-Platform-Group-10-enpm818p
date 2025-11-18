import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsService } from '../services/productsApi';
import { inventoryService } from '../services/inventoryApi';
import { Product, InventoryItem } from '../types';
import { useCart } from '../context/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;

      try {
        const productData = await productsService.getProduct(id);
        setProduct(productData);

        try {
          const inventoryData = await inventoryService.getInventory(id);
          setInventory(inventoryData);
        } catch (err) {
          console.warn('Failed to fetch inventory:', err);
        }
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white text-2xl font-bold">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="relative z-10 text-center animate-fade-in">
          <div className="text-8xl mb-6">😕</div>
          <h3 className="text-3xl font-bold text-white mb-4">Product Not Found</h3>
          <p className="text-red-400 text-xl mb-8">{error || 'This product does not exist'}</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-gradient text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const availableStock = inventory?.quantity ?? product.stock;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-spotify-green/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 px-8 lg:px-16 py-12 max-w-[1400px] mx-auto">
        <button
          onClick={() => navigate('/products')}
          className="glass-strong text-white hover:text-spotify-green mb-8 flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-spotify-green/30 hover:border-spotify-green transition-all hover:scale-105 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-gradient-to-br from-spotify-lightgray to-spotify-gray rounded-2xl aspect-square overflow-hidden relative group">
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-spotify-lightgray to-spotify-gray">
                <span className="text-9xl">📦</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-9xl">📦</span>
            </div>
          )}
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="flex flex-col glass-strong p-8 rounded-2xl border border-spotify-green/20">
          {product.category && (
            <span className="inline-block bg-spotify-green/20 text-spotify-green text-sm px-4 py-2 rounded-full mb-6 self-start font-bold border border-spotify-green/30">
              {product.category}
            </span>
          )}

          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 gradient-text leading-tight">{product.name}</h1>

          <div className="flex items-baseline gap-4 mb-8">
            <p className="text-spotify-green text-5xl font-black gradient-text">
              ${product.price.toFixed(2)}
            </p>
            {availableStock > 0 && availableStock < 20 && (
              <span className="text-red-400 text-sm font-semibold bg-red-500/20 px-3 py-1 rounded-full">
                Only {availableStock} left!
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-gray-300 text-lg mb-8 leading-relaxed bg-spotify-gray/30 p-4 rounded-xl">{product.description}</p>
          )}

          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-spotify-green" />
              <p className="text-white font-semibold">SKU: <span className="text-spotify-text font-normal">{product.sku}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-spotify-green" />
              <p className="text-white font-semibold">
                Stock: {' '}
                <span className={availableStock > 0 ? "text-spotify-green font-bold" : "text-red-400 font-bold"}>
                  {availableStock > 0
                    ? `${availableStock} units available`
                    : 'Out of stock'}
                </span>
              </p>
            </div>
          </div>

          {availableStock > 0 && (
            <div className="mb-8">
              <label className="text-white text-lg font-bold mb-4 block">
                Quantity
              </label>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-spotify-gray text-white w-14 h-14 rounded-full hover:bg-spotify-green hover:text-black font-bold text-2xl hover:scale-110 transition-all shadow-lg"
                >
                  −
                </button>
                <span className="text-white text-3xl font-black w-16 text-center bg-spotify-gray/30 px-4 py-2 rounded-xl">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(availableStock, quantity + 1))
                  }
                  className="bg-spotify-gray text-white w-14 h-14 rounded-full hover:bg-spotify-green hover:text-black font-bold text-2xl hover:scale-110 transition-all shadow-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={availableStock === 0}
            className="btn-gradient text-black font-bold py-6 px-12 rounded-full hover:scale-105 active:scale-95 transition-all text-xl shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full flex items-center justify-center gap-3 group"
          >
            {availableStock > 0 ? (
              <>
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            ) : (
              'Out of Stock'
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductDetail;