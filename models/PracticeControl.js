const mongoose = require('mongoose');

const practiceControl = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   topicId: { type: String, required: true },
   numberOfQuestions: { type: Number, required: true },
   createdAt: { type: Date, required: true },
   updatedAt: { type: Date }
});

module.exports = mongoose.model('PracticeControl', practiceControl);