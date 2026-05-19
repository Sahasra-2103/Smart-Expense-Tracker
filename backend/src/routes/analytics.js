const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/monthly', auth, analyticsController.monthly);
router.get('/categories', auth, analyticsController.categories);
router.get('/trends', auth, analyticsController.trends);
router.get('/recent', auth, analyticsController.recent);

module.exports = router;
