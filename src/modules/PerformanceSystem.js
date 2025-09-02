import * as THREE from 'three';

export class PerformanceSystem {
    constructor(fourjs) {
        this.fourjs = fourjs;
        this.lodObjects = [];
        this.instancedMeshes = [];
        this.frustumCulling = true;
    }

    // Level of Detail (LOD) system
    enableLOD(options = {}) {
        const config = {
            distances: [10, 25, 50],
            autoUpdate: true,
            ...options
        };

        this.lodSystem = {
            enabled: true,
            distances: config.distances,
            autoUpdate: config.autoUpdate,
            camera: this.fourjs.camera
        };

        return this.lodSystem;
    }

    // Create LOD object with multiple detail levels
    createLOD(geometries, materials, options = {}) {
        const config = {
            distances: [10, 25, 50],
            position: [0, 0, 0],
            ...options
        };

        const lod = new THREE.LOD();

        geometries.forEach((geometry, index) => {
            const material = materials[index] || materials[0];
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            const distance = config.distances[index] || config.distances[config.distances.length - 1];
            lod.addLevel(mesh, distance);
        });

        lod.position.set(...config.position);
        this.fourjs.add(lod);
        this.lodObjects.push(lod);

        return lod;
    }

    // Instanced mesh for rendering many identical objects efficiently
    instancedMesh(geometry, material, count, options = {}) {
        const config = {
            positions: null,
            rotations: null,
            scales: null,
            colors: null,
            randomize: true,
            spread: 10,
            ...options
        };

        const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        // Set up instances
        for (let i = 0; i < count; i++) {
            if (config.positions && config.positions[i]) {
                position.set(...config.positions[i]);
            } else if (config.randomize) {
                position.set(
                    (Math.random() - 0.5) * config.spread,
                    (Math.random() - 0.5) * config.spread,
                    (Math.random() - 0.5) * config.spread
                );
            } else {
                position.set(0, 0, 0);
            }

            if (config.rotations && config.rotations[i]) {
                rotation.set(...config.rotations[i]);
            } else if (config.randomize) {
                rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                );
            } else {
                rotation.set(0, 0, 0);
            }

            if (config.scales && config.scales[i]) {
                scale.set(...config.scales[i]);
            } else if (config.randomize) {
                const s = 0.5 + Math.random() * 1.5;
                scale.set(s, s, s);
            } else {
                scale.set(1, 1, 1);
            }

            quaternion.setFromEuler(rotation);
            matrix.compose(position, quaternion, scale);
            instancedMesh.setMatrixAt(i, matrix);

            // Set colors if provided
            if (config.colors && config.colors[i]) {
                instancedMesh.setColorAt(i, new THREE.Color(config.colors[i]));
            } else if (config.randomize) {
                instancedMesh.setColorAt(i, new THREE.Color(Math.random() * 0xffffff));
            }
        }

        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) {
            instancedMesh.instanceColor.needsUpdate = true;
        }

        this.fourjs.add(instancedMesh);
        this.instancedMeshes.push(instancedMesh);

        return instancedMesh;
    }

    // Geometry optimization
    optimizeGeometry(geometry, options = {}) {
        const config = {
            mergeVertices: true,
            computeVertexNormals: true,
            computeBoundingBox: true,
            computeBoundingSphere: true,
            ...options
        };

        if (config.mergeVertices) {
            geometry.mergeVertices();
        }

        if (config.computeVertexNormals) {
            geometry.computeVertexNormals();
        }

        if (config.computeBoundingBox) {
            geometry.computeBoundingBox();
        }

        if (config.computeBoundingSphere) {
            geometry.computeBoundingSphere();
        }

        return geometry;
    }

    // Texture optimization
    optimizeTexture(texture, options = {}) {
        const config = {
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            maxSize: 1024,
            ...options
        };

        texture.generateMipmaps = config.generateMipmaps;
        texture.minFilter = config.minFilter;
        texture.magFilter = config.magFilter;
        texture.format = config.format;

        // Resize if too large
        if (texture.image && (texture.image.width > config.maxSize || texture.image.height > config.maxSize)) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const scale = Math.min(config.maxSize / texture.image.width, config.maxSize / texture.image.height);
            canvas.width = texture.image.width * scale;
            canvas.height = texture.image.height * scale;
            
            ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);
            texture.image = canvas;
            texture.needsUpdate = true;
        }

        return texture;
    }

    // Object pooling system
    createObjectPool(createFunction, resetFunction, initialSize = 10) {
        const pool = {
            objects: [],
            createFunction,
            resetFunction,
            activeObjects: new Set()
        };

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            const obj = createFunction();
            obj.visible = false;
            pool.objects.push(obj);
            this.fourjs.add(obj);
        }

        pool.get = () => {
            let obj = pool.objects.pop();
            if (!obj) {
                obj = createFunction();
                this.fourjs.add(obj);
            }
            obj.visible = true;
            pool.activeObjects.add(obj);
            return obj;
        };

        pool.release = (obj) => {
            if (pool.activeObjects.has(obj)) {
                pool.activeObjects.delete(obj);
                obj.visible = false;
                resetFunction(obj);
                pool.objects.push(obj);
            }
        };

        pool.releaseAll = () => {
            pool.activeObjects.forEach(obj => {
                obj.visible = false;
                resetFunction(obj);
                pool.objects.push(obj);
            });
            pool.activeObjects.clear();
        };

        return pool;
    }

    // Frustum culling optimization
    enableFrustumCulling(enable = true) {
        this.frustumCulling = enable;
        
        this.fourjs.scene.traverse((object) => {
            if (object.isMesh) {
                object.frustumCulled = enable;
            }
        });
    }

    // Occlusion culling (basic implementation)
    enableOcclusionCulling(options = {}) {
        const config = {
            raycastDistance: 100,
            checkInterval: 100, // ms
            ...options
        };

        this.occlusionCulling = {
            enabled: true,
            config,
            lastCheck: 0,
            raycaster: new THREE.Raycaster()
        };
    }

    // Batch geometry merging
    mergeGeometries(meshes, options = {}) {
        const config = {
            preserveMaterials: false,
            ...options
        };

        const geometries = [];
        const materials = [];

        meshes.forEach(mesh => {
            if (mesh.geometry) {
                const geometry = mesh.geometry.clone();
                geometry.applyMatrix4(mesh.matrixWorld);
                geometries.push(geometry);
                
                if (config.preserveMaterials && mesh.material) {
                    materials.push(mesh.material);
                }
            }
        });

        const mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
        const material = config.preserveMaterials ? materials : meshes[0].material;

        const mergedMesh = new THREE.Mesh(mergedGeometry, material);
        mergedMesh.castShadow = true;
        mergedMesh.receiveShadow = true;

        // Remove original meshes
        meshes.forEach(mesh => {
            this.fourjs.remove(mesh);
        });

        this.fourjs.add(mergedMesh);
        return mergedMesh;
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        this.performanceStats = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 0,
            frameTime: 0,
            memoryUsage: 0
        };

        this.performanceInterval = setInterval(() => {
            this.updatePerformanceStats();
        }, 1000);
    }

    updatePerformanceStats() {
        const now = performance.now();
        const deltaTime = now - this.performanceStats.lastTime;
        
        this.performanceStats.fps = Math.round(1000 / (deltaTime / this.performanceStats.frameCount));
        this.performanceStats.frameTime = deltaTime / this.performanceStats.frameCount;
        
        if (performance.memory) {
            this.performanceStats.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
        }

        this.performanceStats.frameCount = 0;
        this.performanceStats.lastTime = now;
    }

    getPerformanceStats() {
        return {
            ...this.performanceStats,
            triangles: this.fourjs.renderer.info.render.triangles,
            calls: this.fourjs.renderer.info.render.calls,
            objects: this.fourjs.scene.children.length
        };
    }

    // Automatic LOD updates
    updateLOD() {
        if (!this.lodSystem || !this.lodSystem.enabled) return;

        this.lodObjects.forEach(lod => {
            lod.update(this.lodSystem.camera);
        });
    }

    // Occlusion culling update
    updateOcclusionCulling() {
        if (!this.occlusionCulling || !this.occlusionCulling.enabled) return;

        const now = Date.now();
        if (now - this.occlusionCulling.lastCheck < this.occlusionCulling.config.checkInterval) {
            return;
        }

        this.occlusionCulling.lastCheck = now;
        const raycaster = this.occlusionCulling.raycaster;
        const camera = this.fourjs.camera;

        this.fourjs.scene.traverse((object) => {
            if (object.isMesh && object.visible) {
                const direction = object.position.clone().sub(camera.position).normalize();
                raycaster.set(camera.position, direction);
                
                const intersects = raycaster.intersectObjects(this.fourjs.scene.children, true);
                
                if (intersects.length > 0 && intersects[0].object !== object) {
                    const distance = intersects[0].distance;
                    const objectDistance = camera.position.distanceTo(object.position);
                    
                    if (distance < objectDistance) {
                        object.visible = false;
                    }
                } else {
                    object.visible = true;
                }
            }
        });
    }

    // Main update function
    update(deltaTime) {
        if (this.performanceStats) {
            this.performanceStats.frameCount++;
        }

        if (this.lodSystem && this.lodSystem.autoUpdate) {
            this.updateLOD();
        }

        this.updateOcclusionCulling();
    }

    // Cleanup
    dispose() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }

        this.lodObjects.forEach(lod => {
            this.fourjs.remove(lod);
        });

        this.instancedMeshes.forEach(mesh => {
            this.fourjs.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });

        this.lodObjects = [];
        this.instancedMeshes = [];
    }
}
