/* Packages */ 
const mongoose = require('mongoose');

/* Config */
require('dotenv').config();
const config = require('../config');

/* MongoDb Options */
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);

/* MongoDb Atlas*/ 
const uri = config.db.atlasURI;

/* MongoDb Local */
// const uri = config.db.host + config.db.database;

/* Create MongoDB Connection */   
exports.connection = mongoose.connect(uri, function(err) {
   if (err) throw err;
   console.log('[MongoDB] Connection Successful.');
});