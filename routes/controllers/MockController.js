/* Dependencies */
const mongoose = require('mongoose');

/* Models */
const Question = require('../../models/Question');
const Topic = require('../../models/Topic');
const Mock = require('../../models/Mock');
const MockResults = require('../../models/MockResults');
const Subject = require('../../models/Subject');
const User = require('../../models/Users');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Config = require('../../config');

const questionCount = parseInt(Config.questions.testCount);

const MockController = {
	// Admin Routes
	createMock: async (req, res) => {
		let subject, mock, saveMock, exists, questions;
		let validIds = [];
		exists = await Mock.findOne({ subjectId: req.body.subjectId });

		try {
			// Check if mock exam already exists
			if(exists)
				throw new Error("Mock exam already exsists. Use update instead.")
			// Check duplicate entries on question array
			if(!hasUnique(req.body.questions))
				throw new Error("Duplicate questions are not allowed.")
			// Check if subject Exsists
			subject = await Subject.findOne({ _id: req.body.subjectId });
			if (!subject)
				throw new Error("Subject not found.");
			// Validate Questions 
			questions = await Question.find({ subjectId: req.body.subjectId });
			if (req.body.questions.length < 1 )
				throw new Error("Atleast 1 question is required");
			// Validate if question belongs to the subjectId
			questions.forEach((question) => {
				validIds.push(''+question._id);
			});
			if (!doesContain(req.body.questions, validIds))
				throw new Error("Invalid question id.");

			mock = new Mock({
				_id: new mongoose.Types.ObjectId(),
				subjectId: req.body.subjectId,
				questions: req.body.questions,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				isArchive: false
			});

			saveMock = await mock.save();
			res.status(200).json({
				result: 'success',
				message: 'Mock exam successfully created.',
				data: saveMock
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create mock Exam.',
				error: e.message
			});
		}
	},
	getMock: async (req, res) => {
		let mock;
		try {
			mock = await Mock.find();
			res.status(200).json({
				result: 'success',
				message: 'Successfully get all mock exams.',
				data: mock
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get all mock exams.',
				error: e.message
			});
		}

	},
	updateMock: async (req, res) => {
		let mock, updateMock, questions;
		let validIds = [];
		try {
			mock = await Mock.findOne({ _id: req.params.mockId });

			// Check duplicate entries on question array
			if(!hasUnique(req.body.questions))
				throw new Error("Duplicate questions are not allowed.")

			// Validate Questions 
			questions = await Question.find({ subjectId: mock.subjectId });
			if (req.body.questions.length < 1 )
				throw new Error("Atleast 1 question is required");

			// Validate if question belongs to the subjectId
			questions.forEach((question) => {
				validIds.push(''+question._id);
			});
			if (!doesContain(req.body.questions, validIds))
				throw new Error("Invalid question id.");

			updateMock = await Mock.findOneAndUpdate(
				{ _id: req.params.mockId },
				{ $set: {
					questions: req.body.questions
				}},
				{ new: true }
			);

			res.status(200).json({
				result: 'success',
				message: 'Mock Exam set has been successfully updated.',
				data: updateMock
			});
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update mock exam.',
				errror: e.message
			});
		}
	},

	// Front Routes
	generate: async (req, res) => {
		// Get mock, Get Questions without answers.
		let subject, mock, questions, newBody;
		try {
			subject = await Subject.findOne({ _id: req.params.subjectId });
			mock = await Mock.findOne({ subjectId: req.params.subjectId });
			if (!mock)
				throw new Error('There is no mock exam in this subject yet.')
			// get questions, exclude solutions and answers
			questions = await Question.find({_id: { $in: mock.questions }}, {answer: 0, solution: 0});
			newBody = {
				result: 'success',
				message: 'Successfully generated Mock Exam.',
				data: {
					subject: subject.name,
					description: 'Mock Exam',
					numberOfQuestions: questions.length,
					questions: questions
				}
			};
			res.status(200).json(newBody);
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong.',
				errror : e.message
			});
		}
	},
	submit: async (req, res) => {
		let mock, questionsIds, questions, decoded, user, result, saveResult, subject;
		let score = 0;
		let studentPair = {};
		let checkerPair = {};
		let token = req.headers.token;
		try {
			// Get User Details
			decoded = await jwt.verify(token, Config.auth.secret);
			// console.log(decoded._id);
			// Get Subject Details
			subject = await Subject.findOne({ _id: req.body.subjectId });
			// Create student pair object { <questionId>: answer }
			req.body.questions.forEach((question) => {
				studentPair[question.id] = question.answer;
			});
			// Create checker pair object
			mock = await Mock.findOne({ subjectId: req.body.subjectId });
			questions = await Question.find({ _id: { $in: mock.questions }});
			questions.forEach((question)=>{
				checkerPair[question._id] = question.answer;
			});

			// Compare both objects
			req.body.questions.forEach((q)=> {
				if(studentPair[q.id] === checkerPair[q.id]) {
					score++;
				}
			});

			// Save Records
			result = new MockResults({
				_id: new mongoose.Types.ObjectId(),
				userId: decoded._id,
				subjectId: req.body.subjectId,
				subjectName: subject.name,
				numberOfQuestions: questions.length,
				score: score,
				createdAt: Date.now()
			});

			saveResult = await result.save();

			res.status(200).json({
				result: 'success',
				message: 'Mock Exam successfully submitted and evaluated.',
				data: {
					subject: subject.name,
					numberOfQuestions: saveResult.numberOfQuestions,
					score: saveResult.score,
					percentage: (score / saveResult.numberOfQuestions)*100+' %',
					evaluatedAt: saveResult.createdAt
				}
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to submit mock exam.',
				error: e.message
			});
		}
	},
	getRecords: async (req, res) => {
		let decoded, records;
		let token = req.headers.token;
		try {
			// Get User Details
			decoded = await jwt.verify(token, Config.auth.secret);
			records = await MockResults.aggregate([{$match: { userId: decoded._id } }]).sort({createdAt: -1});
			res.status(200).json({

				result: 'success',
				message: 'Successfully get all mock exam records.',
				data: {
					total: records.length,
					records: records
				}
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get mock exam records',
				error: e.message
			});
		}
	},
	getRecordDetails: async (req, res) => {
		let decoded, record;
		let token = req.headers.token;
		try {
			// Get User Details
			decoded = await jwt.verify(token, Config.auth.secret);
			record = await MockResults.findOne({
				$and: [
					{ _id: req.params.recordId },
					{ userId: decoded._id }
				]});
			res.status(200).json({
				result: 'success',
				message: 'Successfully get mock exam record details',
				data: {
					subject: record.subjectName,
					score: record.score,
					numberOfQuestions: record.numberOfQuestions,
					percentage: (record.score / record.numberOfQuestions)*100+' %',
					createdAt: record.createdAt
				}
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get mock exam record details.',
				error: e.message
			});
		}
	}
};

function hasUnique(myArray) {
	return myArray.length === new Set(myArray).size;
}

function doesContain(targets, reference) {
	let mismatch = 0;
	targets.forEach((target)=> {
		if (!reference.includes(target))
			mismatch++
	});

	if (mismatch > 0)
		return false
	else
		return true
}

module.exports = MockController;