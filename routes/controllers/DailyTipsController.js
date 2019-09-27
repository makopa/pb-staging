/* Dependencies */
const mongoose = require('mongoose');

/* Models*/
const DailyTips = require('../../models/DailyTips');

const DailyTipsController = {

	createDailyTips: async (req, res) => {
		// Create new daily tip
		let _dailyTips = new DailyTips ({
			_id: new mongoose.Types.ObjectId(),
			tip: req.body.tip
		});

		try {
			let saveDailyTips = await _dailyTips.save();
			if (saveDailyTips) {
				res.status(200).json({
					result: "success",
					message: 'New Daily Tips has been added.',
					data: saveDailyTips
				});	
			}
		} catch (e) {
			res.status(500).json({
				result: "failed",
				message: 'Error creating daily tips',
				error: e.message
			});
		}
	},

	getTips: async (req, res) => {

		try {
			const tips = await DailyTips.find({});

			let newBody = {
				result: "success",
				message: "Successfully get all daily tips.",
				data: [],
				total: tips.length
			};
			
			tips.forEach((tip)=>{
				newBody.data.push({
					id: tip._id,
					tip: tip.tip,
					isArchive: tip.isArchive
				});
			});
			res.status(200).json(newBody);
		} catch (e) {
			res.status(500).json({
				result: "failed",
				message: 'Daily Tips not Found.',
				error: e.message
			});
		}
	},

	getDailyTips: async (req, res) => {

		try {
			const tip = await DailyTips.aggregate([ 
				{ $match: { isArchive: false }},
				{ $sample: {size: 1} }			  
			]);

			let newBody = {
				result: "success",
				message: `Successfully get ${tip[0].id}`,
				data: {
					id: tip[0]._id,
					tip: tip[0].tip
				}
			};

			res.status(200).json(newBody);

		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong.',
				error: e.message
			});
		}
	},

	updateDailyTips: async (req, res) => {
		// Update Daily Tips
		try {

			const result = await DailyTips.findOneAndUpdate(
				{ _id: req.params.dailyTipsId }, 
				{"$set": req.body },
				{"new":true});

			if (!result) {
				res.status(400).json({
					result: 'failed',
					message: `Daily tip ${req.params.dailyTipsId} does not exist.`
				});

			} else {
				res.status(200).json({
					result: 'success',
					message: 'Daily Tip has been successfuly updated.',
					data: result
				});
			}

		} catch (e) {
			res.status(400).json({
				result: 'failed',
				message: 'Daily tip does not exist.',
				error: e.message
			});
		}
	},

	archiveDailyTips: async (req, res) => {
		// Archive Daily Tips
		try {

			const result = await DailyTips.findOneAndUpdate(
				{ _id: req.params.dailyTipsId }, 
				{"$set": { isArchive: true } },
				{"new":true});

			if (!result) {
				res.status(500).json({
					result: 'failed',
					message: "Daily tip does not exist."
				});
			} else {
				res.status(200).json({
					result: 'success',
					message: 'Daily Tip has been successfuly archived.',
					data: result
				});
			}

		} catch (e) {

			res.status(400).json({
				result: 'failed',
				message: 'Daily tip does not exist.',
				error: e.message
			});
		}
	}
}

module.exports = DailyTipsController;