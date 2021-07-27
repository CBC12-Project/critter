
const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');
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
	let crit_query = `
		SELECT 
			crits.id, crits.user_id, users.display_name, 
			users.username, crits.crit_reply_id,
			crits.message, crits.created_on 
		FROM crits 
		LEFT JOIN users 
		ON crits.user_id = users.id
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
					likes: 0,
					replies: 0,
					message: results[i].message
				}
			})
		}		
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

app.post('/signup', async (req, res) => {
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
});

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
	res.render('profile');
});

app.all('/user/:following_id/follow', (req, res) => {
	let query = `
		INSERT INTO followers (user_id, following_id) VALUES (?, ?)
	`;

	// TODO(erh): grab the current user ID from the session 
	// when Lia finishes coding the login system.
	let my_user_id = 1; 

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

	// TODO(erh): grab the current user ID from the session 
	// when Lia finishes coding the login system.
	let my_user_id = 1; 

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