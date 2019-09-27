/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const QuestionController = require('./controllers/QuestionController');
const SessionController = require('./controllers/SessionController');

router.use('*', SessionController.validateApp, SessionController.validateAdminToken);

/* News Management - Admin */
router.post('/', QuestionController.addQuestion);
router.get('/', QuestionController.getQuestions);
router.put('/:questionId', QuestionController.updateQuestion);
router.delete('/:questionId', QuestionController.deleteQuestion);

module.exports = router;