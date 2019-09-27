/* Packages */
const path = require('path');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');

/* Dependencies */
const config = require('../config');
require('dotenv').config();

/* MongoDB Settings */
const uri = config.db.atlasURI;
   
/* Storage Engine */
exports.storage = new GridFsStorage({
    url: uri,
    options: { useNewUrlParser: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    content_type: file.mimetype,
                    bucketName: 'uploads'
                };
                //console.log("[FILE][STORAGE]: " + JSON.stringify(fileInfo))
                resolve(fileInfo);
            });
        });
    }
});

/* File Filter Function */
exports.fileFilter = (req, file, callback) => {
    let ext = path.extname(file.originalname);
    let type = req.query.type.toUpperCase();
    if (type === 'LESSONS') {
        if (ext === '.pdf') {
            callback(null, true);
        } else {
            return callback(new Error('Only PDF files are allowed in this module.'))
        }
    } else if (type === 'SUBJECTS' || type === 'NEWS' || type === 'QUESTIONS') {
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        } else {
            callback(null, true) 
        }
    } else {
        return callback(new Error('Invalid type.'))
    }  
}