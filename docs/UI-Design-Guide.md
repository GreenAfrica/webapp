# GreenAfrica User Web App - UI Design Guide

## Overview
This design guide establishes the visual foundation for the GreenAfrica user web app, focusing on sustainability, trust, and user engagement. The design system emphasizes clarity, accessibility, and a modern aesthetic that reflects our environmental mission.

---

## 1. Brand Foundation

### Logo Colors
- **Primary Green**: `#8bba8e` (cls-1) - Main brand actions, CTAs, progress indicators
- **Forest Green**: `#2e7d33` (cls-2) - Headers, important text, navigation, emphasis
- **Light Green**: `#e7f6e8` (cls-3) - Backgrounds, cards, subtle elements, success states

### Brand Personality
- **Trustworthy**: Reliable technology for environmental impact
- **Approachable**: Easy-to-use interface for all users
- **Empowering**: Users feel good about their positive impact
- **Modern**: Clean, contemporary design that feels current

---

## 2. Typography System

### Font Selection
- **Primary Font**: [Inter](https://fonts.google.com/specimen/Inter)
  - Usage: Body text, UI elements, forms, navigation
  - Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)
  - Rationale: Excellent legibility, optimized for UI, professional yet approachable

- **Display Font**: [Poppins](https://fonts.google.com/specimen/Poppins)
  - Usage: Headings, hero text, marketing content
  - Weights: 400 (Regular), 600 (SemiBold), 700 (Bold)
  - Rationale: Friendly, geometric, great for impact statements

### Type Scale
```css
/* Headings - Poppins */
.text-4xl    /* 36px - Hero headlines */
.text-3xl    /* 30px - Page titles */
.text-2xl    /* 24px - Section headers */
.text-xl     /* 20px - Subsection headers */
.text-lg     /* 18px - Card titles */

/* Body - Inter */
.text-base   /* 16px - Primary body text */
.text-sm     /* 14px - Secondary text, captions */
.text-xs     /* 12px - Labels, micro-copy */
```

### Font Weights & Usage
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: Emphasized body text, form labels
- **SemiBold (600)**: Button text, important labels, sub-headings
- **Bold (700)**: Headlines only (Poppins)

---

## 3. Color System

### Primary Palette
```css
/* Brand Colors */
--color-primary-50: #f0f9f1;
--color-primary-100: #e7f6e8;    /* cls-3 - Light Green */
--color-primary-200: #c8e6cb;
--color-primary-300: #a1d1a6;
--color-primary-400: #8bba8e;    /* cls-1 - Primary Green */
--color-primary-500: #6da371;
--color-primary-600: #4f8754;
--color-primary-700: #2e7d33;    /* cls-2 - Forest Green */
--color-primary-800: #1b5e20;
--color-primary-900: #0d4715;
```

### Semantic Colors
```css
/* Success */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;
--color-success-700: #15803d;

/* Warning */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-700: #a16207;

/* Error */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-700: #b91c1c;

/* Info */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;
--color-info-700: #1d4ed8;
```

### Neutral Palette
```css
/* Grays */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

---

## 4. Spacing & Layout System

### Spacing Scale (8px base unit)
```css
/* Spacing Scale */
.space-1  /* 4px  - Tight spacing */
.space-2  /* 8px  - Small spacing */
.space-3  /* 12px - Medium-small */
.space-4  /* 16px - Base spacing */
.space-6  /* 24px - Medium spacing */
.space-8  /* 32px - Large spacing */
.space-12 /* 48px - Extra large */
.space-16 /* 64px - Section spacing */
.space-24 /* 96px - Page section spacing */
```

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets, large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Container Widths
```css
.container-sm  /* max-width: 640px */
.container-md  /* max-width: 768px */
.container-lg  /* max-width: 1024px */
.container-xl  /* max-width: 1280px */
```

---

## 5. Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  @apply bg-primary-400 hover:bg-primary-500 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-white border-2 border-primary-400 text-primary-700 hover:bg-primary-50 font-medium px-6 py-3 rounded-lg transition-colors duration-200;
}
```

#### Ghost Button
```css
.btn-ghost {
  @apply text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-medium px-4 py-2 rounded-md transition-colors duration-200;
}
```

### Form Elements

#### Text Input
```css
.input-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-colors duration-200;
}
```

#### Label
```css
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}
```

### Cards

#### Basic Card
```css
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6;
}
```

#### Impact Card
```css
.impact-card {
  @apply bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200;
}
```

### Badges

#### Status Badge
```css
.badge-success {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800;
}

.badge-warning {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800;
}
```

---

## 6. User Web App Specific Guidelines

### Hero Section
- Background: Subtle gradient from `primary-50` to white
- Headline: Poppins Bold, text-4xl, primary-800
- Subtext: Inter Regular, text-lg, gray-600
- CTA Button: Primary button style with extra padding

### Dashboard Layout
- Sidebar: Fixed width 256px on desktop, collapsible on mobile
- Main content: Max-width container with proper spacing
- Cards: Grid layout with consistent spacing

### Impact Visualization
- Primary color for positive metrics
- Success color for achievements
- Animated counters for engagement
- Progress bars using primary color gradients

### Reward System UI
- Cards with subtle shadows and hover states
- Green accent colors for available rewards
- Clear visual hierarchy for point values
- Iconography consistent with sustainability theme

---

## 7. Accessibility Guidelines

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio minimum)
- Interactive elements have sufficient contrast
- Focus states are clearly visible

### Typography
- Minimum 16px for body text
- Line height of 1.5 for readability
- Sufficient spacing between interactive elements (44px minimum)

### Interactive Elements
- Clear focus indicators
- Keyboard navigation support
- Screen reader friendly markup

---

## 8. Tailwind CSS Configuration

### Custom Theme Extension
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f1',
          100: '#e7f6e8',
          200: '#c8e6cb',
          300: '#a1d1a6',
          400: '#8bba8e',
          500: '#6da371',
          600: '#4f8754',
          700: '#2e7d33',
          800: '#1b5e20',
          900: '#0d4715',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      }
    }
  }
}
```

### Custom Utility Classes
```css
/* Custom utilities for GreenAfrica */
@layer utilities {
  .text-gradient-primary {
    @apply bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent;
  }
  
  .shadow-green {
    box-shadow: 0 4px 14px 0 rgb(139 186 142 / 0.1);
  }
  
  .border-gradient-primary {
    border-image: linear-gradient(90deg, theme('colors.primary.400'), theme('colors.primary.600')) 1;
  }
}
```

---

## 9. Component Usage Examples

### Hero Section Example
```jsx
<section className="bg-gradient-to-br from-primary-50 to-white py-24">
  <div className="container mx-auto px-4">
    <h1 className="font-display font-bold text-4xl md:text-5xl text-primary-800 mb-6">
      Turn Recycling Into Instant Rewards
    </h1>
    <p className="text-lg text-gray-600 mb-8 max-w-2xl">
      Drop plastic bottles, earn Green Points, redeem airtime and data while making a positive environmental impact.
    </p>
    <button className="btn-primary text-lg px-8 py-4">
      Get Started Today
    </button>
  </div>
</section>
```

### Impact Card Example
```jsx
<div className="impact-card">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-display font-semibold text-xl text-primary-800">
      Your Impact
    </h3>
    <div className="badge-success">This Month</div>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-2xl font-bold text-primary-700">247</p>
      <p className="text-sm text-gray-600">Bottles Recycled</p>
    </div>
    <div>
      <p className="text-2xl font-bold text-primary-700">12.3kg</p>
      <p className="text-sm text-gray-600">CO₂ Saved</p>
    </div>
  </div>
</div>
```

---

## 10. Implementation Checklist

### Setup Phase
- [ ] Install Google Fonts (Inter, Poppins)
- [ ] Configure Tailwind with custom theme
- [ ] Set up component base styles
- [ ] Create utility class extensions

### Component Development
- [ ] Build button variants
- [ ] Create form components
- [ ] Design card components
- [ ] Implement navigation elements
- [ ] Add loading states and animations

### Page Implementation
- [ ] Landing page with hero section
- [ ] User dashboard
- [ ] Rewards/points system UI
- [ ] Impact tracking displays
- [ ] Mobile responsive layouts

---

## Notes for Development Team

1. **Mobile-First**: Always design and develop for mobile first, then enhance for larger screens
2. **Accessibility**: Test with screen readers and keyboard navigation
3. **Performance**: Optimize font loading and use appropriate font-display values
4. **Consistency**: Use the defined spacing scale and avoid arbitrary values
5. **Testing**: Test color contrast and readability across different devices

This design guide serves as the single source of truth for all UI decisions in the GreenAfrica user web app. When in doubt, refer back to these guidelines to maintain consistency and quality.
