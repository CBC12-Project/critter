const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
    res.redirect('/')
}


router.route('/')
.get('/:crit_id',(req, res) => {
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
})
.post((req, res) => {
    let currentUserId = 1;
    let createCrit = req.body.createCrit;
    let crit_query = `
    INSERT INTO crits 
            (id, user_id, crit_reply_id, message, created_on)
    VALUES
            (NULL, ?, NULL, ?, current_timestamp());
    `;
    connection.query(crit_query, [currentUserId.toString(), createCrit.toString()], function(err, res) {
            if (err) throw err;
    })
    res.redirect('/');
})








module.exports = router;