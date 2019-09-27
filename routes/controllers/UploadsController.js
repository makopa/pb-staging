const config = require('../../config').auth;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Directory = require('../../Services/Directory');

const UploadsController = {

	uploadSingle: (req, res, next) => {
		let dir = 'uploads';
		let dir2 = req.params.directory;
		if(dir2) {
			dir += '/'+req.params.directory;
		}
		
		if (!Directory.validateDirectory(dir)) {
			res.status(400).json({
	      		message: 'Invalid Directory.',
	      		directory: dir
	      	});
		} else {
			let storage = multer.diskStorage({
				destination: function (req, file, cb) {
				    cb(null, dir)
				},
			  	filename: function (req, file, cb) {
					cb(null, (dir2 || 'uploads') + '-' + Date.now() + path.extname(file.originalname))
				}
			});

			let upload = multer({
				storage: storage,
				fileFilter: (req, file, cb) => {
					let ext = path.extname(file.originalname);
					if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
			            return cb(new Error('Only images are allowed'));
			        }
			        cb(null, true);
				}
			}).single('file');

			upload(req, res, function(err) {
				if ( err instanceof multer.MulterError ) {
					res.status(400).json({
			      		message: 'Invalid fieldname. Use file as fieldname.'
			      	});
				} else if (err) {
			      	res.status(400).json({
			      		message: 'Only Images are allowed.'
			      	});
			    } else {
			    	next();
			    }
			});
		}
	},

	sendFilename: (req, res) => {
		let file = req.file || '';
		if(!file){
			res.status(400).json({
				message: 'file is required.'
			});
		} else {
			res.status(200).json({
				path: file.filename
			});
		}
	},

	getFile: async (req, res) => {
		let validateDirectory, validateFile;

		try {
			validateDirectory = await Directory.validateDirectory('uploads/'+req.params.directory);
			validateFile = await Directory.validateFile('./uploads/'+req.params.directory, req.params.fileName);
		} finally {
			if (!validateDirectory) {
				res.status(400).json({
					message: 'Invalid Directory'
				});
			} else if (!validateFile) {
				res.status(400).json({
					message: 'File not found.'
				});
			} else {
				// Create Stream
				let stream = fs.createReadStream('uploads/'+req.params.directory+'/'+req.params.fileName);
				stream.on('error', function(error) {
		            res.writeHead(404, 'Not Found');
		            res.end();
		        });

		        stream.pipe(res);
			} 
		}
	}
}

module.exports = UploadsController;