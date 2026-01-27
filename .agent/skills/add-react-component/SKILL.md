---
name: Add React Component
description: Guide for creating new React components in the frontend
---

# Add React Component Skill

This skill guides you through creating new React components for the To-Do List WebApp frontend.

## Project Structure

```
frontend/src/
├── components/        # Reusable components
│   ├── Auth/         # Authentication components
│   ├── Layout/       # Layout components
│   ├── Todo/         # Todo-specific components
│   └── Common/       # Common/shared components
├── contexts/         # React contexts
├── services/         # API service functions
├── styles/           # Global styles
└── App.jsx           # Main app component
```

## Step-by-Step Guide

### Step 1: Create Component File

Create your component in the appropriate directory:

**File**: `frontend/src/components/YourComponent/YourComponent.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './YourComponent.css';

const YourComponent = ({ title, onAction }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load data on mount
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data from API
      const response = await fetch('/api/your-endpoint');
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (onAction) {
      onAction();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="your-component">
      <h2>{title}</h2>
      <button onClick={handleClick}>Click Me</button>
      <div className="content">
        {data.map((item) => (
          <div key={item.id} className="item">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

YourComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func,
};

YourComponent.defaultProps = {
  onAction: null,
};

export default YourComponent;
```

### Step 2: Create Component Styles

**File**: `frontend/src/components/YourComponent/YourComponent.css`

```css
.your-component {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.your-component h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 24px;
}

.your-component button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.your-component button:hover {
  background-color: #45a049;
}

.your-component .content {
  margin-top: 20px;
}

.your-component .item {
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #4CAF50;
}
```

### Step 3: Create API Service (if needed)

**File**: `frontend/src/services/yourService.js`

```javascript
import api from '../api';

const yourService = {
  // Get all items
  getAll: async () => {
    const response = await api.get('/your-endpoint');
    return response.data;
  },

  // Get single item
  getById: async (id) => {
    const response = await api.get(`/your-endpoint/${id}`);
    return response.data;
  },

  // Create item
  create: async (data) => {
    const response = await api.post('/your-endpoint', data);
    return response.data;
  },

  // Update item
  update: async (id, data) => {
    const response = await api.put(`/your-endpoint/${id}`, data);
    return response.data;
  },

  // Delete item
  delete: async (id) => {
    const response = await api.delete(`/your-endpoint/${id}`);
    return response.data;
  },
};

export default yourService;
```

### Step 4: Create Context (for shared state)

**File**: `frontend/src/contexts/YourContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import yourService from '../services/yourService';

const YourContext = createContext();

export const useYourContext = () => {
  const context = useContext(YourContext);
  if (!context) {
    throw new Error('useYourContext must be used within YourProvider');
  }
  return context;
};

export const YourProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await yourService.getAll();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    try {
      const newItem = await yourService.create(itemData);
      setItems([...items, newItem]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const updated = await yourService.update(id, itemData);
      setItems(items.map(item => item.id === id ? updated : item));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      await yourService.delete(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: loadItems,
  };

  return <YourContext.Provider value={value}>{children}</YourContext.Provider>;
};

YourProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
```

### Step 5: Use Component in App

**File**: `frontend/src/App.jsx`

```javascript
import YourComponent from './components/YourComponent/YourComponent';
import { YourProvider } from './contexts/YourContext';

function App() {
  return (
    <YourProvider>
      <div className="app">
        <YourComponent 
          title="My Component" 
          onAction={() => console.log('Action triggered')}
        />
      </div>
    </YourProvider>
  );
}

export default App;
```

### Step 6: Write Component Tests

**File**: `frontend/src/components/YourComponent/YourComponent.test.jsx`

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('renders with title', () => {
    render(<YourComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const handleAction = vi.fn();
    render(<YourComponent title="Test" onAction={handleAction} />);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    render(<YourComponent title="Test" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error message', async () => {
    // Mock fetch to throw error
    global.fetch = vi.fn(() => Promise.reject(new Error('API Error')));
    
    render(<YourComponent title="Test" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
```

## Component Patterns

### Functional Component with Hooks

```javascript
import { useState, useEffect } from 'react';

const MyComponent = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, []);

  return <div>Count: {count}</div>;
};
```

### Component with Props Destructuring

```javascript
const MyComponent = ({ title, items, onSelect }) => {
  return (
    <div>
      <h1>{title}</h1>
      {items.map(item => (
        <div key={item.id} onClick={() => onSelect(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
};
```

### Custom Hooks

```javascript
// hooks/useYourHook.js
import { useState, useEffect } from 'react';

export const useYourHook = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Custom logic
  }, [value]);

  return { value, setValue, loading };
};

// Usage in component
const MyComponent = () => {
  const { value, setValue, loading } = useYourHook('initial');
  // ...
};
```

## Styling Approaches

### CSS Modules (Recommended)

```javascript
import styles from './YourComponent.module.css';

const YourComponent = () => {
  return <div className={styles.container}>Content</div>;
};
```

### Tailwind CSS (Already configured)

```javascript
const YourComponent = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Title</h2>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Click
      </button>
    </div>
  );
};
```

## Best Practices

1. **Use Functional Components**: Prefer hooks over class components
2. **PropTypes**: Always define prop types for better documentation
3. **Small Components**: Keep components focused and small
4. **Reusability**: Design components to be reusable
5. **Naming**: Use PascalCase for components, camelCase for functions
6. **File Structure**: One component per file
7. **Index Files**: Use index.js to export multiple components from a directory
8. **Error Handling**: Always handle loading and error states
9. **Accessibility**: Use semantic HTML and ARIA attributes
10. **Performance**: Use React.memo, useMemo, useCallback when needed

## Common Hooks

```javascript
import { 
  useState,      // State management
  useEffect,     // Side effects
  useContext,    // Context consumption
  useReducer,    // Complex state management
  useCallback,   // Memoized callbacks
  useMemo,       // Memoized values
  useRef,        // DOM references
} from 'react';
```

## Testing

```bash
# Run component tests
cd frontend
npm run test

# Run with watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## Troubleshooting

### Component Not Rendering

- Check import/export statements
- Verify component is included in parent
- Check React DevTools

### Props Not Working

- Verify prop names match
- Check PropTypes definitions
- Use React DevTools to inspect props

### Styling Not Applied

- Check CSS class names
- Verify CSS file is imported
- Check for specificity issues
- Use browser DevTools

### State Not Updating

- Ensure using setState function
- Check for direct state mutation
- Verify dependencies in useEffect

## Next Steps

After creating the component:
1. Test thoroughly
2. Add to Storybook (if using)
3. Document usage
4. Consider accessibility
5. Optimize performance if needed
