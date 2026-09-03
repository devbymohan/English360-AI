import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, 'client');

const clientDirs = [
  'public',
  'src/assets',
  'src/components/common',
  'src/components/layout',
  'src/components/dashboard',
  'src/components/grammar',
  'src/components/vocabulary',
  'src/components/reading',
  'src/components/writing',
  'src/components/listening',
  'src/components/tests',
  'src/components/mistakes',
  'src/components/progress',
  'src/components/achievements',
  'src/components/ai-coach',
  'src/pages',
  'src/layouts',
  'src/routes',
  'src/services',
  'src/context',
  'src/hooks',
  'src/utils',
  'src/data'
];

clientDirs.forEach(d => {
  const full = path.join(clientDir, d);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
  }
});

// 1. client/package.json
fs.writeFileSync(path.join(clientDir, 'package.json'), JSON.stringify({
  name: "english360-client",
  private: true,
  version: "1.0.0",
  type: "module",
  scripts: {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  dependencies: {
    "axios": "^1.6.8",
    "clsx": "^2.1.0",
    "lucide-react": "^0.364.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "recharts": "^2.12.3",
    "tailwind-merge": "^2.2.2"
  },
  devDependencies: {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.0"
  }
}, null, 2));

// 2. client/vite.config.js
fs.writeFileSync(path.join(clientDir, 'vite.config.js'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
`);

// 3. client/tailwind.config.js
fs.writeFileSync(path.join(clientDir, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        grammar: {
          light: '#ecfdf5',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        vocabulary: {
          light: '#f5f3ff',
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
        },
        reading: {
          light: '#eff6ff',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        writing: {
          light: '#fff7ed',
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },
        listening: {
          light: '#fef2f2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        tests: {
          light: '#ecfeff',
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 12px -1px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
`);

// 4. client/postcss.config.js
fs.writeFileSync(path.join(clientDir, 'postcss.config.js'), `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`);

// 5. client/index.html
fs.writeFileSync(path.join(clientDir, 'index.html'), `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234F46E5'><path d='M12 2L1 7l11 5 9-4.09V17h2V7L12 2z'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <title>English360 AI — Your Personal English Coach</title>
  </head>
  <body class="bg-[#F8FAFC] text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900 font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);

// 6. client/src/index.css
fs.writeFileSync(path.join(clientDir, 'src', 'index.css'), `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-[#F8FAFC] text-slate-800 antialiased;
  }
}

/* Custom Soft Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
`);

// 7. client/src/utils/cn.js
fs.writeFileSync(path.join(clientDir, 'src', 'utils', 'cn.js'), `import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`);

// 8. client/src/utils/formatters.js
fs.writeFileSync(path.join(clientDir, 'src', 'utils', 'formatters.js'), `export const formatMinutes = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
};

export const formatPercentage = (val) => \`\${Math.round(val)}%\`;
`);

// 9. client/src/config/firebase.js
fs.writeFileSync(path.join(clientDir, 'src', 'config', 'firebase.js'), `// Firebase Authentication Client Configuration (Phase 1 Placeholder)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "english360-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "english360-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "english360-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};
`);

// 10. client/src/context/AuthContext.jsx
fs.writeFileSync(path.join(clientDir, 'src', 'context', 'AuthContext.jsx'), `import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    id: 'user-arjun-1',
    name: 'Arjun',
    email: 'arjun@english360.ai',
    level: 'B1',
    levelTitle: 'B1 – Intermediate',
    streak: 12,
    points: 2410,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isPremium: false
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    // Placeholder login flow for Phase 1
    setTimeout(() => {
      setCurrentUser((prev) => ({ ...prev, email }));
      setLoading(false);
    }, 400);
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser((prev) => ({ ...prev, name, email }));
      setLoading(false);
    }, 400);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`);

// 11. client/src/hooks/useAuth.js
fs.writeFileSync(path.join(clientDir, 'src', 'hooks', 'useAuth.js'), `export { useAuth } from '../context/AuthContext';
`);

// 12. client/src/hooks/useToast.js
fs.writeFileSync(path.join(clientDir, 'src', 'hooks', 'useToast.js'), `import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return { toasts, showToast };
};
`);

// 13. Frontend Service Files
const serviceFiles = [
  'api.js',
  'authService.js',
  'assessmentService.js',
  'grammarService.js',
  'vocabularyService.js',
  'readingService.js',
  'writingService.js',
  'listeningService.js',
  'testService.js',
  'mistakeService.js',
  'progressService.js',
  'achievementService.js',
  'aiCoachService.js'
];

fs.writeFileSync(path.join(clientDir, 'src', 'services', 'api.js'), `import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;
`);

serviceFiles.filter(s => s !== 'api.js').forEach(s => {
  const mod = s.replace('Service.js', '');
  fs.writeFileSync(path.join(clientDir, 'src', 'services', s), `import api from './api';

export const get${mod.charAt(0).toUpperCase() + mod.slice(1)}Data = async () => {
  // Service foundation for ${mod} module
  const response = await api.get('/${mod}');
  return response.data;
};
`);
});

console.log('Client configuration and services created successfully!');
`);

console.log('Writing generate_client.js done.');
