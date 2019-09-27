/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const TestController = require('./controllers/TestController');
const SessionController = require('./controllers/SessionController');

router.use('*', SessionController.validateApp);

/* Test Management - Admin */
// router.post('/', SessionController.validateAdminToken, TestController.createTest);
// router.put('/topics/:topicId', SessionController.validateAdminToken, TestController.updateTest);
// router.delete('/topics/:topicId', SessionController.validateAdminToken, TestController.deleteTest);

/* Front and Admin Endpoints */
router.get('/topics/:topicId/generate', TestController.generate);
router.post('/submit', TestController.submit);

module.exports = router;