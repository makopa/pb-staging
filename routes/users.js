/* Dependencies */
var express = require('express');
var router = express.Router();

/* Controllers */
const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');
const SubjectCodeController = require('./controllers/SubjectCodeController');

router.use('*', SessionController.validateApp, SessionController.validateAdminToken);

/* Admin User management */
router.get('/', UserController.getUsers);
router.post('/', UserController.createUser);
router.get('/:userId', UserController.getUser);
router.delete('/:userId', UserController.deleteUser);
router.post('/:userId/reactivate', UserController.reactivateUser);
router.put('/:userId', UserController.updateUser);


module.exports = router;