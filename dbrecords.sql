truncate `crits`;
INSERT INTO `crits`(`id`, `user_id`, `crit_reply_id`, `message`, `created_on`) VALUES ('','1', NULL,'hiiiii this is my first crit!', '2021-07-21 17:55:09');
INSERT INTO `crits`(`id`, `user_id`, `crit_reply_id`, `message`, `created_on`) VALUES ('','6','1','hi lia!', '2021-07-21 17:56:09');
INSERT INTO `crits`(`id`, `user_id`, `crit_reply_id`, `message`, `created_on`) VALUES ('','7','1','go away', '2021-07-21 17:57:09');

truncate `crit_likes`;
INSERT INTO `crit_likes` (`id`, `crit_id`, `user_id`, `created_on`) VALUES (NULL, '1', '2', '2021-07-21 17:56:09');

truncate `users`;
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'liaaa', 'lianeville5@gmail.com', '123', 'lia', '2021-07-21 17:50:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'andrewwww', 'abuchholz33@gmail.com', '123', 'andrew', '2021-07-21 17:55:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'aeastraeaeaea', 'abombita98@hotmail.com', '123', 'astraea', '2021-07-21 17:55:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'gregoryyy', 'gdixon5125@gmail.com', '123', 'gregory', '2021-07-21 17:55:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'ericcc', 'erh@theclubhou.se', '123', 'eric', '2021-07-21 17:55:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'cookies', 'cookies@gmail.com', '123', 'someone', '2021-07-21 15:50:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'unfriendly', 'unfriendly@gmail.com', '123', 'evil', '2021-07-21 17:55:09');