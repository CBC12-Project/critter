const express = require('express');
const router = express.Router();
const mysql = require('mysql');
require('dotenv').config();

router.get('/', (req, res) => {
    res.redirect('/');
});


router.get('/:crit_id',(req, res) => {
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
		WHERE crits.id = ?
		GROUP BY crits.id
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
				likes: results[0].likes,
				replies: results[0].replies,
				message: results[0].message
			}
		};
		res.render('crit', crit);
	});
});
router.post('/create',(req, res) => {
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
});

router.post('/:crit_id',(req, res) => {
    let currentUserId = 1;
    let replyCrit = req.params.crit_id;
    let crit_query = `
    INSERT INTO crits 
            (id, user_id, crit_reply_id, message, created_on)
    VALUES
            (NULL, ?,?,?, current_timestamp())
    `;
connection.query(crit_query, [currentUserId, replyCrit, req.body.replyCrit], function(err, result) {
        if (err) throw err;
		res.redirect('/crit/' + result.insertId);
        console.log(result);
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



module.exports = router;