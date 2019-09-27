/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SubjectUpdatesController = require('./controllers/SubjectUpdatesController');
const SessionController = require('./controllers/SessionController');

/* News Management - Admin */
router.get('/subjects', SessionController.validateApp, SessionController.validateToken, SubjectUpdatesController.getUpdates);

module.exports = router;