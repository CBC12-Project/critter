
const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session')
require('dotenv').config();
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
	console.log(req.session.loggedin)
	let crit_query = `
		SELECT 
			crits.id, crits.user_id, users.display_name, 
			users.username, crits.crit_reply_id,
			crits.message, crits.created_on, 
			count(crit_replies.id) AS replies,
			ifnull(
				(
					SELECT count(crit_likes.id) 
					FROM crit_likes 
					WHERE crit_likes.crit_id = crits.id 
					GROUP BY crit_likes.crit_id
				), 0
			) AS likes
		FROM crits 
		LEFT JOIN crits AS crit_replies
			ON crit_replies.crit_reply_id = crits.id 
		LEFT JOIN crit_likes
			ON crit_likes.crit_id = crits.id
		LEFT JOIN users 
			ON crits.user_id = users.id
		WHERE crits.crit_reply_id is null
		GROUP BY crits.id
		ORDER BY crits.created_on DESC
		LIMIT 10
	`;
	connection.query(crit_query, req.params.crits, (err, results) => {
		let crits = [];
		for (let i = 0; i<results.length; i++){
			crits.push({
				user: {
					display_name: results[i].display_name,
					picture: '',
					username: '@' + results[i].username
				},
				crit: {
					id: results[i].id,
					created_on: results[i].created_on,
					likes: results[i].likes,
					replies: results[i].replies,
					message: results[i].message
				}
			})
		}
		console.log(req.session.UserId)
		
		res.render('timeline', {crits:crits});
	});
});

//search route 

app.get('/search', (req, res) => {
    let searchParam = `%${req.query.search}%`;
	let search_query = `
    SELECT 
        crits.id, crits.user_id, users.display_name, 
        users.username, crits.crit_reply_id,
        crits.message, crits.created_on 
    FROM crits 
    LEFT JOIN users 
    ON crits.user_id = users.id 
    WHERE crits.message 
    lIKE ?`;
	connection.query(search_query, searchParam, (err, results) => {
		let crit_results = [];
		for(let i = 0; i < results.length; i++){
			crit_results.push({
				user: {
					display_name: results[i].display_name,
					picture: '',
					username: '@' + results[i].username
				},
				crit: {
					id: results[i].id,
					created_on: results[i].created_on,
					likes: 0,
					replies: 0,
					message: results[i].message
				}
			});
        };
		res.render('search', {crit_results:crit_results});
	});
	
});

app.post('/signup', (req, res) => {
	let signupEmail = `${req.body.email}`
	let signupUsername = `${req.body.username}`
	let signupDisplayname= `${req.body.display_name}`
	let signupPassword = `${req.body.password}`
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
		(NULL, ?, ?, ?, ?, current_timestamp());`;
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
});

app.post('/auth', (req, res) => {
	let loginEmail = `${req.body.email}`
	let loginPassword = `${req.body.password}`
	let login_query = `
	SELECT users.id, users.display_name, users.username
	FROM users 
	WHERE users.email = ? 
	AND users.password = ?;
	`;
	connection.query(login_query, [loginEmail, loginPassword], (err, results) => {
		
		if (results.length > 0) {
			req.session.loggedin = true;
			req.session.UserId = results[0].id;
			req.session.display_name = results[0].display_name;
			req.session.username = results[0].username;
			console.log(req.session.loggedin);
			res.redirect('/');
		} else {
			res.send('Incorrect Username and/or Password!');
		};
		res.end();
		console.log(results);
	});
});

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
		res.end()
	}
})

//welcome page route
app.get('/welcome', (req, res) => {
        console.log("loaded welcome page")
	res.render('newusers.ejs');
});
//route for profile
app.get('/profile', (req, res) => {
	res.render('profile');
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

app.get('*', (req, res) => {
	res.render('404');
});

const connection = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : 'critter',
        port     : process.env.DB_PORT
});
connection.connect();

app.listen( process.env.PORT || 8080);