const prisma = require('./connection');

async function seedDatabase() {
  try {
    // Clear existing data (in correct order due to foreign keys)
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.restaurant.deleteMany();
    console.log('✓ Existing data cleared');
    
    // Insert restaurants
    const restaurants = [
      { name: 'Hyderabadi Spice House', city: 'Hyderabad' },
      { name: 'Delhi Darbar', city: 'Delhi' },
      { name: 'Mumbai Masala', city: 'Mumbai' },
      { name: 'Bengaluru Biryani', city: 'Bengaluru' },
      { name: 'Chennai Curry House', city: 'Chennai' },
      { name: 'Pune Palace', city: 'Pune' },
      { name: 'Kolkata Kitchen', city: 'Kolkata' },
      { name: 'Ahmedabad Aroma', city: 'Ahmedabad' },
      { name: 'Jaipur Junction', city: 'Jaipur' },
      { name: 'Lucknow Legacy', city: 'Lucknow' },
      { name: 'Goa Grill', city: 'Goa' },
      { name: 'Kerala Kitchen', city: 'Kochi' }
    ];
    
    const createdRestaurants = await Promise.all(
      restaurants.map(restaurant => 
        prisma.restaurant.create({ data: restaurant })
      )
    );
    console.log(`✓ Inserted ${createdRestaurants.length} restaurants`);
    
    // Insert menu items (multiple dishes per restaurant)
    const menuItems = [
      // Hyderabadi Spice House
      { restaurantId: createdRestaurants[0].id, name: 'Chicken Biryani', price: 220 },
      { restaurantId: createdRestaurants[0].id, name: 'Mutton Biryani', price: 280 },
      { restaurantId: createdRestaurants[0].id, name: 'Veg Biryani', price: 180 },
      { restaurantId: createdRestaurants[0].id, name: 'Butter Chicken', price: 250 },
      
      // Delhi Darbar
      { restaurantId: createdRestaurants[1].id, name: 'Chicken Biryani', price: 200 },
      { restaurantId: createdRestaurants[1].id, name: 'Paneer Biryani', price: 190 },
      { restaurantId: createdRestaurants[1].id, name: 'Dal Makhani', price: 150 },
      
      // Mumbai Masala
      { restaurantId: createdRestaurants[2].id, name: 'Chicken Biryani', price: 240 },
      { restaurantId: createdRestaurants[2].id, name: 'Prawn Biryani', price: 300 },
      { restaurantId: createdRestaurants[2].id, name: 'Fish Curry', price: 220 },
      
      // Bengaluru Biryani
      { restaurantId: createdRestaurants[3].id, name: 'Chicken Biryani', price: 210 },
      { restaurantId: createdRestaurants[3].id, name: 'Egg Biryani', price: 170 },
      { restaurantId: createdRestaurants[3].id, name: 'Chicken Biryani', price: 230 }, // Different price variant
      
      // Chennai Curry House
      { restaurantId: createdRestaurants[4].id, name: 'Chicken Biryani', price: 195 },
      { restaurantId: createdRestaurants[4].id, name: 'Dosa', price: 80 },
      
      // Pune Palace
      { restaurantId: createdRestaurants[5].id, name: 'Chicken Biryani', price: 225 },
      { restaurantId: createdRestaurants[5].id, name: 'Chicken Biryani', price: 250 }, // Premium variant
      
      // Kolkata Kitchen
      { restaurantId: createdRestaurants[6].id, name: 'Chicken Biryani', price: 205 },
      { restaurantId: createdRestaurants[6].id, name: 'Fish Biryani', price: 260 },
      
      // Ahmedabad Aroma
      { restaurantId: createdRestaurants[7].id, name: 'Chicken Biryani', price: 190 },
      { restaurantId: createdRestaurants[7].id, name: 'Gujarati Thali', price: 200 },
      
      // Jaipur Junction
      { restaurantId: createdRestaurants[8].id, name: 'Chicken Biryani', price: 215 },
      { restaurantId: createdRestaurants[8].id, name: 'Rajasthani Thali', price: 180 },
      
      // Lucknow Legacy
      { restaurantId: createdRestaurants[9].id, name: 'Chicken Biryani', price: 245 },
      { restaurantId: createdRestaurants[9].id, name: 'Awadhi Biryani', price: 280 },
      
      // Goa Grill
      { restaurantId: createdRestaurants[10].id, name: 'Chicken Biryani', price: 235 },
      { restaurantId: createdRestaurants[10].id, name: 'Goan Fish Curry', price: 240 },
      
      // Kerala Kitchen
      { restaurantId: createdRestaurants[11].id, name: 'Chicken Biryani', price: 200 },
      { restaurantId: createdRestaurants[11].id, name: 'Kerala Parotta', price: 120 }
    ];
    
    const createdMenuItems = await Promise.all(
      menuItems.map(item => 
        prisma.menuItem.create({ 
          data: {
            restaurantId: item.restaurantId,
            name: item.name,
            price: item.price
          }
        })
      )
    );
    console.log(`✓ Inserted ${createdMenuItems.length} menu items`);
    
    // Insert orders (simulate order history)
    const orders = [];
    
    // Generate orders for Chicken Biryani with different frequencies per restaurant
    const biryaniItems = createdMenuItems.filter(item => item.name.toLowerCase().includes('biryani'));
    
    // Assign order counts to create realistic top 10 results
    const orderCounts = [
      { restaurantId: createdRestaurants[0].id, count: 96 },  // Hyderabadi Spice House - highest
      { restaurantId: createdRestaurants[2].id, count: 85 },  // Mumbai Masala
      { restaurantId: createdRestaurants[3].id, count: 78 },  // Bengaluru Biryani
      { restaurantId: createdRestaurants[5].id, count: 72 },  // Pune Palace
      { restaurantId: createdRestaurants[9].id, count: 68 },  // Lucknow Legacy
      { restaurantId: createdRestaurants[1].id, count: 65 },  // Delhi Darbar
      { restaurantId: createdRestaurants[6].id, count: 58 },  // Kolkata Kitchen
      { restaurantId: createdRestaurants[10].id, count: 52 }, // Goa Grill
      { restaurantId: createdRestaurants[8].id, count: 48 },  // Jaipur Junction
      { restaurantId: createdRestaurants[11].id, count: 45 }, // Kerala Kitchen
      { restaurantId: createdRestaurants[4].id, count: 38 },  // Chennai Curry House
      { restaurantId: createdRestaurants[7].id, count: 32 }   // Ahmedabad Aroma
    ];
    
    for (const orderData of orderCounts) {
      const items = biryaniItems.filter(item => item.restaurantId === orderData.restaurantId);
      if (items.length > 0) {
        for (let i = 0; i < orderData.count; i++) {
          const item = items[Math.floor(Math.random() * items.length)];
          orders.push({
            restaurantId: orderData.restaurantId,
            menuItemId: item.id
          });
        }
      }
    }
    
    // Add some orders for other dishes too
    const otherItems = createdMenuItems.filter(item => !item.name.toLowerCase().includes('biryani'));
    for (let i = 0; i < 50; i++) {
      const item = otherItems[Math.floor(Math.random() * otherItems.length)];
      orders.push({
        restaurantId: item.restaurantId,
        menuItemId: item.id
      });
    }
    
    // Insert orders in batches using Prisma's createMany
    const batchSize = 100;
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      await prisma.order.createMany({
        data: batch
      });
    }
    
    console.log(`✓ Inserted ${orders.length} orders`);
    console.log('\n✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
