import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Clock } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: string;
  image?: string;
  description?: string;
  score?: number;
}

interface HomePageProps {
  userProfile?: any; // The JSON payload from questionnaire
  recommendedProducts?: Product[];
}

const HomePage: React.FC<HomePageProps> = ({ userProfile, recommendedProducts = [] }) => {
  const [products, setProducts] = useState<Product[]>(recommendedProducts);
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder data for now - will be replaced with actual recommendations
  const placeholderProducts: Product[] = [
    {
      id: '1',
      name: 'Herman Miller Aeron Chair',
      brand: 'Herman Miller',
      price: '$1,445.00',
      description: 'Ergonomic office chair with PostureFit support',
      score: 0.95
    },
    {
      id: '2',
      name: 'LG 27" UltraGear Gaming Monitor',
      brand: 'LG',
      price: '$399.99',
      description: '240Hz refresh rate, 1ms response time',
      score: 0.92
    },
    {
      id: '3',
      name: 'Keychron Q1 Pro Mechanical Keyboard',
      brand: 'Keychron',
      price: '$189.00',
      description: 'Wireless mechanical keyboard with hot-swappable switches',
      score: 0.89
    },
    {
      id: '4',
      name: 'Logitech MX Master 3S',
      brand: 'Logitech',
      price: '$99.99',
      description: 'Wireless ergonomic mouse for productivity',
      score: 0.87
    },
  ];

  useEffect(() => {
    // Use provided products or fallback to placeholders
    if (recommendedProducts.length === 0) {
      setProducts(placeholderProducts);
    }
  }, [recommendedProducts]);

  const categories = [
    { id: 'for-you', label: 'For You', icon: <Sparkles size={16} /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
    { id: 'saved', label: 'Saved', icon: <Heart size={16} /> },
    { id: 'recent', label: 'Recent', icon: <Clock size={16} /> },
  ];

  const [activeCategory, setActiveCategory] = useState('for-you');

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-teal to-coral bg-clip-text text-transparent">
          Welcome Back{userProfile?.fullName ? `, ${userProfile.fullName}` : ''}
        </h1>
        <p className="text-gray-400 text-sm">
          Personalized recommendations based on your profile
        </p>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-teal/10 text-teal border border-teal/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center py-24">
          <div className="w-16 h-16 border-t-2 border-teal rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-400">Loading recommendations...</p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group glass rounded-2xl p-4 border border-white/10 hover:border-teal/30 transition-all cursor-pointer"
            >
              {/* Product Image Placeholder */}
              <div className="w-full aspect-square bg-white/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-6xl opacity-20">📦</div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                {product.brand && (
                  <p className="text-[10px] uppercase tracking-wider text-teal font-semibold">
                    {product.brand}
                  </p>
                )}
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-teal transition-colors">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-lg font-bold text-white">{product.price}</p>
                  {product.score && (
                    <div className="flex items-center gap-1 text-xs text-teal">
                      <Sparkles size={12} />
                      <span>{Math.round(product.score * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-24">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No recommendations yet</p>
          <p className="text-sm text-gray-500">Complete your profile to get personalized suggestions</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
