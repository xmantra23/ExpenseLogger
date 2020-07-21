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
			req.flash("error","Oops. Something went wrong. Please try again.")
			res.redirect("/index");
			return;
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Welcome " + req.user.username);
			res.redirect("/expenses");
		});
	});
});

router.get("/login",function(req,res){
	res.render("auth/login");
});

router.post(
		"/login",
		passport.authenticate("local",
			{
				failureRedirect: "/login",
				failureFlash: ("Invalid username/password")
			}				  
		),
		function(req,res){
			req.flash("success","Welcome back " + req.user.username);
			res.redirect("/expenses");
		}
);

router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});


module.exports = router;