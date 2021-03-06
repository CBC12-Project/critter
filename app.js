const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');
const validator = require("email-validator");
require('dotenv').config();
const md5 = require('md5');
app.use(express.urlencoded({extended:true}));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(function(req, res, next) {
	res.locals.userId = req.session.UserId;
	res.locals.display_name = req.session.display_name;
	res.locals.username = req.session.username;
	next();
});

const critRoute = require('./critRouter');
app.use('/crit', critRoute);

app.use( express.static('static') );
app.set('view engine', 'ejs');

// Route for Timeline

app.get('/', (req, res) => {
	let crit_query = `
		SELECT 
			crits.id, crits.user_id, users.display_name, 
			users.username, users.email, crits.crit_reply_id,
			crits.message, crits.created_on, 
			count(crit_replies.id) AS replies,
			ifnull(
				(
					SELECT count(crit_likes.id) 
					FROM crit_likes 
					WHERE crit_likes.crit_id = crits.id 
					GROUP BY crit_likes.crit_id
				), 0
			) AS likes,
			ifnull(user_liked.id, 0) AS isLiked
		FROM crits 
		LEFT JOIN crits AS crit_replies
			ON crit_replies.crit_reply_id = crits.id 
		LEFT JOIN crit_likes
			ON crit_likes.crit_id = crits.id
		LEFT JOIN users 
			ON crits.user_id = users.id
		LEFT JOIN crit_likes AS user_liked
			ON user_liked.user_id = ? AND user_liked.crit_id = crits.id
		WHERE crits.crit_reply_id is null
		GROUP BY crits.id
		ORDER BY crits.created_on DESC
		LIMIT 10
	`;
	let user_id = req.session.UserId || 0;
	connection.query(crit_query, user_id, (err, results) => {
		if ( err ) {
			console.error(err);
			throw err;
		}

		let crits = [];
		for (let i = 0; i<results.length; i++){
			crits.push({
				user: {
					display_name: results[i].display_name,
					username:results[i].username,
					picture: 'https://www.gravatar.com/avatar/' + md5(results[i].email)
				},
				crit: {
					id: results[i].id,
					created_on: results[i].created_on,
					likes: results[i].likes,
					replies: results[i].replies,
					message: results[i].message,
					isLiked: results[i].isLiked 
				}
			})
		}
		let mode = 'timeline'
		res.render('timeline', {crits:crits, mode});
	});
});

//search route 
app.get('/search', (req, res) => {
    let searchParam = `%${req.query.search}%`;
	let search_query = `
    SELECT 
        crits.id, crits.user_id, users.display_name, 
        users.username, users.email, crits.crit_reply_id,
        crits.message, crits.created_on, 
		count(crit_replies.id) AS replies,
        ifnull(
        (
            SELECT count(crit_likes.id) 
            FROM crit_likes 
            WHERE crit_likes.crit_id = crits.id 
            GROUP BY crit_likes.crit_id
        ), 0
        ) AS likes,
        ifnull(user_liked.id, 0) AS isLiked
    FROM crits 
	LEFT JOIN crits AS crit_replies
		ON crit_replies.crit_reply_id = crits.id 
	LEFT JOIN crit_likes
		ON crit_likes.crit_id = crits.id
    LEFT JOIN users 
		ON crits.user_id = users.id 
	LEFT JOIN crit_likes AS user_liked
        ON user_liked.user_id = ? AND user_liked.crit_id = crits.id
    WHERE crits.message 
    lIKE ?
	GROUP BY crits.id
	`;
	let user_id = req.session.UserId || 0;
	connection.query(search_query, [user_id, searchParam], (err, results) => {
		let crit_results = [];
		for(let i = 0; i < results.length; i++){
			crit_results.push({
				user: {
					display_name: results[i].display_name,
					picture: 'https://www.gravatar.com/avatar/' + md5(results[i].email),
					username: results[i].username
				},
				crit: {
					id: results[i].id,
					created_on: results[i].created_on,
					likes: results[i].likes,
					replies: results[i].replies - (results[i].replies > 0 ? results[i].likes : 0),
					message: results[i].message,
					isLiked: results[i].isLiked
				}
			});
        };
		let mode = 'search'
		res.render('timeline', {crit_results:crit_results, mode});
	});
});

//sign up 
app.post('/signup', async (req, res) => {
	if (validator.validate(req.body.email) && (req.body.username) && (req.body.display_name)) {
		try {
			const salt = await bcrypt.genSalt();
			const signupPassword = `${await bcrypt.hash(req.body.password, salt)}`;
				let signupEmail = `${req.body.email}`;
				let signupUsername = `${req.body.username}`;
				let signupDisplayname= `${req.body.display_name}`;
				let signup_verify_email_query = `
			SELECT id
			FROM users
			WHERE users.email = ? 
			;`
			let signup_verify_username_query = `
			SELECT id
			FROM users
			WHERE users.username = ? 
			;`
			let signup_query = `
			INSERT INTO users 
				(id, username, email, password, display_name, created_on) 
			VALUES 
				(NULL, ?, ?, ?, ?, current_timestamp())
			;`
			connection.query(signup_verify_email_query, signupEmail, (err, results) => {
				if (!results[0]) {
					connection.query(signup_verify_username_query, signupUsername, (err, results) => {
						if (!results[0]) {
							connection.query(signup_query, [signupUsername, signupEmail, signupPassword, signupDisplayname], (err, results) => {
								if (err) throw err;
								res.redirect('/');
							})		
						} else {
							res.send('Username already in use!');
						};
					});
				} else {
					res.send('Email already in use!');
				};
			});
		} catch {
			res.status(500).send();
		}
	} else {
		res.send('Invalid!');
	}
});

// authenticate
app.post('/auth', async (req, res) => {
	let loginEmail = `${req.body.email}`
	let loginPassword = `${req.body.password}`
	let login_query = `
	SELECT users.id, users.display_name, users.username, users.password
	FROM users 
	WHERE users.email = ?;
	`;
	connection.query(login_query, loginEmail, async (err, results) => {
		if (results.length > 0) {
			try {
				if (await bcrypt.compare(loginPassword, results[0].password)) {
					req.session.loggedin = true;
					req.session.UserId = results[0].id;
					req.session.display_name = results[0].display_name;
					req.session.username = results[0].username;
					res.redirect('/');
				} else {
					res.send('Incorrect Username and/or Password!');
				}
			} catch {
				res.status(500).send();
			}
		} else {
			res.send('Incorrect Username and/or Password!');
		};
	});
});

// log out
app.post('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy(err => {
			if (err) {
				res.status(400).send('Unable to log out');
			} else {
				res.redirect('/');
			}
		});
	} else {
		res.end();
	}
})

//welcome page route
app.get('/welcome', (req, res) => {
	res.render('newusers.ejs');
});

//route for profile
app.get('/profile', (req, res) => {
	let profile_query = `
		SELECT 
			id, username, display_name, email
		FROM 
			users 
		WHERE 
			username = ?
		`;
	
	// get the user information for the profile I'm viewing
	connection.query(profile_query,  req.session.username, (err, results) =>{
		if ( err ) {
			console.error(err);
			throw err;
		}
		let userProfile = [];
		for (let i = 0; i<results.length; i++){
			userProfile.push({
				profile:{
					id: results[i].id,
					display_name: results[i].display_name,
					picture: 'https://www.gravatar.com/avatar/' + md5(results[i].email),
					username: results[i].username
				}
			});
		};
		let profile_crit_query = `
			SELECT 
				crits.id, crits.user_id, users.display_name, 
				users.username, users.email, crits.crit_reply_id,
				crits.message, crits.created_on, 
				count(crit_replies.id) AS replies,
				ifnull(
					(
						SELECT count(crit_likes.id) 
						FROM crit_likes 
						WHERE crit_likes.crit_id = crits.id 
						GROUP BY crit_likes.crit_id
					), 0
				) AS likes,
				ifnull(user_liked.id, 0) AS isLiked
			FROM crits 
			LEFT JOIN crits AS crit_replies
				ON crit_replies.crit_reply_id = crits.id 
			LEFT JOIN crit_likes
				ON crit_likes.crit_id = crits.id
			LEFT JOIN users 
				ON crits.user_id = users.id
			LEFT JOIN crit_likes AS user_liked
				ON user_liked.user_id = ? AND user_liked.crit_id = crits.id
			WHERE crits.crit_reply_id is null AND users.id = ?
			GROUP BY crits.id
			ORDER BY crits.created_on DESC
			LIMIT 10
		`;
		let user_id = req.session.UserId || 0;

		// get the timeline of the user i'm viewing
		connection.query(profile_crit_query,[user_id, user_id] , (err, result) => {
			if ( err ) {
				console.error(err);
				throw err;
			}

			let critsProfile = [];
			for (let i = 0; i<result.length; i++){
				critsProfile.push({
					user: {
						display_name: result[i].display_name,
						username:result[i].username,
						picture: 'https://www.gravatar.com/avatar/' + md5(result[i].email)
					},
					crit: {
						id: result[i].id,
						created_on: result[i].created_on,
						likes: result[i].likes,
						replies: result[i].replies,
						message: result[i].message,
						isLiked: result[i].isLiked 
					}
				});
			}

			let follow_query = `SELECT id FROM followers WHERE user_id = ? AND following_id = ?`;
			// see if I (logged in) am following this user
			connection.query(follow_query, [req.session.UserId, req.session.UserId], (err, results) => {
				if (err) {
					console.error(err);
					throw err;
				}
				res.render('profile', {userProfile: userProfile, critsProfile: critsProfile, isFollowing: results.length });	
			});			
		});
	});
});

// user @handle route
app.get('/profile/:username', (req, res) => {
	let toProfile = ` 
		SELECT 
			id, username, display_name, email
		FROM users 
		WHERE username = ?
	`;

	let profile_user_id = null; 

	// get the user information for the profile I'm viewing
	connection.query(toProfile, req.params.username, (err, results) =>{
		if ( err ) {
			console.error(err);
			throw err;
		}
		let toProfile = [];
		for (let i = 0; i<results.length; i++){
			profile_user_id = results[i].id;
			toProfile.push({
				profile:{
					id: results[i].id,
					display_name: results[i].display_name,
					picture: 'https://www.gravatar.com/avatar/' + md5(results[i].email),
					username: results[i].username
				}
			});
		};

		let profile_crit_query = `
			SELECT 
				crits.id, crits.user_id, users.display_name, 
				users.username, users.email, crits.crit_reply_id,
				crits.message, crits.created_on, 
				count(crit_replies.id) AS replies,
				ifnull(
					(
						SELECT count(crit_likes.id) 
						FROM crit_likes 
						WHERE crit_likes.crit_id = crits.id 
						GROUP BY crit_likes.crit_id
					), 0
				) AS likes,
				ifnull(user_liked.id, 0) AS isLiked
			FROM crits 
			LEFT JOIN crits AS crit_replies
				ON crit_replies.crit_reply_id = crits.id 
			LEFT JOIN crit_likes
				ON crit_likes.crit_id = crits.id
			LEFT JOIN users 
				ON crits.user_id = users.id
			LEFT JOIN crit_likes AS user_liked
				ON user_liked.user_id = ? AND user_liked.crit_id = crits.id
			WHERE crits.crit_reply_id is null AND users.username = ?
			GROUP BY crits.id
			ORDER BY crits.created_on DESC
			LIMIT 10
		`;
		let user_id = req.session.UserId || 0;

		// get the timeline of the user i'm viewing
		connection.query(profile_crit_query,[user_id, req.params.username] , (err, result) => {
			if ( err ) {
				console.error(err);
				throw err;
			}

			let critsProfile = [];
			for (let i = 0; i<result.length; i++){
				critsProfile.push({
					user: {
						display_name: result[i].display_name,
						username:result[i].username,
						picture: 'https://www.gravatar.com/avatar/' + md5(result[i].email)
					},
					crit: {
						id: result[i].id,
						created_on: result[i].created_on,
						likes: result[i].likes,
						replies: result[i].replies,
						message: result[i].message,
						isLiked: result[i].isLiked 
					}
				});
			}

			let follow_query = `SELECT id FROM followers WHERE user_id = ? AND following_id = ?`;
			// see if I (logged in) am following this user
			connection.query(follow_query, [req.session.UserId, profile_user_id], (err, results) => {
				if (err) {
					console.error(err);
					throw err;
				}
				res.render('profile', {userProfile: toProfile, critsProfile: critsProfile, isFollowing: results.length });	
			});
		});
	});
});

app.all('/user/:following_id/follow', (req, res) => {
	let query = `
		INSERT INTO followers (user_id, following_id) VALUES (?, ?)
	`;

	let my_user_id = req.session.UserId; 

	connection.query(query, [ my_user_id, req.params.following_id ], (err, results) => {
		if ( err ) {
			console.error(err);
			throw err;
		}

		// TODO(erh): we'll need to write a JSON route for this for our front-end
		// until then, simply reload the current page.
		res.redirect('back');
	});
});

app.all('/user/:following_id/unfollow', (req, res) => {
	let query = `
		DELETE FROM followers WHERE user_id = ? AND following_id = ?
	`;

	let my_user_id = req.session.UserId; 

	connection.query(query, [ my_user_id, req.params.following_id ], (err, results) => {
		if ( err ) {
			console.error(err);
			throw err;
		}

		// TODO(erh): we'll need to write a JSON route for this for our front-end
		// until then, simply reload the current page.
		res.redirect('back');
	});
});

app.all('/like/:crit_id', (req, res) => {
	if(req.session.UserId) {
		let all_query = ` 
		SELECT * FROM crit_likes WHERE user_id = ? AND crit_id = ? 
		`;
		let my_user_id = req.session.UserId;

		connection.query(all_query, [ my_user_id, req.params.crit_id], (err, results) => {
			if (results.length > 0){
				let unlike_query = `
				DELETE FROM crit_likes WHERE user_id = ? AND crit_id = ?
				`;
				let my_user_id = req.session.UserId; 

				connection.query(unlike_query, [ my_user_id, req.params.crit_id ], (err, results) => {
					res.redirect('back');
				});
			} else {
				let like_query = `
				INSERT INTO crit_likes (user_id, crit_id) VALUES (?, ?)
				`;
				let my_user_id = req.session.UserId;  
		
				connection.query(like_query, [ my_user_id, req.params.crit_id ], (err, results) => {
					if ( err ) {
						console.error(err);
						throw err;
					}
					res.redirect('back');
				}); 
			};
		});
	} else { 
		res.send('Please log in');
	};
});

app.get('/settings', (req,res) =>{
	let settings_query = `
	SELECT users.email, users.password, users.display_name FROM users WHERE id = ?
	`;
	let my_user_id = req.session.UserId;
	connection.query(settings_query, my_user_id, (err, results) => {
		let userInfo = [];
		for(let i = 0; i < results.length; i++){
			userInfo.push({
				user: {
					email: results[i].email,
					display_name: results[i].display_name,
					password: results[i].password
				}
			});
		res.render('settings', {userInfo:userInfo});
		};
	});
});

app.post('/settings', (req,res) => {
	let newEmail = `${req.body.email}`;
	let newDisplayName = `${req.body.display_name}`;
	let edit_query =`
		UPDATE users 
		SET email = ?, display_name = ? 
		WHERE id = ?
	`;
	connection.query(edit_query, [newEmail, newDisplayName, req.session.UserId], (err, results) => {
		if (err) throw err;
		res.redirect('/');
	});
});

app.post('/user/password', async (req,res) => {
	let oldPassword = `${req.body.old_password}`;
	let password_query = `
	SELECT password 
	FROM users
	WHERE users.id = ?
	`;
	connection.query(password_query, req.session.UserId,  async (err, results) => {
		if (await bcrypt.compare(oldPassword, results[0].password)) {
			let newPassword = `${req.body.password}`;
			let checkPassword = `${req.body.check_password}`;
			if(newPassword == checkPassword) {
				const salt = await bcrypt.genSalt();
				const changePassword = `${await bcrypt.hash(req.body.password, salt)}`;
				let new_password_query =`
				UPDATE users 
				SET password = ? 
				WHERE id = ?
				`;
				connection.query(new_password_query, [changePassword, req.session.UserId], (err, results) => {
					if (err) throw err;
					res.redirect('/');
				});
			} else {
				res.send('Passwords Do Not Match');
			};
		} else {
			res.send('Incorrect Password');
		};
	});
});

app.get('*', (req, res) => {
	res.render('404');
});

const connection = mysql.createConnection({
	host     : process.env.DB_HOST,
	user     : process.env.DB_USER,
	password : process.env.DB_PASS,
	database : process.env.DB_SCHEMA,
	port     : process.env.DB_PORT
});
connection.connect();

app.listen( process.env.PORT || 8080);
