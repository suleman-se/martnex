# Tailwind CSS 4.1 Comprehensive Guide

Complete documentation for Tailwind CSS 4.1 - the latest major version with enhanced utilities, text shadows, masks, and advanced styling capabilities.

---

## TABLE OF CONTENTS

1. [Installation & Setup](#installation--setup)
2. [New Features in v4.1](#new-features-in-v41)
3. [Core Configuration](#core-configuration)
4. [Utility Classes](#utility-classes)
5. [Typography & Text Effects](#typography--text-effects)
6. [Colors & Gradients](#colors--gradients)
7. [Layout & Spacing](#layout--spacing)
8. [Responsive Design](#responsive-design)
9. [Dark Mode](#dark-mode)
10. [Performance & Optimization](#performance--optimization)
11. [Integration with Next.js 16](#integration-with-nextjs-16)
12. [Marketplace Examples](#marketplace-examples)

---

## Installation & Setup

### Quick Start with Vite

```bash
npm install -D tailwindcss @tailwindcss/vite
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```

**style.css:**
```css
@import "tailwindcss";
```

### Installation with Next.js 16

Tailwind CSS 4.1 simplifies setup with a single CSS import.

```bash
npm install -D tailwindcss postcss
npm install -D @tailwindcss/postcss
```

**postcss.config.mjs:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**app/globals.css:**
```css
/* Single import replaces everything - this is v4.1! */
@import "tailwindcss";

/* Optional: Add custom layers for additional styling */
@layer base {
  body {
    @apply bg-white text-gray-900 dark:bg-gray-900 dark:text-white;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6 dark:bg-gray-800;
  }
}
```

---

## New Features in v4.1

### Text Shadow Utilities

Tailwind CSS 4.1 introduces native text shadow support for enhanced text effects.

**Available Classes:**
```
text-shadow-sm    : 0 1px 2px rgba(0,0,0,0.05)
text-shadow       : 0 1px 3px rgba(0,0,0,0.1)
text-shadow-md    : 0 4px 6px rgba(0,0,0,0.1)
text-shadow-lg    : 0 10px 15px rgba(0,0,0,0.1)
text-shadow-xl    : 0 20px 25px rgba(0,0,0,0.1)
text-shadow-2xl   : 0 25px 50px rgba(0,0,0,0.25)
text-shadow-none  : 0 0 0 transparent
```

**Example - Marketplace Product Header:**
```html
<h1 class="text-4xl font-bold text-shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-800">
  Premium Product Listing
</h1>

<p class="text-lg text-shadow-md text-gray-200">
  Featured Products for Sellers
</p>
```

**Custom Text Shadows:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      textShadow: {
        'neon': '0 0 10px rgba(59, 130, 246, 0.5)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.4)',
        'danger': '0 2px 4px rgba(239, 68, 68, 0.3)',
      },
    },
  },
}
```

```html
<h2 class="text-shadow-neon">Glowing Title</h2>
<p class="text-shadow-glow text-green-500">Success Message</p>
```

### Mask Utilities

Mask utilities allow you to hide parts of elements using images or gradients.

**Available Classes:**
```
mask-contain     : background-attachment: fixed
mask-cover       : mask-size: cover
mask-auto        : mask-size: auto
mask-center      : mask-position: center
mask-bottom      : mask-position: bottom
mask-top         : mask-position: top
mask-left        : mask-position: left
mask-right       : mask-position: right
mask-repeat      : mask-repeat: repeat
mask-no-repeat   : mask-repeat: no-repeat
mask-repeat-x    : mask-repeat: repeat-x
mask-repeat-y    : mask-repeat: repeat-y
```

**Example - Image Gradient Fade:**
```html
<div class="relative w-full">
  <img
    src="/marketplace-hero.jpg"
    alt="Marketplace"
    class="w-full h-80 object-cover mask-image-to-b mask-gradient-to-transparent"
  />
</div>
```

**Custom Mask Patterns:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      maskImage: {
        'fade-top': 'linear-gradient(to bottom, transparent, black)',
        'fade-bottom': 'linear-gradient(to top, transparent, black)',
        'vignette': 'radial-gradient(ellipse, black, transparent)',
        'circle': 'radial-gradient(circle, black, transparent)',
      },
    },
  },
}
```

```html
<!-- Product image with vignette effect -->
<img 
  src="/product.jpg" 
  alt="Product"
  class="mask-vignette w-full rounded-lg"
/>

<!-- Card with fade effect -->
<div class="mask-fade-bottom bg-gradient-to-b from-blue-500 to-transparent h-64 rounded-lg">
  <p class="text-white">Content fades out</p>
</div>
```

---

## Core Configuration

### Extending Default Theme

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      // Colors
      colors: {
        marketplace: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#3b82f6',
          900: '#0f172a',
        },
      },
      
      // Spacing
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
        'gutter': 'clamp(1rem, 5vw, 2rem)',
      },
      
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      
      // Animations
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      
      keyframes: {
        slideIn: {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      
      // Shadows
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'elevated': '0 20px 40px rgba(0, 0, 0, 0.15)',
      },
    },
  },
}
```

### Custom Theme with @theme Directive

Tailwind CSS 4.1 introduces the **@theme directive**, a CSS-first approach to theme customization. Define your entire theme directly in CSS instead of JavaScript configuration:

```css
/* styles/globals.css */
@import "tailwindcss";

@theme {
  /* Color palette */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Semantic colors */
  --color-marketplace-brand: #3b82f6;
  --color-marketplace-danger: #ef4444;
  
  /* Spacing scale */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Text sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  
  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-card: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-elevated: 0 20px 40px rgba(0, 0, 0, 0.15);
  
  /* Animation durations */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
  
  /* Easing functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Tailwind automatically generates utility classes from your `@theme` variables AND creates CSS custom properties for use in your own styles.

## Theme Variables & CSS Custom Properties

### Available Theme Variable Namespaces

The `@theme` directive supports these CSS variable namespaces:

```css
@theme {
  /* Colors - generates utilities like bg-primary, text-secondary */
  --color-*: value;
  
  /* Spacing - generates utilities like p-4, m-8 */
  --spacing-*: value;
  
  /* Typography */
  --font-*: font-family;
  --text-*: font-size;
  --line-height-*: value;
  --letter-spacing-*: value;
  --font-weight-*: value;
  
  /* Layout */
  --breakpoint-*: media-query-value;
  --container-*: container-query-value;
  --aspect-*: aspect-ratio;
  --inset-*: positioning-value;
  --size-*: dimension;
  
  /* Effects */
  --shadow-*: box-shadow;
  --inset-shadow-*: inset-box-shadow;
  --drop-shadow-*: filter-value;
  --text-shadow-*: text-shadow;
  --blur-*: filter-value;
  --perspective-*: perspective-value;
  
  /* Animations */
  --duration-*: time;
  --delay-*: time;
  --ease-*: easing-function;
  --animate-*: animation;
  --keyframes-*: animation-frames;
}
```

### Overriding Default Theme Values

You can override Tailwind's default theme values in your `@theme` block:

```css
@theme {
  /* Override default colors */
  --color-blue-500: #0ea5e9;
  --color-blue-600: #0284c7;
  
  /* Add new color families */
  --color-marketplace-50: #f0f9ff;
  --color-marketplace-500: #3b82f6;
  --color-marketplace-900: #0c1b33;
  
  /* Override spacing scale */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
}
```

### Using Theme Variables in Custom CSS

Theme variables become CSS custom properties automatically:

```css
@theme {
  --color-brand: #3b82f6;
  --spacing-card: 1.5rem;
}

/* Your custom styles */
.card {
  background-color: var(--color-brand);
  padding: var(--spacing-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Advanced: Referencing Other Theme Values

You can reference theme variables within your `@theme` using CSS functions:

```css
@theme {
  --color-primary: #3b82f6;
  --color-primary-light: color-mix(in srgb, var(--color-primary) 90%, white);
  --color-primary-dark: color-mix(in srgb, var(--color-primary) 70%, black);
  
  /* Use in other variables */
  --shadow-brand: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
}
```

### Custom Keyframes in @theme

```css
@theme {
  --animate-fade: fadeInOut 2s ease-in-out infinite;
  --animate-slide: slideInUp 0.3s ease-out;
  
  --keyframes-fadeInOut: {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  };
  
  --keyframes-slideInUp: {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  };
}
```

### Preset Configurations (Legacy Config File)

```typescript
// tailwind.config.ts (for backward compatibility)
export default {
  // Light/Dark mode configuration
  darkMode: ['class', '[data-theme="dark"]'],
  
  // Responsive breakpoints
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
}
```

---

## Utility Classes

### Container & Layout

```html
<!-- Full-width container with padding -->
<div class="container mx-auto px-4">
  Content with responsive padding
</div>

<!-- Flexbox layouts -->
<div class="flex items-center justify-between gap-4">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Grid layouts -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Sticky positioning -->
<header class="sticky top-0 bg-white shadow-md z-10">
  Navigation
</header>
```

### Sizing & Spacing

```html
<!-- Fixed sizes -->
<div class="w-full h-64 bg-blue-100"></div>
<div class="w-96 h-80 bg-blue-100"></div>

<!-- Responsive sizing -->
<div class="w-full md:w-2/3 lg:w-1/2">
  Content that shrinks on desktop
</div>

<!-- Padding & Margin -->
<div class="p-4 md:p-8 space-y-4">
  <div class="mb-6">Spaced content</div>
</div>
```

### Display & Visibility

```html
<!-- Responsive display -->
<div class="hidden md:block">
  Shows only on desktop
</div>

<div class="md:hidden">
  Shows only on mobile
</div>

<!-- Flexbox utilities -->
<div class="flex flex-col md:flex-row">
  Column on mobile, row on desktop
</div>

<!-- Overflow handling -->
<div class="overflow-auto max-h-96">
  Long scrollable content
</div>
```

---

## Typography & Text Effects

### Font Sizes & Styles

```html
<!-- Font sizes -->
<h1 class="text-4xl font-bold text-shadow-lg">Large Heading</h1>
<h2 class="text-2xl font-semibold">Medium Heading</h2>
<p class="text-base text-gray-700">Body text</p>
<small class="text-sm text-gray-500">Small text</small>

<!-- Font weights -->
<p class="font-thin">Thin text</p>
<p class="font-normal">Normal text</p>
<p class="font-bold">Bold text</p>
<p class="font-black">Black text</p>

<!-- Text alignment -->
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>
<p class="text-justify">Justified text</p>

<!-- Letter spacing -->
<p class="tracking-tighter">Tight letter spacing</p>
<p class="tracking-wide">Wide letter spacing</p>
```

### Text Effects

```html
<!-- Truncation -->
<p class="truncate">Long text that gets truncated</p>
<p class="line-clamp-2">Multiple lines truncated after 2 lines</p>

<!-- Text decoration -->
<a href="#" class="underline hover:no-underline">Link</a>
<del class="line-through">Deleted text</del>

<!-- Text transforms -->
<p class="uppercase">uppercase text</p>
<p class="lowercase">LOWERCASE TEXT</p>
<p class="capitalize">capitalize text</p>

<!-- Text opacity -->
<p class="text-opacity-50">Semi-transparent text</p>
<p class="text-opacity-75">More opaque text</p>
```

### Text Colors & Shadows

```html
<!-- Text colors -->
<p class="text-gray-900">Dark text</p>
<p class="text-blue-600">Blue text</p>
<p class="text-emerald-500">Emerald text</p>

<!-- Text shadows (NEW in v4.1) -->
<h1 class="text-white text-shadow-lg">Shadowed heading</h1>
<p class="text-gray-700 text-shadow-sm">Subtle shadow</p>

<!-- Gradient text -->
<h2 class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
  Gradient text effect
</h2>
```

---

## Colors & Gradients

### Color Utilities

```html
<!-- Text colors -->
<p class="text-red-500">Red text</p>
<p class="text-blue-600">Blue text</p>
<p class="dark:text-white">White text in dark mode</p>

<!-- Background colors -->
<div class="bg-yellow-100">Light yellow background</div>
<div class="bg-gradient-to-r from-blue-500 to-purple-600">
  Gradient background
</div>

<!-- Border colors -->
<div class="border-2 border-red-500">Red border</div>
<div class="border border-gray-300 dark:border-gray-600">
  Adaptive border color
</div>

<!-- Opacity modifiers -->
<div class="bg-blue-500 bg-opacity-50">50% opacity background</div>
<p class="text-gray-900 text-opacity-60">60% opacity text</p>
```

### Gradient Directions

```html
<!-- Linear gradients -->
<div class="bg-gradient-to-r from-red-500 to-yellow-500">
  Left to right
</div>

<div class="bg-gradient-to-b from-blue-500 to-blue-900">
  Top to bottom
</div>

<div class="bg-gradient-to-tr from-green-400 to-green-600">
  Diagonal gradient
</div>

<!-- Radial gradients (custom) -->
<div class="bg-radial from-center via-blue-500 to-blue-900">
  Radial effect
</div>
```

---

## Layout & Spacing

### Flexbox

```html
<!-- Basic flex -->
<div class="flex gap-4">
  <div class="flex-1">Flexible item</div>
  <div class="flex-1">Flexible item</div>
  <div class="w-32">Fixed width</div>
</div>

<!-- Flex directions -->
<div class="flex flex-col">Vertical</div>
<div class="flex flex-row">Horizontal</div>
<div class="flex flex-row-reverse">Reversed row</div>

<!-- Justify & Align -->
<div class="flex justify-between items-center h-16">
  <span>Left</span>
  <span>Right</span>
</div>

<div class="flex justify-center items-end gap-4 min-h-64">
  <div>Centered & bottom aligned</div>
</div>
```

### Grid

```html
<!-- Basic grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div>Item</div>
  <!-- repeated -->
</div>

<!-- Grid spanning -->
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-2">Spans 2 columns</div>
  <div class="col-span-2">Spans 2 columns</div>
  <div class="col-span-4">Spans all 4</div>
</div>

<!-- Named grid areas -->
<div class="grid grid-areas gap-4">
  <header class="area-header">Header</header>
  <aside class="area-sidebar">Sidebar</aside>
  <main class="area-main">Main</main>
  <footer class="area-footer">Footer</footer>
</div>
```

---

## Responsive Design

### Breakpoint Utilities

```html
<!-- Hide/Show based on screen size -->
<div class="hidden md:block">Shows only on medium screens and up</div>
<div class="block md:hidden">Shows only below medium screens</div>

<!-- Responsive text sizes -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">
  Responsive heading
</h1>

<!-- Responsive padding -->
<div class="p-2 md:p-4 lg:p-8">
  Padding increases on larger screens
</div>

<!-- Responsive grid columns -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <div>Product</div>
  <!-- repeated -->
</div>
```

### Mobile-First Approach

```html
<!-- Start with mobile styles, add desktop overrides -->
<div class="
  w-full p-4 text-sm
  md:w-1/2 md:p-6 md:text-base
  lg:w-1/3 lg:p-8 lg:text-lg
">
  Responsive content that scales beautifully
</div>

<div class="
  flex flex-col gap-2
  md:flex-row md:gap-4
  lg:gap-8
">
  <div class="w-full md:w-1/3">Sidebar</div>
  <div class="w-full md:w-2/3">Main content</div>
</div>
```

---

## Dark Mode

### Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class', // or 'media'
  // ... rest of config
}
```

### Implementation

```html
<!-- Apply dark mode class to root -->
<html class="dark">
  <body class="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
    <!-- Content -->
  </body>
</html>
```

### Using Dark Mode Classes

```html
<!-- Background colors -->
<div class="bg-white dark:bg-gray-900">
  Background adapts to mode
</div>

<!-- Text colors -->
<p class="text-gray-900 dark:text-gray-100">
  Text color changes in dark mode
</p>

<!-- Border colors -->
<div class="border border-gray-300 dark:border-gray-700">
  Border adapts to mode
</div>

<!-- Complex styling -->
<div class="
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  text-gray-900 dark:text-white
  shadow-sm dark:shadow-lg
">
  Card with full dark mode support
</div>
```

---

## Performance & Optimization

### File Size Optimization

```bash
# Production build creates minimal CSS
npm run build

# Check generated CSS size
ls -lh dist/output.css
```

### Purging Unused Styles

The `content` array in `tailwind.config.ts` automatically purges unused classes:

```typescript
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  // Only includes CSS for classes found in these files
}
```

### Critical CSS

```html
<!-- Inline critical styles for above-fold content -->
<style>
  /* Critical CSS generated at build time */
  @import "tailwindcss/base";
  @layer base {
    body {
      @apply bg-white text-gray-900;
    }
  }
</style>

<!-- Defer non-critical CSS -->
<link rel="stylesheet" href="/styles/full.css" media="print" onload="this.media='all'">
```

---

## Integration with Next.js 16

### Setup for Next.js

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

### Global Styles

```css
/* app/globals.css */
@import "tailwindcss";

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg
           hover:bg-blue-700 active:bg-blue-800
           transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-900 rounded-lg
           hover:bg-gray-300 dark:bg-gray-700 dark:text-white
           transition-colors;
  }

  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md
           border border-gray-200 dark:border-gray-700 p-6;
  }

  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-blue-500
           dark:bg-gray-800 dark:border-gray-600 dark:text-white;
  }
}
```

### Component-Level Styling

```typescript
// components/ProductCard.tsx
export default function ProductCard({ product }) {
  return (
    <div className="card">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-semibold text-shadow-sm mb-2">
        {product.name}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {product.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-600">
          ${product.price}
        </span>
        <button className="btn-primary">Add to Cart</button>
      </div>
    </div>
  )
}
```

---

## Marketplace Examples

### Complete Product Listing Page

```typescript
// app/products/page.tsx
import ProductCard from '@/components/ProductCard'

export default function ProductsPage() {
  const products = [
    { id: 1, name: 'Laptop', price: 999, description: 'Powerful computing' },
    { id: 2, name: 'Phone', price: 699, description: 'Latest smartphone' },
    { id: 3, name: 'Headphones', price: 199, description: 'Premium audio' },
  ]

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-gray-900 shadow-md z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-shadow-lg">
            Marketplace
          </h1>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="search"
            placeholder="Search products..."
            className="input flex-1"
          />
          <select className="input md:w-48">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Clothing</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Seller Dashboard

```typescript
// app/dashboard/page.tsx
export default function SellerDashboard() {
  return (
    <div className="flex gap-6 p-6">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <nav className="space-y-2">
          <a href="#" className="block px-4 py-2 rounded-lg bg-blue-600 text-white">
            Dashboard
          </a>
          <a href="#" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Listings
          </a>
          <a href="#" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Orders
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <h1 className="text-4xl font-bold text-shadow-lg mb-8">
          Welcome back, Seller!
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Sales', value: '$12,450' },
            { label: 'Active Listings', value: '24' },
            { label: 'Orders Pending', value: '5' },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders Table */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">Order ID</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3">#001</td>
                <td>John Doe</td>
                <td>$299</td>
                <td><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
```

---

## Plugins & Extensions

### Official Plugins

```typescript
// tailwind.config.ts
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import aspectRatio from '@tailwindcss/aspect-ratio'
import containerQueries from '@tailwindcss/container-queries'

export default {
  plugins: [
    typography,
    forms,
    aspectRatio,
    containerQueries,
  ],
}
```

### Custom Plugin Example

```typescript
// plugins/customPlugin.ts
import plugin from 'tailwindcss/plugin'

const customPlugin = plugin(function ({ addBase, addComponents, addUtilities }) {
  // Add custom utilities
  addUtilities({
    '.text-shadow-custom': {
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
  })
})

export default customPlugin
```

---

**Questions?** Check [Tailwind CSS Documentation](https://tailwindcss.com/docs) or visit [Tailwind CSS Official Site](https://tailwindcss.com)
