import React from 'react';

const Sidebar = ({ activeComponent, setActiveComponent }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'inventory', label: 'Inventory', icon: 'fas fa-boxes' },
    { id: 'sales', label: 'Sales', icon: 'fas fa-shopping-cart' },
    { id: 'waste', label: 'Waste Log', icon: 'fas fa-trash' },
    { id: 'redistribution', label: 'Redistribution', icon: 'fas fa-share-alt' },
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
  ];

  return (
    <nav className="sidebar">
      <div className="p-3">
        <h4 className="text-white mb-4">
          <i className="fas fa-leaf me-2"></i>
          Food Waste Manager
        </h4>
        <ul className="nav nav-pills flex-column">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link w-100 text-start ${
                  activeComponent === item.id ? 'active' : ''
                }`}
                onClick={() => setActiveComponent(item.id)}
              >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;