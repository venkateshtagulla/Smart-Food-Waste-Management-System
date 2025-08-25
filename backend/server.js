const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
//app.use(cors({ origin: 'https://your-frontend-url.onrender.com' }));

app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  //ssl: { rejectUnauthorized: false },
  ssl: process.env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
};

// Create database connection pool
let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Database connection pool created');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Routes

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT i.*, s.name as supplier_name 
      FROM Items i 
      LEFT JOIN Suppliers s ON i.supplier_id = s.supplier_id 
      ORDER BY i.expiry_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get expiring items (within 3 days)
app.get('/api/items/expiring', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT i.*, s.name as supplier_name 
      FROM Items i 
      LEFT JOIN Suppliers s ON i.supplier_id = s.supplier_id 
      WHERE i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
      AND i.expiry_date >= CURDATE()
      AND i.quantity > 0
      ORDER BY i.expiry_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

// Add new item
app.post('/api/items', async (req, res) => {
  try {
    const { name, category, quantity, purchase_date, expiry_date, supplier_id } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO Items (name, category, quantity, purchase_date, expiry_date, supplier_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, quantity, purchase_date, expiry_date, supplier_id || null]
    );
    
    res.status(201).json({ 
      message: 'Item added successfully', 
      item_id: result.insertId 
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update item
app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, purchase_date, expiry_date, supplier_id } = req.body;
    
    await pool.execute(
      'UPDATE Items SET name = ?, category = ?, quantity = ?, purchase_date = ?, expiry_date = ?, supplier_id = ? WHERE item_id = ?',
      [name, category, quantity, purchase_date, expiry_date, supplier_id || null, id]
    );
    
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM Items WHERE item_id = ?', [id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get all suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Suppliers ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Log sale
app.post('/api/sales', async (req, res) => {
  try {
    const { item_id, quantity_sold, sale_date } = req.body;
    
    // First check if item exists and has enough quantity
    const [itemRows] = await pool.execute('SELECT quantity FROM Items WHERE item_id = ?', [item_id]);
    
    if (itemRows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (itemRows[0].quantity < quantity_sold) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }
    
    // Insert sale record
    await pool.execute(
      'INSERT INTO Sales (item_id, quantity_sold, sale_date) VALUES (?, ?, ?)',
      [item_id, quantity_sold, sale_date]
    );
    
    // Update item quantity
    await pool.execute(
      'UPDATE Items SET quantity = quantity - ? WHERE item_id = ?',
      [quantity_sold, item_id]
    );
    
    res.status(201).json({ message: 'Sale recorded successfully' });
  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// Get sales history
app.get('/api/sales', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.*, i.name as item_name, i.category 
      FROM Sales s 
      JOIN Items i ON s.item_id = i.item_id 
      ORDER BY s.sale_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Log waste
app.post('/api/waste', async (req, res) => {
  try {
    const { item_id, quantity_wasted, reason, date_logged } = req.body;
    
    // Check if item exists and has enough quantity
    const [itemRows] = await pool.execute('SELECT quantity FROM Items WHERE item_id = ?', [item_id]);
    
    if (itemRows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (itemRows[0].quantity < quantity_wasted) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }
    
    // Insert waste record
    await pool.execute(
      'INSERT INTO Waste_Log (item_id, quantity_wasted, reason, date_logged) VALUES (?, ?, ?, ?)',
      [item_id, quantity_wasted, reason, date_logged]
    );
    
    // Update item quantity
    await pool.execute(
      'UPDATE Items SET quantity = quantity - ? WHERE item_id = ?',
      [quantity_wasted, item_id]
    );
    
    res.status(201).json({ message: 'Waste logged successfully' });
  } catch (error) {
    console.error('Error logging waste:', error);
    res.status(500).json({ error: 'Failed to log waste' });
  }
});

// Get waste log
app.get('/api/waste', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT w.*, i.name as item_name, i.category 
      FROM Waste_Log w 
      JOIN Items i ON w.item_id = i.item_id 
      ORDER BY w.date_logged DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching waste log:', error);
    res.status(500).json({ error: 'Failed to fetch waste log' });
  }
});

// Get redistribution suggestions
app.get('/api/redistribution', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM Items 
      WHERE quantity > 10 
      AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND expiry_date > CURDATE()
      ORDER BY expiry_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching redistribution suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch redistribution suggestions' });
  }
});

// Record redistribution
app.post('/api/redistribution/send', async (req, res) => {
  try {
    const { item_id, quantity, destination, date_sent } = req.body;
    
    // Check if item exists and has enough quantity
    const [itemRows] = await pool.execute('SELECT quantity FROM Items WHERE item_id = ?', [item_id]);
    
    if (itemRows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (itemRows[0].quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }
    
    // Insert redistribution record
    await pool.execute(
      'INSERT INTO Redistribution (item_id, quantity, destination, date_sent) VALUES (?, ?, ?, ?)',
      [item_id, quantity, destination, date_sent]
    );
    
    // Update item quantity
    await pool.execute(
      'UPDATE Items SET quantity = quantity - ? WHERE item_id = ?',
      [quantity, item_id]
    );
    
    res.status(201).json({ message: 'Redistribution recorded successfully' });
  } catch (error) {
    console.error('Error recording redistribution:', error);
    res.status(500).json({ error: 'Failed to record redistribution' });
  }
});

// Get redistribution history
app.get('/api/redistribution/history', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*, i.name as item_name, i.category 
      FROM Redistribution r 
      JOIN Items i ON r.item_id = i.item_id 
      ORDER BY r.date_sent DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching redistribution history:', error);
    res.status(500).json({ error: 'Failed to fetch redistribution history' });
  }
});

// Analytics - Dashboard stats
app.get('/api/analytics/dashboard-stats', async (req, res) => {
  try {
    const [[totalItemsResult]] = await pool.execute('SELECT COALESCE(SUM(quantity), 0) as total_items FROM Items');
    const [[expiringResult]] = await pool.execute('SELECT COUNT(*) as expiring_count FROM Items WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY) AND expiry_date >= CURDATE() AND quantity > 0');
    const [[totalSalesResult]] = await pool.execute('SELECT COALESCE(SUM(quantity_sold), 0) as total_sales FROM Sales');
    const [[totalWasteResult]] = await pool.execute('SELECT COALESCE(SUM(quantity_wasted), 0) as total_waste FROM Waste_Log');
    
    res.json({
      totalItems: totalItemsResult.total_items,
      expiringCount: expiringResult.expiring_count,
      totalSales: totalSalesResult.total_sales,
      totalWaste: totalWasteResult.total_waste
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Analytics - Monthly waste report
app.get('/api/analytics/monthly-waste', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date_logged, '%Y-%m') as month,
        SUM(quantity_wasted) as total_waste
      FROM Waste_Log 
      GROUP BY DATE_FORMAT(date_logged, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching monthly waste:', error);
    res.status(500).json({ error: 'Failed to fetch monthly waste data' });
  }
});

// Analytics - Top wasted items
app.get('/api/analytics/top-wasted', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        i.name as item_name,
        SUM(w.quantity_wasted) as total_wasted
      FROM Waste_Log w
      JOIN Items i ON w.item_id = i.item_id
      GROUP BY w.item_id, i.name
      ORDER BY total_wasted DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching top wasted items:', error);
    res.status(500).json({ error: 'Failed to fetch top wasted items' });
  }
});

// Analytics - Waste cost by category
app.get('/api/analytics/waste-cost', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        i.category,
        SUM(w.quantity_wasted) * 5 as estimated_cost
      FROM Waste_Log w
      JOIN Items i ON w.item_id = i.item_id
      GROUP BY i.category
      ORDER BY estimated_cost DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching waste cost data:', error);
    res.status(500).json({ error: 'Failed to fetch waste cost data' });
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;