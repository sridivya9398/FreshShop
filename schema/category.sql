CREATE TABLE category (
  id   INT(10) AUTO_INCREMENT PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

INSERT INTO category (id, name)
VALUES
  (1, 'produce'),
  (2, 'beer'),
  (3, 'bakery'),
  (4, 'dairy'),
  (5, 'snacks'),
  (6, 'frozen');