Here's the English translation of your provided text:

# Plugin Development

## Plugin Architecture

A plugin in DeesseJS is a **function** that takes configuration options as parameters and returns a resolved `Plugin` object. This approach allows for declarative, expressive, and strongly typed configuration.

### Basic Types

```typescript
interface PluginPage {
  id: string;
  title: string;
  path: string;
  component: React.ComponentType<any>;
  group?: string;
  icon?: string;
  order?: number;
}

interface PluginWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  size?: 'small' | 'medium' | 'large';
  order?: number;
}

interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  pages: PluginPage[];
  widgets: PluginWidget[];
  dependencies?: string[];
}
```

## `plugin()` Function

The `plugin()` function is a utility for creating plugins in a standardized way:

```typescript
function plugin<T extends Record<string, any>>(
  id: string,
  name: string,
  version: string,
  setup: (options: T) => Pick<Plugin, 'pages' | 'widgets' | 'dependencies' | 'description'>
): (options: T) => Plugin
```

### Parameters

- `id`: Unique identifier for the plugin
- `name`: Display name of the plugin
- `version`: Version of the plugin
- `setup`: Function that receives options and returns pages, widgets, dependencies, and description

## Creating a Plugin

### Example: SEO Plugin

```typescript
import { plugin } from "deesse/plugin";

const seo = plugin('seo', 'SEO Plugin', '1.0.0', (options) => {
  const { title, description, defaultImage, social } = options;

  return {
    description: `SEO Plugin for ${title}`,
    pages: [
      {
        id: 'seo-overview',
        title: 'Overview',
        path: 'seo/overview',
        component: SeoOverviewPage,
        group: 'SEO',
        icon: '📊',
        order: 1
      },
      {
        id: 'seo-settings',
        title: 'Settings',
        path: 'seo/settings',
        component: SeoSettingsPage,
        group: 'SEO',
        icon: '⚙️',
        order: 2
      }
    ],
    widgets: [
      {
        id: 'seo-score',
        title: 'SEO Score',
        component: SeoScoreWidget,
        size: 'medium',
        order: 1
      }
    ]
  };
});
```

### Example: Analytics Plugin

```typescript
const analytics = plugin('analytics', 'Analytics Plugin', '1.0.0', (options) => {
  const { provider, trackingId, enableHeatmap } = options;

  return {
    description: `Analytics plugin using ${provider}`,
    pages: [
      {
        id: 'analytics-dashboard',
        title: 'Dashboard',
        path: 'analytics/dashboard',
        component: AnalyticsDashboard,
        group: 'Analytics',
        icon: '📈',
        order: 1
      }
    ],
    widgets: [
      {
        id: 'traffic-chart',
        title: 'Traffic Overview',
        component: TrafficChartWidget,
        size: 'large',
        order: 1
      }
    ]
  };
});
```

## Integration in Configuration

In your `deesse.config.ts` file, import and use your plugins:

```typescript
import { defineConfig } from "deesse/config";
import { seo } from "deesse/plugins/seo";
import { analytics } from "deesse/plugins/analytics";

export default defineConfig({
  plugins: [
    // SEO Plugin with its options
    seo({
      title: "My Awesome Application",
      description: "A fullstack application built with DeesseJS",
      defaultImage: "/og-default.jpg",
      social: {
        twitter: "@myapp",
        facebook: "myapp"
      }
    }),

    // Analytics Plugin with its options
    analytics({
      provider: "google",
      trackingId: "G-XXXXXXXXXX",
      enableHeatmap: true
    })
  ]
});
```

## Page Structure

### Page Paths

Pages must define a `path` that corresponds to the access URL:

```
seo/overview    → /admin/seo/overview
seo/settings    → /admin/seo/settings
analytics/dashboard → /admin/analytics/dashboard
```

### Page Groups

Use the `group` field to organize pages in the sidebar:

```typescript
pages: [
  {
    id: 'page1',
    title: 'Page 1',
    path: 'plugin/page1',
    component: Page1Component,
    group: 'Plugin Name' // Pages in the same group are grouped together
  },
  {
    id: 'page2',
    title: 'Page 2',
    path: 'plugin/page2',
    component: Page2Component,
    group: 'Plugin Name' // Same group
  }
]
```

### Display Order

Use the `order` field to control the order of pages and widgets:

```typescript
pages: [
  {
    id: 'overview',
    title: 'Overview',
    path: 'plugin/overview',
    component: OverviewComponent,
    order: 1 // Will be displayed before pages with order > 1
  },
  {
    id: 'settings',
    title: 'Settings',
    path: 'plugin/settings',
    component: SettingsComponent,
    order: 2
  }
]
```

## Widgets

Widgets appear on the main dashboard page:

```typescript
widgets: [
  {
    id: 'score-widget',
    title: 'Score',
    component: ScoreWidget,
    size: 'medium', // small, medium, large
    order: 1
  }
]
```

## Best Practices

### 1. Strongly Typed Option Types

```typescript
interface SeoOptions {
  title: string;
  description: string;
  defaultImage: string;
  social: {
    twitter?: string;
    facebook?: string;
  };
}

const seo = plugin<SeoOptions>('seo', 'SEO Plugin', '1.0.0', (options) => {
  // options is now typed with SeoOptions
  return {
    // ...
  };
});
```

### 2. Option Validation

```typescript
const seo = plugin('seo', 'SEO Plugin', '1.0.0', (options) => {
  // Simple validation
  if (!options.title) {
    throw new Error('Title is required for SEO plugin');
  }

  return {
    // ...
  };
});
```

### 3. React Components

Create dedicated React components for each page and widget:

```typescript
// pages/seo-overview.tsx
export const SeoOverviewPage: React.FC = () => {
  return <div>SEO Overview Content</div>;
};

// widgets/seo-score.tsx
export const SeoScoreWidget: React.FC = () => {
  return <div>SEO Score: 95%</div>;
};
```

### 4. Plugin Dependencies

If your plugin depends on other plugins, use the `dependencies` field:

```typescript
const advancedAnalytics = plugin('advanced-analytics', 'Advanced Analytics', '1.0.0', (options) => {
  return {
    description: 'Advanced analytics features',
    dependencies: ['analytics'], // Depends on the analytics plugin
    pages: [
      // ...
    ]
  };
});
```

## Plugin Lifecycle

1. **Configuration**: The plugin is called with its options in `deesse.config.ts`
2. **Resolution**: `buildConfig()` executes all plugin functions to get the resolved Plugin objects
3. **Integration**: The plugin's pages and widgets are integrated into the dashboard
4. **Rendering**: Pages and widgets are rendered when the user navigates to them

## Debugging

### Check Resolved Plugins

You can inspect the resolved plugins in your configuration:

```javascript
console.log(JSON.stringify(config.plugins, null, 2));
```

### Common Issues

1. **Page not found**: Verify that the `path` matches the access URL
2. **Missing group**: Pages without a `group` appear under the plugin's name
3. **Incorrect order**: Use the `order` field to control display
4. **Missing options**: Ensure all required options are passed

## Complete Example

```typescript
// plugins/my-plugin/index.ts
import { plugin } from "deesse/plugin";
import { MyPage } from "./components/my-page";
import { MyWidget } from "./components/my-widget";

interface MyPluginOptions {
  apiKey: string;
  enabled: boolean;
  features: {
    feature1: boolean;
    feature2: boolean;
  };
}

const myPlugin = plugin<MyPluginOptions>(
  'my-plugin',
  'My Plugin',
  '1.0.0',
  (options) => {
    return {
      description: 'My awesome plugin',
      pages: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          path: 'my-plugin/dashboard',
          component: MyPage,
          group: 'My Plugin',
          icon: '🚀',
          order: 1
        }
      ],
      widgets: [
        {
          id: 'status-widget',
          title: 'Status',
          component: MyWidget,
          size: 'medium',
          order: 1
        }
      ]
    };
  }
);

export { myPlugin };
```

```typescript
// deesse.config.ts
import { defineConfig } from "deesse/config";
import { myPlugin } from "./plugins/my-plugin";

export default defineConfig({
  plugins: [
    myPlugin({
      apiKey: 'your-api-key',
      enabled: true,
      features: {
        feature1: true,
        feature2: false
      }
    })
  ]
});
```