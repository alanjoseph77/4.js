import * as THREE from 'three';

export class ParticleSystem {
    constructor(fourjs) {
        this.fourjs = fourjs;
        this.systems = [];
    }

    // Star field particle system
    stars(options = {}) {
        const config = {
            count: 1000,
            size: 2,
            color: 0xffffff,
            spread: 100,
            twinkle: true,
            ...options
        };

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(config.count * 3);
        const colors = new Float32Array(config.count * 3);
        const sizes = new Float32Array(config.count);

        const color = new THREE.Color(config.color);

        for (let i = 0; i < config.count; i++) {
            const i3 = i * 3;
            
            // Random positions in sphere
            positions[i3] = (Math.random() - 0.5) * config.spread;
            positions[i3 + 1] = (Math.random() - 0.5) * config.spread;
            positions[i3 + 2] = (Math.random() - 0.5) * config.spread;

            // Colors with slight variation
            const hue = Math.random() * 0.1 + 0.9;
            color.setHSL(0.6, 0.2, hue);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = config.size * (0.5 + Math.random() * 0.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                twinkle: { value: config.twinkle ? 1.0 : 0.0 }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                uniform float twinkle;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    float twinkleEffect = 1.0;
                    if (twinkle > 0.5) {
                        twinkleEffect = 0.5 + 0.5 * sin(time * 3.0 + position.x * 0.1);
                    }
                    
                    gl_PointSize = size * twinkleEffect * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true
        });

        const stars = new THREE.Points(geometry, material);
        stars.userData = {
            type: 'stars',
            startTime: Date.now(),
            twinkle: config.twinkle
        };

        this.fourjs.add(stars);
        this.systems.push(stars);
        return stars;
    }

    // Fire particle system
    fire(options = {}) {
        const config = {
            position: [0, 0, 0],
            count: 200,
            size: 0.5,
            height: 3,
            spread: 1,
            intensity: 1,
            ...options
        };

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(config.count * 3);
        const velocities = new Float32Array(config.count * 3);
        const lifetimes = new Float32Array(config.count);
        const sizes = new Float32Array(config.count);

        for (let i = 0; i < config.count; i++) {
            const i3 = i * 3;
            
            // Start at base position with slight spread
            positions[i3] = config.position[0] + (Math.random() - 0.5) * config.spread;
            positions[i3 + 1] = config.position[1];
            positions[i3 + 2] = config.position[2] + (Math.random() - 0.5) * config.spread;

            // Upward velocity with randomness
            velocities[i3] = (Math.random() - 0.5) * 0.5;
            velocities[i3 + 1] = 1 + Math.random() * 2;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;

            lifetimes[i] = Math.random();
            sizes[i] = config.size * (0.5 + Math.random() * 0.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                height: { value: config.height }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute float lifetime;
                attribute float size;
                uniform float time;
                uniform float height;
                varying float vLifetime;
                varying vec3 vColor;
                
                void main() {
                    vLifetime = lifetime;
                    
                    vec3 pos = position + velocity * time * 2.0;
                    
                    // Reset particle if it goes too high or lifetime expires
                    float life = mod(time + lifetime * 10.0, 10.0) / 10.0;
                    if (pos.y > height || life > 1.0) {
                        pos = position;
                        life = 0.0;
                    }
                    
                    // Color based on height (red to yellow to transparent)
                    float heightRatio = pos.y / height;
                    vColor = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 1.0, 0.0), heightRatio);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (1.0 - heightRatio) * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vLifetime;
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * (1.0 - vLifetime);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const fire = new THREE.Points(geometry, material);
        fire.position.set(...config.position);
        fire.userData = {
            type: 'fire',
            startTime: Date.now()
        };

        this.fourjs.add(fire);
        this.systems.push(fire);
        return fire;
    }

    // Magic sparkles
    magic(options = {}) {
        const config = {
            position: [0, 0, 0],
            count: 100,
            size: 0.3,
            colors: [0xff00ff, 0x00ffff, 0xffff00],
            spread: 5,
            ...options
        };

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(config.count * 3);
        const colors = new Float32Array(config.count * 3);
        const sizes = new Float32Array(config.count);
        const phases = new Float32Array(config.count);

        for (let i = 0; i < config.count; i++) {
            const i3 = i * 3;
            
            // Random positions in sphere
            const radius = Math.random() * config.spread;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = config.position[0] + radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = config.position[1] + radius * Math.cos(phi);
            positions[i3 + 2] = config.position[2] + radius * Math.sin(phi) * Math.sin(theta);

            // Random color from palette
            const colorIndex = Math.floor(Math.random() * config.colors.length);
            const color = new THREE.Color(config.colors[colorIndex]);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = config.size * (0.5 + Math.random() * 0.5);
            phases[i] = Math.random() * Math.PI * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute float phase;
                uniform float time;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    
                    // Floating motion
                    vec3 pos = position;
                    pos.y += sin(time * 2.0 + phase) * 0.5;
                    pos.x += cos(time * 1.5 + phase) * 0.3;
                    
                    // Pulsing alpha
                    vAlpha = 0.5 + 0.5 * sin(time * 4.0 + phase);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * vAlpha * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });

        const magic = new THREE.Points(geometry, material);
        magic.userData = {
            type: 'magic',
            startTime: Date.now()
        };

        this.fourjs.add(magic);
        this.systems.push(magic);
        return magic;
    }

    // Snow particle system
    snow(options = {}) {
        const config = {
            count: 500,
            size: 0.2,
            area: 50,
            fallSpeed: 1,
            windStrength: 0.5,
            ...options
        };

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(config.count * 3);
        const velocities = new Float32Array(config.count * 3);
        const sizes = new Float32Array(config.count);

        for (let i = 0; i < config.count; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * config.area;
            positions[i3 + 1] = Math.random() * config.area;
            positions[i3 + 2] = (Math.random() - 0.5) * config.area;

            velocities[i3] = (Math.random() - 0.5) * config.windStrength;
            velocities[i3 + 1] = -config.fallSpeed * (0.5 + Math.random() * 0.5);
            velocities[i3 + 2] = (Math.random() - 0.5) * config.windStrength;

            sizes[i] = config.size * (0.5 + Math.random() * 0.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: config.size,
            transparent: true,
            opacity: 0.8
        });

        const snow = new THREE.Points(geometry, material);
        snow.userData = {
            type: 'snow',
            config: config,
            startTime: Date.now()
        };

        this.fourjs.add(snow);
        this.systems.push(snow);
        return snow;
    }

    // Explosion effect
    explosion(options = {}) {
        const config = {
            position: [0, 0, 0],
            count: 300,
            size: 0.4,
            speed: 5,
            duration: 3,
            colors: [0xff4500, 0xff6600, 0xffaa00, 0xffffff],
            ...options
        };

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(config.count * 3);
        const velocities = new Float32Array(config.count * 3);
        const colors = new Float32Array(config.count * 3);
        const lifetimes = new Float32Array(config.count);

        for (let i = 0; i < config.count; i++) {
            const i3 = i * 3;
            
            // Start at explosion center
            positions[i3] = config.position[0];
            positions[i3 + 1] = config.position[1];
            positions[i3 + 2] = config.position[2];

            // Random spherical velocity
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = config.speed * (0.5 + Math.random() * 0.5);
            
            velocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
            velocities[i3 + 1] = speed * Math.cos(phi);
            velocities[i3 + 2] = speed * Math.sin(phi) * Math.sin(theta);

            // Random color from explosion palette
            const colorIndex = Math.floor(Math.random() * config.colors.length);
            const color = new THREE.Color(config.colors[colorIndex]);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            lifetimes[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                duration: { value: config.duration }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute float lifetime;
                uniform float time;
                uniform float duration;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    
                    float life = mod(time + lifetime * duration, duration) / duration;
                    vAlpha = 1.0 - life;
                    
                    vec3 pos = position + velocity * time;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 20.0 * vAlpha * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });

        const explosion = new THREE.Points(geometry, material);
        explosion.userData = {
            type: 'explosion',
            startTime: Date.now(),
            duration: config.duration * 1000
        };

        this.fourjs.add(explosion);
        this.systems.push(explosion);

        // Auto-remove after duration
        setTimeout(() => {
            this.remove(explosion);
        }, config.duration * 1000);

        return explosion;
    }

    // Remove particle system
    remove(system) {
        this.fourjs.remove(system);
        const index = this.systems.indexOf(system);
        if (index > -1) {
            this.systems.splice(index, 1);
        }
        
        if (system.geometry) system.geometry.dispose();
        if (system.material) system.material.dispose();
    }

    // Update all particle systems
    update(deltaTime) {
        const currentTime = Date.now();
        
        this.systems.forEach(system => {
            const userData = system.userData;
            const elapsedTime = (currentTime - userData.startTime) / 1000;
            
            switch (userData.type) {
                case 'stars':
                    if (system.material.uniforms) {
                        system.material.uniforms.time.value = elapsedTime;
                    }
                    break;
                    
                case 'fire':
                case 'magic':
                case 'explosion':
                    if (system.material.uniforms) {
                        system.material.uniforms.time.value = elapsedTime;
                    }
                    break;
                    
                case 'snow':
                    this.updateSnow(system, deltaTime);
                    break;
            }
        });
    }

    updateSnow(snow, deltaTime) {
        const positions = snow.geometry.attributes.position.array;
        const velocities = snow.geometry.attributes.velocity.array;
        const config = snow.userData.config;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i] * deltaTime;
            positions[i + 1] += velocities[i + 1] * deltaTime;
            positions[i + 2] += velocities[i + 2] * deltaTime;
            
            // Reset if fallen below ground
            if (positions[i + 1] < -config.area / 2) {
                positions[i] = (Math.random() - 0.5) * config.area;
                positions[i + 1] = config.area / 2;
                positions[i + 2] = (Math.random() - 0.5) * config.area;
            }
        }
        
        snow.geometry.attributes.position.needsUpdate = true;
    }
}
