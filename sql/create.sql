CREATE TABLE `user` (
    `user_id` varchar(20) NOT NULL, 
    `password` char(60) NOT NULL, 
    `email` varchar(50) NOT NULL, 
    `name` varchar(20) NOT NULL, 
    `birth_date` date NULL, 
    `gender` tinyint NULL, 
    PRIMARY KEY (`user_id`, `email`)
)