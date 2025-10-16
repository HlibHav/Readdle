# Design System Guide

> **For Non-Designers**: This guide helps you build consistent, beautiful UIs without design experience

## 🎨 Quick Start

This application uses **Tailwind CSS** with a pre-configured design system. You can build UIs by using simple class names instead of writing CSS.

---

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Components](#components)
5. [Common Patterns](#common-patterns)
6. [Quick Examples](#quick-examples)

---

## Colors

### Basic Usage

Use color classes like `bg-primary`, `text-secondary`, `border-neutral-200`

### Color Palette

#### **Primary Colors** (Main brand colors)
```html
<!-- Primary Blue (iOS style) -->
<div class="bg-primary">Primary</div>
<div class="bg-primary-dark">Primary Dark</div>
<div class="bg-primary-light">Primary Light</div>

<!-- Text color -->
<span class="text-primary">Primary Text</span>
```

#### **Neutral Colors** (Backgrounds, borders, text)
```html
<!-- Backgrounds -->
<div class="bg-neutral-50">Lightest gray</div>
<div class="bg-neutral-100">Very light gray</div>
<div class="bg-neutral-200">Light gray</div>
<div class="bg-neutral-300">Medium-light gray</div>
<div class="bg-neutral-600">Medium gray</div>
<div class="bg-neutral-900">Very dark gray</div>

<!-- Text -->
<p class="text-neutral-900">Primary text (darkest)</p>
<p class="text-neutral-600">Secondary text</p>
<p class="text-neutral-400">Disabled text</p>
```

#### **Semantic Colors** (Status and feedback)
```html
<!-- Success (green) -->
<div class="bg-success text-white">Success</div>
<div class="text-success">Success text</div>

<!-- Warning (yellow) -->
<div class="bg-warning text-white">Warning</div>

<!-- Error (red) -->
<div class="bg-error text-white">Error</div>

<!-- Info (blue) -->
<div class="bg-info text-white">Info</div>
```

#### **Accent Colors** (Use sparingly for emphasis)
```html
<div class="bg-accent-green">Green</div>
<div class="bg-accent-orange">Orange</div>
<div class="bg-accent-purple">Purple</div>
<div class="bg-accent-pink">Pink</div>
```

### When to Use Each Color

| Purpose | Color | Example |
|---------|-------|---------|
| Primary actions | `bg-primary` | Submit buttons, links |
| Secondary text | `text-neutral-600` | Descriptions, labels |
| Borders | `border-neutral-200` | Card borders, dividers |
| Success messages | `text-success` | Success notifications |
| Error messages | `text-error` | Error notifications |
| Background | `bg-neutral-50` | Page backgrounds |

---

## Typography

### Font Sizes

Use semantic font size classes:

```html
<!-- Headings -->
<h1 class="text-display">Display Text (40px)</h1>
<h1 class="text-heading-lg">Large Heading (32px)</h1>
<h2 class="text-heading">Heading (24px)</h2>
<h3 class="text-heading-sm">Small Heading (20px)</h3>

<!-- Body Text -->
<p class="text-body-lg">Large body text (18px)</p>
<p class="text-body">Body text (16px)</p>
<p class="text-body-sm">Small body text (14px)</p>
<p class="text-caption">Caption text (12px)</p>
```

### Pre-made Text Styles

These classes combine size, weight, and color:

```html
<!-- Page title -->
<h1 class="text-heading-page">Page Title</h1>

<!-- Section title -->
<h2 class="text-heading-section">Section Title</h2>

<!-- Primary body text -->
<p class="text-body-primary">Main content text</p>

<!-- Secondary body text -->
<p class="text-body-secondary">Supporting text</p>

<!-- Caption (small text) -->
<span class="text-caption-primary">Caption text</span>
<span class="text-caption-secondary">Muted caption</span>
```

### Font Weights

```html
<span class="font-normal">Normal weight</span>
<span class="font-medium">Medium weight</span>
<span class="font-semibold">Semibold weight</span>
<span class="font-bold">Bold weight</span>
```

---

## Spacing

### Spacing Scale

Use consistent spacing throughout your app:

| Class | Size | Use For |
|-------|------|---------|
| `p-xs` / `m-xs` | 4px | Tiny gaps |
| `p-sm` / `m-sm` | 8px | Small gaps |
| `p-md` / `m-md` | 16px | Standard spacing |
| `p-lg` / `m-lg` | 24px | Large spacing |
| `p-xl` / `m-xl` | 32px | Extra large spacing |
| `p-2xl` / `m-2xl` | 48px | Very large spacing |

### Examples

```html
<!-- Padding (space inside) -->
<div class="p-md">Standard padding (16px all sides)</div>
<div class="px-md py-sm">Horizontal 16px, Vertical 8px</div>
<div class="pt-lg">Top padding 24px</div>

<!-- Margin (space outside) -->
<div class="m-md">Standard margin</div>
<div class="mt-lg mb-md">Top 24px, Bottom 16px</div>
<div class="mx-auto">Centered horizontally</div>

<!-- Gap (space between flex/grid items) -->
<div class="flex gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Common Spacing Patterns

```html
<!-- Card with standard padding -->
<div class="p-md">Content</div>

<!-- Section with vertical spacing -->
<section class="py-lg">
  <h2 class="mb-md">Title</h2>
  <p>Content</p>
</section>

<!-- List with gaps -->
<div class="space-y-sm">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## Components

### Buttons

Pre-made button classes - just add the class:

```html
<!-- Primary button (main actions) -->
<button class="btn-primary">Save Changes</button>

<!-- Secondary button (less important) -->
<button class="btn-secondary">Cancel</button>

<!-- Ghost button (subtle actions) -->
<button class="btn-ghost">Learn More</button>

<!-- Danger button (destructive actions) -->
<button class="btn-danger">Delete</button>

<!-- Button sizes -->
<button class="btn-primary btn-sm">Small Button</button>
<button class="btn-primary">Normal Button</button>
<button class="btn-primary btn-lg">Large Button</button>

<!-- Disabled button -->
<button class="btn-primary" disabled>Disabled</button>
```

### Input Fields

```html
<!-- Standard input -->
<input type="text" class="input-field" placeholder="Enter text...">

<!-- Input with error -->
<input type="text" class="input-field input-error" placeholder="Enter text...">

<!-- Full form field -->
<div class="form-group">
  <label class="form-label">Email Address</label>
  <input type="email" class="input-field" placeholder="you@example.com">
  <p class="form-hint">We'll never share your email</p>
</div>

<!-- Form field with error -->
<div class="form-group">
  <label class="form-label">Password</label>
  <input type="password" class="input-field input-error">
  <p class="form-error">Password is required</p>
</div>
```

### Cards

```html
<!-- Basic card -->
<div class="card">
  <h3 class="text-heading-sm mb-sm">Card Title</h3>
  <p class="text-body-secondary">Card content goes here</p>
</div>

<!-- Hoverable card -->
<div class="card-hover">
  <h3 class="text-heading-sm mb-sm">Card Title</h3>
  <p class="text-body-secondary">This card has hover effect</p>
</div>

<!-- Elevated card (more shadow) -->
<div class="card-elevated">
  <h3 class="text-heading-sm mb-sm">Important Card</h3>
  <p class="text-body-secondary">This card stands out more</p>
</div>
```

### Badges

```html
<!-- Status badges -->
<span class="badge-success">Active</span>
<span class="badge-warning">Pending</span>
<span class="badge-error">Error</span>
<span class="badge-info">New</span>
<span class="badge-neutral">Draft</span>

<!-- Basic badge -->
<span class="badge bg-purple-100 text-purple-700">Custom</span>
```

### Dividers

```html
<!-- Horizontal divider -->
<div class="divider"></div>

<!-- Vertical divider (in flex container) -->
<div class="flex items-center">
  <span>Left</span>
  <div class="divider-vertical"></div>
  <span>Right</span>
</div>
```

---

## Common Patterns

### Layout Containers

```html
<!-- Page container (max width, centered) -->
<div class="container-page">
  <!-- Your content -->
</div>

<!-- Section with spacing -->
<section class="container-section">
  <!-- Auto-spaced content -->
</section>
```

### Flex Layouts

```html
<!-- Horizontal layout with gap -->
<div class="flex gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Space between items -->
<div class="flex justify-between items-center">
  <h2>Title</h2>
  <button class="btn-primary">Action</button>
</div>

<!-- Centered content -->
<div class="flex items-center justify-center min-h-screen">
  <div>Centered Content</div>
</div>

<!-- Vertical stack -->
<div class="flex flex-col gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid Layouts

```html
<!-- 2 columns -->
<div class="grid grid-cols-2 gap-md">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
</div>

<!-- 3 columns, responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### Loading States

```html
<!-- Skeleton loader -->
<div class="skeleton h-4 w-full mb-2"></div>
<div class="skeleton h-4 w-3/4 mb-2"></div>
<div class="skeleton h-4 w-1/2"></div>
```

---

## Quick Examples

### Example 1: Simple Card with Button

```html
<div class="card">
  <h3 class="text-heading-sm mb-sm">Welcome Back!</h3>
  <p class="text-body-secondary mb-md">
    Continue where you left off
  </p>
  <button class="btn-primary">Get Started</button>
</div>
```

### Example 2: Form

```html
<div class="card max-w-md mx-auto">
  <h2 class="text-heading-section mb-lg">Sign In</h2>
  
  <form class="space-y-md">
    <div class="form-group">
      <label class="form-label">Email</label>
      <input type="email" class="input-field" placeholder="you@example.com">
    </div>
    
    <div class="form-group">
      <label class="form-label">Password</label>
      <input type="password" class="input-field">
      <p class="form-hint">At least 8 characters</p>
    </div>
    
    <button type="submit" class="btn-primary w-full">Sign In</button>
    <button type="button" class="btn-ghost w-full">Forgot Password?</button>
  </form>
</div>
```

### Example 3: List with Actions

```html
<div class="card">
  <h3 class="text-heading-sm mb-md">Recent Items</h3>
  
  <div class="space-y-sm">
    <div class="list-item flex justify-between items-center">
      <div>
        <p class="text-body-primary">Item 1</p>
        <p class="text-caption-secondary">Updated 2 hours ago</p>
      </div>
      <button class="btn-ghost btn-sm">View</button>
    </div>
    
    <div class="list-item flex justify-between items-center">
      <div>
        <p class="text-body-primary">Item 2</p>
        <p class="text-caption-secondary">Updated yesterday</p>
      </div>
      <button class="btn-ghost btn-sm">View</button>
    </div>
  </div>
</div>
```

### Example 4: Status Dashboard

```html
<div class="container-page py-lg">
  <h1 class="text-heading-page mb-lg">Dashboard</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
    <div class="card">
      <p class="text-caption-secondary mb-xs">Total Users</p>
      <p class="text-display font-bold text-primary">1,234</p>
      <span class="badge-success mt-sm">+12% this month</span>
    </div>
    
    <div class="card">
      <p class="text-caption-secondary mb-xs">Revenue</p>
      <p class="text-display font-bold text-primary">$45.2K</p>
      <span class="badge-error mt-sm">-3% this month</span>
    </div>
    
    <div class="card">
      <p class="text-caption-secondary mb-xs">Active Sessions</p>
      <p class="text-display font-bold text-primary">842</p>
      <span class="badge-info mt-sm">Live</span>
    </div>
  </div>
</div>
```

### Example 5: Alert Messages

```html
<!-- Success alert -->
<div class="bg-success/10 border border-success rounded-card p-md">
  <p class="text-success font-medium">Success! Your changes have been saved.</p>
</div>

<!-- Error alert -->
<div class="bg-error/10 border border-error rounded-card p-md">
  <p class="text-error font-medium">Error: Something went wrong.</p>
</div>

<!-- Info alert -->
<div class="bg-info/10 border border-info rounded-card p-md">
  <p class="text-info font-medium">Info: New features available.</p>
</div>
```

---

## Responsive Design

Tailwind is mobile-first. Add prefixes to apply styles at different screen sizes:

```html
<!-- Stack on mobile, row on tablet+ -->
<div class="flex flex-col md:flex-row gap-md">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div>Item</div>
</div>

<!-- Hide on mobile, show on tablet+ -->
<div class="hidden md:block">Desktop only content</div>

<!-- Different padding on mobile vs desktop -->
<div class="p-md lg:p-lg">Content</div>
```

### Breakpoints

| Prefix | Screen Size | Example |
|--------|-------------|---------|
| (none) | < 768px (mobile) | `text-sm` |
| `md:` | ≥ 768px (tablet) | `md:text-base` |
| `lg:` | ≥ 1024px (desktop) | `lg:text-lg` |
| `xl:` | ≥ 1280px (large desktop) | `xl:text-xl` |

---

## Tips for Non-Designers

### 1. **Start with Components**
Always use pre-made component classes (`btn-primary`, `card`, `input-field`) instead of building from scratch.

### 2. **Use Consistent Spacing**
Stick to the spacing scale (`xs`, `sm`, `md`, `lg`, `xl`). Don't use arbitrary values like `p-3` or `m-7`.

### 3. **Follow the Color Palette**
Use `primary`, `neutral-X`, and semantic colors (`success`, `error`). Avoid random colors.

### 4. **Keep Typography Simple**
Use the pre-made text classes (`text-body-primary`, `text-heading-section`).

### 5. **Test Responsiveness**
Always check how your UI looks on mobile, tablet, and desktop.

### 6. **Copy Examples**
Start with the examples in this guide and modify them for your needs.

### 7. **Common Mistakes to Avoid**

❌ **Don't do this:**
```html
<div style="margin: 17px; color: #123456;">Text</div>
```

✅ **Do this instead:**
```html
<div class="m-md text-primary">Text</div>
```

---

## Cheat Sheet

### Most Used Classes

```
Layout:
  flex, grid, block, inline-block
  flex-col, flex-row
  items-center, justify-between, justify-center
  gap-md, space-y-md

Colors:
  bg-primary, bg-neutral-100, bg-white
  text-primary, text-neutral-600, text-error
  border-neutral-200

Spacing:
  p-md, px-lg, py-sm, m-md
  
Typography:
  text-body, text-heading, text-caption
  font-medium, font-semibold, font-bold
  
Components:
  btn-primary, btn-secondary
  card, card-hover
  input-field
  badge-success

Sizing:
  w-full, h-full
  max-w-md, max-w-lg
  min-h-screen
```

---

## Need Help?

1. **See Tailwind docs**: https://tailwindcss.com/docs
2. **Check existing components**: Look at other components in the app for examples
3. **Use the examples** in this guide as templates
4. **Copy and modify**: Start with working code and adjust it

---

## Summary

✅ Use pre-made component classes (`btn-primary`, `card`, etc.)  
✅ Follow the color palette (`primary`, `neutral-X`, semantic colors)  
✅ Use consistent spacing (`xs`, `sm`, `md`, `lg`, `xl`)  
✅ Use semantic text classes (`text-body-primary`, `text-heading-section`)  
✅ Copy examples and modify them  
✅ Test on mobile, tablet, and desktop  

With this design system, you can build beautiful, consistent UIs without any design experience! 🎨

