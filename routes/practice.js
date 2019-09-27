/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const PracticeController = require('./controllers/PracticeController');
const SessionController = require('./controllers/SessionController');

router.use('*', SessionController.validateApp);

/* Practice Management - Admin */
// Not managed by admin anymore. Controls
// router.post('/', SessionController.validateAdminToken, PracticeController.createPractice);
// router.put('/topics/:topicId', SessionController.validateAdminToken, PracticeController.updatePractice);
// router.delete('/topics/:topicId', SessionController.validateAdminToken, PracticeController.deletePractice);
router.get('/controls', SessionController.validateAdminToken, PracticeController.getPracticeControls);
router.post('/controls', SessionController.validateAdminToken, PracticeController.createPracticeControls);
router.put('/controls/:id', SessionController.validateAdminToken, PracticeController.updatePracticeControls);
router.delete('/controls/:id', SessionController.validateAdminToken, PracticeController.deletePracticeControls);

/* Front Endpoints */
// router.get('/topics/:topicId', PracticeController.getByTopic); 
// router.get('/subjects/:subjectId', PracticeController.getBySubject);
router.get('/topics/:topicId/generate', PracticeController.generatePractice);

module.exports = router;