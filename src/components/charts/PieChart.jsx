import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

export default function PieChart({ labels, values }) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];

  const data = {
    labels: labels || [],
    datasets: [{
      data: values || [],
      backgroundColor: colors.slice(0, (labels || []).length),
      borderColor: colors.slice(0, (labels || []).length),
      borderWidth: 2,
      hoverBorderWidth: 3
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Category Expenses
      </h4>
      <Pie data={data} options={options} />
    </div>
  );
}
