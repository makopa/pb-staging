/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const SubjectController = require('./controllers/SubjectController');
const SubjectCodeController = require('./controllers/SubjectCodeController');
const TopicController = require('./controllers/TopicController');

router.use('*', SessionController.validateApp);

/* Admin Exclusive Endpoints */
/* Subject Management */
router.post('/', SessionController.validateAdminToken, SubjectController.createSubject);
router.get('/enrollees/count', SessionController.validateAdminToken, SubjectController.getEnrolleesCount);
router.delete('/:subjectId', SessionController.validateAdminToken, SubjectController.archiveSubject);
router.put('/:subjectId', SessionController.validateAdminToken, SubjectController.updateSubject);
/* Topics Management */
router.post('/:subjectId/topics', SessionController.validateAdminToken, TopicController.createTopic);
router.put('/:subjectId/topics/:topicId', SessionController.validateAdminToken, TopicController.updateTopic);
router.delete('/:subjectId/topics/:topicId', SessionController.validateAdminToken, TopicController.archiveTopic)

/* Subjects / Topics / Lessons routes for front and admin */
/* Subjects */ 
router.get('/:subjectId', SubjectController.getSubject);
router.get('/:subjectId/codes', SessionController.validateAdminToken, SubjectController.getSubjectCodes);
router.get('/', SubjectController.getSubjects);

/* Topics */
router.get('/:subjectId/topics', TopicController.getTopics);
router.get('/:subjectId/topics/:topicId', TopicController.getTopic);

/* Front Exclusive Endpoints */
/* Subject Code Activation - Front*/
router.post('/codes/activate', SessionController.validateToken, SubjectCodeController.activateSubjectCode);


module.exports = router;