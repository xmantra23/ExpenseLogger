var Expense = require("../models/expense");
var middleware = {};

middleware.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You are not logged in.");
	res.redirect("/login");
}

middleware.checkOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Expense.findById(req.params.id,function(err,foundExpense){
			if(err){
				res.send("You don't have permission to do that");
			}else{
				if(req.user._id.equals(foundExpense.creator.id)){
					return next();
				}else{
					res.send("You don't have permission to do that");
				}
			}
		});
	}else{
		res.send("Not logged in");
	}
}

module.exports = middleware;