# 4.js - Ultimate Three.js Utility Library

A comprehensive Three.js utility library that simplifies 3D web development with an ultra-simple API and advanced features.

## 🚀 Features

### Core Features
- **Ultra-simple API** - Get started with just a few lines of code
- **Cargo Robot System** - Pre-built 3D robot models with 12+ components
- **Orbital Controls** - Mouse and wheel camera controls out of the box
- **Animation Utilities** - Easy rotation, floating, pulsing, and orbiting animations
- **Modular Design** - Use only what you need

### Advanced Features ✨
- **Advanced Geometry** - Terrain generation, crystals, spirals, rounded boxes, stars
- **Particle Systems** - Stars, fire, magic effects with customizable parameters
- **Dynamic Materials** - Holographic, neon, metallic, gradient, and glow effects
- **Lighting Systems** - Three-point lighting, dynamic colored lights, lightning effects
- **Visual Effects** - Portals, rainbow colors, fireworks, and more
- **Performance Tools** - LOD systems, instanced meshes, geometry optimization
- **UI Helpers** - Info panels, interactive controls, FPS monitoring

## 🎯 Quick Start

```javascript
import { FourJS } from './src/4js.js';

// Create a scene in one line
const scene = new FourJS('#canvas');

// Add a cargo robot
const robot = scene.addCargoRobot();

// Add some animations
scene.animate.rotate(robot, { speed: 0.01 });
scene.animate.float(robot, { amplitude: 0.5 });

// Start the scene
scene.start();
```

## 📦 Installation

### Option 1: NPM (Coming Soon)
```bash
npm install 4js
```

### Option 2: CDN (Recommended)
```html
<!-- Include Three.js first -->
<script src="https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js"></script>

<!-- Include 4.js -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/4js@main/dist/4js.umd.js"></script>

<script>
  // Now you can use FourJS globally
  const app = new FourJS();
  app.addCargoRobot();
  app.start();
</script>
```

### Option 3: ES Modules
```html
<script type="module">
  import { FourJS } from 'https://cdn.jsdelivr.net/gh/yourusername/4js@main/dist/4js.es.js';
  
  const app = new FourJS();
  app.addCargoRobot();
  app.start();
</script>
```

## 🤖 Cargo Robot System

The Cargo Robot comes with 12+ pre-built components:

```javascript
const robot = scene.addCargoRobot({
  head: { type: 'dome', color: 0x00ff00 },
  body: { type: 'cylinder', color: 0x0066cc },
  arms: { type: 'articulated', color: 0xff6600 },
  legs: { type: 'hydraulic', color: 0x666666 }
});
```

## 🎨 Materials & Effects

```javascript
// Holographic material
const holo = scene.materials.holographic({ color: 0x00ffff });

// Neon glow effect
const neon = scene.materials.neon({ color: 0xff0066, intensity: 2 });

// Particle systems
scene.particles.stars({ count: 1000 });
scene.particles.fire({ position: [0, 0, 0] });
```

## 🎬 Animations

```javascript
// Multiple animation types
scene.animate.rotate(object, { axis: 'y', speed: 0.02 });
scene.animate.float(object, { amplitude: 1, frequency: 0.5 });
scene.animate.pulse(object, { scale: [0.8, 1.2], duration: 2 });
scene.animate.orbit(object, { radius: 5, speed: 0.01 });
```

## 🌟 Advanced Geometry

```javascript
// Terrain generation
const terrain = scene.geometry.terrain({
  width: 100,
  height: 100,
  heightMap: './heightmap.png'
});

// Crystal formations
const crystal = scene.geometry.crystal({
  faces: 8,
  height: 2,
  roughness: 0.3
});
```

## 📊 Performance Tools

```javascript
// LOD system
scene.performance.enableLOD();

// Instanced meshes for performance
const instances = scene.performance.instancedMesh(geometry, material, 1000);

// FPS monitoring
scene.ui.showFPS();
```

## 🎮 Controls & UI

```javascript
// Orbital controls (enabled by default)
scene.controls.orbital.enable();

// Info panels
scene.ui.infoPanel({
  title: 'Scene Stats',
  data: { objects: scene.children.length }
});
```

## 📖 Examples

Check the `examples/` directory for complete demos:
- Basic scene setup
- Cargo robot showcase
- Particle effects demo
- Material gallery
- Animation playground

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📄 License

MIT License - see LICENSE file for details.
