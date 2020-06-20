var express = require("express");
var router = express.Router();
var Expense = require("../models/expense");

router.get("/expenses/new",function(req,res){
	if(req.isAuthenticated()){
		res.render("expenses/new");
	}else{
		res.send("Not logged in");
	}
});

router.get("/expenses/:id/edit",function(req,res){
	if(req.isAuthenticated()){
		Expense.findById(req.params.id,function(err,foundExpense){
			if(err){
				console.log(err);
			}else{
				res.render("expenses/edit",{expense:foundExpense});
			}
		});
	}else{
		res.send("Not logged in");
	}
});

router.post("/expenses",function(req,res){
	if(req.isAuthenticated()){
		var newExpense = new Expense(req.body.expense);
		newExpense.creator.id = req.user._id;
		newExpense.creator.username = req.user.username;
		Expense.create(newExpense,function(err,newlyCreatedExpense){
			if(err){
				console.log(err.message);
				return res.redirect("/expenses");
			}else{
				res.redirect("/expenses");
			}
		});
	}else{
		res.send("Not logged in");
	}
});

router.get("/expenses",function(req,res){
	if(req.isAuthenticated()){
		Expense.find({"creator.id":req.user._id},function(err,foundExpenses){
			if(err){
				console.log(err.message);
			}else{
				res.render("expenses/index",{expenses:foundExpenses});
			}
		});	
	}else{
		res.send("Not logged in");
	}
});

router.delete("/expenses/:id",function(req,res){
	if(req.isAuthenticated()){
		Expense.findByIdAndRemove(req.params.id,function(err,removedExpense){
			if(err)
				console.log(err);
			else
				res.redirect("/expenses");
		});
	}else{
		res.send("Not logged in");
	}
});

module.exports = router;