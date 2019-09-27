/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const ExamController = require('./controllers/ExamController');

/* Exam Management - Admin */
//router.get('/', SessionController.validateApp, SessionController.validateAdminToken, ExamController.getAll);

/* Exam - Front*/
router.get('/topics/:topicId', SessionController.validateApp, SessionController.validateToken, ExamController.generateExam);

module.exports = router;