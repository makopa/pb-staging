const mongoose = require('mongoose');

const question = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   question: { type: String, require: true },
   solution: { type: String },
   choices: { type: Array, required: true },
   answer: { type: String, required: true },
   subjectId: { type: String, required: true },
   topicId: { type: String, required: true },
   resourceUrl: { type: String },
   isArchive: { type: Boolean, required: true },
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date }
});

module.exports = mongoose.model('Question', question);