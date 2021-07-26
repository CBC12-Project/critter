CREATE TABLE `crits` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
	`crit_reply_id` INT(11) NULL,
    `message` text NOT NULL,
    `created_on` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8mb4;	

CREATE TABLE `crit_likes` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `crit_id` int(11) NOT NULL,
    `user_id` int(11) NOT NULL,
    `created_on` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB  CHARSET=utf8mb4;

CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `display_name` varchar(255) NOT NULL,
    `created_on` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8mb4;

CREATE TABLE `followers` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`user_id` INT(11) NOT NULL,
	`following_id` INT(11) NOT NULL,
	PRIMARY KEY(`id`)
) ENGINE=InnoDB CHARSET=utf8mb4;
