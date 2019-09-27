/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const DailyTipsController = require('./controllers/DailyTipsController');

router.use('*', SessionController.validateApp);

/* Daily Tips Management - Admin */
router.post('/', SessionController.validateAdminToken, DailyTipsController.createDailyTips);
router.get('/', SessionController.validateAdminToken, DailyTipsController.getTips);
router.put('/:dailyTipsId', SessionController.validateAdminToken, DailyTipsController.updateDailyTips);
router.delete('/:dailyTipsId', SessionController.validateAdminToken, DailyTipsController.archiveDailyTips);

/* Front Get Daily Tips */
router.get('/random', DailyTipsController.getDailyTips);

module.exports = router;