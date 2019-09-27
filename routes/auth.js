/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const AuthController = require('./controllers/AuthController');
const SessionController = require('./controllers/SessionController');

router.use('*', SessionController.validateApp);

/* Front - Authentication Routes */
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/password/reset', AuthController.resetPassword);
router.post('/password/change', AuthController.changePassword);
router.post('/password/update', SessionController.validateResetPasswordToken, AuthController.updatePassword);
router.get('/sessions/validate', SessionController.validateToken, function (req ,res) {
	res.status(200).json({
		auth: true,
		message: 'Token is valid.'
	});
});

/* Admin - Authentication Routes */
router.post('/admin/login', AuthController.adminLogin);
router.post('/admin/register', SessionController.validateAdminToken, AuthController.adminRegister);
router.post('/admin/password/change', SessionController.validateAdminToken, AuthController.changePassword);
router.get('/admin/sessions/validate', SessionController.validateAdminToken, function (req, res) {
	res.status(200).json({
		auth: true,
		message: 'Admin Token is valid.'
	});
});

module.exports = router;