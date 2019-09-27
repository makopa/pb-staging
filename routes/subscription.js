/* Dependencies */
var express = require('express');
var router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const SubjectCodeController = require('./controllers/SubjectCodeController');

router.get('/', SessionController.validateApp, SessionController.validateToken, SubjectCodeController.getSubscription);

module.exports = router;