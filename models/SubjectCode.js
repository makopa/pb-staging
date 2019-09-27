const mongoose = require('mongoose');

const subjectCode = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   subjectCode: { type: String, required: true,  index: { unique : true, dropDups: true } },
   organizationName: { type: String, default: "" },
   userId: { type: String, required: false, index: { unique: false } },
   createdAt: { type: Date, default: Date.now },
   activatedAt: { type: Date, default: "" },
   expiresAt: { type: Date, default: "" },
   subjects: { type: Array, required: true }
});

module.exports = mongoose.model('SubjectCode', subjectCode);