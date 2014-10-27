#!/usr/bin/env node
var fs = require('fs');
var bcrypt = require('bcrypt');
var StringDecoder = require('string_decoder').StringDecoder;
var decode = new StringDecoder('utf8');
var Users = [];
var compare = false;
var comparison = [];
var sortedUsers= [];
var userCount = 0;
var filepath;

// flags
var argv = require('optimist').argv;
if(argv.c){
	if(argv.c.length){
		compare = true;
		filepath = argv.c;
	}
}

// Read piped input stream
process.stdin.setEncoding('utf8');
process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    chunks = chunk.split('\n');
    Users = [];
    chunks = chunks.filter(function(row){
    	return row.length;
    }).forEach(function (row){
			var temp = row.split(',');
			Users.push({
					username: temp[0],
					password: temp[1]
			});	    
    });
  }
});

// After piped stream input has finished
process.stdin.on('end', function() {

	// Sort via users array
  Users = Users.sort(sortUsernameAsc);

	if(compare){
		var rs = fs.createReadStream(filepath);
		rs.on('data', addToComparison);
		rs.on('end', comparePlaintextToHash);
	} else {
		Users.forEach(encryptPlaintext);
	}
});

function addToComparison(data){

	// decode buffer to string
	decode.write(data).split('\n').forEach(function(row){
		comparison.push(row);
	});			
}

function comparePlaintextToHash(data){
  comparison = comparison.filter(function(item){
  		return item.length;
  	}).map(function(item){
  		var temp = item.split(',');
  		return {
  			username: temp[0],
  			password: temp[1]
  		}
  	}).sort(sortUsernameAsc);

  // Assumes comparison and Users are sorted, matches by username
	Users.forEach(function (a, idx){
		var b = comparison[idx];
		if(b.username === a.username){
			bcrypt.compare(b.password, a.password,function (err,res){
				if(err) new Error(err);
				if(res) console.log(a.username +': OK');
				if(!res) console.log(a.username +': Mismatch');
			});
		} else {
			console.error('Usernames do not match: ' + a.username + ' ' + b.username);
		}
	});
}

function encryptPlaintext(user){
	function cb(u,p){
		sortedUsers.push({
			username: u,
			password: p
		});

		if(++userCount === Users.length){
			
			// stdout
			sortUsersThenStdout(sortedUsers);
		}
	}

	var username = user.username;
	var password = user.password;

  bcrypt.hash(password, 10, function(err, hash) {
  	cb(username,hash);
  });
}

function sortUsersThenStdout(users){
	return users.sort(sortUsernameAsc)
		.forEach(function(user){
  		process.stdout.write([user.username,user.password].join(',') + '\n');
		});
}

function sortUsernameAsc(a,b){
	if(a.username < b.username) return -1;
	if(a.username > b.username) return 1;
	return 0;
}