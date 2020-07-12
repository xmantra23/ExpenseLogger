var express = require("express");
var router = express.Router();
var Expense = require("../models/expense");

// file upload settings ------------------------------------------
var path = require('path');
var multer = require('multer');
var fs = require('fs');

var storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  // var dir =  'upload_receipts/' + req.user.username;
  //     fs.exists(dir, exist =>{
  // if(!exist){
  // return fs.mkdir(dir, {recursive: true}, err => cb(err,dir))
  // }
  // return cb(null, dir);
  // });
  // },
  filename: function (req, file, cb) {
    cb(null,Date.now() + '-' + Math.round(Math.random() * 1E9)+ '-' + file.originalname);
  }
});

var fileFilter = function(req,file,callback){
 	var ext = path.extname(file.originalname);
	if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.pdf') {
		return callback(new Error('Only images and pdfs are allowed'))
	}
	callback(null, true)
}

var upload = multer({storage:storage,fileFilter:fileFilter});
var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'xmantra23',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});
//-----------------------------------------------------------------------------------------------

//new
router.get("/expenses/new",function(req,res){
	if(req.isAuthenticated()){
		res.render("expenses/new");
	}else{
		res.send("Not logged in");
	}
});

//edit
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

//create
router.post("/expenses",upload.single('receipt'),function(req,res){
	if(req.isAuthenticated()){
		if(req.fileValidationError){
			return res.redirect("/expenses/new");
		}
		//console.log(req.file);
		cloudinary.v2.uploader.upload(req.file.path,
		{folder:"ExpenseTracker/Upload_Receipts/" + req.user.username},function(err,result){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			var newExpense = new Expense(req.body.expense);
			newExpense.creator.id = req.user._id;
			newExpense.creator.username = req.user.username;
			newExpense.receiptImage = result.secure_url;
			newExpense.receiptId = result.public_id;
			Expense.create(newExpense,function(err,newlyCreatedExpense){
				if(err){
					console.log(err.message);
					return res.redirect("/expenses");
				}else{
					res.redirect("/expenses");
				}
			});
		});
	}else{
		res.send("Not logged in");
	}
});

//update
router.put("/expenses/:id",upload.single('receipt'),function(req,res){
	if(req.isAuthenticated()){
		Expense.findById(req.params.id, async function(err,foundExpense){
			if(err){
				console.log(err);
			}else{
				if(req.file){
					if(req.fileValidationError){
						return res.redirect("/expenses");
					}
					try{
						await cloudinary.v2.uploader.destroy(foundExpense.receiptId);
						var result = await cloudinary.v2.uploader.upload(req.file.path,
								{folder:"ExpenseTracker/Upload_Receipts/" + req.user.username});
						foundExpense.receiptImage = result.secure_url;
						foundExpense.receiptId = result.public_id;
					}catch(err){
						console.log(err);
						return res.redirect("back");
					}
				}
			}
			
			foundExpense.title = req.body.title;
			foundExpense.total = req.body.total;
			foundExpense.location = req.body.location;
			foundExpense.memo = req.body.memo;
			foundExpense.transactionDate = req.body.transactionDate;
			foundExpense.updatedAt = Date.now();
			foundExpense.save();
			res.redirect("/expenses");
		});
	};

});

//show
router.get("/receipts/:id",function(req,res){
	Expense.findById(req.params.id,function(err,foundExpense){
			if(err){
				console.log(err.message);
			}else{
				var fileType = (foundExpense.receiptImage).split('.').pop();
				res.render("receipts/show",{file:foundExpense.receiptImage,fileType:fileType});
			}
	});	
});

//index
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

//destroy
router.delete("/expenses/:id",function(req,res){
	if(req.isAuthenticated()){
		Expense.findByIdAndRemove(req.params.id,function(err,removedExpense){
			if(err)
				console.log(err);
			else{
				try{
					cloudinary.v2.uploader.destroy(removedExpense.receiptId);
					res.redirect("/expenses");
				}catch(err){
					if(err){
						console.log("Couldn't delete image /n error: ",err.message );
						return res.redirect("/expenses");
					}
				}
			}
		});
	}else{
		res.send("Not logged in");
	}
});

module.exports = router;