const fs = require('fs');
const path = require('path');

/**
 * Frontend Bootstrap Utility
 * Creates the complete frontend project structure
 */

function createFrontendScaffold() {
  const projectRoot = path.join(__dirname, '..', '..');
  const frontendPath = path.join(projectRoot, 'frontend');

  const directories = [
    frontendPath,
    path.join(frontendPath, 'public'),
    path.join(frontendPath, 'src'),
    path.join(frontendPath, 'src', 'components'),
    path.join(frontendPath, 'src', 'pages'),
    path.join(frontendPath, 'src', 'services'),
    path.join(frontendPath, 'src', 'context'),
    path.join(frontendPath, 'src', 'utils'),
    path.join(frontendPath, 'src', 'hooks'),
  ];

  // Create all directories
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created: ${path.relative(projectRoot, dir)}`);
    }
  });

  // package.json
  const packageJson = {
    name: 'smart-expense-tracker-frontend',
    version: '0.1.0',
    private: true,
    proxy: 'http://localhost:5000',
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.14.0',
      axios: '^1.4.0',
      'date-fns': '^2.30.0',
    },
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject',
    },
    eslintConfig: {
      extends: ['react-app'],
    },
    browserslist: {
      production: ['>0.2%', 'not dead', 'not op_mini all'],
      development: [
        'last 1 chrome version',
        'last 1 firefox version',
        'last 1 safari version',
      ],
    },
    devDependencies: {
      'react-scripts': '5.0.1',
    },
  };

  // .gitignore
  const gitignore = `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;

  // public/index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smart Expense Tracker</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

  // src/index.js
  const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  // src/index.css
  const indexCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

html, body, #root {
  height: 100%;
}
`;

  // src/App.js
  const appJs = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Smart Expense Tracker</h1>
          <p>Track expenses with AI-powered insights</p>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<div>Home Page - Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
`;

  // src/App.css
  const appCss = `.App {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.App-header {
  text-align: center;
  padding: 3rem 1rem;
}

.App-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.App-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.App-main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
`;

  // src/services/api.js
  const apiJs = `import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;
`;

  // src/context/AuthContext.js
  const authContextJs = `import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
`;

  // src/hooks/useAuth.js
  const useAuthJs = `import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
`;

  // Write files
  const files = {
    'package.json': packageJson,
    '.gitignore': gitignore,
    'public/index.html': indexHtml,
    'src/index.js': indexJs,
    'src/index.css': indexCss,
    'src/App.js': appJs,
    'src/App.css': appCss,
    'src/services/api.js': apiJs,
    'src/context/AuthContext.js': authContextJs,
    'src/hooks/useAuth.js': useAuthJs,
  };

  Object.entries(files).forEach(([filePath, content]) => {
    const fullPath = path.join(frontendPath, filePath);
    const fileDir = path.dirname(fullPath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    fs.writeFileSync(fullPath, fileContent);
    console.log(`✓ Created: ${path.relative(projectRoot, fullPath)}`);
  });

  console.log('\n✅ Frontend scaffold created successfully!');
  console.log('\nNext steps:');
  console.log('  cd frontend');
  console.log('  npm install');
  console.log('  npm start');
}

if (require.main === module) {
  createFrontendScaffold();
}

module.exports = { createFrontendScaffold };
