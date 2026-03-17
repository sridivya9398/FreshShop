CREATE TABLE items (
  id          INT(10) AUTO_INCREMENT PRIMARY KEY NOT NULL,
  category_id INT(10) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  price       DECIMAL(10,2) DEFAULT '0.00',
  CONSTRAINT `fk_items_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB;

INSERT INTO items (id, category_id, name, price)
VALUES
  -- Produce (category 1)
  (1,  1, 'Organic Carrot Bundle',   1.99),
  (2,  1, 'Fuji Apple',              0.89),
  (3,  1, 'Navel Orange',            1.25),
  (4,  1, 'Fresh Spinach',           2.49),
  (5,  1, 'Bananas (Bunch)',         1.79),

  -- Beer (category 2)
  (6,  2, 'Michelob ULTRA 6-Pack',   8.99),
  (7,  2, 'Coors Light 12-Pack',    14.99),
  (8,  2, 'Spotted Cow 6-Pack',     10.49),

  -- Bakery (category 3)
  (9,  3, 'Glazed Donut',            1.50),
  (10, 3, 'Sourdough Bread',         4.50),
  (11, 3, 'Cinnamon Roll',           2.50),
  (12, 3, 'Chocolate Croissant',     3.00),
  (13, 3, 'French Baguette',         3.50),

  -- Dairy (category 4)
  (14, 4, 'Whole Milk (1 Gallon)',   3.79),
  (15, 4, 'Cheddar Cheese (8oz)',    4.49),
  (16, 4, 'Greek Yogurt',            1.99),
  (17, 4, 'Unsalted Butter',         5.29),

  -- Snacks (category 5)
  (18, 5, 'Lay''s Classic Chips',    4.29),
  (19, 5, 'Oreo Cookies',            3.99),
  (20, 5, 'Mixed Nuts (8oz)',        6.49),
  (21, 5, 'Granola Bar (6-Pack)',    4.99),

  -- Frozen (category 6)
  (22, 6, 'Frozen Pizza',            7.99),
  (23, 6, 'Ice Cream (Vanilla)',     5.49),
  (24, 6, 'Frozen Burritos (4pk)',   6.79),
  (25, 6, 'Edamame (Frozen)',        3.29);