const mongoose = require('mongoose');

const mockResult = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId: { type: String, required: true },
   subjectId: { type: String, required: true },
   subjectName: { type: String, required: true },
   numberOfQuestions: { type: Number, required: true },
   score: { type: Number, required: true },
   createdAt: { type: Date, required: true }
});

module.exports = mongoose.model('mockResult', mockResult);