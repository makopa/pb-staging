const mongoose = require('mongoose');

const activity = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId: { type: String },
   details: { type: Object, required: true },
   date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activity);