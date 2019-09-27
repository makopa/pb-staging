const mongoose = require('mongoose');

const practice = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   questions: { type: Array, require: true  },
   subjectId: { type: String, required: true },
   topicId: { type: String, required: true },
   isArchive: { type: Boolean, required: true }
});

module.exports = mongoose.model('practice', practice);