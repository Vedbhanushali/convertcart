const express = require('express');
const router = express.Router();
const { searchDishes } = require('../controllers/searchController');

router.get('/dishes', searchDishes);

module.exports = router;

