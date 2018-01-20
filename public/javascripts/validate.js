var name = document.getElementById('name');
var pass1 = document.getElementById('password');
var pass2 = document.getElementById('password-repeat');

function validate(){
	if (pass1.value != pass2.value && name.length >= 3){
		return false;
	} else {
		return true;
	}
}