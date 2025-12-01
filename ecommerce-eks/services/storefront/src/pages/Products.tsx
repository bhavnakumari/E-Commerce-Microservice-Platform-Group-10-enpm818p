import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { productsService } from '../services/productsApi';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  const location = useLocation();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsService.getAllProducts();
      setProducts(data);
      setFilteredProducts(data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((p) => p.category).filter(Boolean) as string[])
      );
      setCategories(uniqueCategories);
      setError('');
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch whenever we navigate to this route
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, location.pathname]);

  // Apply filters whenever search/category/products change
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative px-8 lg:px-16 py-20 overflow-hidden mesh-gradient">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-spotify-green/20 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 animate-fade-in">
            <span className="px-6 py-3 rounded-full text-sm font-bold glass-strong text-spotify-green border border-spotify-green/40">
              🛍️ Explore Our Collection
            </span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-black mb-6 animate-fade-in">
            <span className="text-white">Browse</span>{' '}
            <span className="gradient-text">All Products</span>
          </h1>

          <p
            className="text-xl lg:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            Discover over{' '}
            <span className="text-spotify-green font-bold">{products.length}+ premium products</span> across
            multiple categories
          </p>

          {/* Search Bar - Premium */}
          <div className="max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-spotify-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 glass-strong text-white rounded-2xl border-2 border-spotify-green/30 focus:outline-none focus:border-spotify-green text-lg placeholder-spotify-text shadow-premium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-4 flex items-center text-spotify-text hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-8 lg:px-16 py-16">
        <div className="max-w-[1600px] mx-auto">
          {/* Category Filter + Results Count */}
          <div className="mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 animate-fade-in">
            {/* Category Pills */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 ${
                  selectedCategory === 'all'
                    ? 'btn-gradient text-black shadow-glow'
                    : 'glass border border-spotify-green/30 text-white hover:border-spotify-green'
                }`}
              >
                All ({products.length})
              </button>
              {categories.map((category) => {
                const count = products.filter((p) => p.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'btn-gradient text-black shadow-glow'
                        : 'glass border border-spotify-green/30 text-white hover:border-spotify-green'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}

              {/* Optional: refresh button near filters */}
              <button
                onClick={fetchProducts}
                className="glass px-4 py-2 rounded-full border border-spotify-green/40 text-sm text-spotify-green hover:border-spotify-green hover:text-white transition-all"
              >
                ↻ Refresh
              </button>
            </div>

            {/* Results Count */}
            <div className="glass-strong px-6 py-3 rounded-full border border-spotify-green/30">
              <span className="text-spotify-text">Showing </span>
              <span className="text-spotify-green font-bold text-lg">{filteredProducts.length}</span>
              <span className="text-spotify-text">
                {' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {[...Array(20)].map((_, i) => (
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
              <p className="text-spotify-text mb-8">Please try refreshing the products</p>
              <button
                onClick={fetchProducts}
                className="btn-gradient text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-all"
              >
                Refresh Products
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-white mb-4">No products found</h3>
              <p className="text-spotify-text text-lg mb-8">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="btn-gradient text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    style={{ animationDelay: `${index * 20}ms` }}
                    className="animate-fade-in"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {filteredProducts.length > 20 && (
                <div className="mt-16 text-center animate-fade-in">
                  <p className="text-spotify-text text-lg mb-4">
                    Showing all {filteredProducts.length} products
                  </p>
                  <div className="inline-flex items-center gap-2 text-spotify-green">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">All products loaded</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;