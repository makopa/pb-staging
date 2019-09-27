/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth; 

/* Model */
const School = require('../../models/School');
const User = require('../../models/Users');

const SchoolController = {

	addSchools: async (req, res) => {
		let saveSchools;
		let docs = [];
		req.body.forEach((school)=>{
			docs.push({
				_id: new mongoose.Types.ObjectId(),
				name: school,
				isArchive: false
			});
		});

		try {
			saveSchools = await School.insertMany(docs);
			res.status(200).json({
				result: 'success',
				message: 'Schools successfully added.',
				data: saveSchools
			});
		} catch (e) {
			res.status(200).json({
				result: 'failed',
				message: 'Failed to add schools.',
				error : e.message
			});
		}
	},

	updateSchool: async (req, res) => {
		let school, updateSchool
		try {
			school = await School.findOne({ _id: req.params.schoolId });
		} finally {
			if (!school) {
				res.status(400).json({
					result: 'failed',
					message: 'School does not exist.'
				});
			} else {
				updateSchool = await School.findOneAndUpdate(
					{ _id: req.params.schoolId },
					{ $set: {
						name: req.body.name,
						isArchive: req.body.isArchive
					}},
					{ new: true }
				);
				if (!updateSchool) {
					res.status(500).json({
						result: 'failed',
						message: 'Failed to update school.'
					});
				} else {
					res.status(200).json({
						result: 'success',
						message: 'School details successfully updated.',
						data: updateSchool
					});
				}
			}
		}
	},

	getSchools: async (req, res) => {
		let schools;
		try {
			schools = await School.find().sort( {name: 1} );
		} finally {
			if(!schools) {
				res.status(500).json({
					result: 'failed',
					message: 'Failed to get list of schools'
				});
			} else {
				let newBody = {
					result: 'success',
					message: 'successfully get list of schools.',
					data: []
				};
				schools.forEach((school)=> {
					newBody.data.push({
						_id: school.id,
						name: school.name,
						isArchive: school.isArchive
					});
				});
				res.status(200).json(newBody);
			}
		}
	}
};

module.exports = SchoolController;