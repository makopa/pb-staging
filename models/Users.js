const mongoose = require('mongoose');

const user = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   email: { type: String, required: true, index: { unique : true, dropDups: true } },
   password: { type: String, required: true },
   firstName: { type: String, required: true },
   middleName: { type: String, required: false, default: "" },
   lastName: { type: String, required: true },
   subjectCode: { type: String, default: "" },
   isAdmin: {type: Boolean, required: true },
   createdAt: { type: Date },
   updatedAt: { type: Date },
   isActive: {type: Boolean, default: true},
   isArchive: { type: Boolean, default: false}
});

module.exports = mongoose.model('User', user);