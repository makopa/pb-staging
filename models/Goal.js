const mongoose = require('mongoose');

const PreGoalSchema = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   goalType: {type: Number, required: true},
   description: {type: String, required: true},
   isArchive: {type: Boolean, default: false}
});

const GoalSchema = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId: { type: String, required: true},
   goalType: { type: Number, require: true },
   description: { type: String, required: true },
   dateCreated: { type: Date, default: Date.now },
   deadline: { type: Date },
   targetValue: { type: Number, required: true },
   currentValue: { type: Number, default: 0 },
   isCompleted: { type: Boolean, default: false },
   isArchive: { type: Boolean, default: false },
   status: { type: String, default: 'ongoing'}
});

const PreGoal = mongoose.model('PreGoal', PreGoalSchema);
const Goal = mongoose.model('Goal', GoalSchema);

module.exports = {
	PreGoal: PreGoal,
	Goal: Goal
}