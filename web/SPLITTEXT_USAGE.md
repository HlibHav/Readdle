# SplitText Component Usage Guide

## Overview
The `SplitText` component creates beautiful text animations where characters, words, or lines animate in with stagger effects as they scroll into view.

## ⚠️ Important: GSAP SplitText Plugin

The `SplitText` component uses **GSAP's SplitText plugin**, which is a **premium plugin**. 

### Options:

1. **Use GSAP Club GreenSock** (Recommended for production)
   - Sign up at [GreenSock Club](https://greensock.com/club/)
   - Get access to premium plugins including SplitText
   - Install via npm with your authentication token

2. **Use Trial Version** (Already installed)
   - ✅ Already installed: `gsap-trial@3.13.0`
   - Good for development and testing
   - May have limitations in production

3. **Create Alternative Implementation**
   - Use free GSAP features with custom text splitting
   - See "Free Alternative" section below

## 📦 Installed Dependencies

- ✅ `gsap@3.13.0` - Core GSAP library
- ✅ `gsap-trial@3.13.0` - Trial version with premium plugins
- ✅ `@gsap/react@2.x` - React hooks for GSAP

## 🚀 Basic Usage

```tsx
import SplitText from './SplitText';

function MyComponent() {
  return (
    <SplitText 
      text="Hello World"
      tag="h1"
      splitType="chars"
      delay={50}
      duration={0.6}
      className="text-4xl font-bold"
    />
  );
}
```

## 🎨 Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | **required** | The text to animate |
| `className` | `string` | `''` | Tailwind classes |
| `delay` | `number` | `100` | Stagger delay in ms |
| `duration` | `number` | `0.6` | Animation duration in seconds |
| `ease` | `string` | `'power3.out'` | GSAP easing function |
| `splitType` | `'chars' \| 'words' \| 'lines'` | `'chars'` | How to split the text |
| `from` | `gsap.TweenVars` | `{ opacity: 0, y: 40 }` | Starting animation state |
| `to` | `gsap.TweenVars` | `{ opacity: 1, y: 0 }` | Ending animation state |
| `threshold` | `number` | `0.1` | Intersection observer threshold |
| `rootMargin` | `string` | `'-100px'` | Intersection observer margin |
| `tag` | `'h1' \| 'h2' \| ... \| 'p'` | `'p'` | HTML tag to render |
| `textAlign` | `CSSProperties['textAlign']` | `'center'` | Text alignment |
| `onLetterAnimationComplete` | `() => void` | `undefined` | Callback when animation completes |

## 💡 Examples

### 1. Character-by-Character Animation (Hero Title)
```tsx
<SplitText 
  text="Welcome to Our App"
  tag="h1"
  splitType="chars"
  delay={30}
  duration={0.8}
  ease="elastic.out(1, 0.5)"
  className="text-6xl font-bold text-gray-900"
  textAlign="center"
/>
```

### 2. Word-by-Word Animation (Subtitle)
```tsx
<SplitText 
  text="Building amazing experiences together"
  tag="h2"
  splitType="words"
  delay={100}
  duration={0.6}
  from={{ opacity: 0, y: 20, scale: 0.9 }}
  to={{ opacity: 1, y: 0, scale: 1 }}
  className="text-2xl text-gray-600"
  textAlign="center"
/>
```

### 3. Line-by-Line Animation (Paragraph)
```tsx
<SplitText 
  text="This is a longer piece of text that will animate line by line as you scroll down the page."
  tag="p"
  splitType="lines"
  delay={150}
  duration={0.8}
  className="text-lg text-gray-700 max-w-2xl"
  textAlign="left"
/>
```

### 4. Custom Animation (Slide from Side)
```tsx
<SplitText 
  text="Sliding in from the left"
  tag="h3"
  splitType="chars"
  delay={40}
  duration={0.7}
  from={{ opacity: 0, x: -50, rotation: -10 }}
  to={{ opacity: 1, x: 0, rotation: 0 }}
  ease="back.out(1.7)"
  className="text-4xl font-semibold"
/>
```

### 5. With Callback
```tsx
<SplitText 
  text="Animation Complete!"
  tag="h2"
  splitType="chars"
  delay={50}
  duration={0.5}
  className="text-3xl"
  onLetterAnimationComplete={() => {
    console.log('Text animation finished!');
    // Trigger next animation, show confetti, etc.
  }}
/>
```

## 🎯 Use Cases in Your App

### AssistantPanel Header
```tsx
<SplitText 
  text="AI Assistant"
  tag="h2"
  splitType="chars"
  delay={30}
  duration={0.5}
  className="text-lg font-semibold"
  textAlign="left"
/>
```

### FolderSidebar Section Title
```tsx
<SplitText 
  text="Library"
  tag="h2"
  splitType="chars"
  delay={20}
  duration={0.4}
  className="text-lg font-semibold"
  textAlign="left"
/>
```

### Hero Section (New Landing Page)
```tsx
<div className="flex flex-col items-center space-y-4">
  <SplitText 
    text="Document Browser"
    tag="h1"
    splitType="chars"
    delay={40}
    duration={0.8}
    ease="elastic.out(1, 0.5)"
    className="text-6xl font-bold text-gray-900"
  />
  <SplitText 
    text="Organize, Search, and Collaborate"
    tag="h2"
    splitType="words"
    delay={100}
    duration={0.6}
    className="text-2xl text-gray-600"
  />
</div>
```

## 🎨 Pairing with GlassSurface

Combine SplitText animations with your new GlassSurface components:

```tsx
<GlassSurface 
  width={600} 
  height={200}
  borderRadius={24}
  className="flex items-center justify-center"
>
  <SplitText 
    text="Glassmorphic Text Animation"
    tag="h1"
    splitType="chars"
    delay={40}
    duration={0.7}
    className="text-4xl font-bold"
  />
</GlassSurface>
```

## 🆓 Free Alternative (No Premium Plugin)

If you prefer not to use the premium SplitText plugin, here's a simpler alternative:

```tsx
// SimpleSplitText.tsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SimpleSplitTextProps {
  text: string;
  className?: string;
}

export function SimpleSplitText({ text, className }: SimpleSplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const chars = text.split('').map((char, i) => 
      `<span key="${i}" class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');
    
    ref.current.innerHTML = chars;
    
    gsap.from(ref.current.children, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.03,
      ease: 'power2.out'
    });
  }, [text]);

  return <div ref={ref} className={className} />;
}
```

## 📚 Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [SplitText Plugin Docs](https://greensock.com/docs/v3/Plugins/SplitText)
- [GSAP Easing Visualizer](https://greensock.com/ease-visualizer/)
- [GreenSock Club](https://greensock.com/club/)

## 🐛 Troubleshooting

### "SplitText is not defined" Error
- Ensure `gsap-trial` is installed: `pnpm add gsap-trial`
- Or sign up for GreenSock Club for production use

### Text Not Animating
- Check that `text` prop is provided
- Ensure element is in viewport (scroll to see it)
- Check browser console for GSAP errors

### Performance Issues
- Reduce `splitType` complexity (use 'words' instead of 'chars')
- Increase `delay` value
- Use `will-change: transform` CSS (already included)

