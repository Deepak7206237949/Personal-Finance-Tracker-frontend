// Mock API service that uses localStorage instead of real API calls
const ACCESS_KEY = 'pf_access_token';
const REFRESH_KEY = 'pf_refresh_token';
const USERS_KEY = 'pf_users';
const TRANSACTIONS_KEY = 'pf_transactions';
const CATEGORIES_KEY = 'pf_categories';

// Initialize default data if not exists
function initializeDefaultData() {
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@finance.com',
        password: 'SecureAdmin2024!',
        role: 'ADMIN'
      },
      {
        id: '2',
        name: 'Demo User',
        email: 'user@demo.com',
        password: 'UserPass123!',
        role: 'USER'
      },
      {
        id: '3',
        name: 'Read Only User',
        email: 'readonly@demo.com',
        password: 'ReadOnly123',
        role: 'READ_ONLY'
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(CATEGORIES_KEY)) {
    const defaultCategories = [
      { id: '1', name: 'Food & Dining', amount: 500, type: 'EXPENSE' },
      { id: '2', name: 'Transportation', amount: 300, type: 'EXPENSE' },
      { id: '3', name: 'Shopping', amount: 200, type: 'EXPENSE' },
      { id: '4', name: 'Entertainment', amount: 150, type: 'EXPENSE' },
      { id: '5', name: 'Salary', amount: 5000, type: 'INCOME' },
      { id: '6', name: 'Freelance', amount: 1000, type: 'INCOME' }
    ];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  }

  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    const defaultTransactions = [
      { id: '1', amount: 5000, description: 'Monthly Salary', categoryId: '5', type: 'INCOME', date: '2024-01-01' },
      { id: '2', amount: -150, description: 'Grocery Shopping', categoryId: '1', type: 'EXPENSE', date: '2024-01-02' },
      { id: '3', amount: -50, description: 'Gas Station', categoryId: '2', type: 'EXPENSE', date: '2024-01-03' },
      { id: '4', amount: 500, description: 'Freelance Project', categoryId: '6', type: 'INCOME', date: '2024-01-04' },
      { id: '5', amount: -80, description: 'Movie Night', categoryId: '4', type: 'EXPENSE', date: '2024-01-05' }
    ];
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(defaultTransactions));
  }
}

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API object
const api = {
  post: async (endpoint, data) => {
    await delay(500); // Simulate network delay
    initializeDefaultData();

    if (endpoint === '/auth/login') {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find(u => u.email === data.email && u.password === data.password);

      if (user) {
        const accessToken = `token_${user.id}_${Date.now()}`;
        const refreshToken = `refresh_${user.id}_${Date.now()}`;

        return {
          data: {
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
          }
        };
      } else {
        throw { response: { data: { error: 'Invalid email or password' } } };
      }
    }

    if (endpoint === '/auth/signup') {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const existingUser = users.find(u => u.email === data.email);

      if (existingUser) {
        throw { response: { data: { error: 'Email already exists' } } };
      }

      const newUser = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'USER'
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      return { data: { message: 'User created successfully' } };
    }

    if (endpoint === '/auth/logout') {
      return { data: { message: 'Logged out successfully' } };
    }

    if (endpoint === '/categories') {
      const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
      const existingCategory = categories.find(c => c.name.toLowerCase() === data.name.toLowerCase());

      if (existingCategory) {
        throw { response: { data: { error: 'Category already exists' } } };
      }

      const newCategory = {
        id: Date.now().toString(),
        name: data.name,
        amount: data.amount || 0,
        type: data.type || 'EXPENSE',
        createdAt: new Date().toISOString()
      };

      categories.push(newCategory);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));

      return { data: newCategory };
    }

    throw { response: { data: { error: 'Endpoint not found' } } };
  },

  get: async (endpoint) => {
    await delay(300);
    initializeDefaultData();

    if (endpoint === '/analytics/category') {
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');

      const categoryTotals = {};
      transactions.forEach(t => {
        if (t.type === 'EXPENSE') {
          const category = categories.find(c => c.id === t.categoryId);
          const categoryName = category ? category.name : 'Other';
          categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + Math.abs(t.amount);
        }
      });

      return {
        data: {
          labels: Object.keys(categoryTotals),
          values: Object.values(categoryTotals)
        }
      };
    }

    if (endpoint === '/analytics/monthly') {
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      const monthlyData = {};

      transactions.forEach(t => {
        const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 };
        }

        if (t.type === 'INCOME') {
          monthlyData[month].income += t.amount;
        } else {
          monthlyData[month].expense += Math.abs(t.amount);
        }
      });

      const labels = Object.keys(monthlyData);
      const incomes = labels.map(label => monthlyData[label].income);
      const expenses = labels.map(label => monthlyData[label].expense);

      return {
        data: { labels, incomes, expenses }
      };
    }

    if (endpoint === '/categories') {
      const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');

      // Add transaction counts and totals to categories
      const enrichedCategories = categories.map(category => {
        const categoryTransactions = transactions.filter(t => t.categoryId === category.id);
        const totalAmount = categoryTransactions
          .filter(t => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
          ...category,
          transactionCount: categoryTransactions.length,
          totalAmount: totalAmount
        };
      });

      return { data: enrichedCategories };
    }

    if (endpoint === '/transactions') {
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');

      // Add category information to transactions
      const enrichedTransactions = transactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return {
          ...transaction,
          category: category ? { id: category.id, name: category.name } : null
        };
      });

      // Sort by date (newest first)
      enrichedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      return { data: { items: enrichedTransactions, total: enrichedTransactions.length } };
    }

    if (endpoint === '/users') {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return { data: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })) };
    }

    throw { response: { data: { error: 'Endpoint not found' } } };
  },

  put: async (endpoint, data) => {
    await delay(300);
    initializeDefaultData();

    if (endpoint.startsWith('/categories/')) {
      const categoryId = endpoint.split('/')[2];
      const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
      const categoryIndex = categories.findIndex(c => c.id === categoryId);

      if (categoryIndex === -1) {
        throw { response: { data: { error: 'Category not found' } } };
      }

      categories[categoryIndex] = { ...categories[categoryIndex], ...data };
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));

      return { data: categories[categoryIndex] };
    }

    throw { response: { data: { error: 'Endpoint not found' } } };
  },

  delete: async (endpoint) => {
    await delay(300);
    initializeDefaultData();

    if (endpoint.startsWith('/categories/')) {
      const categoryId = endpoint.split('/')[2];
      const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
      const filteredCategories = categories.filter(c => c.id !== categoryId);

      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filteredCategories));
      return { data: { message: 'Category deleted successfully' } };
    }

    if (endpoint.startsWith('/transactions/')) {
      const transactionId = endpoint.split('/')[2];
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      const filteredTransactions = transactions.filter(t => t.id !== transactionId);

      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filteredTransactions));
      return { data: { message: 'Transaction deleted successfully' } };
    }

    throw { response: { data: { error: 'Endpoint not found' } } };
  }
};

export default api;
