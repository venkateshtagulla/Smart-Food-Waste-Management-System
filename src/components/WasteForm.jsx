import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "./api";

const WasteForm = () => {
  const [items, setItems] = useState([]);
  const [wasteLog, setWasteLog] = useState([]);
  const [formData, setFormData] = useState({
    item_id: '',
    quantity_wasted: '',
    reason: '',
    date_logged: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const wasteReasons = [
    'Expired',
    'Spoiled',
    'Damaged',
    'Overripe',
    'Contaminated',
    'Customer Return',
    'Other'
  ];

  useEffect(() => {
    fetchItems();
    fetchWasteLog();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await API.get('/api/items');
      setItems(response.data.filter(item => item.quantity > 0));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchWasteLog = async () => {
    try {
      const response = await API.get('/api/waste');
      setWasteLog(response.data);
    } catch (error) {
      console.error('Error fetching waste log:', error);
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

      if (parseInt(formData.quantity_wasted) > selectedItem.quantity) {
        setMessage(`Error: Only ${selectedItem.quantity} units available`);
        setLoading(false);
        return;
      }

      await API.post('/api/waste', formData);
      setMessage('Waste logged successfully!');
      
      setFormData({
        item_id: '',
        quantity_wasted: '',
        reason: '',
        date_logged: new Date().toISOString().split('T')[0],
      });
      
      fetchItems();
      fetchWasteLog();
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
        <i className="fas fa-trash me-2"></i>
        Waste Management
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
              <h5 className="mb-0">Log Waste</h5>
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
                  <label htmlFor="quantity_wasted" className="form-label">Quantity Wasted *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity_wasted"
                    name="quantity_wasted"
                    value={formData.quantity_wasted}
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
                  <label htmlFor="reason" className="form-label">Reason for Waste *</label>
                  <select
                    className="form-control"
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select reason</option>
                    {wasteReasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="date_logged" className="form-label">Date Logged *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date_logged"
                    name="date_logged"
                    value={formData.date_logged}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-danger" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging Waste...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Log Waste
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
              <h5 className="mb-0">Waste Log History</h5>
            </div>
            <div className="card-body">
              {wasteLog.length === 0 ? (
                <p className="text-muted">No waste logged yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity Wasted</th>
                        <th>Reason</th>
                        <th>Date Logged</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wasteLog.map((waste) => (
                        <tr key={waste.waste_id}>
                          <td className="fw-bold">{waste.item_name}</td>
                          <td>
                            <span className="badge bg-danger">{waste.quantity_wasted}</span>
                          </td>
                          <td>{waste.reason}</td>
                          <td>{new Date(waste.date_logged).toLocaleDateString()}</td>
                          <td>{waste.category}</td>
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

export default WasteForm;