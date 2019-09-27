const mongoose = require('mongoose');

const subjectUpdates = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   subjectId: { type: String },
   topicId: { type: String },
   lessonId: { type: String },
   description: { type: String },
   name: { type: String},
   updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubjectUpdates', subjectUpdates);