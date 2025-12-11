const prisma = require('../database/connection');

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

    // Search using Prisma: Get top 10 restaurants where the dish is ordered most,
    // filtered by price range, ordered by order count descending
    const results = await prisma.menuItem.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        },
        price: {
          gte: minPriceNum,
          lte: maxPriceNum
        }
      },
      include: {
        restaurant: true,
        orders: true
      }
    });

    // Process results: group by restaurant and dish, count orders, and sort
    const restaurantMap = new Map();

    results.forEach(menuItem => {
      const key = `${menuItem.restaurantId}-${menuItem.name}-${menuItem.price}`;
      const orderCount = menuItem.orders.length;

      if (!restaurantMap.has(key) || restaurantMap.get(key).orderCount < orderCount) {
        restaurantMap.set(key, {
          restaurantId: menuItem.restaurant.id,
          restaurantName: menuItem.restaurant.name,
          city: menuItem.restaurant.city,
          dishName: menuItem.name,
          dishPrice: parseFloat(menuItem.price),
          orderCount: orderCount
        });
      }
    });

    // Convert to array, sort by order count (descending) and restaurant name (ascending), then limit to 10
    const restaurants = Array.from(restaurantMap.values())
      .sort((a, b) => {
        if (b.orderCount !== a.orderCount) {
          return b.orderCount - a.orderCount;
        }
        return a.restaurantName.localeCompare(b.restaurantName);
      })
      .slice(0, 10);

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
