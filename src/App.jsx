import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryForm from './components/InventoryForm';
import SalesForm from './components/SalesForm';
import WasteForm from './components/WasteForm';
import Redistribution from './components/Redistribution';
import Analytics from './components/Analytics';

function App() {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryForm />;
      case 'sales':
        return <SalesForm />;
      case 'waste':
        return <WasteForm />;
      case 'redistribution':
        return <Redistribution />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 col-lg-2 px-0">
          <Sidebar 
            activeComponent={activeComponent} 
            setActiveComponent={setActiveComponent} 
          />
        </div>
        <div className="col-md-9 col-lg-10">
          <div className="main-content">
            {renderComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;