import * as THREE from 'three';

export class AnimationSystem {
    constructor(fourjs) {
        this.fourjs = fourjs;
        this.animations = new Map();
        this.animationId = 0;
    }

    // Rotation animation
    rotate(object, options = {}) {
        const config = {
            axis: 'y',
            speed: 0.01,
            direction: 1,
            ...options
        };

        const animId = this.animationId++;
        const animation = {
            type: 'rotate',
            object,
            config,
            update: (deltaTime) => {
                const rotation = config.speed * config.direction * deltaTime * 60;
                switch (config.axis) {
                    case 'x':
                        object.rotation.x += rotation;
                        break;
                    case 'y':
                        object.rotation.y += rotation;
                        break;
                    case 'z':
                        object.rotation.z += rotation;
                        break;
                    case 'all':
                        object.rotation.x += rotation;
                        object.rotation.y += rotation;
                        object.rotation.z += rotation;
                        break;
                }
            }
        };

        this.animations.set(animId, animation);
        return animId;
    }

    // Floating animation
    float(object, options = {}) {
        const config = {
            amplitude: 0.5,
            frequency: 1,
            axis: 'y',
            offset: 0,
            ...options
        };

        const animId = this.animationId++;
        const startPosition = object.position.clone();
        let time = 0;

        const animation = {
            type: 'float',
            object,
            config,
            startPosition,
            update: (deltaTime) => {
                time += deltaTime * config.frequency;
                const offset = Math.sin(time) * config.amplitude;
                
                switch (config.axis) {
                    case 'x':
                        object.position.x = startPosition.x + offset + config.offset;
                        break;
                    case 'y':
                        object.position.y = startPosition.y + offset + config.offset;
                        break;
                    case 'z':
                        object.position.z = startPosition.z + offset + config.offset;
                        break;
                }
            }
        };

        this.animations.set(animId, animation);
        return animId;
    }

    // Pulsing animation (scale)
    pulse(object, options = {}) {
        const config = {
            scale: [0.8, 1.2],
            duration: 2,
            easing: 'sine',
            ...options
        };

        const animId = this.animationId++;
        const startScale = object.scale.clone();
        let time = 0;

        const animation = {
            type: 'pulse',
            object,
            config,
            startScale,
            update: (deltaTime) => {
                time += deltaTime;
                const progress = (time % config.duration) / config.duration;
                
                let easedProgress;
                switch (config.easing) {
                    case 'sine':
                        easedProgress = Math.sin(progress * Math.PI * 2);
                        break;
                    case 'linear':
                        easedProgress = progress * 2 - 1;
                        break;
                    default:
                        easedProgress = Math.sin(progress * Math.PI * 2);
                }

                const scaleRange = config.scale[1] - config.scale[0];
                const currentScale = config.scale[0] + (easedProgress + 1) * 0.5 * scaleRange;
                
                object.scale.copy(startScale).multiplyScalar(currentScale);
            }
        };

        this.animations.set(animId, animation);
        return animId;
    }

    // Orbital animation
    orbit(object, options = {}) {
        const config = {
            center: new THREE.Vector3(0, 0, 0),
            radius: 5,
            speed: 0.01,
            axis: 'y',
            clockwise: true,
            ...options
        };

        const animId = this.animationId++;
        let angle = 0;

        const animation = {
            type: 'orbit',
            object,
            config,
            update: (deltaTime) => {
                angle += config.speed * (config.clockwise ? 1 : -1) * deltaTime * 60;
                
                switch (config.axis) {
                    case 'x':
                        object.position.x = config.center.x;
                        object.position.y = config.center.y + Math.cos(angle) * config.radius;
                        object.position.z = config.center.z + Math.sin(angle) * config.radius;
                        break;
                    case 'y':
                        object.position.x = config.center.x + Math.cos(angle) * config.radius;
                        object.position.y = config.center.y;
                        object.position.z = config.center.z + Math.sin(angle) * config.radius;
                        break;
                    case 'z':
                        object.position.x = config.center.x + Math.cos(angle) * config.radius;
                        object.position.y = config.center.y + Math.sin(angle) * config.radius;
                        object.position.z = config.center.z;
                        break;
                }
            }
        };

        this.animations.set(animId, animation);
        return animId;
    }

    // Bounce animation
    bounce(object, options = {}) {
        const config = {
            height: 2,
            duration: 1,
            gravity: 9.8,
            damping: 0.8,
            ...options
        };

        const animId = this.animationId++;
        const startY = object.position.y;
        let velocity = Math.sqrt(2 * config.gravity * config.height);
        let currentHeight = 0;

        const animation = {
            type: 'bounce',
            object,
            config,
            startY,
            velocity,
            currentHeight,
            update: (deltaTime) => {
                animation.velocity -= config.gravity * deltaTime;
                animation.currentHeight += animation.velocity * deltaTime;

                if (animation.currentHeight <= 0) {
                    animation.currentHeight = 0;
                    animation.velocity = Math.abs(animation.velocity) * config.damping;
                    
                    if (animation.velocity < 0.1) {
                        animation.velocity = Math.sqrt(2 * config.gravity * config.height);
                    }
                }

                object.position.y = startY + animation.currentHeight;
            }
        };

        this.animations.set(animId, animation);
        return animId;
    }

    // Shake animation
    shake(object, options = {}) {
        const config = {
            intensity: 0.1,
            frequency: 10,
            duration: 1,
            decay: true,
            ...options
        };

        const animId = this.animationId++;
        const startPosition = object.position.clone();
        let time = 0;

        const animation = {
            type: 'shake',
            object,
            config,
            startPosition,
            update: (deltaTime) => {
                time += deltaTime;
                
                if (time >= config.duration) {
                    object.position.copy(startPosition);
                    this.stop(animId);
                    return;
                }

                let intensity = config.intensity;
                if (config.decay) {
                    intensity *= (1 - time / config.duration);
                }

                const shakeX = (Math.random() - 0.5) * intensity * Math.sin(time * config.frequency);
                const shakeY = (Math.random() - 0.5) * intensity * Math.sin(time * config.frequency);
                const shakeZ = (Math.random() - 0.5) * intensity * Math.sin(time * config.frequency);

                object.position.set(
                    startPosition.x + shakeX,
                    startPosition.y + shakeY,
                    startPosition.z + shakeZ
                );
            }
        };

        this.animations.set(animId, animation);
        return animId;
    }

    // Spiral animation
    spiral(object, options = {}) {
        const config = {
            radius: 3,
            height: 5,
            speed: 0.02,
            turns: 3,
            ...options
        };

        const animId = this.animationId++;
        const startPosition = object.position.clone();
        let progress = 0;

        const animation = {
            type: 'spiral',
            object,
            config,
            startPosition,
            update: (deltaTime) => {
                progress += config.speed * deltaTime * 60;
                
                const angle = progress * config.turns * Math.PI * 2;
                const heightProgress = (progress % 1);
                
                object.position.set(
                    startPosition.x + Math.cos(angle) * config.radius,
                    startPosition.y + heightProgress * config.height,
                    startPosition.z + Math.sin(angle) * config.radius
                );
            }
        };

        this.animations.set(animId, animation);
        return animId;
    }

    // Stop animation
    stop(animationId) {
        this.animations.delete(animationId);
    }

    // Stop all animations for an object
    stopAll(object) {
        for (const [id, animation] of this.animations) {
            if (animation.object === object) {
                this.animations.delete(id);
            }
        }
    }

    // Clear all animations
    clear() {
        this.animations.clear();
    }

    // Update all animations
    update(deltaTime) {
        for (const animation of this.animations.values()) {
            animation.update(deltaTime);
        }
    }

    // Get active animations count
    getActiveCount() {
        return this.animations.size;
    }

    // Chain animations
    chain(object, animationConfigs) {
        const chainId = this.animationId++;
        let currentIndex = 0;
        let currentAnimId = null;

        const executeNext = () => {
            if (currentIndex >= animationConfigs.length) {
                return;
            }

            const config = animationConfigs[currentIndex];
            currentAnimId = this[config.type](object, config.options);
            
            if (config.duration) {
                setTimeout(() => {
                    this.stop(currentAnimId);
                    currentIndex++;
                    executeNext();
                }, config.duration * 1000);
            } else {
                currentIndex++;
                executeNext();
            }
        };

        executeNext();
        return chainId;
    }
}
