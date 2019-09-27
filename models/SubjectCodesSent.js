const mongoose = require('mongoose');

const sentCodes = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   to: { type: String, required: true },
   organizationName: { type: String },
   subject: { type: String, required: true },
   html: {type: String, required: true },
   createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SentCodes', sentCodes);