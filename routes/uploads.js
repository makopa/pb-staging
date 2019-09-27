/* Packages */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

/* Config */
require('dotenv').config();
const config = require('../config'); 

/* Services */
const GridFSService = require('../services/GridFS');

/* Controllers */
const SessionController = require('./controllers/SessionController');

/* Setup - Storage Engine */
const upload = multer({ 
	storage: GridFSService.storage,
	fileFilter: GridFSService.fileFilter
}).single('file');


/* MongoDB Settings */
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

/* Localhost Db*/
// const mongoURI = 'mongodb://localhost/pinnacle';

/* Mongodb Atlas */
const mongoURI = config.db.atlasURI;

/* Create mongo connection */
const conn = mongoose.createConnection(mongoURI);

/* Initialize GridFS */ 
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

/* Routes */

/* Upload - Admin */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, (req,res)=> {
	upload(req, res, (err)=> {
		if(err) {
			res.status(400).json({
				message: err.message
			});
		} else {
			res.json({ file: req.file });
		}
	});
});	

/* Delete File - Admin */
router.delete('/:fileId', SessionController.validateApp, SessionController.validateAdminToken, (req, res) => {
	gfs.remove({ _id: req.params.fileId, root: 'uploads'}, (err, gridStore) => {
		if (err) {
			res.status(400).json({
				message: 'Failed to delete file.'
			});
		} else {
			res.status(200).json({
				message: 'File successfully deleted.'
			});
		}
	});
});

/* Get List of Files */
router.get('/list', SessionController.validateApp, SessionController.validateAdminToken, (req,res) => {
	gfs.files.find().toArray((err, files) => {
		let newBody = [];
	    if (!files || files.length === 0) {
	      	res.status(400).json({
	      		message: 'File Server is Empty.'
			});
	    } else {
	    	files.forEach((file)=>{
	    		newBody.push({
	    			id: file._id,
	    			filename: file.filename,
	    			size: file.length/1000 + 'kb',
	    			uploadDate: file.uploadDate,
	    			contentType: file.contentType
	    		});
	    	});
	      	res.status(200).json(newBody);
	    }
  	});
});

/* Get Single File */
router.get('/:filename', SessionController.validateApp, (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
		if (!file || file.length === 0) {
		  	return res.status(404).json({
		    	message: 'File Does not Exist.'
			});
		}
		
		// console.log(file.contentType);
		res.set({
			'content-type': file.contentType
		});

		let readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
	});
});

module.exports = router;