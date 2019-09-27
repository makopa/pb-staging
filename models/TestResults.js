const mongoose = require('mongoose');

const testResult = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId: { type: String, required: true },
   score: { type: Number, required: true },
   questions: { type: Array, required: true },
   subjectId: { type: String, required: true },
   topicId: { type: String, required: true },
   isArchive: { type: Boolean, required: true }
});

module.exports = mongoose.model('TestResult', testResult);