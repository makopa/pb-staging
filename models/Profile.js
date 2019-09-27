const mongoose = require('mongoose');

const profile = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId: { type: String, required: true, index: { unique : true, dropDups: true } },
   birthDate: {type: Date, required: true},
   gender: {type: String, required: false },
   school: {type: String, required: false },
   updatedAt: { type: Date, default: Date.now },
   createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profile);