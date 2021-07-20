CREATE TABLE `crits` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `crit_id` int(11) DEFAULT NULL,
    `message` text NOT NULL,
    `created_on` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4	

CREATE TABLE `crit_likes` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `crit_id` int(11) NOT NULL,
    `user_id` int(11) NOT NULL,
    `created_on` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `display_name` varchar(255) NOT NULL,
    `created_on` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4