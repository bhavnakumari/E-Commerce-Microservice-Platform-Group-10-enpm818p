import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsService } from '../services/productsApi';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.getAllProducts();
        setProducts(data.slice(0, 12)); // Show 12 products on home page
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section - Full Width */}
      <section className="relative px-8 lg:px-16 py-32 overflow-hidden mesh-gradient">
        {/* Multi-layer animated gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-spotify-green/20 via-transparent to-purple-500/10 opacity-40" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-spotify-green/30 to-transparent rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-spotify-green/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(29,185,84,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(29,185,84,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

        {/* Content - Centered */}
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block mb-8 animate-fade-in">
            <span className="px-6 py-3 rounded-full text-sm font-bold glass-strong text-spotify-green border border-spotify-green/40 shadow-glow">
              ⚡ Over 100+ Premium Products Available
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-7xl lg:text-9xl font-black mb-8 leading-[1.05] animate-fade-in">
            <span className="text-white block mb-4">Experience</span>
            <span className="gradient-text glow-text">Pulse Store</span>
          </h1>

          {/* Subheading */}
          <p className="text-2xl lg:text-3xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto font-light animate-fade-in" style={{ animationDelay: '100ms' }}>
            Discover <span className="text-white font-semibold">premium electronics</span> and <span className="text-white font-semibold">accessories</span>
            <br />
            with <span className="text-spotify-green font-bold">lightning-fast</span> delivery and <span className="text-spotify-green font-bold">unbeatable</span> prices
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-6 justify-center flex-wrap mb-20 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 btn-gradient text-black font-bold px-12 py-6 rounded-full text-xl shadow-glow hover:scale-105 active:scale-95 transition-all group"
            >
              <span>Explore All Products</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 glass-strong text-white font-bold px-12 py-6 rounded-full hover:scale-105 transition-all border-2 border-spotify-green/50 hover:border-spotify-green text-xl neon-border shadow-premium"
            >
              <span>Join Free</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Stats - Premium Cards */}
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
            {[
              { label: 'Premium Products', value: '100+', icon: '🎁' },
              { label: 'Happy Customers', value: '10K+', icon: '⭐' },
              { label: 'Customer Rating', value: '4.9/5', icon: '💎' },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-strong p-8 rounded-2xl hover:scale-105 transition-all card-hover border border-spotify-green/20"
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <p className="text-4xl lg:text-5xl font-black gradient-text mb-2">{stat.value}</p>
                <p className="text-spotify-text text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-40 right-40 w-32 h-32 bg-gradient-to-br from-spotify-green to-emerald-400 rounded-3xl blur-2xl opacity-30 animate-float" />
        <div className="absolute bottom-40 left-40 w-24 h-24 bg-gradient-to-br from-spotify-green to-green-600 rounded-full blur-xl opacity-40 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-spotify-green rounded-2xl blur-xl opacity-20 animate-float" style={{ animationDelay: '3s' }} />
      </section>

      {/* Featured Products Section - Full Width Grid */}
      <section className="px-8 lg:px-16 py-24 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-spotify-green/5 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-[1600px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold glass-strong text-spotify-green border border-spotify-green/30 mb-6">
              ✨ Handpicked For You
            </span>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">
              Featured <span className="gradient-text">Products</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Explore our curated collection of premium electronics and accessories
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-spotify-green hover:text-green-400 font-bold text-lg group"
            >
              <span>View All 100+ Products</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-spotify-gray p-6 rounded-2xl animate-pulse">
                  <div className="skeleton aspect-square rounded-xl mb-4" />
                  <div className="skeleton h-6 w-3/4 rounded mb-3" />
                  <div className="skeleton h-4 w-full rounded mb-2" />
                  <div className="skeleton h-4 w-2/3 rounded mb-4" />
                  <div className="skeleton h-10 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-8xl mb-6">😕</div>
              <h3 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong</h3>
              <p className="text-red-400 text-xl mb-2">{error}</p>
              <p className="text-spotify-text mb-8">Please try refreshing the page</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-gradient text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-all"
              >
                Refresh Page
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-9xl mb-8">🛍️</div>
              <h3 className="text-3xl font-bold text-white mb-4">No Products Available Yet</h3>
              <p className="text-spotify-text text-lg mb-8">Check back soon for amazing deals!</p>
              <Link
                to="/products"
                className="inline-block btn-gradient text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-all"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="animate-fade-in"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Full Width */}
      <section className="px-8 lg:px-16 py-24 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-spotify-dark/50 via-transparent to-spotify-dark/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,185,84,0.15),transparent_70%)]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              Why Choose <span className="gradient-text">Pulse Store?</span>
            </h2>
            <p className="text-xl text-gray-400">Premium shopping experience with unmatched benefits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚚',
                title: 'Lightning Fast Delivery',
                description: 'Free shipping on all orders over $50 with express delivery options',
                gradient: 'from-spotify-green/20 to-emerald-500/20',
              },
              {
                icon: '🔒',
                title: 'Secure Payments',
                description: 'Bank-grade encryption ensures your data is always protected',
                gradient: 'from-blue-500/20 to-spotify-green/20',
              },
              {
                icon: '💯',
                title: '100% Quality Guaranteed',
                description: 'Premium products with satisfaction guarantee or money back',
                gradient: 'from-purple-500/20 to-spotify-green/20',
              },
            ].map((feature, index) => (
              <div
                key={index}
                style={{ animationDelay: `${index * 150}ms` }}
                className="group relative glass-strong p-10 rounded-3xl card-hover animate-fade-in border border-spotify-green/20 overflow-hidden"
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-spotify-green transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-[shine_1s_ease-in-out]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 lg:px-16 py-32 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,185,84,0.2),transparent_70%)]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="text-6xl lg:text-7xl font-black text-white mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of happy customers and experience the <span className="text-spotify-green font-bold">Pulse Store</span> difference
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link
              to="/products"
              className="btn-gradient text-black font-bold px-12 py-6 rounded-full hover:scale-105 active:scale-95 transition-all text-xl shadow-glow"
            >
              Browse All Products
            </Link>
            <Link
              to="/register"
              className="glass-strong text-white font-bold px-12 py-6 rounded-full hover:scale-105 transition-all border-2 border-spotify-green/50 hover:border-spotify-green text-xl"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

// Add shine animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shine {
    from { left: -100%; }
    to { left: 200%; }
  }
`;
document.head.appendChild(style);
