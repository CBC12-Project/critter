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

app.use( express.static('static') );
app.set('view engine', 'ejs');

app.get('/crit/:crit_id', (req, res) => {
	let crit_query = `
		SELECT 
			crits.id, crits.user_id, users.display_name, 
			users.username, crits.crit_reply_id,
			crits.message, crits.created_on 
		FROM crits 
		LEFT JOIN users 
		ON crits.user_id = users.id 
		WHERE crits.id = ?;
	`;
	connection.query(crit_query, req.params.crit_id, (err, results) => {
		let crit = {
			user: {
				display_name: results[0].display_name,
				picture: '',
				username: '@' + results[0].username
			},
			crit: {
				id: results[0].id,
				created_on: results[0].created_on,
				likes: 0,
				replies: 0,
				message: results[0].message
			}
		};
		res.render('crit', crit);
	});
});

app.post('/create', (req, res) => {
		if (req.session.UserId) {
			let createCrit = req.body.createCrit;
			let crit_query = `
			INSERT INTO crits 
					(id, user_id, crit_reply_id, message, created_on)
			VALUES
					(NULL, ?, NULL, ?, current_timestamp());
			`;
			connection.query(crit_query, [req.session.UserId.toString(), createCrit.toString()], function(err, res) {
					if (err) throw err;
			})
			res.redirect('/');	
		}
})
// Route for Timeline

app.get('/', (req, res) => {
	console.log(req.session.loggedin)
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
					})		
				} else {
					res.send('Username already in use!')
				}
			})
		} else {
			res.send('Email already in use!');
		}
	})
})

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
		console.log(results)
	});
});

app.post('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy(err => {
			if (err) {
				res.status(400).send('Unable to log out')
			} else {
				res.redirect('/');
			}
		});
	} else {
		res.end()
	}
})


const connection = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : 'critter',
        port     : process.env.DB_PORT
});
connection.connect();

app.listen( process.env.PORT || 8080);