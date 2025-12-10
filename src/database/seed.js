const pool = require('./connection');

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Execute schema in logical groups to avoid parsing issues with dollar-quoted strings
    
    // 1. Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
      );
    `);
    
    // 2. Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_menu_items_price ON menu_items(price);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_menu_item_id ON orders(menu_item_id);');
    
    // 3. Create function for updated_at trigger
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // 4. Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
      CREATE TRIGGER update_restaurants_updated_at
          BEFORE UPDATE ON restaurants
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
      CREATE TRIGGER update_menu_items_updated_at
          BEFORE UPDATE ON menu_items
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await client.query('COMMIT');
    console.log('✓ Database schema created');
    
    // Clear existing data
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM menu_items');
    await client.query('DELETE FROM restaurants');
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
    
    const restaurantIds = [];
    for (const restaurant of restaurants) {
      const result = await client.query(
        'INSERT INTO restaurants (name, city) VALUES ($1, $2) RETURNING id',
        [restaurant.name, restaurant.city]
      );
      restaurantIds.push(result.rows[0].id);
    }
    console.log(`✓ Inserted ${restaurants.length} restaurants`);
    
    // Insert menu items (multiple dishes per restaurant)
    const menuItems = [
      // Hyderabadi Spice House
      { restaurantId: restaurantIds[0], name: 'Chicken Biryani', price: 220 },
      { restaurantId: restaurantIds[0], name: 'Mutton Biryani', price: 280 },
      { restaurantId: restaurantIds[0], name: 'Veg Biryani', price: 180 },
      { restaurantId: restaurantIds[0], name: 'Butter Chicken', price: 250 },
      
      // Delhi Darbar
      { restaurantId: restaurantIds[1], name: 'Chicken Biryani', price: 200 },
      { restaurantId: restaurantIds[1], name: 'Paneer Biryani', price: 190 },
      { restaurantId: restaurantIds[1], name: 'Dal Makhani', price: 150 },
      
      // Mumbai Masala
      { restaurantId: restaurantIds[2], name: 'Chicken Biryani', price: 240 },
      { restaurantId: restaurantIds[2], name: 'Prawn Biryani', price: 300 },
      { restaurantId: restaurantIds[2], name: 'Fish Curry', price: 220 },
      
      // Bengaluru Biryani
      { restaurantId: restaurantIds[3], name: 'Chicken Biryani', price: 210 },
      { restaurantId: restaurantIds[3], name: 'Egg Biryani', price: 170 },
      { restaurantId: restaurantIds[3], name: 'Chicken Biryani', price: 230 }, // Different price variant
      
      // Chennai Curry House
      { restaurantId: restaurantIds[4], name: 'Chicken Biryani', price: 195 },
      { restaurantId: restaurantIds[4], name: 'Dosa', price: 80 },
      
      // Pune Palace
      { restaurantId: restaurantIds[5], name: 'Chicken Biryani', price: 225 },
      { restaurantId: restaurantIds[5], name: 'Chicken Biryani', price: 250 }, // Premium variant
      
      // Kolkata Kitchen
      { restaurantId: restaurantIds[6], name: 'Chicken Biryani', price: 205 },
      { restaurantId: restaurantIds[6], name: 'Fish Biryani', price: 260 },
      
      // Ahmedabad Aroma
      { restaurantId: restaurantIds[7], name: 'Chicken Biryani', price: 190 },
      { restaurantId: restaurantIds[7], name: 'Gujarati Thali', price: 200 },
      
      // Jaipur Junction
      { restaurantId: restaurantIds[8], name: 'Chicken Biryani', price: 215 },
      { restaurantId: restaurantIds[8], name: 'Rajasthani Thali', price: 180 },
      
      // Lucknow Legacy
      { restaurantId: restaurantIds[9], name: 'Chicken Biryani', price: 245 },
      { restaurantId: restaurantIds[9], name: 'Awadhi Biryani', price: 280 },
      
      // Goa Grill
      { restaurantId: restaurantIds[10], name: 'Chicken Biryani', price: 235 },
      { restaurantId: restaurantIds[10], name: 'Goan Fish Curry', price: 240 },
      
      // Kerala Kitchen
      { restaurantId: restaurantIds[11], name: 'Chicken Biryani', price: 200 },
      { restaurantId: restaurantIds[11], name: 'Kerala Parotta', price: 120 }
    ];
    
    const menuItemIds = [];
    for (const item of menuItems) {
      const result = await client.query(
        'INSERT INTO menu_items (restaurant_id, name, price) VALUES ($1, $2, $3) RETURNING id',
        [item.restaurantId, item.name, item.price]
      );
      menuItemIds.push({ id: result.rows[0].id, restaurantId: item.restaurantId, name: item.name });
    }
    console.log(`✓ Inserted ${menuItems.length} menu items`);
    
    // Insert orders (simulate order history)
    // Create orders for different dishes with varying frequencies
    const orders = [];
    
    // Generate orders for Chicken Biryani with different frequencies per restaurant
    const biryaniItems = menuItemIds.filter(item => item.name.toLowerCase().includes('biryani'));
    
    // Assign order counts to create realistic top 10 results
    const orderCounts = [
      { restaurantId: restaurantIds[0], count: 96 },  // Hyderabadi Spice House - highest
      { restaurantId: restaurantIds[2], count: 85 },  // Mumbai Masala
      { restaurantId: restaurantIds[3], count: 78 },  // Bengaluru Biryani
      { restaurantId: restaurantIds[5], count: 72 },  // Pune Palace
      { restaurantId: restaurantIds[9], count: 68 },  // Lucknow Legacy
      { restaurantId: restaurantIds[1], count: 65 },  // Delhi Darbar
      { restaurantId: restaurantIds[6], count: 58 },  // Kolkata Kitchen
      { restaurantId: restaurantIds[10], count: 52 }, // Goa Grill
      { restaurantId: restaurantIds[8], count: 48 },  // Jaipur Junction
      { restaurantId: restaurantIds[11], count: 45 }, // Kerala Kitchen
      { restaurantId: restaurantIds[4], count: 38 },  // Chennai Curry House
      { restaurantId: restaurantIds[7], count: 32 }   // Ahmedabad Aroma
    ];
    
    for (const orderData of orderCounts) {
      const items = biryaniItems.filter(item => item.restaurantId === orderData.restaurantId);
      if (items.length > 0) {
        for (let i = 0; i < orderData.count; i++) {
          const item = items[Math.floor(Math.random() * items.length)];
          orders.push({
            restaurant_id: orderData.restaurantId,
            menu_item_id: item.id
          });
        }
      }
    }
    
    // Add some orders for other dishes too
    const otherItems = menuItemIds.filter(item => !item.name.toLowerCase().includes('biryani'));
    for (let i = 0; i < 50; i++) {
      const item = otherItems[Math.floor(Math.random() * otherItems.length)];
      orders.push({
        restaurant_id: item.restaurantId,
        menu_item_id: item.id
      });
    }
    
    // Insert orders in batches using PostgreSQL's VALUES syntax
    const batchSize = 100;
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      const values = [];
      const params = [];
      
      batch.forEach((order, idx) => {
        const paramIdx = idx * 2 + 1;
        values.push(`($${paramIdx}, $${paramIdx + 1})`);
        params.push(order.restaurant_id, order.menu_item_id);
      });
      
      await client.query(
        `INSERT INTO orders (restaurant_id, menu_item_id) VALUES ${values.join(', ')}`,
        params
      );
    }
    
    console.log(`✓ Inserted ${orders.length} orders`);
    
    await client.query('COMMIT');
    console.log('\n✅ Database seeded successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
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
