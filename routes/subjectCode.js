/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const SubjectCodeController = require('./controllers/SubjectCodeController');

router.use('*', SessionController.validateApp, SessionController.validateAdminToken);

/* SubjectCode Management Admin */
router.post('/generate', SubjectCodeController.generateSubjectCode);
router.get('/', SubjectCodeController.getSubjectCodes);
router.get('/:subjectCodeId', SubjectCodeController.getSubjectCode);
//router.post('/send', SubjectCodeController.sendSubjectCode);

/* Getting And Resending Subject COdes */
router.get('/mail/sent', SubjectCodeController.getSentSubjectCodes);
router.post('/mail/resend', SubjectCodeController.resendSubjectCodes);

module.exports = router;