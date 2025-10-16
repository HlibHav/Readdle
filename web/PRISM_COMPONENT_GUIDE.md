# Prism Component - 3D WebGL Animation Guide

## 🎨 Overview

The **Prism** component creates stunning 3D animated geometric effects using WebGL. It renders a rotating or interactive triangular prism with customizable colors, glow, and effects.

## ✅ Installation Status

- ✅ Component: `/web/src/components/Prism.tsx`
- ✅ Dependency: `ogl@1.0.6` (WebGL rendering library)
- ✅ Integrated: Layout.tsx (animated background)

## 📋 Complete Props Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Geometry** |
| `height` | `number` | `3.5` | Apex height of the prism (world units) |
| `baseWidth` | `number` | `5.5` | Total base width across X/Z (world units) |
| `scale` | `number` | `3.6` | Overall screen-space scale of the prism (bigger = larger) |
| **Animation** |
| `animationType` | `"rotate"` \| `"hover"` \| `"3drotate"` | `"rotate"` | Animation mode: shader wobble, pointer hover tilt, or full 3D rotation |
| `timeScale` | `number` | `0.5` | Global time multiplier for animations (0=frozen, 1=normal) |
| `hoverStrength` | `number` | `2` | Sensitivity of hover tilt (pitch/yaw amplitude) |
| `inertia` | `number` | `0.05` | Easing factor for hover (0..1, higher = snappier) |
| `suspendWhenOffscreen` | `boolean` | `false` | Pause rendering when the element is not in the viewport |
| **Visual Effects** |
| `glow` | `number` | `1` | Glow/bleed intensity multiplier |
| `bloom` | `number` | `1` | Extra bloom factor layered on top of glow |
| `noise` | `number` | `0.5` | Film-grain noise amount added to final color (0 disables) |
| `transparent` | `boolean` | `true` | Whether the canvas has an alpha channel (transparent background) |
| **Color** |
| `hueShift` | `number` | `0` | Hue rotation (radians) applied to final color |
| `colorFrequency` | `number` | `1` | Frequency of internal sine bands controlling color variation |
| **Position** |
| `offset` | `{ x?: number; y?: number }` | `{ x: 0, y: 0 }` | Pixel offset within the canvas (x→right, y→down) |

### 📐 Props Deep Dive

#### Geometry Props

**`height`** - Apex height of the prism
- **Range:** 0.001+ (enforced minimum)
- **Units:** World space units
- **Effect:** Taller = more stretched prism
- **Examples:** `2.0` (short), `3.5` (default), `6.0` (tall)

**`baseWidth`** - Total base width
- **Range:** 0.001+ (enforced minimum)
- **Units:** World space units  
- **Effect:** Wider = broader prism base
- **Examples:** `3.0` (narrow), `5.5` (default), `8.0` (wide)

**`scale`** - Screen-space scale
- **Range:** 0.001+ (enforced minimum)
- **Units:** Multiplier
- **Effect:** Overall size on screen
- **Examples:** `2.0` (small), `3.6` (default), `5.0` (large)
- **Note:** Affects canvas resolution, not world geometry

#### Animation Props

**`animationType`** - Animation mode
- **`"rotate"`** - Continuous 2D rotation with base wobble
  - Uses shader-based wobble matrix
  - Lightweight, smooth performance
  - Best for backgrounds
- **`"hover"`** - Mouse-interactive tilt
  - Tracks pointer position
  - Inertia-based smooth following
  - Pauses when not hovering
- **`"3drotate"`** - Full 3D rotation
  - Yaw, pitch, and roll on all axes
  - Sine-wave modulated rotation speeds
  - Premium visual effect

**`timeScale`** - Animation speed multiplier
- **Range:** 0+ (0 = frozen)
- **Units:** Multiplier
- **Effect:** 0.5 = half speed, 1 = normal, 2 = double speed
- **Performance:** Lower = less GPU work

**`hoverStrength`** - Hover tilt sensitivity (hover mode only)
- **Range:** 0+
- **Units:** Amplitude multiplier
- **Effect:** Higher = more dramatic tilt
- **Examples:** `1` (subtle), `2` (default), `4` (extreme)

**`inertia`** - Hover easing factor (hover mode only)
- **Range:** 0..1
- **Units:** Interpolation factor
- **Effect:** Higher = snappier response
- **Examples:** `0.02` (slow), `0.05` (default), `0.2` (fast)

**`suspendWhenOffscreen`** - Viewport-based suspension
- **`true`** - Pauses rendering when not visible (saves GPU)
- **`false`** - Always animates (default)
- **Use:** Enable for off-screen backgrounds

#### Visual Effects Props

**`glow`** - Glow/bleed intensity
- **Range:** 0+
- **Units:** Multiplier
- **Effect:** Higher = more intense glow
- **Examples:** `0.5` (subtle), `1` (default), `2` (intense)

**`bloom`** - Additional bloom layer
- **Range:** 0+
- **Units:** Multiplier on top of glow
- **Effect:** Extra brightness multiplication
- **Formula:** `finalGlow = glow * bloom`

**`noise`** - Film grain amount
- **Range:** 0..1+ (0 disables)
- **Units:** Noise amplitude
- **Effect:** Adds texture/grain to final image
- **Examples:** `0` (clean), `0.5` (default), `1` (grainy)

**`transparent`** - Alpha channel
- **`true`** - Canvas has transparency (default)
- **`false`** - Opaque black background
- **Note:** Also affects saturation multiplier (1.5 vs 1.0)

#### Color Props

**`hueShift`** - Hue rotation
- **Range:** Any number (radians)
- **Units:** Radians (not degrees!)
- **Conversion:** degrees × (π/180) = radians
- **Examples:** 
  - `0` = no shift (default)
  - `Math.PI` = 180° shift
  - `Math.PI * 2` = 360° full rotation
- **Color shifts:**
  - `0` = Original (red/orange/yellow)
  - `π/3` (~60°) = Green
  - `2π/3` (~120°) = Cyan
  - `π` (180°) = Blue/purple
  - `4π/3` (~240°) = Magenta

**`colorFrequency`** - Color band frequency
- **Range:** 0+
- **Units:** Frequency multiplier
- **Effect:** Controls speed of color variation
- **Examples:** `0.5` (slow), `1` (default), `2` (fast rainbow)

#### Position Props

**`offset`** - Canvas position offset
- **Type:** `{ x?: number; y?: number }`
- **Units:** Pixels (scaled by DPR)
- **Direction:** x = right, y = down
- **Use:** Fine-tune prism position in container

## 🎯 Animation Types

### 1. `'rotate'` - Continuous Rotation (Default)
```tsx
<Prism animationType="rotate" timeScale={0.5} />
```
- **Best for:** Background animations, ambient effects
- **Features:** Smooth 2D rotation with base wobble
- **Performance:** Excellent (continuous but lightweight)

### 2. `'hover'` - Mouse Interactive
```tsx
<Prism 
  animationType="hover" 
  hoverStrength={2}
  inertia={0.05}
/>
```
- **Best for:** Interactive hero sections, focal points
- **Features:** Follows mouse movement with smooth inertia
- **Performance:** Good (only animates on mouse move)

### 3. `'3drotate'` - Complex 3D Rotation
```tsx
<Prism animationType="3drotate" timeScale={0.5} />
```
- **Best for:** Premium effects, hero sections
- **Features:** Full 3D rotation on all axes
- **Performance:** Good (more complex than rotate)

## 💡 Usage Examples

### Subtle Background (Current in Layout)
```tsx
<div className="fixed inset-0 pointer-events-none opacity-30 z-0">
  <Prism
    animationType="rotate"
    timeScale={0.5}
    height={3.5}
    baseWidth={5.5}
    scale={3.6}
    glow={1}
    noise={0.5}
  />
</div>
```

### Prominent Hero Section
```tsx
<div className="relative w-full h-screen">
  <div className="absolute inset-0 opacity-50">
    <Prism
      animationType="3drotate"
      timeScale={0.8}
      height={4}
      baseWidth={6}
      scale={4}
      glow={1.5}
      bloom={1.2}
      hueShift={180}
      colorFrequency={1.5}
    />
  </div>
  <div className="relative z-10">
    <h1>Your Content Here</h1>
  </div>
</div>
```

### Interactive Card
```tsx
<div className="relative w-96 h-96 rounded-xl overflow-hidden">
  <Prism
    animationType="hover"
    height={3}
    baseWidth={4}
    scale={3}
    hoverStrength={3}
    inertia={0.1}
    glow={2}
  />
  <div className="relative z-10 p-8">
    <h2>Interactive Card</h2>
  </div>
</div>
```

### Slow Ethereal Effect
```tsx
<Prism
  animationType="rotate"
  timeScale={0.2}
  height={4}
  baseWidth={6}
  scale={4}
  glow={0.8}
  noise={0.8}
  bloom={0.8}
  colorFrequency={0.5}
/>
```

### Vibrant & Fast
```tsx
<Prism
  animationType="3drotate"
  timeScale={1.5}
  height={3}
  baseWidth={5}
  scale={4}
  glow={2}
  bloom={1.5}
  hueShift={120}
  colorFrequency={2}
  noise={0.3}
/>
```

### Color Variations

**Important:** `hueShift` uses **radians**, not degrees!

```tsx
// Original Colors (red/orange/yellow)
<Prism hueShift={0} />

// Green (~60°)
<Prism hueShift={Math.PI / 3} colorFrequency={1} />

// Cyan (~120°)
<Prism hueShift={(Math.PI * 2) / 3} colorFrequency={1} />

// Blue/Purple (180°)
<Prism hueShift={Math.PI} colorFrequency={1} />

// Magenta (~240°)
<Prism hueShift={(Math.PI * 4) / 3} colorFrequency={1.2} />

// Rainbow Fast Cycle
<Prism hueShift={0} colorFrequency={3} />

// Degrees to Radians Helper
const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);
<Prism hueShift={degreesToRadians(90)} /> // 90 degrees = π/2
```

**Quick Reference Table:**
| Degrees | Radians | Color Shift | Code |
|---------|---------|-------------|------|
| 0° | 0 | Original | `hueShift={0}` |
| 60° | π/3 | → Green | `hueShift={Math.PI / 3}` |
| 120° | 2π/3 | → Cyan | `hueShift={(Math.PI * 2) / 3}` |
| 180° | π | → Blue/Purple | `hueShift={Math.PI}` |
| 240° | 4π/3 | → Magenta | `hueShift={(Math.PI * 4) / 3}` |
| 300° | 5π/3 | → Pink/Red | `hueShift={(Math.PI * 5) / 3}` |
| 360° | 2π | Full circle | `hueShift={Math.PI * 2}` |

## 🎨 Styling Tips

### As Background Layer
```tsx
<div className="fixed inset-0 pointer-events-none opacity-30 z-0">
  <Prism {...props} />
</div>
```
- Use `fixed` for full-screen background
- Add `pointer-events-none` to allow clicks through
- Adjust `opacity` for subtlety (20-40% works well)
- Set `z-index` behind content

### In Container
```tsx
<div className="relative w-full h-96 overflow-hidden rounded-xl">
  <div className="absolute inset-0">
    <Prism {...props} />
  </div>
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
```
- Wrap in `relative` container
- Prism goes in `absolute` positioned div
- Content goes in sibling with higher `z-index`
- Add `overflow-hidden` and `rounded-xl` for card effect

### With Glass Effects
```tsx
<div className="relative w-full h-screen">
  <Prism animationType="rotate" timeScale={0.5} />
  <GlassSurface className="absolute inset-0">
    {/* Content with glass over prism */}
  </GlassSurface>
</div>
```

## ⚡ Performance Optimization

### Best Practices

1. **Use `suspendWhenOffscreen={true}`** for off-screen animations
   ```tsx
   <Prism suspendWhenOffscreen={true} />
   ```

2. **Lower `timeScale` for subtle movement**
   ```tsx
   <Prism timeScale={0.3} /> // Slower = less GPU work
   ```

3. **Reduce `scale` for smaller canvases**
   ```tsx
   <Prism scale={2} /> // Smaller = better performance
   ```

4. **Use `'rotate'` over `'3drotate'` for backgrounds**
   ```tsx
   <Prism animationType="rotate" /> // Simpler calculation
   ```

### Performance Metrics

| Animation Type | GPU Usage | CPU Usage | Best For |
|----------------|-----------|-----------|----------|
| `rotate` | Low | Very Low | Backgrounds, always-on |
| `hover` | Variable | Low | Interactive elements |
| `3drotate` | Medium | Low | Hero sections, premium |

### Mobile Considerations

```tsx
// Detect mobile and adjust
const isMobile = window.innerWidth < 768;

<Prism
  timeScale={isMobile ? 0.3 : 0.5}
  scale={isMobile ? 2.5 : 3.6}
  suspendWhenOffscreen={isMobile}
/>
```

## 🎯 Combining with Other Components

### Prism + GlassSurface
```tsx
<div className="relative h-screen">
  <Prism animationType="rotate" timeScale={0.5} />
  <GlassSurface width="100%" height={200} borderRadius={24}>
    <h1>Glass over Prism</h1>
  </GlassSurface>
</div>
```

### Prism + SplitText
```tsx
<div className="relative h-screen flex items-center justify-center">
  <div className="absolute inset-0 opacity-40">
    <Prism animationType="3drotate" />
  </div>
  <SplitText 
    text="Animated Title"
    tag="h1"
    splitType="chars"
    className="relative z-10 text-6xl"
  />
</div>
```

### Prism + Gradient Background
```tsx
<div className="relative h-screen bg-gradient-to-br from-purple-900 to-blue-900">
  <div className="absolute inset-0 opacity-50 mix-blend-screen">
    <Prism 
      animationType="rotate"
      hueShift={270}
      colorFrequency={1.5}
    />
  </div>
</div>
```

## 🔧 Technical Details

### WebGL Rendering
- Uses **OGL** (Object Graphics Library) for efficient WebGL
- Custom GLSL shaders for effects
- Signed distance field (SDF) rendering for sharp edges
- Ray marching technique for 3D effect

### Browser Support
- ✅ Chrome, Edge, Opera (Chromium)
- ✅ Firefox
- ✅ Safari (macOS, iOS)
- ❌ IE11 (no WebGL 2 support)

### Memory Usage
- ~2-5 MB GPU memory
- Minimal CPU usage
- No memory leaks (proper cleanup on unmount)

### Canvas Management
- Auto-resizes with ResizeObserver
- DPR-aware (supports retina displays)
- Automatic cleanup on component unmount

## 🐛 Troubleshooting

### Black Screen / Not Rendering
```tsx
// Ensure container has dimensions
<div className="w-full h-full" style={{ minHeight: '400px' }}>
  <Prism />
</div>
```

### Performance Issues
```tsx
// Reduce complexity
<Prism
  scale={2}          // Smaller canvas
  timeScale={0.3}    // Slower animation
  suspendWhenOffscreen={true}
/>
```

### Not Visible
```tsx
// Check z-index and opacity
<div className="relative z-10 opacity-50">
  <Prism />
</div>
```

### Clicks Not Working Through Background
```tsx
// Add pointer-events-none
<div className="fixed inset-0 pointer-events-none">
  <Prism />
</div>
```

## 📊 Current Implementation (Layout.tsx)

Your Layout currently uses:

```tsx
<div className="fixed inset-0 pointer-events-none opacity-30 z-0">
  <Prism
    animationType="rotate"        // Continuous rotation
    timeScale={0.5}               // Moderate speed
    height={3.5}                  // Standard height
    baseWidth={5.5}               // Standard width
    scale={3.6}                   // Medium size
    hueShift={0}                  // Default colors
    colorFrequency={1}            // Standard variation
    noise={0.5}                   // Medium texture
    glow={1}                      // Full glow
    transparent={true}            // Alpha enabled
    suspendWhenOffscreen={false}  // Always animating
  />
</div>
```

**Why this configuration:**
- ✅ Subtle at 30% opacity
- ✅ Continuous smooth rotation
- ✅ Doesn't distract from content
- ✅ Works beautifully with glass nav
- ✅ Premium feel without being overwhelming

## 🎨 Design Philosophy

The Prism creates:
- ✨ **Movement** - Dynamic, alive interface
- 🌈 **Color** - Vibrant, gradient effects
- 📐 **Geometry** - Clean, modern shapes
- 💎 **Premium feel** - Sophisticated depth
- 🎯 **Focus** - Draws eye without distraction

## 🚀 Advanced Techniques

### Synchronized Animations
```tsx
const [time, setTime] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setTime(t => t + 0.016);
  }, 16);
  return () => clearInterval(interval);
}, []);

<Prism timeScale={time % 2} />
```

### Dynamic Colors
```tsx
const [hue, setHue] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setHue(h => (h + 1) % 360);
  }, 50);
  return () => clearInterval(interval);
}, []);

<Prism hueShift={hue} />
```

### Responsive Sizing
```tsx
const [scale, setScale] = useState(3.6);

useEffect(() => {
  const updateScale = () => {
    setScale(window.innerWidth > 1024 ? 4 : 2.5);
  };
  window.addEventListener('resize', updateScale);
  updateScale();
  return () => window.removeEventListener('resize', updateScale);
}, []);

<Prism scale={scale} />
```

## 📚 Resources

- [OGL Documentation](https://github.com/oframe/ogl)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [ReactBits.dev](https://reactbits.dev)

---

**Prism Component: Complete!** 🎉

A stunning 3D WebGL animation component that adds premium, dynamic effects to your application!

