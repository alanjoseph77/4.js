import * as THREE from 'three';

export class MaterialSystem {
    constructor(fourjs) {
        this.fourjs = fourjs;
    }

    // Holographic material
    holographic(options = {}) {
        const config = {
            color: 0x00ffff,
            intensity: 1,
            transparent: true,
            opacity: 0.8,
            ...options
        };

        const material = new THREE.MeshPhysicalMaterial({
            color: config.color,
            transparent: config.transparent,
            opacity: config.opacity,
            roughness: 0.1,
            metalness: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            iridescence: 1.0,
            iridescenceIOR: 1.3,
            iridescenceThicknessRange: [100, 800]
        });

        // Add time-based color shifting
        material.userData = {
            type: 'holographic',
            originalColor: new THREE.Color(config.color),
            intensity: config.intensity,
            time: 0
        };

        return material;
    }

    // Neon glow material
    neon(options = {}) {
        const config = {
            color: 0xff0066,
            intensity: 2,
            glowSize: 1.5,
            ...options
        };

        const material = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: config.intensity
        });

        material.userData = {
            type: 'neon',
            originalColor: new THREE.Color(config.color),
            intensity: config.intensity,
            glowSize: config.glowSize,
            time: 0
        };

        return material;
    }

    // Metallic material with variations
    metallic(options = {}) {
        const config = {
            color: 0x888888,
            roughness: 0.2,
            metalness: 1.0,
            type: 'steel', // steel, gold, copper, chrome
            ...options
        };

        let baseColor = config.color;
        let roughness = config.roughness;
        let metalness = config.metalness;

        switch (config.type) {
            case 'gold':
                baseColor = 0xffd700;
                roughness = 0.1;
                break;
            case 'copper':
                baseColor = 0xb87333;
                roughness = 0.3;
                break;
            case 'chrome':
                baseColor = 0xc0c0c0;
                roughness = 0.05;
                metalness = 1.0;
                break;
            case 'steel':
            default:
                baseColor = 0x888888;
                roughness = 0.2;
                break;
        }

        const material = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: roughness,
            metalness: metalness
        });

        return material;
    }

    // Gradient material
    gradient(options = {}) {
        const config = {
            colors: [0xff0000, 0x0000ff],
            direction: 'vertical', // vertical, horizontal, radial
            size: 512,
            ...options
        };

        const canvas = document.createElement('canvas');
        canvas.width = config.size;
        canvas.height = config.size;
        const ctx = canvas.getContext('2d');

        let gradient;
        switch (config.direction) {
            case 'horizontal':
                gradient = ctx.createLinearGradient(0, 0, config.size, 0);
                break;
            case 'radial':
                gradient = ctx.createRadialGradient(
                    config.size / 2, config.size / 2, 0,
                    config.size / 2, config.size / 2, config.size / 2
                );
                break;
            case 'vertical':
            default:
                gradient = ctx.createLinearGradient(0, 0, 0, config.size);
                break;
        }

        // Add color stops
        config.colors.forEach((color, index) => {
            const stop = index / (config.colors.length - 1);
            gradient.addColorStop(stop, `#${color.toString(16).padStart(6, '0')}`);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, config.size, config.size);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshStandardMaterial({ map: texture });

        return material;
    }

    // Glow material
    glow(options = {}) {
        const config = {
            color: 0x00ff00,
            intensity: 1.5,
            size: 2,
            ...options
        };

        const material = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.6
        });

        material.userData = {
            type: 'glow',
            originalColor: new THREE.Color(config.color),
            intensity: config.intensity,
            size: config.size,
            time: 0
        };

        return material;
    }

    // Plasma material
    plasma(options = {}) {
        const config = {
            colors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00],
            speed: 1,
            scale: 1,
            ...options
        };

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                colors: { value: config.colors.map(c => new THREE.Color(c)) },
                speed: { value: config.speed },
                scale: { value: config.scale }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 colors[4];
                uniform float speed;
                uniform float scale;
                varying vec2 vUv;
                
                void main() {
                    vec2 uv = vUv * scale;
                    float t = time * speed;
                    
                    float noise1 = sin(uv.x * 10.0 + t) * cos(uv.y * 8.0 + t * 0.7);
                    float noise2 = sin(uv.x * 7.0 + t * 1.3) * cos(uv.y * 12.0 + t * 0.5);
                    float noise3 = sin(uv.x * 15.0 + t * 0.8) * cos(uv.y * 6.0 + t * 1.1);
                    
                    float combined = (noise1 + noise2 + noise3) / 3.0;
                    combined = (combined + 1.0) / 2.0;
                    
                    vec3 color1 = mix(colors[0], colors[1], combined);
                    vec3 color2 = mix(colors[2], colors[3], combined);
                    vec3 finalColor = mix(color1, color2, sin(t + combined * 3.14159) * 0.5 + 0.5);
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });

        material.userData = {
            type: 'plasma',
            startTime: Date.now()
        };

        return material;
    }

    // Water material
    water(options = {}) {
        const config = {
            color: 0x006994,
            transparency: 0.7,
            waveSpeed: 1,
            waveHeight: 0.1,
            ...options
        };

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(config.color) },
                waveSpeed: { value: config.waveSpeed },
                waveHeight: { value: config.waveHeight }
            },
            vertexShader: `
                uniform float time;
                uniform float waveSpeed;
                uniform float waveHeight;
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    vUv = uv;
                    vNormal = normal;
                    
                    vec3 pos = position;
                    float wave = sin(pos.x * 2.0 + time * waveSpeed) * cos(pos.z * 2.0 + time * waveSpeed) * waveHeight;
                    pos.y += wave;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
                    fresnel = pow(1.0 - fresnel, 2.0);
                    
                    vec3 finalColor = mix(color, vec3(1.0), fresnel * 0.3);
                    gl_FragColor = vec4(finalColor, 0.7);
                }
            `,
            transparent: true
        });

        material.userData = {
            type: 'water',
            startTime: Date.now()
        };

        return material;
    }

    // Crystal material
    crystal(options = {}) {
        const config = {
            color: 0x00ffff,
            transparency: 0.8,
            refraction: 1.5,
            ...options
        };

        const material = new THREE.MeshPhysicalMaterial({
            color: config.color,
            transparent: true,
            opacity: config.transparency,
            roughness: 0,
            metalness: 0,
            clearcoat: 1.0,
            clearcoatRoughness: 0,
            ior: config.refraction,
            transmission: 0.9,
            thickness: 1.0
        });

        return material;
    }

    // Lava material
    lava(options = {}) {
        const config = {
            color1: 0xff4500,
            color2: 0xff0000,
            speed: 1,
            ...options
        };

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(config.color1) },
                color2: { value: new THREE.Color(config.color2) },
                speed: { value: config.speed }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float speed;
                varying vec2 vUv;
                
                void main() {
                    vec2 uv = vUv;
                    float t = time * speed;
                    
                    float noise = sin(uv.x * 5.0 + t) * cos(uv.y * 3.0 + t * 0.7) * 0.5 + 0.5;
                    noise += sin(uv.x * 10.0 + t * 1.3) * cos(uv.y * 7.0 + t * 0.5) * 0.3;
                    
                    vec3 color = mix(color1, color2, noise);
                    color += vec3(noise * 0.5); // Add glow
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });

        material.userData = {
            type: 'lava',
            startTime: Date.now()
        };

        return material;
    }

    // Update animated materials
    update(deltaTime) {
        this.fourjs.scene.traverse((object) => {
            if (object.material && object.material.userData) {
                const userData = object.material.userData;
                
                switch (userData.type) {
                    case 'holographic':
                        userData.time += deltaTime;
                        const hue = (userData.time * 0.5) % 1;
                        object.material.color.setHSL(hue, 1, 0.5);
                        break;
                        
                    case 'neon':
                        userData.time += deltaTime;
                        const pulse = Math.sin(userData.time * 3) * 0.3 + 0.7;
                        object.material.emissiveIntensity = userData.intensity * pulse;
                        break;
                        
                    case 'plasma':
                        const plasmaTime = (Date.now() - userData.startTime) / 1000;
                        object.material.uniforms.time.value = plasmaTime;
                        break;
                        
                    case 'water':
                        const waterTime = (Date.now() - userData.startTime) / 1000;
                        object.material.uniforms.time.value = waterTime;
                        break;
                        
                    case 'lava':
                        const lavaTime = (Date.now() - userData.startTime) / 1000;
                        object.material.uniforms.time.value = lavaTime;
                        break;
                }
            }
        });
    }
}
