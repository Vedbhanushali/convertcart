# Restaurant Search API

A Node.js + PostgreSQL backend service that allows users to search for restaurants based on dish names with mandatory price range filtering. The system returns the top 10 restaurants where a specific dish has been ordered the most, filtered by price range.

## Features

- 🔍 Search restaurants by dish name
- 💰 Mandatory price range filtering
- 📊 Returns top 10 restaurants ordered by dish popularity
- 🏪 Includes restaurant details, dish information, and order counts

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Environment:** dotenv

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ConvertCart
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using PostgreSQL Command Line (psql)

1. Log in to PostgreSQL:
```bash
psql -U postgres
```

2. Create the database (the seed script expects the database to exist):
```sql
CREATE DATABASE restaurant_search;
\q
```

#### Option B: Using createdb command

```bash
createdb -U postgres restaurant_search
```

**Note:** Make sure PostgreSQL is running and you have the necessary permissions to create databases.

### 4. Environment Configuration

1. Create a `.env` file in the root directory (you can use `env.example` as a template):
```bash
# On Windows (PowerShell)
Copy-Item env.example .env

# On Linux/Mac
cp env.example .env
```

2. Edit `.env` and update with your database credentials. You can use either a connection string or individual variables:

**Option 1: Connection String (Recommended for cloud databases like Neon, Railway, Render)**
```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

PORT=3000
NODE_ENV=development
```

**Option 2: Individual Environment Variables (For local development)**
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=restaurant_search
DB_PORT=5432
DB_SSL=false

PORT=3000
NODE_ENV=development
```

**Note:** If you're using a cloud PostgreSQL service (like Neon, Railway, or Render), they typically provide a connection string. Use `DATABASE_URL` for the easiest setup.

**Example for Neon PostgreSQL:**
```env
DATABASE_URL=postgresql://neondb_owner:password@ep-summer-glade-a126tma5-pooler.ap-southeast-1.aws.neon.tech/restaurant_search?sslmode=require
```

The connection string format is:
```
postgresql://username:password@host:port/database?sslmode=require
```

**Important:** Copy your connection string exactly as provided by your database provider. The pg library will handle URL encoding automatically.

### 5. Seed the Database

Run the seed script to create tables and populate sample data:

```bash
npm run seed
```

This will:
- Create the database schema (restaurants, menu_items, orders tables)
- Insert sample restaurants, menu items, and orders
- Display confirmation messages

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

### Base URL

```
http://localhost:3000
```

### Endpoints

#### 1. Health Check

Check if the server is running.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### 2. Search Dishes

Search for restaurants by dish name with price range filtering.

**Request:**
```http
GET /search/dishes?name={dishName}&minPrice={minPrice}&maxPrice={maxPrice}
```

**Query Parameters:**
- `name` (required): The dish name to search for (case-insensitive, partial match)
- `minPrice` (required): Minimum price of the dish
- `maxPrice` (required): Maximum price of the dish

**Example Request:**
```http
GET /search/dishes?name=biryani&minPrice=150&maxPrice=300
```

**Success Response (200):**
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
    },
    {
      "restaurantId": 3,
      "restaurantName": "Mumbai Masala",
      "city": "Mumbai",
      "dishName": "Chicken Biryani",
      "dishPrice": 240,
      "orderCount": 85
    }
  ]
}
```

**Error Responses:**

**400 Bad Request - Missing Parameters:**
```json
{
  "error": "Dish name is required",
  "message": "Please provide a dish name in the query parameter: ?name=yourDishName"
}
```

**400 Bad Request - Invalid Price Range:**
```json
{
  "error": "Invalid price range",
  "message": "minPrice must be less than or equal to maxPrice"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "An error occurred while searching for dishes"
}
```

## Example API Usage

### Using cURL

```bash
# Search for biryani between 150-300
curl "http://localhost:3000/search/dishes?name=biryani&minPrice=150&maxPrice=300"

# Search for butter chicken between 200-250
curl "http://localhost:3000/search/dishes?name=butter%20chicken&minPrice=200&maxPrice=250"
```

### Using JavaScript (Fetch API)

```javascript
const searchDishes = async (dishName, minPrice, maxPrice) => {
  const url = `http://localhost:3000/search/dishes?name=${encodeURIComponent(dishName)}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Example usage
searchDishes('biryani', 150, 300);
```

### Using Postman

1. Create a new GET request
2. URL: `http://localhost:3000/search/dishes`
3. Add query parameters:
   - `name`: biryani
   - `minPrice`: 150
   - `maxPrice`: 300
4. Send the request

## Database Schema

### Tables

#### `restaurants`
- `id` (SERIAL, PRIMARY KEY)
- `name` (VARCHAR(255))
- `city` (VARCHAR(100))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `menu_items`
- `id` (SERIAL, PRIMARY KEY)
- `restaurant_id` (INTEGER, FOREIGN KEY)
- `name` (VARCHAR(255))
- `price` (DECIMAL(10, 2))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `orders`
- `id` (SERIAL, PRIMARY KEY)
- `restaurant_id` (INTEGER, FOREIGN KEY)
- `menu_item_id` (INTEGER, FOREIGN KEY)
- `created_at` (TIMESTAMP)

## Project Structure

```
ConvertCart/
├── src/
│   ├── controllers/
│   │   └── searchController.js    # Search logic
│   ├── database/
│   │   ├── connection.js          # PostgreSQL connection pool
│   │   ├── schema.sql             # Database schema
│   │   └── seed.js                # Seed script
│   ├── routes/
│   │   └── searchRoutes.js        # API routes
│   └── server.js                  # Express app entry point
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore file
├── package.json                   # Dependencies and scripts
├── README.md                      # This file
└── Requirement.md                 # Project requirements
```

## Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm run seed` - Seed the database with sample data

## Deployment

### Railway

1. Push your code to a Git repository
2. Create a new project on [Railway](https://railway.app)
3. Connect your repository
4. Add environment variables in Railway dashboard
5. Railway will automatically deploy

### Render

1. Push your code to a Git repository
2. Create a new Web Service on [Render](https://render.com)
3. Connect your repository
4. Add environment variables
5. Set build command: `npm install`
6. Set start command: `npm start`

### Environment Variables for Deployment

Make sure to set these in your hosting platform:

**Option 1: Connection String (Recommended)**
- `DATABASE_URL` - Your full PostgreSQL connection string (e.g., from Neon, Railway, Render)
- `PORT` - Server port (usually set automatically by hosting platform)
- `NODE_ENV` - Set to `production`

**Option 2: Individual Variables**
- `DB_HOST` - Your PostgreSQL host
- `DB_USER` - Your PostgreSQL username
- `DB_PASSWORD` - Your PostgreSQL password
- `DB_NAME` - Your database name
- `DB_PORT` - Your PostgreSQL port (usually 5432)
- `DB_SSL` - Set to `true` if SSL is required
- `PORT` - Server port (usually set automatically by hosting platform)
- `NODE_ENV` - Set to `production`

**Note:** Most cloud PostgreSQL providers (Neon, Railway, Render, etc.) provide a connection string. Using `DATABASE_URL` is the simplest approach.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `psql -U postgres -l` or check service status
- Check your `.env` file has correct credentials
- Ensure the database exists (create it manually before running seed)

### Port Already in Use

If port 3000 is already in use, change the `PORT` in your `.env` file.

### Seed Script Errors

- Make sure PostgreSQL is running
- Verify database credentials in `.env`
- Ensure the database exists before running the seed script
- Check that you have permission to create tables and insert data

## License

ISC