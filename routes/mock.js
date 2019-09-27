/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const MockController = require('./controllers/MockController');
const SessionController = require('./controllers/SessionController');

router.use('*', SessionController.validateApp);

/* Mock Management - Admin */
router.post('/', SessionController.validateAdminToken, MockController.createMock);
router.get('/', SessionController.validateAdminToken, MockController.getMock);
router.put('/:mockId', SessionController.validateAdminToken, MockController.updateMock);

/* Front and Admin Endpoints */
router.get('/subjects/:subjectId/generate', MockController.generate);
router.get('/records', MockController.getRecords);
router.get('/records/:recordId', MockController.getRecordDetails);

/* Front Only Endpoint */
router.post('/submit', SessionController.validateToken ,MockController.submit);

module.exports = router;