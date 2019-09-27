/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth; 

/* Models */
const Topic = require('../../models/Topic');
const Subject = require('../../models/Subject');
const User = require('../../models/Users');
const SubjectUpdates = require('../../models/SubjectUpdates');

const TopicController = {

	/* Create new Topic */
	createTopic: async (req, res) => {

		let subject, topicCount, _topic, saveTopic;

		try {
			subject = await Subject.findOne( { _id: req.params.subjectId } ); 
			topicCount = await Topic.count( { subjectId: req.params.subjectId } );

			_topic = new Topic ({
				_id: new mongoose.Types.ObjectId(),
				description: req.body.description,
				topicNumber: topicCount + 1 ,
				subjectId: req.params.subjectId,
				lessons: req.body.lessons,
				createdAt: Date.now(),
				isArchive: false
			});

			saveTopic = await _topic.save();
			res.status(200).json({
				result: 'success',
				message: "Topic Successfully added.",
				data: {
					id: saveTopic._id,
					description: saveTopic.description,
					subjectId: saveTopic.subjectId,
					lessons: saveTopic.lessons,
					createdAt: saveTopic.createdAt,
					isArchive: saveTopic.isArchive
				}
			});
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create new topic',
				errror: e.message
			});
		}
	},

	/* Get All Topics on a subject */
	getTopics: async (req, res) => {
		let token = req.headers['token'];
		let subject, topics, user, decoded;
		let data = [];
		let query = { 
			$and: [
				{ subjectId: req.params.subjectId },
				{ isArchive: false }
			]};
		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id});
			
			// Show only unarchived topics on non-admin users
			if (user.isAdmin === false) {
				query.$and.push({ isArchive: false });
			}

			subject = await Subject.findOne( { _id: req.params.subjectId } );
			topics = await Topic.find(query);
		} finally {

			if (!decoded) {
				res.status(401).json({
					result: 'failed',
					message: 'Unauthorized'
				});
			} else if (!subject) {
				res.status(400).json({
					result: 'failed',
					message: 'Subject does not exist.'
				});
			} else if (!topics) {
				res.status(500).json({
					result: 'failed',
					message: 'Failed to get topic'
				});
			} else {
				topics.forEach((topic) => {
					data.push({
						id: topic._id,
						topicNumber: topic.topicNumber,
						description: topic.description,
						subjectId: topic.subjectId,
						lessons: topic.lessons,
						createdAt: topic.createdAt,
						isArchive: topic.isArchive
					});
				});
				res.status(200).json({
					result: 'success',
					message: 'Successfully get list of topics.',
					data: data
				});
			}
		}
	},

	/* Get Topic Details */
	getTopic: async (req, res) => {
		
		let topic;

		try {
			topic = await Topic.findOne({
				$and: [
					{ _id: req.params.topicId},
					{ subjectId: req.params.subjectId}
				]
			});
		} finally {
			if (!topic) {
				res.status(400).json({
					result: 'failed',
					message: 'Topic does not exist.'
				});
			} else {
				res.status(200).json({
					result: 'success',
					message: 'Successfully get topic details.',
					data:{
						id: topic._id,
						topicNumber: topic.topicNumber,
						description: topic.description,
						subjectId: topic.subjectId,
						lessons: topic.lessons,
						createdAt: topic.createdAt,
						isArchive: topic.isArchive
					}
				});
			}
		}

	},

	/* Update Topic */
	updateTopic: async (req, res) => {
		let topic, updateTopic, subject;
		try {
			topic = await Topic.findOne({
				$and: [
					{ _id: req.params.topicId},
					{ subjectId: req.params.subjectId}
				]
			});
			subject = await Subject.findOne({ _id: topic.subjectId });
			updateTopic = await Topic.findOneAndUpdate(
				{ _id: req.params.topicId},
				{ $set: {
					description: req.body.description,
					topicNumber: req.body.topicNumber,
					lessons: req.body.lessons,
					isArchive: req.body.isArchive,
					updatedAt: Date.now()
				}},
				{ new: true }
			);
			
			res.status(200).json({
				result: 'success',
				message: 'Topic details successfuly updated.',
				data: {
					id: updateTopic._id,
					description: updateTopic.description,
					topicNumber: updateTopic.topicNumber,
					subjectId: updateTopic.subjectId,
					lessons: updateTopic.lessons,
					createdAt: updateTopic.createdAt,
					updatedAt: updateTopic.updatedAt,
					isArchive: updateTopic.isArchive
				}
			});

		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update topic details.',
				error: e.message
			})
		}
	},

	/* Archive topics */
	archiveTopic: async (req, res)=> {
		let topic, updateTopic;
		try {
			topic = await Topic.findOne({
				$and: [
					{ _id: req.params.topicId},
					{ subjectId: req.params.subjectId}
				]
			});
			updateTopic = await Topic.findOneAndUpdate(
				{ _id: req.params.topicId},
				{ $set: {
					isArchive: true
				}},
				{ new: true }
			);

			res.status(200).json({
				result: 'success',
				message: 'Topic successfuly archived.',
				data: updateTopic
			});
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Something went wrong.',
				error: e.message
			});
		}
	}
}

module.exports = TopicController;