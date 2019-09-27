/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const NewsController = require('./controllers/NewsController');

router.use('*', SessionController.validateApp);

/* News Management - Admin */
router.post('/', SessionController.validateAdminToken, NewsController.createNews);
router.put('/:newsId', SessionController.validateAdminToken, NewsController.updateNews);
router.delete('/:newsId', SessionController.validateAdminToken, NewsController.archiveNews);

/* Front & Admin Get News */
router.get('/', NewsController.getNews);
router.get('/:newsId', NewsController.getNewsDetails);

module.exports = router;