/* Dependencies */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config').auth; 

/* Models */
const Activity = require('../../models/Activity');
const mongoose = require('mongoose');
const User = require('../../models/Users');

const ActivityController = {
	
	addActivity: async (details, userId) => {
		let result, _recentActivity;	
		try {
			// Save recent activity
			_recentActivity = new Activity ({
				_id: new mongoose.Types.ObjectId(),
				userId: userId,
				details: details,
				date: Date.now()
			});

			await _recentActivity.save();
		} finally {
			if (!_recentActivity) {
				console.log('failed to log activity');
			} else {
				console.log("["+_recentActivity.date+"][userId: "+userId+"]["+JSON.stringify(details)+"]");
			}
		}
	},

	getRecentActivities: async (req, res) => {
		let recentActivity, decoded;
		let newBody = {
			result: "",
			message: "",
			data: []
		};
		let token = req.headers['token'];

		try {
			decoded = await jwt.verify(token, config.secret);
			recentActivity = await Activity.find({ userId: decoded._id}).sort({"date": -1});
		} finally {
			if (!decoded) {
				res.status(401).json({
					message: 'Unauthorized.'
				});
			} else if (!recentActivity){
				res.status(200).json(newBody);
			} else if (recentActivity){
				newBody.result = "success",
				newBody.message = "Successfully get recent activities."
				await recentActivity.forEach((activity)=> {
					newBody.data.push({
						id: activity._id,
						details: activity.details,
						date: activity.date
					});
				});
				res.status(200).json(newBody);
			}
		}

	}
}


module.exports = ActivityController;