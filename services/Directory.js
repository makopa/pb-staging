const fs = require('fs');
const directories = [
	'uploads',
	'uploads/images',
	'uploads/questions',
	'uploads/subjects',
	'uploads/lessons',
	'uploads/public'
];

exports.initialize = () => {
	directories.forEach((dir)=> {
		if(!fs.existsSync(dir)){
			fs.mkdirSync(dir);
			console.log('[Setup] Directory Initialize: '+dir+' has been created.');
		}			
	});	
}

exports.validateDirectory = (dir) => {
	if(directories.indexOf(dir) > -1) {
		return true
	} else {
		return false
	}
}

exports.validateFile = (dir, fileName) => {
	if(fs.existsSync(dir+'/'+fileName)) {
		return true
	} else {
		return false
	}
}