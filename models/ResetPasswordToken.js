const mongoose = require('mongoose');

const resetPasswordToken = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   token: { type: String, required: true },
});

module.exports = mongoose.model('ResetPasswordToken', resetPasswordToken);