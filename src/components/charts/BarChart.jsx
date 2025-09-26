import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChart({ labels, incomes, expenses }) {
  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Income',
        data: incomes || [],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: '#4BC0C0',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false
      },
      {
        label: 'Expenses',
        data: expenses || [],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: '#FF6384',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount ($)'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Income vs Expenses
      </h4>
      <Bar data={data} options={options} />
    </div>
  );
}
