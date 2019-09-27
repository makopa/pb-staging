const mongoose = require('mongoose');

const examRecords = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId: { type: String, required: true },
   topicId: { type: String, required: true },
   numberOfQuestions: { type: Number, required: true},
   score: { type: Number, required: true },
   createdAt: { type: Date, required: true}
});

module.exports = mongoose.model('ExamRecords', examRecords);