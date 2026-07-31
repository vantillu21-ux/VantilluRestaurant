import { PrismaClient, UserRole, PortionType, SpiceLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting VANTILLU Supabase Database Seeding...');

  // 1. Seed Roles
  const roles = ['OWNER', 'MANAGER', 'KITCHEN', 'CASHIER', 'DELIVERY', 'CUSTOMER'];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: { name: r, description: `${r} role permissions` },
    });
  }

  // 2. Seed Default Owner Account
  const hashedPassword = await bcrypt.hash('vantillu123', 10);
  const ownerUser = await prisma.user.upsert({
    where: { email: 'admin@vantillu.com' },
    update: {},
    create: {
      email: 'admin@vantillu.com',
      phone: '9876543210',
      password: hashedPassword,
      fullName: 'Vantillu Restaurant Owner',
      role: UserRole.OWNER,
      isVerified: true,
    },
  });

  console.log('👤 Owner user created:', ownerUser.email);

  // 3. Seed Default Restaurant Settings
  await prisma.restaurantSetting.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      restaurantName: 'VANTILLU Multi Cuisine Family Restaurant',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'contact@vantillu.com',
      address: 'BN Reddy Nagar, Hyderabad, Telangana 500070',
      gstNumber: '36AAAAA0000A1Z5',
      openingHours: '11:00 AM - 11:00 PM',
      packingCharge: 25.0,
      deliveryCharge: 40.0,
      gstPercent: 5.0,
    },
  });

  // 4. Seed Categories
  const categoriesList = [
    { name: 'Biryani', displayOrder: 1 },
    { name: 'Chicken Starters', displayOrder: 2 },
    { name: 'Tandoori Bhatti Starters', displayOrder: 3 },
    { name: 'Seafood Starters', displayOrder: 4 },
    { name: 'Veg Starters', displayOrder: 5 },
    { name: 'Non-Veg Curries', displayOrder: 6 },
    { name: 'Egg Specials', displayOrder: 7 },
    { name: 'Veg Curries', displayOrder: 8 },
    { name: 'Roti', displayOrder: 9 },
    { name: 'Fried Rice', displayOrder: 10 },
    { name: 'Noodles', displayOrder: 11 },
    { name: 'Soup', displayOrder: 12 },
    { name: 'Sweets', displayOrder: 13 },
    { name: 'French Fries', displayOrder: 14 },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesList) {
    const createdCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: { displayOrder: cat.displayOrder },
      create: { name: cat.name, displayOrder: cat.displayOrder },
    });
    categoryMap[cat.name] = createdCat.id;
  }

  console.log('📁 Categories seeded successfully.');

  // 5. Seed Core Signature Dishes
  const sampleDishes = [
    {
      name: 'Chicken Dum Biryani',
      category: 'Biryani',
      cuisine: 'Biryani',
      description: 'Classic Hyderabadi dum biryani, slow-cooked in copper vessels with fresh spices and basmati.',
      portionType: PortionType.FOUR_SIZES,
      singlePrice: 180,
      fullPrice: 320,
      familyPrice: 600,
      jumboPrice: 920,
      isBestSeller: true,
      isVeg: false,
    },
    {
      name: 'Paneer Butter Masala',
      category: 'Veg Curries',
      cuisine: 'Indian',
      description: 'Cubes of soft paneer cooked in a rich, velvety tomato and cashew butter gravy.',
      portionType: PortionType.HALF_FULL,
      halfPrice: 210,
      fullPrice: 400,
      isBestSeller: true,
      isVeg: true,
    },
    {
      name: 'Chicken 65',
      category: 'Chicken Starters',
      cuisine: 'Indian',
      description: 'Fiery red deep-fried chicken cubes tempered with yogurt curd, green chilies, and curry leaves.',
      portionType: PortionType.HALF_FULL,
      halfPrice: 180,
      fullPrice: 330,
      isBestSeller: true,
      isVeg: false,
    },
    {
      name: 'Tandoori Chicken',
      category: 'Tandoori Bhatti Starters',
      cuisine: 'Tandoor',
      description: 'Full chicken marinated overnight in garam masala and red village chili curd, roasted in clay oven.',
      portionType: PortionType.HALF_FULL,
      halfPrice: 220,
      fullPrice: 420,
      isBestSeller: true,
      isVeg: false,
    },
    {
      name: 'Kaddu Ka Kheer',
      category: 'Sweets',
      cuisine: 'Sweets',
      description: 'Traditional Hyderabadi sweet dessert made with grated bottle gourd, milk, saffron, and dry fruits.',
      portionType: PortionType.STANDARD,
      price: 50,
      isVeg: true,
    },
    {
      name: 'French Fries Peri Peri',
      category: 'French Fries',
      cuisine: 'French Fries',
      description: 'Spicy french fries coated in peri-peri African red chili seasoning.',
      portionType: PortionType.STANDARD,
      price: 110,
      isVeg: true,
    }
  ];

  for (const dish of sampleDishes) {
    const catId = categoryMap[dish.category];
    if (catId) {
      await prisma.menuItem.create({
        data: {
          categoryId: catId,
          name: dish.name,
          cuisine: dish.cuisine,
          description: dish.description,
          portionType: dish.portionType,
          price: dish.price || 0,
          halfPrice: dish.halfPrice,
          fullPrice: dish.fullPrice,
          singlePrice: dish.singlePrice,
          familyPrice: dish.familyPrice,
          jumboPrice: dish.jumboPrice,
          isBestSeller: dish.isBestSeller || false,
          isVeg: dish.isVeg,
        },
      });
    }
  }

  console.log('🍲 Dishes seeded successfully.');
  console.log('✅ Supabase database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
