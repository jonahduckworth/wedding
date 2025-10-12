# Wedding Color Guide

## Color Palette

### Individual Colors
```css
--color-sage: #c4d7a4      /* Light sage green */
--color-olive: #7d9456     /* Olive green */
--color-blush: #ecd5e8     /* Soft pink/lavender */
--color-rose: #c78ba4      /* Dusty rose */
--color-mauve: #9a4e72     /* Deep mauve/burgundy */
```

### Semantic Names (Easier to Use)
```css
--color-primary: #9a4e72   /* Deep mauve - main brand color */
--color-secondary: #7d9456 /* Olive - secondary actions */
--color-accent: #c78ba4    /* Dusty rose - accents */
--color-light: #ecd5e8     /* Soft blush - backgrounds */
--color-muted: #c4d7a4     /* Light sage - muted elements */
```

## Usage in Tailwind Classes

### Text Colors
```jsx
<h1 className="text-primary">Heading</h1>
<p className="text-mauve">Paragraph</p>
<span className="text-rose">Accent text</span>
<p className="text-olive">Secondary text</p>
<span className="text-sage">Muted text</span>
```

### Background Colors
```jsx
<div className="bg-primary">Primary background</div>
<div className="bg-light">Light background</div>
<div className="bg-rose">Rose background</div>
<div className="bg-sage">Sage background</div>
```

### Borders
```jsx
<div className="border-2 border-primary">Primary border</div>
<div className="border-t-4 border-rose">Top border accent</div>
<div className="border-sage/30">Sage border with opacity</div>
```

### Hover States
```jsx
<button className="bg-primary hover:bg-mauve">Button</button>
<a className="text-mauve hover:text-primary">Link</a>
```

### Gradients
```jsx
<div className="bg-gradient-to-b from-light to-white">Gradient</div>
<div className="bg-gradient-to-r from-sage via-rose to-mauve">Multi-color gradient</div>
```

## Color Psychology & Usage Recommendations

### Primary (Deep Mauve #9a4e72)
- **Use for:** Main headings, primary buttons, brand elements, CTA buttons
- **Emotion:** Elegant, romantic, sophisticated
- **Example:** "Sam & Jonah" heading, RSVP buttons

### Rose (Dusty Rose #c78ba4)
- **Use for:** Accents, subheadings, highlights, dates
- **Emotion:** Soft, romantic, warm
- **Example:** "August 15, 2026", card borders, icons

### Olive (Olive Green #7d9456)
- **Use for:** Secondary buttons, navigation hover states
- **Emotion:** Natural, grounded, calming
- **Example:** Registry items, secondary CTAs

### Blush (Soft Pink #ecd5e8)
- **Use for:** Backgrounds, sections, cards
- **Emotion:** Gentle, romantic, airy
- **Example:** Hero section background, card backgrounds

### Sage (Light Sage #c4d7a4)
- **Use for:** Muted elements, borders, subtle accents
- **Emotion:** Fresh, natural, peaceful
- **Example:** Dividers, borders, subtle backgrounds

## Typography

### Font Families
```css
--font-display: "Playfair Display", Georgia, serif  /* Headings */
--font-sans: system-ui, -apple-system, sans-serif   /* Body text */
```

### Usage
```jsx
<h1 className="font-display">Elegant Heading</h1>
<p className="font-sans">Body text</p>
```

## Example Components

### Primary Button
```jsx
<button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-mauve transition-colors shadow-md">
  Click Me
</button>
```

### Card with Accent Border
```jsx
<div className="bg-white border-t-4 border-rose rounded-xl shadow-lg p-6">
  <h3 className="text-primary font-display text-xl mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

### Link
```jsx
<a href="#" className="text-mauve hover:text-primary font-semibold transition-colors">
  Learn More →
</a>
```

### Hero Section
```jsx
<div className="bg-gradient-to-b from-light via-white to-white py-32">
  <h1 className="text-7xl font-display text-primary">Sam & Jonah</h1>
  <p className="text-3xl text-mauve italic">are getting married</p>
</div>
```

## Best Practices

1. **Use primary for important actions** - RSVP buttons, main CTAs
2. **Use light/blush for backgrounds** - Creates soft, romantic atmosphere
3. **Use rose/mauve for text accents** - Draws attention without being harsh
4. **Use sage/olive sparingly** - Great for borders and secondary elements
5. **Maintain contrast** - Always ensure text is readable on backgrounds
6. **Use gradients subtly** - from-light to-white for gentle transitions
7. **Add hover states** - Makes the site feel interactive and polished

## Accessibility

- Primary text on white: ✅ Good contrast
- Mauve text on white: ✅ Good contrast
- Rose text on white: ⚠️ Check for larger text only
- Sage text on white: ⚠️ Use for larger text or backgrounds
- Always test with browser dev tools for WCAG compliance
