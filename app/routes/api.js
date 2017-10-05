var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user){
	var token = jsonwebtoken.sign( {
		id: user._id,
		name: user.name,
		username: user.username
	} ,secretKey, {
		expiresIn : 60*60*24		//expiresInMenute is deprecated
	});
	return token;
}

module.exports = function(app,express,io){
	var api = express.Router();

	api.get('/all_stories',function(req,res){
		Story.find({},function(err,stories){
			if(err){
				res.send(err);
				return;
			}
			res.json(stories);
		});
	});

	api.post('/signup',function(req,res){
		var user = new User({
			name:req.body.name,
			username:req.body.username,
			password:req.body.password
		});

		var token = createToken(user);

		user.save(function(err){
			if(err){
				res.send(err);
				return;
			}
			res.json({
				success: true,
				message:'User has been created',
				token: token
			});
		});
	});

	api.get('/users',function(req,res){
		User.find({},function(err,users){
			if(err){
				res.send(err);
				return;
			}
			res.json(users);
		});
	});

	api.post('/login',function(req,res){
		User.findOne({
			username:req.body.username
		}).select('name username password').exec(function(err,user){
			if(err){
				throw err;
			}
			if(!user){
				res.send({message:"User doesnot exist"});
			}
			else if(user){
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword){
					res.send({message: "Invalid password"});
				}else{
					//creating token here for successful login
					var token = createToken(user);
					res.json({
						success: true,
						message: "Sucessfuly login",
						token: token
					});
				}
			}	
		});
	});

	api.use(function(req,res,next){
		console.log('Somebody just came to our app!');
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];
		//check is token exist
		if(token){
			jsonwebtoken.verify(token,secretKey,function(err,decoded){
				if(err){
					res.status(403).send({ success: false, message: "Failed to authenticate user"});
				} else{
					req.decoded = decoded;
					next();
				}
			});
		}
		else{
			res.status(403).send({success: false,message:"No Token Provided"});
		}
	});

	//destination B // provide a legitimate token

	/*api.get('/',function(req,res){
		res.json("My world!") ;
	});*/

	api.route('/')
		.post(function(req,res/*,io*/){
			console.log('inside story post!')
			var story = new Story({
				creator: req.decoded.id,
				content: req.body.content
			});
			story.save(function(err,newStory){
				console.log('Inside story.save!');
				if(err){
					res.send(err);
					return;
				}
				/*io.on('connection',function(socket){
					console.log('inside io.on method');
					socket.on('msg',function(data){
						io.sockets.emit('story', data);
					})
					
				})*/
				io.emit('story',newStory)
				res.json({message:"New Story Created!"});
			    //io.emit('story',newStory);
				
			});
		})

		.get(function(req,res){
			Story.find({ creator: req.decoded.id},function(err,stories){
				if(err){
					res.send(err);
					return;
				}
				res.json(stories);
			});
		});
	

	api.get('/me',function(req,res){
		res.json(req.decoded);
	});

	return api
}