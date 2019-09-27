const mongoose = require('mongoose');

const mock = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   subjectId: { type: String, required: true },
   questions: { type: Array, required: true },
   createdAt: { type: Date, required: true },
   updatedAt: { type: Date, required: true },
   isArchive: { type: Boolean, required: true }
});

module.exports = mongoose.model('Mock', mock);