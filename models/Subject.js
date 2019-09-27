const mongoose = require('mongoose');

const subject = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   code: { type: String, required: true,  index: { unique : true, dropDups: true } },
   name: { type: String, required: true,  index: { unique : true, dropDups: true } },
   description: { type: String },
   imageUrl: { type: String, default: "" },
   createdAt: { type: Date, default: Date.now },
   isArchive: { type: Boolean, default: false }
});

module.exports = mongoose.model('Subject', subject);