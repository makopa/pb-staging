const User = require('./models/Users');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('./config');

const _user = new User({
	_id: new  mongoose.Types.ObjectId(),
	email: 'superuser@pinnacle.com',
	password: 'superpassword123',
	firstName: 'Super',
	lastName: 'User',
	subjectCode: "N/A",
	isAdmin: true					
});

_user.save().then(function (result) {
	res.status(200).json({
		message: 'New admin user has been created.'
	});
}, function (err) {
	console.log(err);
	res.status(500).json({
		error: err
	});
});