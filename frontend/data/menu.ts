export interface MenuItem {
  id: number;
  name: string;
  isVeg: boolean;
  category: string;
  cuisine: 'Chinese' | 'Indian' | 'Tandoor' | 'Biryani' | 'Sweets' | 'French Fries';
  description: string;
  image: string;
  spiceLevel: 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy';
  rating: number;
  prepTime: string;
  portionType: 'four-sizes' | 'half-full' | 'single-full' | 'standard';
  price?: number;
  halfPrice?: number;
  fullPrice?: number;
  singlePrice?: number;
  familyPrice?: number;
  jumboPrice?: number;
  isBestSeller?: boolean;
  isChefSpecial?: boolean;
}

import items from './menu.json';

export const menuItems = items as MenuItem[];
