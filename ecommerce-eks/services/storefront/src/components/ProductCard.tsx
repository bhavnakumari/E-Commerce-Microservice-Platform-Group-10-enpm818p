import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 200));

    addToCart(product, 1);
    setIsAdding(false);

    toast.success(
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-spotify-lightgray rounded flex items-center justify-center text-xl">
          📦
        </div>
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-spotify-text">Added to cart</p>
        </div>
      </div>,
      {
        duration: 2000,
      }
    );
  };

  return (
    <div className="group relative">
      <Link to={`/products/${product.id}`} className="block">
        <div className="bg-gradient-to-br from-spotify-gray to-spotify-lightgray p-6 rounded-3xl card-hover stagger-fade-in relative overflow-hidden border border-spotify-green/10 hover:border-spotify-green/30 transition-all duration-300">
          {/* Product Image */}
          <div className="aspect-square rounded-2xl mb-5 relative overflow-hidden bg-gradient-to-br from-spotify-lightgray to-spotify-gray shadow-xl">
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.querySelector('.fallback-icon')!.classList.remove('hidden');
                }}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center fallback-icon">
              <span className="text-7xl">📦</span>
            </div>
          )}

          {/* Fallback icon (hidden by default if image exists) */}
          {product.imageUrl && (
            <div className="hidden fallback-icon absolute inset-0 flex items-center justify-center bg-gradient-to-br from-spotify-lightgray to-spotify-gray">
              <span className="text-7xl">📦</span>
            </div>
          )}

          {/* Stock badge */}
          {product.stock > 0 && product.stock < 20 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
              Only {product.stock} left!
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Category badge */}
        {product.category && (
          <span className="inline-block bg-spotify-green/20 text-spotify-green text-xs px-3 py-1 rounded-full mb-3 font-semibold border border-spotify-green/30">
            {product.category}
          </span>
        )}

        {/* Product name */}
        <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-spotify-green transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-spotify-text text-sm mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <div>
            <p className="text-spotify-green font-black text-3xl mb-1">
              ${product.price.toFixed(2)}
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-spotify-green' : 'bg-red-500'} animate-pulse`} />
              <p className="text-spotify-text text-xs font-semibold">
                {product.stock > 0 ? `${product.stock} Available` : 'Out of stock'}
              </p>
            </div>
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-spotify-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
      </div>
      </Link>

      {/* Premium Add to Cart Button - Always visible, positioned at bottom */}
      {product.stock > 0 && (
        <div className="mt-4 relative z-10">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-spotify-green via-green-400 to-emerald-400 text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-spotify-green/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Button content */}
            <div className="relative flex items-center justify-center gap-3">
              {isAdding ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-base">Adding to cart...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 group-hover/btn:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="text-base">Add to Cart</span>
                  <svg className="w-5 h-5 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-spotify-green/0 via-white/20 to-spotify-green/0" />
          </button>
        </div>
      )}

      {/* Out of stock overlay button */}
      {product.stock === 0 && (
        <div className="mt-4">
          <button
            disabled
            className="w-full bg-spotify-lightgray text-spotify-text font-bold py-4 px-6 rounded-2xl cursor-not-allowed border-2 border-red-500/30"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Out of Stock</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
