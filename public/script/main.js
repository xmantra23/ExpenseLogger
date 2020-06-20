var password = document.getElementById("password");
var rePassword = document.getElementById("rePassword");
var submitButton = document.getElementById("register-submit");

password.addEventListener("input",function(){
	if ((password.value !== rePassword.value) && (rePassword.value !== "")){
		password.style.backgroundColor = "#e3504b";
		rePassword.style.backgroundColor = "#e3504b";
		submitButton.disabled = true;
	}else{
		password.style.backgroundColor = "white";
		rePassword.style.backgroundColor = "white";
		submitButton.disabled = false;
	}
});

rePassword.addEventListener("input",function(){
	if (password.value !== rePassword.value){
		password.style.backgroundColor = "#e3504b";
		rePassword.style.backgroundColor = "#e3504b";
		submitButton.disabled = true;
	}else{
		password.style.backgroundColor = "white";
		rePassword.style.backgroundColor = "white";
		submitButton.disabled = false;
	}
});