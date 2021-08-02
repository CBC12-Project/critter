const express = require('express');
const router = express.Router();
const mysql = require('mysql');
require('dotenv').config();
const md5 = require('md5');

router.get('/', (req, res) => {
    res.redirect('/');
});


router.get('/:crit_id',(req, res) => {
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
		LEFT JOIN crit_likes AS user_liked
			ON user_liked.user_id = ? AND user_liked.crit_id = crits.id
		LEFT JOIN users 
		ON crits.user_id = users.id 
		WHERE crits.id = ?
		GROUP BY crits.id
	`;
	let user_id = req.session.UserId || 0;
    connection.query(crit_query, [user_id, req.params.crit_id], (err, results) => {
        let crit = {
            user: {
                display_name: results[0].display_name,
                picture: 'https://www.gravatar.com/avatar/' + md5(results[0].email),
                username: results[0].username
            },
            crit: {
                replyCrits: [],
                id: results[0].id,
                created_on: results[0].created_on,
                likes: results[0].likes,
                replies: results[0].replies - (results[0].replies > 0 ? results[0].likes : 0),
                message: results[0].message,
				isLiked: results[0].isLiked
            }
        };
    let replies_query=`
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
			ON crits.user_id = ? AND crit_likes.crit_id = crits.id
        WHERE crits.crit_reply_id = ?
        GROUP BY crits.id`;
	let user_id = req.session.UserId || 0;
    connection.query(replies_query, [user_id, req.params.crit_id], (err, result) =>{

            for ( let i = 0; i < result.length; i++ ){
                let replyCrit = {
                    user: {
                        display_name: result[i].display_name,
                        picture: 'https://www.gravatar.com/avatar/' + md5(result[i].email),
                        username: result[i].username
                    },
                    crit: {
                        replyCrits: [],
                        id: result[i].id,
                        created_on: result[i].created_on,
                        likes: result[i].likes,
                        replies: result[i].replies - (result[i].replies > 0 ? result[i].likes : 0),
                        message: result[i].message,
						isLiked: result[i].isLiked
                    }
                };
                crit.crit.replyCrits.push(replyCrit);
            }
            let mode = 'single-crit';
            res.render('timeline', {crit, mode});
        });
	});
});
router.post('/create',(req, res) => {
    if (req.session.loggedin) {
        let createCrit = req.body.createCrit;
        if (createCrit == ""){
            return res.redirect("back");
        } else {
            let crit_query = `
            INSERT INTO crits 
                    (id, user_id, crit_reply_id, message, created_on)
            VALUES
                    (NULL, ?, NULL, ?, current_timestamp());
            `;
            connection.query(crit_query, [req.session.UserId.toString(), createCrit.toString()], function(err, res) {
                    if (err) throw err;
            });
            res.redirect('/');
        }	
    } else {
        res.send("You're not logged in!")
    }
});

router.post('/:crit_id',(req, res) => {
    if (req.session.loggedin) {
        let replyCrit = req.params.crit_id;
        if (req.body.replyCrit == ""){
            return res.redirect("back");
        } else {
            let crit_query = `
            INSERT INTO crits 
                    (id, user_id, crit_reply_id, message, created_on)
            VALUES
                    (NULL, ?,?,?, current_timestamp())
            `;
            connection.query(crit_query, [req.session.UserId, replyCrit, req.body.replyCrit], function(err, result) {
                if (err) throw err;
                res.redirect('/crit/' + replyCrit);
            });
        }
    } else {
        res.send("You're not logged in!")
    }
});

const connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_SCHEMA,
    port     : process.env.DB_PORT
});
connection.connect();



module.exports = router;