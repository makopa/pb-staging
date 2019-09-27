/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const ActivityController = require('./controllers/ActivityController');
const SessionController = require('./controllers/SessionController');

/* News Management - Admin */
router.get('/', SessionController.validateApp, SessionController.validateToken, ActivityController.getRecentActivities);

module.exports = router;