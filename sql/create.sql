CREATE TABLE `user` (
    `role` varchar(20) NOT NULL DEFAULT 'basicuser', 
    `user_id` varchar(20) NOT NULL, 
    `password` char(60) NOT NULL, 
    `accessToken` varchar(256) NULL, 
    `refresh_token` varchar(256) NULL, 
    INDEX `IDX_6620cd026ee2b231beac7cfe57` (`role`), 
    INDEX `IDX_758b8ce7c18b9d347461b30228` (`user_id`), 
    PRIMARY KEY (`user_id`)) ENGINE=InnoDB