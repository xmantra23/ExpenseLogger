var mongoose = require('mongoose');

var ExpenseSchema = new mongoose.Schema({
	title: String,
	total: String,
	memo: String,
	receiptImage: String,
	receiptId: String,
	location: String,
	transactionDate: Date,
	creator:{
		id:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
		username: String
	},
	createdAt: {type:Date, default: Date.now},
	updatedAt: {type:Date, default: Date.now}
});

module.exports = mongoose.model("Expense",ExpenseSchema);