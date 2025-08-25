import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "./api";

const SalesForm = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    item_id: '',
    quantity_sold: '',
    sale_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchItems();
    fetchSales();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await API.get('/api/items');
      setItems(response.data.filter(item => item.quantity > 0));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await API.get('/api/sales');
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const selectedItem = items.find(item => item.item_id.toString() === formData.item_id);
      
      if (!selectedItem) {
        setMessage('Error: Please select a valid item');
        setLoading(false);
        return;
      }

      if (parseInt(formData.quantity_sold) > selectedItem.quantity) {
        setMessage(`Error: Only ${selectedItem.quantity} units available`);
        setLoading(false);
        return;
      }

      await API.post('/api/sales', formData);
      setMessage('Sale recorded successfully!');
      
      setFormData({
        item_id: '',
        quantity_sold: '',
        sale_date: new Date().toISOString().split('T')[0],
      });
      
      fetchItems();
      fetchSales();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getSelectedItemInfo = () => {
    if (!formData.item_id) return null;
    return items.find(item => item.item_id.toString() === formData.item_id);
  };

  const selectedItem = getSelectedItemInfo();

  return (
    <div>
      <h2 className="mb-4">
        <i className="fas fa-shopping-cart me-2"></i>
        Sales Management
      </h2>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Record Sale</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="item_id" className="form-label">Select Item *</label>
                  <select
                    className="form-control"
                    id="item_id"
                    name="item_id"
                    value={formData.item_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose an item</option>
                    {items.map((item) => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.name} (Available: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItem && (
                  <div className="alert alert-info">
                    <strong>{selectedItem.name}</strong><br />
                    <small>
                      Category: {selectedItem.category}<br />
                      Available: {selectedItem.quantity} units<br />
                      Expires: {new Date(selectedItem.expiry_date).toLocaleDateString()}
                    </small>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="quantity_sold" className="form-label">Quantity to Sell *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity_sold"
                    name="quantity_sold"
                    value={formData.quantity_sold}
                    onChange={handleInputChange}
                    min="1"
                    max={selectedItem ? selectedItem.quantity : ''}
                    required
                  />
                  {selectedItem && (
                    <div className="form-text">
                      Maximum: {selectedItem.quantity} units
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="sale_date" className="form-label">Sale Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="sale_date"
                    name="sale_date"
                    value={formData.sale_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Recording Sale...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Record Sale
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Sales</h5>
            </div>
            <div className="card-body">
              {sales.length === 0 ? (
                <p className="text-muted">No sales recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity Sold</th>
                        <th>Sale Date</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.sale_id}>
                          <td className="fw-bold">{sale.item_name}</td>
                          <td>
                            <span className="badge bg-success">{sale.quantity_sold}</span>
                          </td>
                          <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                          <td>{sale.category}</td>
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

export default SalesForm;