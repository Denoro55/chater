var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var session = require('express-session');

var app = express();

var socket = require('socket.io');
var port = normalizePort(process.env.PORT || '3000');
var io = socket.listen(app.listen(port));

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: "mysecret",
	key: "NODESESSID",
	cookie: {
		"path": "/",
		"maxAge": null,
		"httpOnly": true
	}
}))

app.use('/', index);
app.use('/users', users);

// MONGOSEE ---------------------------->>>>

var Person = require('./shema/user').Person;

// var theSituation = new Person({
//     name: 'Dene',
//     password: 'example'
// });

// theSituation.save(function(err){
// 	if (err) console.log(err);
// })

// var kitty = new Cat({ name: 'Zildjian',age: 15 });

// // kitty.save(function (err) {
// //   if (err) {
// //     console.log(err);
// //   } else {
// //     console.log('meow');
// //   }
// // });

// Cat.find(function (err, kittens) {
//   if (err) return console.error(err);
//   console.log(kittens);
// })

// MONGOSEE ---------------------------->>>>

// ---- SOCKET

var users = {};

function checkUser(id){
  for (let i =0;i<logs.length;i++){
    if (logs[i] == id){
      return true;
    }
  }
  return false;
}

var User = require('./shema/user').Person

var e = require('./ext/error');

app.get('/chat', function(req, res, next) {
  if (req.session.user){
    User.findById(req.session.user,function(err,user){
      if (err) next(err);
      // for (let i =0;i<logs.length;i++){
      //   if (user._id == logs[i]) {
      //     return false;
      //   }
      // }
      res.render('chat', { title: 'Express', name: user.name , id: user._id});
    })
  } else {
    res.render('chat', { title: 'Express' , name: 'Гость' });
  }
});

function getUsers(obj,join){
  var tmp = [];
  for (let i in obj){
    tmp.push(obj[i]);
  }
  if (join) {
    return tmp.join(', ');
  } else {
    return tmp;
  }
}

io.sockets.on('connection',function(client){

  var address = client.handshake.address;

  console.log(users);

  console.log('New connection from ' + address.address + ':' + address.port)

  client.on('hello',function(data){

    client.broadcast.emit('message',{kick: data.id});

    // logs.push(data.id);

    users[data.id] = data.name,

    client.set('nick',data.name);
    client.set('identif',data.id);
    client.emit('message',{message: 'Добро пожаловать в чат, '+'<span style="font-weight: bold;">'+data.name+'</span>', users});
    client.broadcast.emit('message',{message: '<span style="font-weight: bold;">'+data.name+'</span>'+'<span style="color: green;"> присоединился к чату.</span>',users});

    // if (Object.keys(users).length > 1){
    //   client.emit('message',{message: 'Сейчас в чате: '});
    // } else {
    //   client.emit('message',{message: 'Кроме вас в чате никого нет :('});
    // }

  })

  client.on('message',function(data){
    client.get('nick',function(err,nick){
      var getText = data.message.replace('<','&lt;').replace('>','&gt;');
      io.sockets.emit('message',{message: '<span style="font-weight: bold;">'+nick+'</span>: '+getText});
    });
  })

  client.on('disconnect',function(data){
    client.get('identif',function(err,idd){
      delete users[idd];
      console.log(users);
    });
    client.get('nick',function(err,nick){
      io.sockets.emit('message',{message: '<span style="font-weight: bold;">'+nick+'</span>'+'<span style="color: red;"> покинул чат.</span>',users});
      // delete users[client.id];
    });

  // if (req.session.user && !checkUser(req.session.user)){
  //   User.findById(req.session.user,function(err,user){
  //     if (err) next(err);
  //     for (let i =0;i<logs.length;i++){
  //       if (req.session.user == logs[i]){
  //         logs.splice(logs.indexOf(req.session.user), 1);
  //         console.log(logs);
  //       }
  //     }
  //   })
  // }

  })

  client.on('kick',function(data){
    client.get('identif',function(err,idd){
      if (idd == data){
        client.emit('message',{message: 'Вы отключены от чата.'});
        client.emit('message',{message: 'disconn'});
      }
    });
  })

})

// ------- >>>

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
