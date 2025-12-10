const pool = require('../database/connection');

async function searchDishes(req, res) {
  try {
    const { name, minPrice, maxPrice } = req.query;
    
    // Validate required parameters
    if (!name) {
      return res.status(400).json({
        error: 'Dish name is required',
        message: 'Please provide a dish name in the query parameter: ?name=yourDishName'
      });
    }
    
    if (!minPrice || !maxPrice) {
      return res.status(400).json({
        error: 'Price range is required',
        message: 'Please provide both minPrice and maxPrice in the query parameters'
      });
    }
    
    const minPriceNum = parseFloat(minPrice);
    const maxPriceNum = parseFloat(maxPrice);
    
    // Validate price range
    if (isNaN(minPriceNum) || isNaN(maxPriceNum)) {
      return res.status(400).json({
        error: 'Invalid price range',
        message: 'minPrice and maxPrice must be valid numbers'
      });
    }
    
    if (minPriceNum < 0 || maxPriceNum < 0) {
      return res.status(400).json({
        error: 'Invalid price range',
        message: 'Prices must be non-negative'
      });
    }
    
    if (minPriceNum > maxPriceNum) {
      return res.status(400).json({
        error: 'Invalid price range',
        message: 'minPrice must be less than or equal to maxPrice'
      });
    }
    
    // Search query: Get top 10 restaurants where the dish is ordered most,
    // filtered by price range, ordered by order count descending
    const query = `
      SELECT 
        r.id AS "restaurantId",
        r.name AS "restaurantName",
        r.city,
        mi.name AS "dishName",
        mi.price AS "dishPrice",
        COUNT(o.id) AS "orderCount"
      FROM 
        restaurants r
      INNER JOIN 
        menu_items mi ON r.id = mi.restaurant_id
      LEFT JOIN 
        orders o ON mi.id = o.menu_item_id
      WHERE 
        LOWER(mi.name) LIKE LOWER($1)
        AND mi.price >= $2
        AND mi.price <= $3
      GROUP BY 
        r.id, r.name, r.city, mi.name, mi.price
      ORDER BY 
        "orderCount" DESC, r.name ASC
      LIMIT 10
    `;
    
    const results = await pool.query(query, [
      `%${name}%`,
      minPriceNum,
      maxPriceNum
    ]);
    
    // Format response
    const restaurants = results.rows.map(row => ({
      restaurantId: row.restaurantId,
      restaurantName: row.restaurantName,
      city: row.city,
      dishName: row.dishName,
      dishPrice: parseFloat(row.dishPrice),
      orderCount: parseInt(row.orderCount)
    }));
    
    res.json({
      restaurants
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while searching for dishes'
    });
  }
}

module.exports = {
  searchDishes
};

