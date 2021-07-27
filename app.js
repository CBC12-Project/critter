const express = require('express');
const app = express();
const mysql = require('mysql');
require('dotenv').config();
app.use(express.urlencoded({extended:true}));
app.use( express.static('static') );
app.set('view engine', 'ejs');


const critRoute = require('./critRouter');
app.use('/crit', critRoute);

//welcome page route
app.get('/welcome', (req, res) => {
        console.log("loaded welcome page")
	res.render('newusers.ejs');
});
//route for profile
app.get('/profile', (req, res) => {
	res.render('profile');
});
app.get('*', (req, res) => {
	res.render('404');
});

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



const connection = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : 'critter',
        port     : process.env.DB_PORT
});
connection.connect();

app.listen( process.env.PORT || 8080);
