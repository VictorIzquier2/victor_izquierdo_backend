// REQUIRES
const express = require('express');
const router  = express.Router();

// MODELS
const User = require('../models/User');

/* GET home page */
router.get('/', (req, res, next) => {
  res.send('Home');
});

module.exports = router;
