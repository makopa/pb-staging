/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const GoalController = require('./controllers/GoalController');
const SessionController = require('./controllers/SessionController');
router.use('*', SessionController.validateApp);

/* Goal Management - Admin */
router.get('/pregoals', GoalController.getAllPreGoal);
router.post('/pregoals', SessionController.validateAdminToken, GoalController.addPreGoal);
router.post('/create', SessionController.validateToken, GoalController.addGoal);
router.post('/update', SessionController.validateToken, GoalController.updateGoalProgress);
router.get('/', SessionController.validateToken, GoalController.getGoals);

/* Goal Management - User */
// router.post('/goals', GoalController.createGoal);

module.exports = router;