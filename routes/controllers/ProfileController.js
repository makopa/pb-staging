/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth;

/* Models */
const Profile = require('../../models/Profile');
const SubjectCode = require('../../models/SubjectCode');
const User = require('../../models/Users');

const ProfileController = {

	getProfile : async (req, res) => {
		// Get Profile

		let token = req.headers['token'];
		let decoded, user, profile, subjectCode

		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id });
			profile = await Profile.findOne({ userId: decoded._id}) || {};
			subjectCode = await SubjectCode.findOne({ userId: decoded._id}) || {};
		} finally {
			res.status(200).json({
				user: {
					id: user._id,
					email: user.email,
					firstName: user.firstName || '',
					lastName: user.lastName || '',
					birthDate: profile.birthDate || '',
					gender: profile.gender || '',
					school: profile.school || '',
					updatedAt: profile.updatedAt || '',
				},
				subjects: {
					subjectCode: subjectCode.subjectCode || '',
					list: subjectCode.subjects || [],
					activatedAt: subjectCode.activatedAt || '',
					expiresAt: subjectCode.expiresAt || ''
				}
			});
		}
	},

	updateProfile: async (req, res) => {
		// Update Profile
		let token = req.headers['token'];
		let decoded, checkProfile;
		
		try {
			
			decoded = await jwt.verify(token, config.secret);
			checkProfile = await Profile.findOne({ userId: decoded._id});

		} finally {
			/*  Update if there is an existing profile */	
			if (checkProfile) {
				let updateQuery = {
					updatedAt: Date.now()
				};
				//update only field is not null/empty
				req.body.birthDate ? updateQuery.birthDate = req.body.birthDate : '';
				req.body.gender ? updateQuery.gender = req.body.gender : '';
				req.body.school ? updateQuery.school = req.body.school : '';

				await Profile.findOneAndUpdate(
					{ userId: decoded._id },
					{ "$set": updateQuery},
					{ "new": true });

				res.status(200).json({
					message: 'Profile successfuly updated.'
				});
			} else {
				/* Create new Profile if no existing */
				const _profile = new Profile ({
						_id: new mongoose.Types.ObjectId(),
						userId: decoded._id,
						birthDate: req.body.birthDate,
						gender: req.body.gender,
						school: req.body.school
					});

				await _profile.save() 
				res.status(200).json({
					message: 'Profile has been created.'
				});
			}
			
		}
	},	
}

module.exports = ProfileController;