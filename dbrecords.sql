truncate `crits`;
INSERT INTO `crits`(`id`, `user_id`, `crit_reply_id`, `message`, `created_on`) VALUES (NULL,'1', NULL,'hiiiii this is my first crit!', '2021-07-21 17:55:09');
INSERT INTO `crits`(`id`, `user_id`, `crit_reply_id`, `message`, `created_on`) VALUES (NULL,'6','1','hi lia!', '2021-07-21 17:56:09');
INSERT INTO `crits`(`id`, `user_id`, `crit_reply_id`, `message`, `created_on`) VALUES (NULL,'7','1','go away', '2021-07-21 17:57:09');

truncate `crit_likes`;
INSERT INTO `crit_likes` (`id`, `crit_id`, `user_id`, `created_on`) VALUES (NULL, '1', '2', '2021-07-21 17:56:09');

truncate `users`;
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'liaaa', 'lianeville5@gmail.com', '$2b$10$ndGmepTkE9G4.C3ZuAuLWOwI6TPS8lDOazFRXzbBHq09aG5fSY.6m', 'lia', '2021-07-21 17:50:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'andrewwww', 'abuchholz33@gmail.com', '$2b$10$zEEgN19ij7xo9F9EaFT4A.Y9XgYCvAsylmfw9D6NEu1vXyEGCWkDW', 'andrew', '2021-07-21 17:55:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'aeastraeaeaea', 'abombita98@hotmail.com', '$2b$10$aj7rK8ozS2iyICloWSpVdOPhT0vq98.yRjLuLWpyqsQtdsfeAfdbK', 'astraea', '2021-07-21 17:55:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'gregoryyy', 'gdixon5125@gmail.com', '$2b$10$2f49QHwCfDmwuNuPzQ9vQuwAaIUs2hIL8.HULURsh30MvB61Zh8MW', 'gregory', '2021-07-21 17:55:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'ericcc', 'erh@theclubhou.se', '$2b$10$syWncxyZvz6h9gRS5KDJh.h.Qk2W1Fxf3uM7cxujsa5qoS0z/0d8m', 'eric', '2021-07-21 17:55:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'cookies', 'cookies@gmail.com', '$2b$10$LzuuOuZpLX3aDI7bcQoAY.Qr5R6YwcYVnBJU1gUI9wJlLbqaCjt/2', 'someone', '2021-07-21 15:50:09');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `created_on`) VALUES (NULL, 'unfriendly', 'unfriendly@gmail.com', '$2b$10$XXd3w3l6yRLm.O37vUbVAeSxoi6fc6swA2.VmeNpMRlItaTLhEvfK', 'evil', '2021-07-21 17:55:09');