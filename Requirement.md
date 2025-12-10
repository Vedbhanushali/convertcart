# Project Requirements

## Overview

Build a simple backend service that allows users to search for restaurants based on a dish name. The system should store restaurants, their menu items, and the orders placed for those items. When a user searches for a dish, the system should return the restaurants where that dish is ordered the most, restricted by a mandatory price range filter.

Your task is to design the data model, implement the logic, and expose an API to return the results.

## Use Case: Search by Dish Name (with Mandatory Price Range)

When the user searches by dish name, return:
- The top 10 restaurants where that dish has been ordered the highest number of times
- Only include restaurants where the dish's price falls within the required price range
- Each result should include:
  - Restaurant details
  - Dish name
  - Dish price
  - Total order count for that dish in that restaurant

## API Specification

### Endpoint
```
GET /search/dishes?name={dishName}&minPrice={minPrice}&maxPrice={maxPrice}
```

### Sample Request
```
GET /search/dishes?name=biryani&minPrice=150&maxPrice=300
```

### Expected Response Format
```json
{
  "restaurants": [
    {
      "restaurantId": 5,
      "restaurantName": "Hyderabadi Spice House",
      "city": "Hyderabad",
      "dishName": "Chicken Biryani",
      "dishPrice": 220,
      "orderCount": 96
    }
  ]
}
```

**Note:** Only one API endpoint is required for this use case.

## Technical Requirements

### Stack
- **Backend:** Node.js
- **Database:** MySQL
- **Code Quality:** Clean and well-structured code

### Deliverables

1. **Codebase**
   - Clean and well-structured Node.js + MySQL backend code
   - Proper error handling and validation
   - Well-organized project structure

2. **Documentation**
   - Clear README with:
     - Setup steps
     - Database configuration
     - Example API usage
     - Environment variables

3. **Database**
   - Seed file with sample data for:
     - Restaurants
     - Menu items
     - Orders (for simplicity, consider one order has only one item)

4. **Deployment**
   - Project hosted on a free platform (Railway / Render / etc.)
   - Public URL shared

5. **Version Control**
   - Code pushed to a public Git repository
   - Repository link included

### Additional Notes

- Keep it simple, understandable, and runnable without issues
- Use of AI tools is allowed, but you must fully understand your code — during the interview, we may ask you to modify or extend it in real time