/* Dependencies */
const mongoose = require('mongoose');

/* Models */
const Question = require('../../models/Question');
const Topic = require('../../models/Topic');
const PracticeControl = require('../../models/PracticeControl');
const Subject = require('../../models/Subject');

const Config = require('../../config');

// Default number of questions
const defaultNumberOfQuestions = parseInt(Config.questions.practiceCount);

const PracticeController = {

	getPracticeControls: async (req, res) => {
		let practiceControls;
		try {
			practiceControls = await PracticeControl.find();
			res.status(200).json({
				result: 'success',
				message: 'Successfully get all practice controls',
				data: practiceControls
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get practice controls',
				error: e.message
			});
		}
	},

	createPracticeControls: async (req, res) => {
		let topic, controls, saveControls, exists;
		exists = await PracticeControl.findOne({ topicId: req.body.topicId });

		try {
			// If controls on that topic exists, throw error.
			if (exists)
				throw new Error('Practice controls already exisits. Please use update instead.');
			// Validate number of questions
			if (req.body.numberOfQuestions < defaultNumberOfQuestions)
				throw new Error('Number of questions must be equal or more than '+defaultNumberOfQuestions+'.');	
			// Find Topic
			topic = await Topic.findOne({ _id :req.body.topicId });
			if (!topic) 
				throw new Error('Topic does not exist.');	

			controls = new PracticeControl({
				_id: new mongoose.Types.ObjectId(),
				topicId: req.body.topicId,
				numberOfQuestions: req.body.numberOfQuestions,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
			saveControls = await controls.save();

			res.status(200).json({
				result: 'success',
				message: 'New Practice Controls has been save.',
				data: saveControls
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create practice controls',
				error: e.message
			});
		}
 	},

	updatePracticeControls: async (req, res) => {
		let updatePracticeControls, controls;
		console.log(defaultNumberOfQuestions);
		try {
			controls = await PracticeControl.findOne({ _id: req.params.id });
			if(req.body.numberOfQuestions < defaultNumberOfQuestions) {
				throw new Error(`Number of questions must be more than `+defaultNumberOfQuestions+`.`);
			}

			updatePracticeControls = await PracticeControl.findOneAndUpdate(
				{ _id: req.params.id },
				{ "$set": {
					numberOfQuestions: req.body.numberOfQuestions,
					updatedAt: Date.now()
				}},
				{ $new: true });
			res.status(200).json({
				result: 'success',
				message: 'Practice controls exam successfully updated.',
				data: updatePracticeControls
			});

		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update practice controls',
				errror: e.message
			});
		}
	},

	deletePracticeControls: async (req, res) => {
		let deletePracticeControls, controls;
		try {
			controls = await PracticeControl.findOne({ _id: req.params.id });
			if (!controls) 
				throw new Error('Practice Control not found.')
			deletePracticeControls = await PracticeControl.findOneAndDelete({ _id: req.params.id });
			res.status(200).json({
				result: 'success',
				message: 'Practice Controls has been successfully deleted.',
				data: deletePracticeControls
			})
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to delete practice controls',
				error: e.message
			});
		}
	},

	generatePractice: async (req, res) => {
		let topic, questions, controls;
		let practice = {
			total: 0,
			items: []
		}
		let numberOfQuestions = defaultNumberOfQuestions;

		controls = await PracticeControl.findOne({ topicId: req.params.topicId });
		if (controls) 
			numberOfQuestions = controls.numberOfQuestions; 

		try {
			topic = await Topic.findOne({ _id: req.params.topicId });
			if(!topic)
				throw new Error('Topic not found.');
			questions = await Question.aggregate([{ $sample: {size: numberOfQuestions} }]);
			practice.size = questions.length;
			practice.items = questions;
			res.status(200).json({
				result: 'success',
				message: 'Successfully generated practice exam',
				data: practice
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Something went wrong.',
				error: e.message
			});
		}
	}	
}


module.exports = PracticeController;