import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "./api";

const InventoryForm = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    purchase_date: '',
    expiry_date: '',
    supplier_id: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = ['Dairy', 'Meat', 'Vegetables', 'Fruits', 'Grains', 'Beverages', 'Other'];

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await API.get('/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await API.get('/api/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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
      if (editingId) {
        await API.put(`/api/items/${editingId}`, formData);
        setMessage('Item updated successfully!');
        setEditingId(null);
      } else {
        await API.post('/api/items', formData);
        setMessage('Item added successfully!');
      }
      
      setFormData({
        name: '',
        category: '',
        quantity: '',
        purchase_date: '',
        expiry_date: '',
        supplier_id: '',
      });
      
      fetchItems();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      purchase_date: item.purchase_date.split('T')[0],
      expiry_date: item.expiry_date.split('T')[0],
      supplier_id: item.supplier_id?.toString() || '',
    });
    setEditingId(item.item_id);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await API.delete(`/api/items/${id}`);
        setMessage('Item deleted successfully!');
        fetchItems();
      } catch (error) {
        setMessage('Error deleting item: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      purchase_date: '',
      expiry_date: '',
      supplier_id: '',
    });
    setEditingId(null);
    setMessage('');
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="fas fa-boxes me-2"></i>
        Inventory Management
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
              <h5 className="mb-0">
                {editingId ? 'Edit Item' : 'Add New Item'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Item Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category *</label>
                  <select
                    className="form-control"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">Quantity *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="purchase_date" className="form-label">Purchase Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="purchase_date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="expiry_date" className="form-label">Expiry Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="expiry_date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="supplier_id" className="form-label">Supplier</label>
                  <select
                    className="form-control"
                    id="supplier_id"
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {editingId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                        {editingId ? 'Update Item' : 'Add Item'}
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Current Inventory</h5>
            </div>
            <div className="card-body">
              {items.length === 0 ? (
                <p className="text-muted">No items in inventory.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Expiry Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.item_id}>
                          <td className="fw-bold">{item.name}</td>
                          <td>{item.category}</td>
                          <td>
                            <span className="badge bg-primary">{item.quantity}</span>
                          </td>
                          <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(item)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(item.item_id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
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

export default InventoryForm;