/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth;

/* Models */
const models = require('../../models/Goal');

const GoalController = {
    addPreGoal: (req, res) => { //add pre goal admin only
        let preGoal = models.PreGoal({
            _id: new mongoose.Types.ObjectId(),
            goalType: req.body.goalType,
            description: req.body.description,
            isArchive: req.body.isArchive //boolean
        });

        preGoal.save((err, preGoal) => {
            if (err) {
                res.status(500).json({
                    result:'failed',
                    message: `insert failed. ${err}`,
                });
            } else {
                res.status(200).json({
                    result: 'success',
                    message: 'New predefined goal has beed added.',
                    data: preGoal
                });
            }
        });
    },
    getAllPreGoal: (req, res) => { //get all predefined goal admin/regular user
        models.PreGoal.find({}, (err, goals) => {
            if(err) {
                res.status(500).json({
                    result: 'failed',
                    message: `get records failed. ${err}`
                });
            } else {
                let newBody = {
                    result: 'success',
                    message: 'Successfully get all pre goals',
                    data: []
                };
                goals.forEach( goal => newBody.data.push({
                    id: goal._id,
                    isArchive: goal.isArchive,
                    goalType: goal.goalType,
                    description: goal.description
                }));
                
                res.status(200).json(newBody);
            }
        });
    },
    addGoal: async (req, res) => { //user only
        let isGoalExist = await models.Goal.findOne({ userId: req.body.userId, goalType: req.body.goalType });

        if(isGoalExist) {
            res.status(400).json({
                message: `Please choose another type of goal.`,
            });
        } else { //add new goal if not exist
            let dateNow = (new Date()).toISOString().split('T')[0] //yyy-mm-dd format

            if(req.body.deadline < dateNow) res.status(400).json({ message: "Invaid deadline"});
            else {
                let userId = await jwt.verify( req.headers['token'], config.secret )._id;
                let goal = models.Goal({
                    _id: new mongoose.Types.ObjectId(),
                    userId: userId,
                    goalType: req.body.goalType,
                    description: req.body.description,
                    deadline: req.body.deadline,
                    targetValue: req.body.targetValue,
                });

                goal.save((err, goal) => {
                    if(err) {
                        res.status(500).json({message: `Insert failed. ${err}`});
                    } else {
                        res.status(200).json({message: `New goal has been added.`});
                    }
                });
            }
        }
    },
    updateGoalProgress: (req, res) => {
        let userId = jwt.verify( req.headers['token'], config.secret )._id;
        let currentValue = req.body.currentValue;

        models.Goal.findOneAndUpdate({
            userId: userId,
            goalType: req.body.goalType
        }, {
            $inc: { currentValue: currentValue }    
        }, {
            useFindAndModify: false,
            new: true
        }, (err, goal) => { 
            if(!err && goal) {
                if(goal.currentValue >= goal.targetValue) {//check if status is completed currentValue >= targetValue
                    models.Goal.findOneAndUpdate(
                        { _id: goal._id },
                        { $set: { isCompleted: true }},
                        { useFindAndModify: false, new: true },
                        (err, goal) => {

                            if(err)  res.status(500).json({ message: `Update failed. ${err}`});
                            else if(goal.isCompleted) res.status(200).json({ message: 'Goal is completed' });
                        });
                        return                 
                }
                res.status(200).json({ message: `Goal progress has been updated`});
            }
            else res.status(400).json({ message: `No goal records found`});
        });
    },
    getGoals: (req, res) => {
        let userId = jwt.verify(req.headers['token'], config.secret )._id;
        console.log(userId);

        models.Goal.find({userId: userId}, (err, goals) => {
            if(err) {
                res.status(500).json({
                    message: `get records failed. ${err}`
                });
            } else {
                let formatResponse = [];

                goals.forEach( goal => formatResponse.push({
                    id: goal._id,
                    currentValue: goal.currentValue,
                    isCompleted: goal.isCompleted,
                    isArchive: goal.isArchive,
                    userId: goal.userId,
                    goalType: goal.goalType,
                    description: goal.description,
                    targetValue: goal.targetValue,
                    deadline: goal.deadline,
                    dateCreated: goal.dateCreated
                }));
                
                res.status(200).json(formatResponse.length > 0 ? formatResponse : {message: "No goal records found"});
            }
        });
    }
}

module.exports = GoalController;