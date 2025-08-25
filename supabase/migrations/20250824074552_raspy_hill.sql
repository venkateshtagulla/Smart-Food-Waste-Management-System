/*
# Smart Food Waste Management Database Schema (MySQL 8 Compatible)

- Removed unsafe triggers that modify Items.
- Added stored procedures to safely handle inserts and update Items.quantity.
*/

-- Create database
CREATE DATABASE IF NOT EXISTS defaultdb;
USE defaultdb;

-- Drop tables if exist
DROP TABLE IF EXISTS Redistribution;
DROP TABLE IF EXISTS Waste_Log;
DROP TABLE IF EXISTS Sales;
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Suppliers;

-- ============================
-- Tables
-- ============================

CREATE TABLE Suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact_info VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    purchase_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    supplier_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id) ON DELETE SET NULL,
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_category (category),
    INDEX idx_quantity (quantity)
);

CREATE TABLE Sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    quantity_sold INT NOT NULL,
    sale_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    INDEX idx_sale_date (sale_date)
);

CREATE TABLE Waste_Log (
    waste_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    quantity_wasted INT NOT NULL,
    reason VARCHAR(200) NOT NULL,
    date_logged DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    INDEX idx_date_logged (date_logged),
    INDEX idx_reason (reason)
);

CREATE TABLE Redistribution (
    redistribution_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    destination VARCHAR(100) NOT NULL,
    date_sent DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    INDEX idx_date_sent (date_sent),
    INDEX idx_destination (destination)
);

-- ============================
-- Sample Data
-- ============================

INSERT INTO Suppliers (name, contact_info) VALUES
('Fresh Farm Co.', 'contact@freshfarm.com, +1-555-0101'),
('Organic Produce Ltd.', 'info@organicproduce.com, +1-555-0102'),
('Quality Foods Inc.', 'orders@qualityfoods.com, +1-555-0103');

INSERT INTO Items (name, category, quantity, purchase_date, expiry_date, supplier_id) VALUES
('Organic Apples', 'Fruits', 50, '2025-01-01', '2025-01-15', 1),
('Fresh Milk', 'Dairy', 30, '2025-01-02', '2025-01-07', 2),
('Whole Wheat Bread', 'Grains', 25, '2025-01-01', '2025-01-06', 3),
('Greek Yogurt', 'Dairy', 40, '2025-01-03', '2025-01-10', 2),
('Chicken Breast', 'Meat', 20, '2025-01-02', '2025-01-08', 3),
('Spinach', 'Vegetables', 35, '2025-01-01', '2025-01-05', 1),
('Orange Juice', 'Beverages', 45, '2025-01-03', '2025-01-12', 2),
('Ground Beef', 'Meat', 15, '2025-01-02', '2025-01-09', 3),
('Bananas', 'Fruits', 60, '2025-01-01', '2025-01-08', 1),
('Cheddar Cheese', 'Dairy', 25, '2025-01-03', '2025-01-17', 2),
('Tomatoes', 'Vegetables', 40, '2025-01-01', '2025-01-07', 1),
('Brown Rice', 'Grains', 100, '2025-01-02', '2025-03-15', 3);

INSERT INTO Sales (item_id, quantity_sold, sale_date) VALUES
(1, 10, '2025-01-03'),
(2, 5, '2025-01-03'),
(3, 8, '2025-01-04'),
(4, 6, '2025-01-04'),
(5, 3, '2025-01-03'),
(7, 12, '2025-01-04'),
(9, 15, '2025-01-03'),
(10, 4, '2025-01-04');

INSERT INTO Waste_Log (item_id, quantity_wasted, reason, date_logged) VALUES
(6, 5, 'Expired', '2025-01-04'),
(2, 2, 'Spoiled', '2025-01-04'),
(11, 3, 'Damaged', '2025-01-03'),
(1, 2, 'Overripe', '2025-01-03');

INSERT INTO Redistribution (item_id, quantity, destination, date_sent) VALUES
(9, 10, 'Local Food Bank', '2025-01-04'),
(7, 8, 'Community Kitchen', '2025-01-04'),
(1, 5, 'Animal Shelter', '2025-01-03');

-- ============================
-- Views
-- ============================

CREATE OR REPLACE VIEW Expiring_Items AS
SELECT i.*, s.name AS supplier_name,
       DATEDIFF(i.expiry_date, CURDATE()) AS days_until_expiry
FROM Items i
LEFT JOIN Suppliers s ON i.supplier_id = s.supplier_id
WHERE i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
  AND i.expiry_date >= CURDATE()
  AND i.quantity > 0
ORDER BY i.expiry_date ASC;

CREATE OR REPLACE VIEW Monthly_Waste_Report AS
SELECT DATE_FORMAT(w.date_logged, '%Y-%m') AS month,
       i.category,
       COUNT(*) AS waste_incidents,
       SUM(w.quantity_wasted) AS total_waste_quantity,
       AVG(w.quantity_wasted) AS avg_waste_per_incident
FROM Waste_Log w
JOIN Items i ON w.item_id = i.item_id
GROUP BY DATE_FORMAT(w.date_logged, '%Y-%m'), i.category
ORDER BY month DESC, total_waste_quantity DESC;

-- ============================
-- Stored Procedures
-- ============================

DELIMITER //

DROP PROCEDURE IF EXISTS InsertSale;
CREATE PROCEDURE InsertSale(IN p_item_id INT, IN p_quantity INT, IN p_sale_date DATE)
BEGIN
    INSERT INTO Sales(item_id, quantity_sold, sale_date)
    VALUES (p_item_id, p_quantity, p_sale_date);
    
    UPDATE Items
    SET quantity = quantity - p_quantity
    WHERE item_id = p_item_id;
END;
//

DROP PROCEDURE IF EXISTS InsertWaste;
CREATE PROCEDURE InsertWaste(IN p_item_id INT, IN p_quantity INT, IN p_reason VARCHAR(200), IN p_date DATE)
BEGIN
    INSERT INTO Waste_Log(item_id, quantity_wasted, reason, date_logged)
    VALUES (p_item_id, p_quantity, p_reason, p_date);

    UPDATE Items
    SET quantity = GREATEST(0, quantity - p_quantity)
    WHERE item_id = p_item_id;
END;
//

DROP PROCEDURE IF EXISTS InsertRedistribution;
CREATE PROCEDURE InsertRedistribution(IN p_item_id INT, IN p_quantity INT, IN p_destination VARCHAR(100), IN p_date DATE)
BEGIN
    INSERT INTO Redistribution(item_id, quantity, destination, date_sent)
    VALUES (p_item_id, p_quantity, p_destination, p_date);

    UPDATE Items
    SET quantity = GREATEST(0, quantity - p_quantity)
    WHERE item_id = p_item_id;
END;
//

DELIMITER ;

-- ============================
-- Expired Items Logging
-- ============================

INSERT INTO Waste_Log(item_id, quantity_wasted, reason, date_logged)
SELECT item_id, quantity, 'Expired', CURDATE()
FROM Items
WHERE expiry_date < CURDATE() AND quantity > 0;

-- ============================
-- Indexes
-- ============================

CREATE INDEX idx_items_expiry_quantity ON Items(expiry_date, quantity);
CREATE INDEX idx_waste_date_category ON Waste_Log(date_logged);
CREATE INDEX idx_sales_date ON Sales(sale_date);
CREATE INDEX idx_redistribution_date ON Redistribution(date_sent);

-- ============================
-- Status & Reports
-- ============================

SELECT 'Database setup completed successfully!' AS status,
       (SELECT COUNT(*) FROM Suppliers) AS suppliers_count,
       (SELECT COUNT(*) FROM Items) AS items_count,
       (SELECT COUNT(*) FROM Sales) AS sales_count,
       (SELECT COUNT(*) FROM Waste_Log) AS waste_records_count,
       (SELECT COUNT(*) FROM Redistribution) AS redistribution_count;

SELECT 'Current Expiring Items:' AS info;
SELECT * FROM Expiring_Items;

SELECT 'Recent Monthly Waste Report:' AS info;
SELECT * FROM Monthly_Waste_Report LIMIT 5;
