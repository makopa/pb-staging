/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../../config'); 

/* Models */
const User = require('../../models/Users');
const ActivityController = require('./ActivityController');
const Subject = require('../../models/Subject');
const SubjectCode = require('../../models/SubjectCode');
const SubjectCodesSent = require('../../models/SubjectCodesSent');

const tag = 'Subscription';


// Nodemailer Options
const transporter = nodemailer.createTransport({
    host: config.mail.host,
    secureConnection: config.mail.secureConnection,
    port: config.mail.port,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.password
    }
});

const SubjectController = {

	generateSubjectCode: async (req, res) => {

		let _subjects = [];
		let subjects;
		let list = {};
		// Subject code count to be generated
		let count = req.body.count || 1;
		// Organization Name 
		let organizationName = req.body.organizationName || '';
		// email 
		let email = req.body.email;
		// Container of subject codes
		let docs = [];

		try {
			// Validations
			if (!email) {
				throw new Error("Email address is required")
			}

			// Get Subjects
			subjects = await Subject.find();

			// Get all Subject Names
			// { subjectId: subjectName };

			if(subjects) {
				subjects.forEach((subject) => {
					list[subject._id] = subject.name
				});
			}

			if(req.body.subjects.length < 1) {
				res.status(500).json({
					message: 'Atleast 1 subject is required.'
				});
			} else {
				req.body.subjects.forEach((subject)=>{
					_subjects.push({
						subjectId: subject,
						name: list[subject] || '',
					});
				});	
			}

			// Generate Subject codes based on count
			for (i = 0; i < count; i++) {
				let subjectCode = Math.random().toString(36).substr(2, 8).toUpperCase();
				docs.push({
					_id: new mongoose.Types.ObjectId(),
					subjectCode: subjectCode,
					subjects: _subjects,
					organizationName: organizationName,
					createdAt: Date.now()
				});
			}

			// Save subject Codes to DB

			let saveSubjectCodes = await SubjectCode.insertMany(docs);

			// Store List of saved Subject Codes
			let savedIds = [];
			saveSubjectCodes.forEach((code)=> {
				savedIds.push(code.subjectCode);
			});

			let codesToString = '';

			// Send Email 
			savedIds.forEach((id, index)=> {
				codesToString += (index+1)+'. <b>' +id + '</b><br>';
			});

			let mailOptions = {
				from: `Pinnacle Review School <${config.mail.auth.user}>`,  
				to: email,
				subject: 'Pinnacle App Subject Code Purchase',
				html: '<p>Congratulations! Your Subject Code(s) are now ready for activation! <br><br>'+
				'Organization Name: ' + saveSubjectCodes[0].organizationName + '<br><br>'+
				'Subject Codes: <br><br>'+ codesToString + '<br>'+
				'Activate your Subject Codes by using the mobile or web app.<br></p>'
			};

			let sendMail = await transporter.sendMail(mailOptions);

			// to be used when resending emails
			let saveMessage = new SubjectCodesSent ({
				_id: new mongoose.Types.ObjectId(),
				to: mailOptions.to,
				subject: mailOptions.subject,
				organizationName: organizationName,
				html: mailOptions.html,
				createdAt: Date.now()
			});

			await saveMessage.save();

			// Response
			res.status(200).json({
				result: 'success',
				message: 'Subject Code(s) has been successfully generated and has been sent to '+email,
				data: {
					organizationName: saveSubjectCodes[0].organizationName,
					createdAt: saveSubjectCodes[0].createdAt,
					codes: savedIds
				}
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to generate subject code.',
				error: e.message
			});
		}	
	},

	getSubjectCodes: async (req, res) => {

		let subjectCodes;
		let query = [{ $match: { createdAt: { $exists: true }} }];

		// Search
		let keyword = req.query.keyword;
		if (keyword) {
			query.push( {$match:{ $or: [
					{"email": {'$regex': keyword, '$options' : 'i'}},
					{"organizationName":{'$regex': keyword, '$options' : 'i'}}
				]} 
			});
		}

		// Pagination:
		let count = 0;
		let pageItems = parseInt(config.pagination.defaultItemsPerPage);
		let pageNumber = 1;

		let data = {
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
			count = await SubjectCode.aggregate(query);
			count = count.length;
			subjectCodes = await SubjectCode.aggregate(query).skip(pageItems*(pageNumber-1)).limit(pageItems);
			data.pageNumber = parseInt(pageNumber);
            data.totalPages = Math.ceil(count / pageItems);
            data.itemsPerPage = pageItems;
            data.totalItems = count;

            subjectCodes.forEach((code)=>{
            	data.items.push({
					id: code._id,
					subjectCode: code.subjectCode,
					userId: code.userId || '',
					subjects: code.subjects,
					organizationName: code.organizationName || '',
				});
            });

            res.status(200).json({
            	result: 'success',
            	message: 'Successfully get subject codes list.',
            	data: data
            });
		} catch (e) {
			res.status(500).json({
				result: 'success',
				message: 'Failed to get list of subject codes.',
				error: e.message
			})
		}
	},

	getSubjectCode: async (req, res) => {
		let subjectCode;
		try {
			subjectCode = await SubjectCode.findOne({ _id: req.params.subjectCodeId });
		} finally {
			if(!subjectCode) {
				res.status(400).json({
					result: 'failed',
					message: 'Subject code does not exist.'
				});
			} else {
				res.status(200).json({
					result : 'success',
					message: 'Successfully get subject code details.',
					data: {
						id: subjectCode._id,
						subjectCode: subjectCode.subjectCode,
						userId: subjectCode.userId || '',
						organizationName: subjectCode.organizationName,
						createdAt: subjectCode.createdAt,
						activatedAt: subjectCode.activatedAt || '',
						expiresAt: subjectCode.expiresAt || '',
						subjects: subjectCode.subjects
					}
				});
			}
		}
	},

	getSubscription: async (req, res) => {
		let token = req.headers['token'];
		let decoded, user, subjectCode, newBody;
		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id});
			subjectCode = await SubjectCode.findOne({ subjectCode: user.subjectCode}); 
		} finally {
			if (!decoded || !user) {
				res.status(401).json({ 
					result: 'failed',
					message: 'Unauthorized.' 
				});		
			} else if (!subjectCode) {
				res.status(400).json({ 
					result: 'failed',
					message: 'You are currently unsubscribed. Please activate a subject code.' 
				});	
			} else {
				newBody = {
					result: 'success',
					message: 'Successfully get subscription details.',
					data: {
						id: subjectCode._id,
						subjectCode: subjectCode.subjectCode,
						userId: subjectCode.userId,
						subjects: subjectCode.subjects,
						createdAt: subjectCode.createdAt,
						activatedAt: subjectCode.activatedAt,
						expiresAt: subjectCode.expiresAt					
					}
				};
				res.status(200).json(newBody);
			}	
		}
	},

	activateSubjectCode: async (req, res) => {
		let token = req.headers['token'];
		let decoded, user, subjectCode, userResult, subjectCodeResult;

		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id});
			subjectCode = await SubjectCode.findOne({ subjectCode: req.body.subjectCode});
			
		} finally {
			// Validate User
			if (!user || !decoded) {
				res.status(401).json({ 
					result: 'failed',
					message: 'Unauthorized.' 
				});	
			// Validate if user has a subject code
			} else if (user.subjectCode) {
				res.status(400).json({ 
					result: 'failed',
					message: 'You already have a subject code.' 
				});
			// Validate if subject code exists
			} else if (!subjectCode) {
				res.status(400).json({
					result: 'failed', 
					message: 'Subject code does not exist.' 
				});
			// Validate if subject code is already used
			} else if (subjectCode.userId) {
				res.status(400).json({ 
					result: 'failed',
					message: 'Subject code already used.' 
				});
			// Activate Subject Code
			} else if (!subjectCode.userId && !user.subjectCode){

				userResult = await User.findOneAndUpdate({ _id: decoded._id },
					{ "$set": {
						subjectCode: req.body.subjectCode
					}},
					{ "new": true });
				
				subjectCodeResult = await SubjectCode.findOneAndUpdate(
					{ subjectCode: req.body.subjectCode },
					{ "$set": {
						userId: decoded._id,
						activatedAt: Date.now(),
						expiresAt: new Date(Date.now()+(43200*1000*2*31*6))
					}},
					{ "new": true });
				// Validate if successful
				if (userResult && subjectCodeResult) {
					res.status(200).json({
						result: 'success',
						message: 'Subject Code has been activated.',
						data: {
							activatedBy: decoded.email,
							subjectCode: userResult.subjectCode,
							activatedAt: subjectCodeResult.activatedAt,
							expiresAt: subjectCodeResult.expiresAt
						}
					});

					let details = {
						module: tag,
						subjectCode: subjectCodeResult.subjectCodes,
						subjects: subjectCodeResult.subjects,
						activatedAt: subjectCodeResult.activatedAt,
						expiresAt: subjectCodeResult.expiresAt
					};

					ActivityController.addActivity(details, decoded._id);
				} else {
					res.status(500).json({ 
						message: 'Something went wrong.' 
					});
				}
			} else {
				res.status(500).json({ 
					message: 'Something went wrong.' 
				});
			} 
		}	
	},

	// Depreciated - Use resend instead
	sendSubjectCode: async (req,res) => {
		// Send Subject Code to user email 
		let subjectCode, user; 

		try {
			subjectCode = await SubjectCode.findOne({ subjectCode: req.body.subjectCode});
			user = await User.findOne({ email: req.body.email});
		} finally {
			if(!user) {
				res.status(400).json({ 
					result: 'failed',
					message: 'Email address is not yet enrolled.' 
				});
			} else if (!subjectCode) {
				res.status(400).json({ 
					result: 'failed',
					message: 'Subject code does not exist.' 
				});
			} else {
				let mailOptions = {
						from: `Pinnacle Review School <${config.mail.auth.user}>`,  
						to: user.email,
						subject: 'Pinnacle App Subject Code',
						html: '<p>Congratulations! You have successfuly purchased a subject code! <br><br>Subject Code : ' + subjectCode.subjectCode + '<br><br>Activate your subcription by using the mobile or web app.<br></p>'
					};
				sendMail = await transporter.sendMail(mailOptions);
				if (!sendMail) {
					res.status(500).json({
						result: 'failed',
						message: 'Email sending failed. Please try again.'+ req.body.email
					});
				} else {
					res.status(200).json({
						result: 'success',
						message: 'Subject code has been sent to '+ req.body.email
					});
					console.log('Email has been sent to '+ user.email);				
				}
			}
		}
	},

	resendSubjectCodes: async (req, res) => {
		let sentCodes, resendEmail;
		let sentCodesId = req.body.id;
		let email = req.body.email;

		try {
			sentCodes = await SubjectCodesSent.findOne({ _id: sentCodesId });
			let mailOptions = {
				from: `Pinnacle Review School <${config.mail.auth.user}>`,  
				to: email,
				subject: sentCodes.subject,
				html: sentCodes.html
			};

			resendEmail = await transporter.sendMail(mailOptions);

			res.status(200).json({
				result: 'success',
				message: 'Email has been sent to '+ email
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to resend email.',
				error: e.message
			});
		}
	},

	getSentSubjectCodes: async (req, res) => {
		let sentCodes;
		let query = [{ $match: { createdAt: { $exists: true }} }];

		// Search
		let keyword = req.query.keyword;
		if (keyword) {
			query.push( {$match:{ $or: [
					{"to": {'$regex': keyword, '$options' : 'i'}},
					{"organizationName":{'$regex': keyword, '$options' : 'i'}}
				]} 
			});
		}

		// Pagination:
		let count = 0;
		let pageItems = parseInt(config.pagination.defaultItemsPerPage);
		let pageNumber = 1;

		let data = {
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
			count = await SubjectCodesSent.aggregate(query);
			count = count.length
			sentCodes = await SubjectCodesSent.aggregate(query).skip(pageItems*(pageNumber-1)).limit(pageItems);;
			data.pageNumber = parseInt(pageNumber);
            data.totalPages = Math.ceil(count / pageItems);
            data.itemsPerPage = pageItems;
            data.totalItems = count;
            sentCodes.forEach((code)=> {
            	data.items.push({
            		id: code._id,
            		to: code.to,
            		subject: code.subject,
            		organizationName: code.organizationName,
            		content: code.html,
            		createdAt: code.createdAt
            	});
            });

			res.status(200).json({
				result: 'success',
				message: 'Successfully get list of sent subject codes',
				data: data
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get list of sent subject codes.',
				error: e.message
			});
		}
	}
}

module.exports = SubjectController;