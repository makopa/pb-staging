const mongoose = require('mongoose');

const news = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   title: { type: String, required: true},
   description: { type: String, required: true},
   author: { type: String, default: "" },
   imageUrl: { type: String, default: "" },
   createdBy: { type: String, required: true },
   createdAt: {type: Date, default: Date.now },
   updatedAt: {type: Date, default: Date.now },
   isArchive: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('News', news);