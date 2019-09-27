/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config'); 

/* Models */
const Question = require('../../models/Question');
const Topic = require('../../models/Topic');
const Exam = require('../../models/Exam');
const User = require('../../models/Users');

const questionsPerTopic = 2;

const ExamController = {

	generateExam: async (req, res) => {
		let token = req.headers.token;
		let questions, topic, lessons, exam, user, decoded;
		let response = [];

		exam = new Exam({
			_id: new mongoose.Types.ObjectId(),
			userId: "",
			topicId: "",
			questions: [],
			isChecked: 0,
			totalScore: 0,
			totalItems: 0,
			dateCreated: Date.now()
		});

		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id});
			topic = await Topic.findOne({ _id: req.params.topicId });

			exam.userId = user._id;
			exam.topicId = topic._id;

			questions = await ExamController.generateQuestions(req.params.topicId);

			res.status(200).json(questions);

		} catch (e) {
			res.status(500).json({
				error: e.message
			});
		}
	},

	generateQuestions: async (topicId) => {

		try {
			lessons = await Lesson.findOne({ topicId: topicId });
			questions = await Question.find({ topicId: topicId });

			return Promise.resolve(questions);
		} catch (e) {
			return Promise.reject(e);
		} 
	}
}


module.exports = ExamController;