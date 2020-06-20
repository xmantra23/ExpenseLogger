var express = require("express");
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get("/register",function(req,res){
	res.render("auth/register");
});

router.post("/register",function(req,res){
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email
	});
	
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return;
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/expenses");
		});
	});
});

router.get("/login",function(req,res){
	res.render("auth/login");
});

router.post(
		"/login",
		passport.authenticate("local",{failureRedirect: "/login"}),
		function(req,res){
			res.redirect("/expenses");
		}
);

router.get("/secret",function(req,res){
	if(req.isAuthenticated()){
		res.send("you are logged in <a href = '/logout'>logout</a> Welcome " + req.user.username);
	}else{
		res.send("Not logged in");
	}
});

router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});


module.exports = router;