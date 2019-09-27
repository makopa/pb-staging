/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const ProfileController = require('./controllers/ProfileController');

router.use('*', SessionController.validateApp);

/* Profile Management */
router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);

module.exports = router;