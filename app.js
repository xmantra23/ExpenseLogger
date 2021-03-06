require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/user');
var expressSession = require("express-session");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var app = express();

//------------ routes-----------------------------------//
var authRoutes = require("./routes/auth");
var expenseRoutes = require("./routes/expenses");


app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
//app.use(express.static(__dirname + "/upload_receipts"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());


//------------------ DATABASE CONNECTION----------------//
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify',false);
mongoose.connect(process.env.DATABASEURL,{useNewUrlParser: true, useCreateIndex: true});

//------------------- PASSPORT CONFIGURATION-------------//
app.use(expressSession({
	secret:"abara ka dabara meri maah",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//---------------------- setting up global variables -----------//
app.use(function(req,res,next){
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.currentUser = req.user;
	var today = new Date();
	var month = today.getMonth()+1;
	var day = today.getDate();
	month = month < 10 ? '0' + month : '' + month;  //if month is less than 10 add a 0 prefix . eg 8 -> becomes 08
	day = day < 10 ? '0' + day: '' + day;
	res.locals.today = today.getFullYear()+'-'+ month +'-'+day;  //todays date in yyyy-mm-dd format
	res.locals.formattedDate = function(date){
		//was getting one day off before doing this.
		var date = new Date(date.getTime() + date.getTimezoneOffset() * 60000); //converting utc date zone to local date.
		const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  				"Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
		var month = monthName[date.getMonth()];
		var day = date.getDate();
		if (day > 3 && day < 21) {
			day = day + 'th';
		}else{
  			switch (day % 10) {
    			case 1:  day = day + "st";
						 break;
    			case 2:  day = day + "nd";
						 break;
    			case 3:  day = day + "rd";
					     break;
    			default: day = day + "th";
					 	 break;
  			}
		}
		var year = date.getFullYear();
		return (month + " " + day + " " + year);
	}
	
	res.locals.format = function(d){
		var date = new Date(d.getTime() + d.getTimezoneOffset() * 60000); 
		var month = date.getMonth()+1;
		var day = date.getDate();
		month = month < 10 ? '0' + month : '' + month;
		day = day < 10 ? '0' + day: '' + day;
		return date.getFullYear()+'-'+ month +'-'+day;  //todays date in yyyy-mm-dd format
	}
	next();
});

//------------------ use routes-------------------------//
app.use(authRoutes);
app.use(expenseRoutes);



app.get("/",function(req,res){
	res.render("home");
});

app.get("*",function(req,res){
	res.send("<h1 style = \"width:100%;text-align: center;margin: 22% auto\">YOU HAVE REACHED AN INVALID ADDRESS.</h1>");
});
app.listen(process.env.PORT,function(){
	console.log("ExpenseLogger server is listening");
});