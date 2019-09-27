const mongoose = require('mongoose');

const exam = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	userId: { type: String, required: true },
	subjectId: { type: String, required: true },
	topicId: {type: String, required: true},
	questions: { type: Array, required: true },
	isChecked: { type: Boolean, required: true },
	totalScore: { type: Number, required: true},
	totalItems: { type: Number, required: true},
	dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', exam);