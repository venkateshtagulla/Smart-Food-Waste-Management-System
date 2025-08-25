import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "./api";

const Redistribution = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [redistribution, setRedistribution] = useState([]);
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: '',
    destination: '',
    date_sent: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const destinations = [
    'Local Food Bank',
    'Community Kitchen',
    'Animal Shelter',
    'Composting Facility',
    'Charity Organization',
    'Staff Distribution',
    'Other'
  ];

  useEffect(() => {
    fetchSuggestions();
    fetchRedistribution();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await API.get('/api/redistribution');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchRedistribution = async () => {
    try {
      const response = await API.get('/api/redistribution/history');
      setRedistribution(response.data);
    } catch (error) {
      console.error('Error fetching redistribution history:', error);
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
      await API.post('/api/redistribution/send', formData);
      setMessage('Redistribution recorded successfully!');
      
      setFormData({
        item_id: '',
        quantity: '',
        destination: '',
        date_sent: new Date().toISOString().split('T')[0],
      });
      
      fetchSuggestions();
      fetchRedistribution();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const selectItemForRedistribution = (item) => {
    setFormData({
      item_id: item.item_id.toString(),
      quantity: Math.min(item.quantity, Math.ceil(item.quantity * 0.5)).toString(),
      destination: '',
      date_sent: new Date().toISOString().split('T')[0],
    });
    setMessage('');
  };

  const getSelectedItemInfo = () => {
    if (!formData.item_id) return null;
    return suggestions.find(item => item.item_id.toString() === formData.item_id);
  };

  const selectedItem = getSelectedItemInfo();

  return (
    <div>
      <h2 className="mb-4">
        <i className="fas fa-share-alt me-2"></i>
        Redistribution Management
      </h2>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-lightbulb me-2"></i>
                Suggested Items for Redistribution
              </h5>
            </div>
            <div className="card-body">
              {suggestions.length === 0 ? (
                <p className="text-muted">No items suggested for redistribution.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Expiry Date</th>
                        <th>Days Until Expiry</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suggestions.map((item) => {
                        const today = new Date();
                        const expiry = new Date(item.expiry_date);
                        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <tr key={item.item_id} className={daysUntilExpiry <= 1 ? 'table-warning' : ''}>
                            <td className="fw-bold">{item.name}</td>
                            <td>
                              <span className="badge bg-primary">{item.quantity}</span>
                            </td>
                            <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${daysUntilExpiry <= 1 ? 'bg-warning' : 'bg-info'}`}>
                                {daysUntilExpiry} days
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => selectItemForRedistribution(item)}
                              >
                                <i className="fas fa-share me-1"></i>
                                Select
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Record Redistribution</h5>
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
                    {suggestions.map((item) => (
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
                  <label htmlFor="quantity" className="form-label">Quantity to Redistribute *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
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
                  <label htmlFor="destination" className="form-label">Destination *</label>
                  <select
                    className="form-control"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select destination</option>
                    {destinations.map((dest) => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="date_sent" className="form-label">Date Sent *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date_sent"
                    name="date_sent"
                    value={formData.date_sent}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Recording...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Record Redistribution
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Redistribution History</h5>
            </div>
            <div className="card-body">
              {redistribution.length === 0 ? (
                <p className="text-muted">No redistribution records yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Destination</th>
                        <th>Date Sent</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redistribution.map((record) => (
                        <tr key={record.redistribution_id}>
                          <td className="fw-bold">{record.item_name}</td>
                          <td>
                            <span className="badge bg-success">{record.quantity}</span>
                          </td>
                          <td>{record.destination}</td>
                          <td>{new Date(record.date_sent).toLocaleDateString()}</td>
                          <td>{record.category}</td>
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

export default Redistribution;