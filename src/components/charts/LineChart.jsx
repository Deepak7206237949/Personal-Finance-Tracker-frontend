import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function LineChart({ labels, incomes, expenses }) {
  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Income',
        data: incomes || [],
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4BC0C0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Expenses',
        data: expenses || [],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FF6384',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
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
        mode: 'index',
        intersect: false,
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
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Monthly Trend
      </h4>
      <Line data={data} options={options} />
    </div>
  );
}
