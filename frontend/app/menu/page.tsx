'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Star, ChefHat } from 'lucide-react';
import { menuItems, MenuItem } from '../../data/menu';
import { FoodCard } from '../../components/FoodCard';
import { API_URL } from '../../lib/api';

export default function MenuPage() {
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilter, setMenuFilter] = useState('All');
  const [menuSort, setMenuSort] = useState('Popularity');
  const [liveMenuItems, setLiveMenuItems] = useState<MenuItem[]>(menuItems);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  // Fetch live menu from API on mount so admin updates reflect immediately
  useEffect(() => {
    setMenuLoading(true);
    fetch(`${API_URL}/api/menu`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data: MenuItem[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLiveMenuItems(data);
        }
      })
      .catch((err) => {
        console.warn('Menu fetch failed, using cached catalog:', err);
        setMenuError('Live menu unavailable. Showing cached catalog.');
      })
      .finally(() => setMenuLoading(false));
  }, []);


  // The actual cuisines and signature groupings
  const categories = [
    'All',
    'Biryani',
    'Chinese',
    'Indian',
    'Tandoor',
    'Sweets',
    'French Fries'
  ];

  // Helper to map item category to cuisine tabs
  const matchesCuisineFilter = (item: MenuItem, filter: string) => {
    if (filter === 'All') return true;
    return item.cuisine === filter;
  };

  // Search & Filter & Sort algorithm — runs against live API data (seeded with static cache)
  const filteredMenu = liveMenuItems
    .filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
        item.description.toLowerCase().includes(menuSearch.toLowerCase());
      
      const matchesFilter = matchesCuisineFilter(item, menuFilter);

      // Quick filter buttons for Veg/Non-Veg
      const isVegTab = menuFilter === 'Veg';
      const isNonVegTab = menuFilter === 'Non-Veg';
      const matchesVegFilter = 
        (!isVegTab && !isNonVegTab) ||
        (isVegTab && item.isVeg) ||
        (isNonVegTab && !item.isVeg);

      return matchesSearch && matchesFilter && matchesVegFilter;
    })
    .sort((a, b) => {
      if (menuSort === 'Price: Low to High') {
        const priceA = a.price || a.halfPrice || a.singlePrice || 0;
        const priceB = b.price || b.halfPrice || b.singlePrice || 0;
        return priceA - priceB;
      }
      if (menuSort === 'Price: High to Low') {
        const priceA = a.price || a.halfPrice || a.singlePrice || 0;
        const priceB = b.price || b.halfPrice || b.singlePrice || 0;
        return priceB - priceA;
      }
      if (menuSort === 'Rating') {
        return b.rating - a.rating;
      }
      // Popularity (Best Seller & Chef Special priority)
      const scoreA = (a.isBestSeller ? 2 : 0) + (a.isChefSpecial ? 1 : 0);
      const scoreB = (b.isBestSeller ? 2 : 0) + (b.isChefSpecial ? 1 : 0);
      return scoreB - scoreA;
    });

  // Customer-attractive ordering index for sub-categories
  const categoryOrder: Record<string, number> = {
    'Biryani': 1,
    'Chicken Starters': 2,
    'Tandoori Bhatti Starters': 3,
    'Seafood Starters': 4,
    'Veg Starters': 5,
    'Non-Veg Curries': 6,
    'Egg Specials': 7,
    'Veg Curries': 8,
    'Roti': 9,
    'Fried Rice': 10,
    'Noodles': 11,
    'Soup': 12,
    'Desserts': 13,
    'Sweets': 14,
    'French Fries': 15
  };

  // Group items by subcategory for clean structured presentation
  const categoriesInFilter = Array.from(new Set(filteredMenu.map(item => item.category)))
    .sort((a, b) => (categoryOrder[a] || 99) - (categoryOrder[b] || 99));

  return (
    <div className="min-h-screen bg-[#0c0607] pb-24 text-white relative">
      {/* Background Lighting */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#153B72]/10 to-transparent blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <div className="pt-28 pb-8 px-6 text-center space-y-4">
        <span className="text-brand-gold text-xs uppercase tracking-[0.3em] font-semibold flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="fill-brand-gold" />
          VANTILLU Multi Cuisine Family Restaurant
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide">
          Vantillu Menu Catalog
        </h1>
        <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
        <p className="text-white/60 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
          Order our delicious dishes cooked in woodfire, clay ovens, and prepared with pure love.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Loading indicator */}
        {menuLoading && (
          <div className="flex items-center justify-center gap-3 py-4 text-white/40 text-xs">
            <div className="w-4 h-4 border-2 border-brand-gold/40 border-t-brand-gold rounded-full animate-spin" />
            Refreshing menu...
          </div>
        )}
        {/* API error banner (non-blocking — static cache is still showing) */}
        {menuError && !menuLoading && (
          <div className="text-center text-xs text-amber-400/70 bg-amber-400/5 border border-amber-400/20 rounded-xl py-2 px-4">
            ⚠ {menuError}
          </div>
        )}
        
        {/* Category Horizontal Scrolling Navigation */}
        <div className="flex border-b border-white/5 pb-2 overflow-x-auto scrollbar-none justify-start md:justify-center">
          <div className="flex gap-2.5 pb-2 whitespace-nowrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setMenuFilter(cat)}
                className={`
                  py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap border
                  ${menuFilter === cat 
                    ? 'bg-brand-gold text-brand-brown border-brand-gold font-bold shadow-md' 
                    : 'bg-brand-brown/25 text-white/60 border-white/5 hover:border-brand-gold/40 hover:text-brand-gold'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search, Filter, Sort Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#2E1A1C]/35 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
          {/* Live Search */}
          <div className="flex gap-2.5 bg-black/35 border border-white/10 px-4 py-2.5 rounded-xl w-full md:max-w-xs items-center focus-within:border-brand-gold transition-colors">
            <Compass size={16} className="text-white/40" />
            <input
              type="text"
              placeholder="Search dishes... (e.g. Biryani)"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="bg-transparent border-none text-xs outline-none w-full text-white"
            />
          </div>

          {/* Quick Veg/Non-Veg Filters */}
          <div className="flex gap-2 w-full md:w-auto justify-start md:justify-center">
            {['All', 'Veg', 'Non-Veg'].includes(menuFilter) && (
              <div className="flex bg-black/40 border border-white/10 p-0.5 rounded-xl">
                {['All', 'Veg', 'Non-Veg'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMenuFilter(mode)}
                    className={`py-1.5 px-4 text-[10px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-all ${
                      menuFilter === mode ? 'bg-brand-gold text-brand-brown' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Sort:</span>
            <select
              value={menuSort}
              onChange={(e) => setMenuSort(e.target.value)}
              className="bg-[#2E1A1C] border border-white/10 text-xs px-3 py-2 rounded-xl text-brand-gold cursor-pointer outline-none focus:border-brand-gold"
            >
              <option value="Popularity">Popularity</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Rating">Rating Score</option>
            </select>
          </div>
        </div>

        {/* Structured Menu Catalog */}
        <div className="space-y-12">
          {categoriesInFilter.map((catName) => {
            const itemsInCat = filteredMenu.filter((i) => i.category === catName);
            if (itemsInCat.length === 0) return null;
            
            // Format labels for user attraction
            let displayHeader = catName;
            if (['Veg Starters', 'Chicken Starters', 'Seafood Starters'].includes(catName)) {
              displayHeader = `${catName} (Chinese & Indian)`;
            } else if (catName === 'Tandoori Bhatti Starters') {
              displayHeader = 'Kebabs & Tandoori Starters (Tandoor)';
            } else if (catName === 'Roti') {
              displayHeader = 'Fresh Clay Oven Breads (Roti)';
            } else if (catName === 'Veg Curries' || catName === 'Non-Veg Curries' || catName === 'Egg Specials') {
              displayHeader = `${catName} (Traditional Indian Gravies)`;
            }

            return (
              <div key={catName} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                  <div className="w-1.5 h-6 bg-brand-gold rounded-full" />
                  <h2 className="font-serif text-lg md:text-xl font-bold tracking-wider text-brand-gold uppercase">
                    {displayHeader}
                  </h2>
                  <span className="text-[10px] text-white/40 font-mono">({itemsInCat.length} items)</span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {itemsInCat.map((item) => (
                    <FoodCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      image={item.image}
                      isVeg={item.isVeg}
                      spiceLevel={item.spiceLevel}
                      rating={item.rating}
                      prepTime={item.prepTime}
                      portionType={item.portionType}
                      price={item.price}
                      halfPrice={item.halfPrice}
                      fullPrice={item.fullPrice}
                      singlePrice={item.singlePrice}
                      familyPrice={item.familyPrice}
                      jumboPrice={item.jumboPrice}
                      isBestSeller={item.isBestSeller}
                      isChefSpecial={item.isChefSpecial}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filteredMenu.length === 0 && (
            <div className="py-20 text-center text-white/40 italic">
              🍲 No traditional dishes match your active search filters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
