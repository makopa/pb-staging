const mongoose = require('mongoose');

const lesson = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   topicId: { type: String, required: true },
   lessonNumber: { type: Number, required: true },
   description: { type: String, required: true,},
   isArchive: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('Lesson', lesson);