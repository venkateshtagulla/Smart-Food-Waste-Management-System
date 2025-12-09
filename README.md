# Smart Food Waste Management System

A comprehensive full-stack application for managing food inventory, tracking waste, and optimizing redistribution to minimize food waste. Built with React frontend, Node.js backend, and MySQL database.

[![Live Project](https://img.shields.io/badge/Live%20Project-Visit%20Now-brightgreen)](https://food-waste-management-system-67c9.onrender.com)

## Live Project

Check out the live project [here](https://food-waste-management-system-67c9.onrender.com)

## 🚀 Features

### Core Functionality
- **Inventory Management**: Complete CRUD operations for food items
- **Sales Tracking**: Record sales and automatically update inventory
- **Waste Logging**: Track wasted items with detailed reasons
- **Redistribution Management**: Smart suggestions for food redistribution
- **Analytics Dashboard**: Real-time insights and waste trend analysis

### Advanced Features
- **Expiry Tracking**: Automatic alerts for items expiring soon
- **Automated Triggers**: Database triggers for expired items
- **Smart Suggestions**: AI-driven redistribution recommendations
- **Cost Analysis**: Estimated waste costs by category
- **Responsive Design**: Bootstrap 5 responsive interface

## 🛠 Tech Stack

### Frontend
- **React 18** - Component-based UI library
- **Bootstrap 5** - Responsive CSS framework
- **Chart.js** - Interactive data visualization
- **Axios** - HTTP client for API requests
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL2** - MySQL database driver
- **CORS** - Cross-origin resource sharing

### Database
- **MySQL** - Relational database
- **Aiven** - Cloud database platform (production)
- **Complex Triggers** - Automated waste logging
- **Stored Procedures** - Business logic optimization

## 📁 Project Structure

```
smart-food-waste-management/
├── backend/
│   └── server.js              # Express server with all API routes
├── src/
│   ├── components/
│   │   ├── Analytics.jsx      # Charts and data visualization
│   │   ├── Dashboard.jsx      # Main overview dashboard
│   │   ├── InventoryForm.jsx  # Item management interface
│   │   ├── Redistribution.jsx # Redistribution management
│   │   ├── SalesForm.jsx      # Sales recording interface
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   └── WasteForm.jsx      # Waste logging interface
│   ├── App.jsx                # Main application component
│   ├── index.css              # Global styles and Bootstrap customization
│   └── main.jsx               # React application entry point
├── database/
│   └── schema.sql             # Complete database schema with sample data
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation
```

## 🗄 Database Schema

### Tables
1. **Suppliers** - Supplier information and contact details
2. **Items** - Food inventory with expiry tracking
3. **Sales** - Sales transaction records
4. **Waste_Log** - Waste tracking with reasons and costs
5. **Redistribution** - Food redistribution records

### Key Features
- **Foreign Key Relationships** - Data integrity across all tables
- **Automated Triggers** - Auto-log expired items, update quantities
- **Stored Procedures** - Smart redistribution suggestions
- **Optimized Indexes** - Fast queries for large datasets
- **Views** - Pre-built queries for common operations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MySQL 8.0+ (or Aiven account)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-food-waste-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE food_waste_db;
USE food_waste_db;

# Import schema and sample data
mysql -u root -p food_waste_db < database/schema.sql
```

4. **Configure environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=food_waste_db
PORT=5000
```

For aiven:
```env
DATABASE_URL=mysql://avnadmin:YOUR_PASSWORD@foodwastemanager-foodwastemanager.b.aivencloud.com:12778/defaultdb?ssl={"rejectUnauthorized":true}
```

5. **Start the application**

Development mode (frontend + backend):
```bash
# Terminal 1: Start backend server
npm start

# Terminal 2: Start frontend development server
npm run dev
```

Production mode:
```bash
# Build and serve
npm run build
npm run preview
```

## 📊 API Endpoints

### Items Management
- `GET /api/items` - Get all inventory items
- `GET /api/items/expiring` - Get items expiring within 3 days
- `POST /api/items` - Add new item
- `PUT /api/items/:id` - Update existing item
- `DELETE /api/items/:id` - Delete item

### Sales & Transactions
- `POST /api/sales` - Record a sale
- `GET /api/sales` - Get sales history

### Waste Management
- `POST /api/waste` - Log wasted items
- `GET /api/waste` - Get waste history

### Redistribution
- `GET /api/redistribution` - Get redistribution suggestions
- `POST /api/redistribution/send` - Record redistribution
- `GET /api/redistribution/history` - Get redistribution history

### Analytics
- `GET /api/analytics/dashboard-stats` - Dashboard overview statistics
- `GET /api/analytics/monthly-waste` - Monthly waste trends
- `GET /api/analytics/top-wasted` - Most wasted items
- `GET /api/analytics/waste-cost` - Waste cost analysis

## 🔧 Configuration

### Database Configuration
The application supports both local MySQL and PlanetScale:

**Local MySQL:**
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'food_waste_db'
};
```

**aiven:**
```javascript
const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: process.env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
```

### Frontend Configuration
The frontend automatically proxies API requests to the backend server running on port 5000.

## 🎨 UI Components

### Dashboard Features
- **Real-time Statistics**: Total items, expiring count, sales, and waste
- **Expiring Items Alert**: Prominent warnings for items expiring soon
- **Color-coded Inventory**: Visual status indicators (red=expired, yellow=expiring, green=fresh)

### Form Validation
- **Client-side Validation**: Immediate feedback on form inputs
- **Server-side Validation**: Database integrity and business rules
- **Loading States**: User feedback during API operations

### Responsive Design
- **Mobile-first Approach**: Optimized for all screen sizes
- **Bootstrap Grid System**: Consistent layout across devices
- **Touch-friendly Interface**: Large buttons and intuitive navigation

## 📈 Analytics & Reporting

### Available Reports
1. **Monthly Waste Trends** - Bar chart showing waste patterns over time
2. **Top Wasted Items** - Pie chart of most frequently wasted items
3. **Waste Cost Analysis** - Estimated financial impact by category
4. **Dashboard Statistics** - Real-time overview metrics

### Data Visualization
- **Chart.js Integration** - Interactive, responsive charts
- **Real-time Updates** - Data refreshes automatically
- **Export Capability** - Built-in chart export functionality

## 🚀 Deployment

### Backend Deployment (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure environment variables
4. Set build command: `npm install`
5. Set start command: `node backend/server.js`

### Database Deployment (aiven)
1. Create aiven account and database
2. Import schema using aiven CLI or web interface
3. Configure connection string in environment variables

### Frontend Deployment
The React frontend can be deployed to any static hosting service:
- Render

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🔮 Future Enhancements

- **Machine Learning**: Predictive analytics for waste patterns
- **Mobile App**: React Native companion app
- **IoT Integration**: Smart sensor integration for real-time monitoring
- **Multi-language Support**: Internationalization features
- **Advanced Reporting**: PDF report generation
- **API Integration**: Third-party inventory management systems
