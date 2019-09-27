/* Config */
require('dotenv').config();
const config = require('./config'); 

/* Packages */
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

/* Routes */
const user = require('./routes/users');
const auth = require('./routes/auth');
const profile = require('./routes/profile');
const subjects = require('./routes/subject');
const dailyTips = require('./routes/dailyTips');
const subjectCode = require('./routes/subjectCode');
const homepage = require('./routes/homepage');
const news = require('./routes/news');
const activity = require('./routes/activity');
const subscription = require('./routes/subscription');
const subjectUpdates = require('./routes/subjectUpdates');
const schools = require('./routes/school');
const uploads = require('./routes/uploads');
const question = require('./routes/question');
const practice = require('./routes/practice');
const test = require('./routes/test');
const mock = require('./routes/mock');

const app = express();

/* Services */
const db = require('./services/db.js');

/* API Settings */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('short'));

/* MongoDB */
let dbConnection = false;

/* Create Database Connection */
const connection = db.connection;

/* Use Routes */
app.use('/users', user);
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/subjects', subjects);
app.use('/tips', dailyTips);
app.use('/admin/subjects/codes', subjectCode);
app.use('/home', homepage);
app.use('/news', news);
app.use('/activities', activity);
app.use('/subscriptions', subscription);
app.use('/updates', subjectUpdates);
app.use('/schools', schools);
app.use('/uploads', uploads);
app.use('/questions', question);
app.use('/practice', practice);
app.use('/test', test);
app.use('/goals', require('./routes/goal'));
app.use('/mock', mock);

/* API Status*/
app.get('/status', function(req, res){
   if (connection) {
      res.status(200).json({
         "message": "API is Running and DB Connection is Up."
      });   
   } else {
      res.status(500).json({
         "message": "Database Connection Error"
      });   
    }   
});

// Invalid endpoint error handler
app.use('*', (req, res)=> {

   res.status(404).json({
      message: 'Endpoint not found.'
   });
});

app.listen(config.server.port, function(){
   console.log('[API] '+config.server.appname + ' Server is running on Port', config.server.port);
});