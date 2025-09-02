import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Import all modules
import { CargoRobot } from './modules/CargoRobot.js';
import { AnimationSystem } from './modules/AnimationSystem.js';
import { MaterialSystem } from './modules/MaterialSystem.js';
import { ParticleSystem } from './modules/ParticleSystem.js';
import { GeometrySystem } from './modules/GeometrySystem.js';
import { LightingSystem } from './modules/LightingSystem.js';
import { PerformanceSystem } from './modules/PerformanceSystem.js';
import { UISystem } from './modules/UISystem.js';

export class FourJS {
    constructor(selector, options = {}) {
        // Get canvas element
        this.canvas = typeof selector === 'string' ? 
            document.querySelector(selector) : selector;
        
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Default options
        this.options = {
            width: window.innerWidth,
            height: window.innerHeight,
            antialias: true,
            alpha: true,
            enableControls: true,
            enableLighting: true,
            backgroundColor: 0x000000,
            ...options
        };

        // Initialize Three.js core
        this.initCore();
        
        // Initialize systems
        this.initSystems();
        
        // Setup default scene
        this.setupDefaults();
        
        // Handle resize
        this.handleResize();
        
        // Animation loop
        this.isRunning = false;
        this.animationId = null;
    }

    initCore() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.options.backgroundColor);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.options.width / this.options.height,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: this.options.antialias,
            alpha: this.options.alpha
        });
        this.renderer.setSize(this.options.width, this.options.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Clock for animations
        this.clock = new THREE.Clock();
    }

    initSystems() {
        // Initialize all subsystems
        this.cargoRobot = new CargoRobot(this);
        this.animate = new AnimationSystem(this);
        this.materials = new MaterialSystem(this);
        this.particles = new ParticleSystem(this);
        this.geometry = new GeometrySystem(this);
        this.lighting = new LightingSystem(this);
        this.performance = new PerformanceSystem(this);
        this.ui = new UISystem(this);

        // Controls
        if (this.options.enableControls) {
            this.controls = new OrbitControls(this.camera, this.canvas);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }
    }

    setupDefaults() {
        if (this.options.enableLighting) {
            // Add default lighting
            this.lighting.threePointLighting();
        }
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // Simple API methods
    add(object) {
        this.scene.add(object);
        return object;
    }

    remove(object) {
        this.scene.remove(object);
        return this;
    }

    addCargoRobot(options = {}) {
        return this.cargoRobot.create(options);
    }

    addCube(options = {}) {
        const geometry = new THREE.BoxGeometry(
            options.width || 1,
            options.height || 1,
            options.depth || 1
        );
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0x00ff00
        });
        const cube = new THREE.Mesh(geometry, material);
        
        if (options.position) {
            cube.position.set(...options.position);
        }
        
        this.add(cube);
        return cube;
    }

    addSphere(options = {}) {
        const geometry = new THREE.SphereGeometry(
            options.radius || 1,
            options.widthSegments || 32,
            options.heightSegments || 32
        );
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0x00ff00
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        if (options.position) {
            sphere.position.set(...options.position);
        }
        
        this.add(sphere);
        return sphere;
    }

    addPlane(options = {}) {
        const geometry = new THREE.PlaneGeometry(
            options.width || 10,
            options.height || 10
        );
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0x808080
        });
        const plane = new THREE.Mesh(geometry, material);
        
        if (options.rotation) {
            plane.rotation.set(...options.rotation);
        } else {
            plane.rotation.x = -Math.PI / 2; // Default horizontal
        }
        
        if (options.position) {
            plane.position.set(...options.position);
        }
        
        this.add(plane);
        return plane;
    }

    // Animation loop
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.render();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    render() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(() => this.render());

        const deltaTime = this.clock.getDelta();

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Update animation system
        this.animate.update(deltaTime);

        // Update particle systems
        this.particles.update(deltaTime);

        // Update UI
        this.ui.update(deltaTime);

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    // Utility methods
    setCameraPosition(x, y, z) {
        this.camera.position.set(x, y, z);
        return this;
    }

    lookAt(x, y, z) {
        this.camera.lookAt(x, y, z);
        return this;
    }

    setBackground(color) {
        this.scene.background = new THREE.Color(color);
        return this;
    }

    // Get scene statistics
    getStats() {
        return {
            objects: this.scene.children.length,
            triangles: this.renderer.info.render.triangles,
            calls: this.renderer.info.render.calls,
            fps: this.ui.fps || 0
        };
    }
}

// Export for direct use
export { FourJS as default };
