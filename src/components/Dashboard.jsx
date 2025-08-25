import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "./api";

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringCount: 0,
    totalWaste: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [itemsRes, expiringRes, statsRes] = await Promise.all([
        API.get('/api/items'),
        API.get('/api/items/expiring'),
        API.get('/api/analytics/dashboard-stats')
      ]);

      setItems(itemsRes.data);
      setExpiringItems(expiringRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemClass = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring-soon';
    return 'fresh';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">
        <i className="fas fa-tachometer-alt me-2"></i>
        Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="stats-card primary">
            <h3>{stats.totalItems}</h3>
            <p className="mb-0">Total Items</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stats-card warning">
            <h3>{stats.expiringCount}</h3>
            <p className="mb-0">Expiring Soon</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stats-card success">
            <h3>{stats.totalSales}</h3>
            <p className="mb-0">Total Sales</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stats-card danger">
            <h3>{stats.totalWaste}</h3>
            <p className="mb-0">Items Wasted</p>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Expiring Items Alert */}
        {expiringItems.length > 0 && (
          <div className="col-12 mb-4">
            <div className="alert alert-warning">
              <h5>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Items Expiring Soon ({expiringItems.length})
              </h5>
              <ul className="mb-0">
                {expiringItems.slice(0, 5).map((item) => (
                  <li key={item.item_id}>
                    {item.name} - {item.quantity} units (Expires: {new Date(item.expiry_date).toLocaleDateString()})
                  </li>
                ))}
              </ul>
              {expiringItems.length > 5 && (
                <small className="text-muted">And {expiringItems.length - 5} more...</small>
              )}
            </div>
          </div>
        )}

        {/* Current Inventory */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-boxes me-2"></i>
                Current Inventory
              </h5>
            </div>
            <div className="card-body">
              {items.length === 0 ? (
                <p className="text-muted">No items in inventory.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Purchase Date</th>
                        <th>Expiry Date</th>
                        <th>Supplier</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.item_id} className={getItemClass(item.expiry_date)}>
                          <td className="fw-bold">{item.name}</td>
                          <td>{item.category}</td>
                          <td>
                            <span className="badge bg-primary">{item.quantity}</span>
                          </td>
                          <td>{new Date(item.purchase_date).toLocaleDateString()}</td>
                          <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
                          <td>{item.supplier_name || 'N/A'}</td>
                          <td>
                            {(() => {
                              const status = getItemClass(item.expiry_date);
                              if (status === 'expired') return <span className="badge bg-danger">Expired</span>;
                              if (status === 'expiring-soon') return <span className="badge bg-warning">Expiring Soon</span>;
                              return <span className="badge bg-success">Fresh</span>;
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;