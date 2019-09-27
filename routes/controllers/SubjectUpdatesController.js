/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth;

/* Models */
const SubjectUpdates = require('../../models/SubjectUpdates');
const SubjectCode = require('../../models/SubjectCode');
const User = require('../../models/Users');

const SubjectUpdatesController = {
	getUpdates: async (req,res) => {
		let updates, decoded, user, subjectCode, data;
		let token = req.headers.token;
		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id});
			subjectCode = await SubjectCode.findOne({ subjectCode: user.subjectCode}); 
			updates = await SubjectUpdates.find();
		} finally {
			if (!decoded || !user) {
				res.status(401).json({ 
					result: 'failed',
					message: 'Unauthorized.' 
				});	
			} else if(!updates) {
				res.status(500).json({
					result: 'failed',
					message: 'Something went wrong.'
				});
			} else {
				data = [];
				let subjectIds = [];
				subjectCode.subjects.forEach((subject)=>{
					subjectIds.push(subject.subjectId);
				});
				
				updates.forEach((update)=> {
					if (subjectIds.indexOf(update.subjectId) > -1)
					data.push({
						id: update.id,
						subjectId: update.subjectId,
						topicId: update.topicId,
						lessonId: update.lessonId,
						description: update.description,
						name: update.name,
						updatedAt: update.updatedAt
					});
				});
				res.status(200).json({
					result: 'success',
					message: 'Successfully get subject updates',
					data: data
				});
			}
		}
	}	
};

module.exports = SubjectUpdatesController;