window.onload = function(){

	var socket = io.connect(window.location.origin);

	var sizer = document.querySelector('.sizer');

	var name = document.querySelector('.nickname').innerText;

	var idd = document.querySelector('.identif').innerText;

	var input = document.querySelector('input[type="text"]');
	var content = document.getElementById('content');
	var form = document.getElementById('messager');
	var userBlock = document.getElementById('users');
	var userList = document.querySelector('#users ul');

	content.style.height = sizer.clientHeight*20+'px';

	var messages = [];
	var count = 0;
	var users = [];

	if (name && name!="Гость"){
		socket.emit('hello',{name:name,id: idd});
		userBlock.style.display = 'block';
	} else {
		messages.push('<div style="color:red;">'+'Чат недоступен для незарегистрированных пользователей.'+'</div>');
		var html = '';
		for (var i =0;i<messages.length;i++){
			html += messages[i];
		}
		content.innerHTML = html;
		socket.disconnect();
	}

	form.onsubmit = function(){
		if (!input.value) return false;
		socket.emit('message',{message: input.value});
		input.value = '';
		return false;
	}
	
	socket.on('message',function(data){

		if (data.message === 'disconn'){
			// socket.emit('kick',{id: data.kick})
			socket.disconnect();
			console.log('disconnected');
			return false;
		}

		if (data.kick){
			socket.emit('kick',data.kick);
			return false;
		}

		console.log('not disconnected');

		if (data.users) {

			console.log(data.users)

			users = [];

			for (let i in data.users){
				users.push('<li class="user__item">'+data.users[i]+'</li>');
			}

			var html = '';

			for (var i =0;i<users.length;i++){
				html += users[i];
			}

			userList.innerHTML = html;

		}

		// messages.push('<div>'+data.message+'</div>');

		var div = document.createElement('div');
		div.innerHTML = data.message;
		content.appendChild(div);
		count++;
		if (count>20){
			var block = document.querySelector('#content div:first-child');
			block.remove();
		}

		// var html = '';

		// for (var i =0;i<messages.length;i++){
		// 	html += messages[i];
		// }

		// content.innerHTML = html;

		if (messages.length>20){
			messages.shift();
		}

	})

}

window.unload = function(){
	var socket = io.connect(window.location.origin);
	socket.disconnect();
}