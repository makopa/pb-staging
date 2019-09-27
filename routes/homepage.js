/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const HomepageController = require('./controllers/HomepageController');

/* Home Page Route for Web - Front */
router.get('/', SessionController.validateApp, SessionController.validateToken, HomepageController.getHomepage);

module.exports = router;