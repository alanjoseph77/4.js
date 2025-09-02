import * as THREE from 'three';

export class LightingSystem {
    constructor(fourjs) {
        this.fourjs = fourjs;
        this.lights = [];
    }

    // Three-point lighting setup
    threePointLighting(options = {}) {
        const config = {
            keyIntensity: 1,
            fillIntensity: 0.5,
            backIntensity: 0.3,
            keyColor: 0xffffff,
            fillColor: 0xffffff,
            backColor: 0xffffff,
            ...options
        };

        // Key light (main light)
        const keyLight = new THREE.DirectionalLight(config.keyColor, config.keyIntensity);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;

        // Fill light (softer, opposite side)
        const fillLight = new THREE.DirectionalLight(config.fillColor, config.fillIntensity);
        fillLight.position.set(-3, 5, 2);

        // Back light (rim lighting)
        const backLight = new THREE.DirectionalLight(config.backColor, config.backIntensity);
        backLight.position.set(0, 3, -5);

        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);

        this.fourjs.add(keyLight);
        this.fourjs.add(fillLight);
        this.fourjs.add(backLight);
        this.fourjs.add(ambientLight);

        this.lights.push(keyLight, fillLight, backLight, ambientLight);

        return { keyLight, fillLight, backLight, ambientLight };
    }

    // Dynamic colored lighting
    coloredLights(options = {}) {
        const config = {
            colors: [0xff0000, 0x00ff00, 0x0000ff],
            intensity: 1,
            distance: 10,
            positions: [
                [-5, 5, 5],
                [5, 5, 5],
                [0, 5, -5]
            ],
            animate: true,
            ...options
        };

        const lights = [];

        config.colors.forEach((color, index) => {
            const light = new THREE.PointLight(color, config.intensity, config.distance);
            const position = config.positions[index] || [
                (Math.random() - 0.5) * 20,
                5 + Math.random() * 5,
                (Math.random() - 0.5) * 20
            ];
            light.position.set(...position);

            if (config.animate) {
                light.userData = {
                    type: 'animated',
                    originalPosition: light.position.clone(),
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.5 + Math.random() * 0.5
                };
            }

            this.fourjs.add(light);
            this.lights.push(light);
            lights.push(light);
        });

        return lights;
    }

    // Spotlight system
    spotlights(options = {}) {
        const config = {
            count: 3,
            color: 0xffffff,
            intensity: 1,
            distance: 20,
            angle: Math.PI / 6,
            penumbra: 0.1,
            height: 10,
            targets: [],
            ...options
        };

        const spotlights = [];

        for (let i = 0; i < config.count; i++) {
            const spotlight = new THREE.SpotLight(
                config.color,
                config.intensity,
                config.distance,
                config.angle,
                config.penumbra
            );

            const angle = (i / config.count) * Math.PI * 2;
            spotlight.position.set(
                Math.cos(angle) * 8,
                config.height,
                Math.sin(angle) * 8
            );

            spotlight.castShadow = true;
            spotlight.shadow.mapSize.width = 1024;
            spotlight.shadow.mapSize.height = 1024;

            // Set target
            if (config.targets[i]) {
                spotlight.target = config.targets[i];
            } else {
                spotlight.target.position.set(0, 0, 0);
            }

            this.fourjs.add(spotlight);
            this.fourjs.add(spotlight.target);
            this.lights.push(spotlight);
            spotlights.push(spotlight);
        }

        return spotlights;
    }

    // Lightning effect
    lightning(options = {}) {
        const config = {
            intensity: 2,
            color: 0x9999ff,
            duration: 0.1,
            frequency: 2, // strikes per second
            randomness: 0.5,
            ...options
        };

        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.fourjs.add(ambientLight);

        const lightningLight = new THREE.DirectionalLight(config.color, 0);
        lightningLight.position.set(0, 20, 0);
        this.fourjs.add(lightningLight);

        const lightningSystem = {
            light: lightningLight,
            ambient: ambientLight,
            config: config,
            lastStrike: 0,
            isStriking: false,
            strikeEnd: 0
        };

        lightningLight.userData = {
            type: 'lightning',
            system: lightningSystem
        };

        this.lights.push(lightningLight);
        return lightningSystem;
    }

    // Disco/party lighting
    discoLights(options = {}) {
        const config = {
            count: 6,
            colors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
            intensity: 1,
            speed: 2,
            radius: 8,
            height: 8,
            ...options
        };

        const discoLights = [];

        for (let i = 0; i < config.count; i++) {
            const light = new THREE.PointLight(config.colors[i % config.colors.length], config.intensity, 15);
            
            const angle = (i / config.count) * Math.PI * 2;
            light.position.set(
                Math.cos(angle) * config.radius,
                config.height,
                Math.sin(angle) * config.radius
            );

            light.userData = {
                type: 'disco',
                originalAngle: angle,
                speed: config.speed,
                radius: config.radius,
                height: config.height,
                colorIndex: i % config.colors.length,
                colors: config.colors
            };

            this.fourjs.add(light);
            this.lights.push(light);
            discoLights.push(light);
        }

        return discoLights;
    }

    // Firefly/magical lights
    fireflies(options = {}) {
        const config = {
            count: 20,
            color: 0xffff88,
            intensity: 0.5,
            area: 15,
            speed: 1,
            ...options
        };

        const fireflies = [];

        for (let i = 0; i < config.count; i++) {
            const light = new THREE.PointLight(config.color, config.intensity, 3);
            
            light.position.set(
                (Math.random() - 0.5) * config.area,
                1 + Math.random() * 3,
                (Math.random() - 0.5) * config.area
            );

            light.userData = {
                type: 'firefly',
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * config.speed,
                    (Math.random() - 0.5) * config.speed * 0.5,
                    (Math.random() - 0.5) * config.speed
                ),
                area: config.area,
                baseIntensity: config.intensity,
                phase: Math.random() * Math.PI * 2
            };

            this.fourjs.add(light);
            this.lights.push(light);
            fireflies.push(light);
        }

        return fireflies;
    }

    // Volumetric light effect (god rays simulation)
    volumetricLight(options = {}) {
        const config = {
            color: 0xffffff,
            intensity: 1,
            position: [0, 10, 0],
            target: [0, 0, 0],
            angle: Math.PI / 4,
            ...options
        };

        // Main light
        const light = new THREE.SpotLight(config.color, config.intensity, 30, config.angle, 0.3);
        light.position.set(...config.position);
        light.target.position.set(...config.target);
        light.castShadow = true;

        // Volumetric effect using a cone geometry with transparent material
        const coneGeometry = new THREE.ConeGeometry(5, 10, 8, 1, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });

        const volumetricCone = new THREE.Mesh(coneGeometry, coneMaterial);
        volumetricCone.position.copy(light.position);
        volumetricCone.lookAt(light.target.position);
        volumetricCone.rotateX(Math.PI / 2);

        this.fourjs.add(light);
        this.fourjs.add(light.target);
        this.fourjs.add(volumetricCone);
        this.lights.push(light);

        return { light, volumetricCone };
    }

    // Neon strip lighting
    neonStrips(options = {}) {
        const config = {
            strips: [
                { start: [-5, 0, -5], end: [5, 0, -5], color: 0xff0066 },
                { start: [5, 0, -5], end: [5, 0, 5], color: 0x0066ff },
                { start: [5, 0, 5], end: [-5, 0, 5], color: 0x66ff00 },
                { start: [-5, 0, 5], end: [-5, 0, -5], color: 0xff6600 }
            ],
            intensity: 1,
            tubeRadius: 0.1,
            ...options
        };

        const neonStrips = [];

        config.strips.forEach((strip, index) => {
            // Create tube geometry for the strip
            const start = new THREE.Vector3(...strip.start);
            const end = new THREE.Vector3(...strip.end);
            const direction = end.clone().sub(start);
            const length = direction.length();

            const tubeGeometry = new THREE.CylinderGeometry(
                config.tubeRadius,
                config.tubeRadius,
                length,
                8
            );

            const tubeMaterial = new THREE.MeshStandardMaterial({
                color: strip.color,
                emissive: strip.color,
                emissiveIntensity: 0.5
            });

            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            
            // Position and orient the tube
            const center = start.clone().add(end).multiplyScalar(0.5);
            tube.position.copy(center);
            tube.lookAt(end);
            tube.rotateZ(Math.PI / 2);

            // Add point lights along the strip
            const lightCount = Math.ceil(length / 2);
            for (let i = 0; i < lightCount; i++) {
                const t = i / (lightCount - 1);
                const lightPos = start.clone().lerp(end, t);
                
                const light = new THREE.PointLight(strip.color, config.intensity / lightCount, 4);
                light.position.copy(lightPos);
                
                this.fourjs.add(light);
                this.lights.push(light);
            }

            this.fourjs.add(tube);
            neonStrips.push(tube);
        });

        return neonStrips;
    }

    // Update animated lights
    update(deltaTime) {
        const currentTime = Date.now() / 1000;

        this.lights.forEach(light => {
            if (!light.userData) return;

            switch (light.userData.type) {
                case 'animated':
                    const data = light.userData;
                    light.position.x = data.originalPosition.x + Math.sin(currentTime * data.speed + data.phase) * 3;
                    light.position.z = data.originalPosition.z + Math.cos(currentTime * data.speed + data.phase) * 3;
                    break;

                case 'lightning':
                    this.updateLightning(light.userData.system, currentTime);
                    break;

                case 'disco':
                    this.updateDiscoLight(light, currentTime);
                    break;

                case 'firefly':
                    this.updateFirefly(light, deltaTime);
                    break;
            }
        });
    }

    updateLightning(system, currentTime) {
        const timeSinceLastStrike = currentTime - system.lastStrike;
        const nextStrikeTime = 1 / system.config.frequency + (Math.random() - 0.5) * system.config.randomness;

        if (system.isStriking) {
            if (currentTime > system.strikeEnd) {
                system.isStriking = false;
                system.light.intensity = 0;
            }
        } else if (timeSinceLastStrike > nextStrikeTime) {
            system.isStriking = true;
            system.lastStrike = currentTime;
            system.strikeEnd = currentTime + system.config.duration;
            system.light.intensity = system.config.intensity;
        }
    }

    updateDiscoLight(light, currentTime) {
        const data = light.userData;
        const angle = data.originalAngle + currentTime * data.speed;
        
        light.position.x = Math.cos(angle) * data.radius;
        light.position.z = Math.sin(angle) * data.radius;
        
        // Color cycling
        const colorCycle = (currentTime * 0.5) % 1;
        const colorIndex = Math.floor(colorCycle * data.colors.length);
        light.color.setHex(data.colors[colorIndex]);
    }

    updateFirefly(light, deltaTime) {
        const data = light.userData;
        
        // Move firefly
        light.position.add(data.velocity.clone().multiplyScalar(deltaTime));
        
        // Bounce off boundaries
        if (Math.abs(light.position.x) > data.area / 2) {
            data.velocity.x *= -1;
        }
        if (Math.abs(light.position.z) > data.area / 2) {
            data.velocity.z *= -1;
        }
        if (light.position.y < 0.5 || light.position.y > 4) {
            data.velocity.y *= -1;
        }
        
        // Flickering intensity
        data.phase += deltaTime * 3;
        light.intensity = data.baseIntensity * (0.5 + 0.5 * Math.sin(data.phase));
    }

    // Remove all lights
    clear() {
        this.lights.forEach(light => {
            this.fourjs.remove(light);
            if (light.target) {
                this.fourjs.remove(light.target);
            }
        });
        this.lights = [];
    }

    // Get light by type
    getLightsByType(type) {
        return this.lights.filter(light => 
            light.userData && light.userData.type === type
        );
    }
}
