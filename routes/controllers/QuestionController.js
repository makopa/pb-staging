/* Dependencies */
const mongoose = require('mongoose');

const Config = require('../../config');

/* Models */
const Question = require('../../models/Question');
const Subject = require('../../models/Subject');
const Topic = require('../../models/Topic');

const choicesCount = parseInt(Config.questions.choicesCount);

const QuestionController = {
	
	addQuestion: async (req, res) => {
		let question, saveQuestion;

		try {
			if (req.body.choices.length !== choicesCount) {
				throw new Error('Question must have four (4) choices.');
			}

			if (req.body.choices.indexOf(req.body.answer) < 0) {
				throw new Error('Answer must be one of the choices.');
			}

			question = new Question({
				_id: new mongoose.Types.ObjectId(),
				question: req.body.name,
				solution: req.body.solution,
				choices: req.body.choices,
				answer: req.body.answer,
				subjectId: req.body.subjectId,
				topicId: req.body.topicId,
				resourceUrl: req.body.resourceUrl,
				isArchive: false,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});

			saveQuestion = await question.save();

			res.status(200).json({
				result: 'success',
				message: 'New Question has been addded.',
				data: saveQuestion
			})
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create new question.',
				error: e.message
			})
		}
	},

	getQuestions: async (req,res) => {
		let questions;
		let subjectId = req.query.subjectId;
		let topicId = req.query.topicId;
		
		let query = [
			{ $match: { isArchive: false }}
		];

		if (subjectId) {
			query.push({ $match: { subjectId: subjectId }});
		}

		if (topicId) {
			query.push({ $match: {topicId: topicId }});
		}

		try {
			questions = await Question.aggregate(query);
			res.status(200).json({
				result: 'success',
				message: 'Successfully get list of questions.',
				data: questions
			});
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			});
		}
	},

	updateQuestion: async (req,res) => {
		let question, updateQuestion;
		try {
			if (req.body.choices.length !== choicesCount) {
				throw new Error('Question must have four (4) choices.');
			}

			if (req.body.choices.indexOf(req.body.answer) < 0) {
				throw new Error('Answer must be one of the choices.');
			}

			updateQuestion = await Question.findOneAndUpdate(
				{ _id: req.params.questionId},
				{ $set: {
					question: req.body.question,
					solution: req.body.solution,
					choices: req.body.choices,
					answer: req.body.answer,
					subjectId: req.body.subjectId,
					topicId: req.body.topicId,
					resourceUrl: req.body.resourceUrl,
					isArchive: req.body.isArchive,
					updatedAt: Date.now()
				}},
				{ new: true }
			);

			res.status(200).json({
				result: 'success',
				message: 'Question successfuly updated.',
				data: updateQuestion
			})
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update question',
				error: e.message
			})
		}
	},

	deleteQuestion: async (req,res) => {
		let question, _deleteQuestion;
		
		try {
			question = await Question.findOneAndUpdate(
				{ _id: req.params.questionId},
				{ $set: {
					isArchive: true
				}},
				{ new: true}
			);

			res.status(200).json({
				result: 'success',
				message: 'Question has been successfuly archived.',
				data: question
			}); 
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to delete question '+ req.params.questionId,
				error: e.message
			});
		}
	}
}


module.exports = QuestionController;