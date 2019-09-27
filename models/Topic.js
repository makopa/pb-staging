const mongoose = require('mongoose');

const topic = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   description: { type: String },
   topicNumber: { type: Number, required: true },
   subjectId : { type: String, required: true },
   lessons: { type: Array, required: true, default: []},
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date },
   isArchive: { type: Boolean, default: false }
});

module.exports = mongoose.model('Topic', topic);