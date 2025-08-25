import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "./api";
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [monthlyWaste, setMonthlyWaste] = useState([]);
  const [topWasted, setTopWasted] = useState([]);
  const [wasteCost, setWasteCost] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [monthlyRes, topRes, costRes] = await Promise.all([
        API.get('/api/analytics/monthly-waste'),
        API.get('/api/analytics/top-wasted'),
        API.get('/api/analytics/waste-cost')
      ]);

      setMonthlyWaste(monthlyRes.data);
      setTopWasted(topRes.data);
      setWasteCost(costRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyWasteChartData = {
    labels: monthlyWaste.map(item => item.month),
    datasets: [
      {
        label: 'Total Waste (units)',
        data: monthlyWaste.map(item => item.total_waste),
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const topWastedChartData = {
    labels: topWasted.map(item => item.item_name),
    datasets: [
      {
        data: topWasted.map(item => item.total_wasted),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
        borderWidth: 2,
      },
    ],
  };

  const wasteCostChartData = {
    labels: wasteCost.map(item => item.category),
    datasets: [
      {
        label: 'Estimated Cost ($)',
        data: wasteCost.map(item => item.estimated_cost),
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
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
        <i className="fas fa-chart-line me-2"></i>
        Analytics Dashboard
      </h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Monthly Waste Trends</h5>
            </div>
            <div className="card-body">
              {monthlyWaste.length === 0 ? (
                <p className="text-muted">No waste data available.</p>
              ) : (
                <Bar 
                  data={monthlyWasteChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Waste by Month',
                      },
                    },
                  }} 
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Top 5 Wasted Items</h5>
            </div>
            <div className="card-body">
              {topWasted.length === 0 ? (
                <p className="text-muted">No waste data available.</p>
              ) : (
                <Pie 
                  data={topWastedChartData} 
                  options={{
                    ...pieOptions,
                    plugins: {
                      ...pieOptions.plugins,
                      title: {
                        ...pieOptions.plugins.title,
                        text: 'Most Wasted Items',
                      },
                    },
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Waste Cost by Category</h5>
            </div>
            <div className="card-body">
              {wasteCost.length === 0 ? (
                <p className="text-muted">No cost data available.</p>
              ) : (
                <Bar 
                  data={wasteCostChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Estimated Waste Cost by Category',
                      },
                    },
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Monthly Waste Data</h6>
            </div>
            <div className="card-body">
              {monthlyWaste.length === 0 ? (
                <p className="text-muted small">No data</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Waste</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyWaste.map((item, index) => (
                        <tr key={index}>
                          <td>{item.month}</td>
                          <td>{item.total_waste}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Top Wasted Items</h6>
            </div>
            <div className="card-body">
              {topWasted.length === 0 ? (
                <p className="text-muted small">No data</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topWasted.map((item, index) => (
                        <tr key={index}>
                          <td>{item.item_name}</td>
                          <td>{item.total_wasted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Waste Cost by Category</h6>
            </div>
            <div className="card-body">
              {wasteCost.length === 0 ? (
                <p className="text-muted small">No data</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Cost ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wasteCost.map((item, index) => (
                        <tr key={index}>
                          <td>{item.category}</td>
                          <td>${item.estimated_cost}</td>
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

export default Analytics;