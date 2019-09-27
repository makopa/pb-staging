const mongoose = require('mongoose');

const school = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   name: { type: String, required: true, index: { unique : true, dropDups: true }},
   isArchive: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('School', school);