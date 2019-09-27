/* Dependencies */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

/* Config */
const config = require('../../config'); 

/* Models */
const User = require('../../models/Users');
const Profile = require('../../models/Profile');

const UserController =  {

	getUsers: async (req, res) => {

		// Search + filters
		let keyword = req.query.keyword;
		let isAdmin = req.query.isAdmin;
		let query = [{ $match: {isActive: true} }];
		let Users;
		if (isAdmin) {
			query.push({ $match: { isAdmin: !!isAdmin }});
		}
		if (keyword) {
			query.push( {$match:{ $or: [
					{"firstName": {'$regex': '^'+keyword, '$options' : 'i'}},
					{"lastName":{'$regex': '^'+ keyword, '$options' : 'i'}},
					{"email": {'$regex': '^'+keyword, '$options' : 'i'}}
				]} 
			});
		}

		// Pagination:
		let count = 0;
		let pageItems = parseInt(config.pagination.defaultItemsPerPage);
		let pageNumber = 1;

		let newBody = {
			pageNumber: 0,
			totalPages: 0,
			itemsPerPage: 0,
			totalItems: 0,
			items: [],
		}

		if (req.query.pageNumber) {
			pageNumber = parseInt(req.query.pageNumber);
		}

		if (req.query.pageItems) {
			pageItems = parseInt(req.query.pageItems);

		}

		try {

			count = await User.aggregate(query);
			count = count.length;
			Users = await User.aggregate(query).skip(pageItems*(pageNumber-1)).limit(pageItems);
			newBody.pageNumber = parseInt(pageNumber);
            newBody.totalPages = Math.ceil(count / pageItems);
            newBody.itemsPerPage = pageItems;
            newBody.totalItems = count;

            Users.forEach((user)=> {
            	newBody.items.push({
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					subjectCode: user.subjectCode,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					isArchive: user.isArchive,
					isAdmin: user.isAdmin,
					isActive: user.isActive
				});
            });

            res.status(200).json({
            	result: 'success',
            	message: 'Successfully get user list',
            	data: newBody
            });
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get list of users',
				error: e.message
			});
		}
		
	},

	getUser: async (req, res) => {

		let user, profile;

		try {
			user = await User.findOne({ _id: req.params.userId });
			if (user.isAdmin === false) {
				profile = await Profile.findOne({ userId: req.params.userId });
			}
			res.status(200).json({
				result: 'success',
				message: 'Successfully get user details.',
				data:{
					id: user._id,
					firstName: user.firstName,
					middleName: user.middleName,
					lastName: user.lastName,
					email: user.email,
					birthDate: profile.birthDate || '',
					gender: profile.gender || '',
					school: profile.school || '',
					subjectCode: user.subjectCode || '',
					updatedAt: user.updatedAt || '',
					createdAt: user.createdAt || '',
					isActive: user.isActive || '',
					isArchive: user.isArchive,
					isAdmin: user.isAdmin
				}
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Something went wrong.',
				error: e.message
			});
		}
	},

	createUser: async (req, res) => {
		let _password = Math.random().toString(36).substr(2, 10).toUpperCase();
		let hash, user, saveUser, sendMail;

		let transporter = nodemailer.createTransport({
		    host: config.mail.host,
		    secureConnection: config.mail.secureConnection,
		    port: config.mail.port,
		    auth: {
		        user: config.mail.auth.user,
		        pass: config.mail.auth.password
		    }
		});

		try {
			hash = await bcrypt.hash(_password,10);
			user = await User.findOne( { email: req.body.email } );
		} finally {
			if (!hash) {
				res.status(500).json({
					result: 'failed',
					message: 'Something went wrong.'
				});
			} else if (user) {
				res.status(400).json({
					result: 'failed',
					message: 'Email already taken.'
				});
			} else if (!user && hash) {
				let _user = new User({
					_id: new mongoose.Types.ObjectId(),
					email: req.body.email,
					password: hash,
					firstName: req.body.firstName,
					middleName: req.body.middleName,
					lastName: req.body.lastName,
					subjectCode: req.body.subjectCode,
					isArchive: false,
					isActive: true,
					isAdmin: req.body.isAdmin || false,
					createdAt: Date.now(),
					updatedAt: Date.now()					
				});

				saveUser = await _user.save();
				if (!saveUser) {
					res.status(500).json({
						result: 'failed',
						message: 'User saving failed.'
					});
				} else {
					let mailOptions = {
						from: `Pinnacle Review School <${config.mail.auth.user}>`,  
						to: saveUser.email,
						subject: 'Pinnacle App Account Registration',
						html: '<p>Congratulations! Your Account has been created. <br><br>Temporary Password : ' + _password + '<br><br>Please Change your password using the link below.<br></p>'
					};
					sendMail = await transporter.sendMail(mailOptions);
					if (sendMail) {
						console.log('Email has been sent to '+ saveUser.email);
						res.status(200).json({
							result: 'success',
							message: 'New user has been created. An Email has been sent to '+ req.body.email,
							data: saveUser
						});
					} else {
						res.status(500).json({
							result: 'failed',
							message: 'Email sending failed.'
						});
					}
				}
			}
		}
	},

	deleteUser: async (req, res) => {
		// Deactivate User (Archive)
		let user, archiveUser;
		try {
			user = await User.findOne({_id: req.params.userId});
		} finally {
			if (!user) {
				res.status(200).json({
					result: 'failed',
					message: 'User does not exist.'
				});
			} else {
				archiveUser = await User.findOneAndUpdate(
					{ _id: req.params.userId },
					{ $set: {
						isActive: false,
						isArchive: true,
					}},
					{ new: true }
				);				
				res.status(200).json({
					result: 'success',
					message: 'User successfuly archived.',
					data: archiveUser
				});	
			}		
		}
	},

	reactivateUser: async (req,res) => {
		// Re activate User account (Unarchive)
		let user, activateUser;
		try {
			user = await User.findOne({_id: req.params.userId});
		} finally {
			if (!user) {
				res.status(200).json({
					result: 'failed',
					message: 'User does not exist.'
				});
			} else {
				activateUser = await User.findOneAndUpdate(
					{ _id: req.params.userId },
					{ $set: {
						isActive: false,
						isArchive: false,
					}},
					{ new: true }
				);				
				res.status(200).json({
					result: 'success',
					message: 'User account successfuly reactivated.',
					data: activateUser
				});	
			}		
		}
	},

	updateUser: async (req, res) => {
		// update user detials
		let user, updateUser;
		try {
			user = await User.findOne({ _id: req.params.userId });
			updateUser = await User.findOneAndUpdate(
				{ _id : user._id },
				{ $set: {
					email: req.body.email,
					firstName: req.body.firstName,
					middleName: req.body.middleName,
					lastName: req.body.lastName,
					subjectCode: req.body.subjectCode,
					updatedAt: Date.now()
				}},
				{ new: true }
			);
			console.log(updateUser);
			res.status(200).json({
				result: 'success',
				message: 'User Details successfuly updated.',
				data: {
					email: updateUser.email,
					firstName: updateUser.firstName,
					middleName: updateUser. middleName,
					lastName: updateUser.lastName,
					subjectCode: updateUser.subjectCode,
					updatedAt: updateUser.updatedAt
				}
			}); 
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update user details',
				error: e.message
			});
		}
	}
}

module.exports = UserController;