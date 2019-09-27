/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const SchoolController = require('./controllers/SchoolController');

router.use('*', SessionController.validateApp);

/* School Management */
router.post('/', SessionController.validateAdminToken, SchoolController.addSchools);
router.put('/:schoolId', SessionController.validateAdminToken, SchoolController.updateSchool);

/* Schools - Front & Admin */
router.get('/', SchoolController.getSchools);


module.exports = router;