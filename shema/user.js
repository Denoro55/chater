var mongoose = require('mongoose');
mongoose.connect('mongodb://root:12345@ds135817.mlab.com:35817/base01', { useMongoClient: true });
mongoose.Promise = global.Promise;

var crypt = require('crypto');

var PersonSchema = new mongoose.Schema({
    name: {
    	type: String,
    	require: true,
    	unique: true
    },
    hash: {
    	type: String,
    	require: true
    },
    salt: {
    	type: String,
    	require: true
    },
    iteration: {
    	type: Number,
    	require: true
    },
    created: {
    	type: Date,
    	default: Date.now()
    }
});

PersonSchema.virtual('password')
	.set(function(data){
		this.salt = String(Math.random());
		this.iteration = parseInt(1+Math.random()*10);
		this.hash = this.getHash(data);
	})
	.get(function(){
		return this.name.first + ' ' + this.name.last;
	})

PersonSchema.methods.getHash = function(pass){
	var c = crypt.createHmac('sha1',this.salt);
	for (let i = 0;i<this.iteration;i++){
		c = c.update(pass);
	}
	return c.digest('hex');
}

PersonSchema.methods.checkPassword = function(data){
    return this.getHash(data) === this.hash;
}

PicSchema = new mongoose.Schema({
name: {
    type: String,
    required: [true, 'Укажите описание картинки']
},
picture: {
    type: String
},
owner: {
    type: String
}

});

BlogSchema = new mongoose.Schema({
title: {
    type: String,
    required: [true, 'Укажите заголовок статьи']
},
body: {
    type: String,
    required: [true, 'Укажите содержимое статьи']
},
owner: {
    type: String
},
date: {
    type: Date, 
    default: Date.now,
    required: [true, 'Укажите дату публикации']
}
});

//просим mongoose сохранить модель для ее дальнейшего использования

exports.Person = mongoose.model('Person', PersonSchema);
exports.Pic = mongoose.model('Pic', PicSchema);
exports.Blog = mongoose.model('Blog', BlogSchema);