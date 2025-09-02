import * as THREE from 'three';

export class GeometrySystem {
    constructor(fourjs) {
        this.fourjs = fourjs;
    }

    // Terrain generation
    terrain(options = {}) {
        const config = {
            width: 100,
            height: 100,
            widthSegments: 64,
            heightSegments: 64,
            maxHeight: 10,
            heightMap: null,
            material: null,
            ...options
        };

        const geometry = new THREE.PlaneGeometry(
            config.width,
            config.height,
            config.widthSegments,
            config.heightSegments
        );

        // Generate height data
        const vertices = geometry.attributes.position.array;
        
        if (config.heightMap) {
            // TODO: Load height map image and apply
            this.applyHeightMap(vertices, config);
        } else {
            // Generate procedural terrain
            this.generateProceduralTerrain(vertices, config);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        const material = config.material || new THREE.MeshStandardMaterial({
            color: 0x4a5d23,
            wireframe: false
        });

        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;

        this.fourjs.add(terrain);
        return terrain;
    }

    generateProceduralTerrain(vertices, config) {
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            
            // Multi-octave noise simulation
            let height = 0;
            height += Math.sin(x * 0.01) * Math.cos(y * 0.01) * config.maxHeight * 0.5;
            height += Math.sin(x * 0.05) * Math.cos(y * 0.05) * config.maxHeight * 0.3;
            height += Math.sin(x * 0.1) * Math.cos(y * 0.1) * config.maxHeight * 0.2;
            height += (Math.random() - 0.5) * config.maxHeight * 0.1;
            
            vertices[i + 2] = height;
        }
    }

    // Crystal geometry
    crystal(options = {}) {
        const config = {
            faces: 8,
            height: 2,
            radius: 1,
            roughness: 0.3,
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            ...options
        };

        const geometry = new THREE.ConeGeometry(config.radius, config.height, config.faces);
        
        // Add roughness to vertices
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const roughness = (Math.random() - 0.5) * config.roughness;
            vertices[i] += roughness;
            vertices[i + 1] += roughness;
            vertices[i + 2] += roughness;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhysicalMaterial({
            color: config.color,
            transparent: config.transparent,
            opacity: config.opacity,
            roughness: 0.1,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        const crystal = new THREE.Mesh(geometry, material);
        crystal.castShadow = true;
        crystal.receiveShadow = true;

        this.fourjs.add(crystal);
        return crystal;
    }

    // Spiral geometry
    spiral(options = {}) {
        const config = {
            radius: 2,
            height: 5,
            turns: 3,
            segments: 100,
            tubeRadius: 0.1,
            color: 0xff6600,
            ...options
        };

        const curve = new THREE.CatmullRomCurve3();
        const points = [];

        for (let i = 0; i <= config.segments; i++) {
            const t = i / config.segments;
            const angle = t * config.turns * Math.PI * 2;
            const x = Math.cos(angle) * config.radius;
            const y = t * config.height;
            const z = Math.sin(angle) * config.radius;
            points.push(new THREE.Vector3(x, y, z));
        }

        curve.points = points;
        const geometry = new THREE.TubeGeometry(curve, config.segments, config.tubeRadius, 8, false);
        const material = new THREE.MeshStandardMaterial({ color: config.color });

        const spiral = new THREE.Mesh(geometry, material);
        spiral.castShadow = true;

        this.fourjs.add(spiral);
        return spiral;
    }

    // Rounded box geometry
    roundedBox(options = {}) {
        const config = {
            width: 2,
            height: 2,
            depth: 2,
            radius: 0.2,
            segments: 8,
            color: 0x00aa00,
            ...options
        };

        // Create rounded box using multiple geometries
        const group = new THREE.Group();
        
        // Main box (reduced by radius on all sides)
        const mainBox = new THREE.BoxGeometry(
            config.width - config.radius * 2,
            config.height - config.radius * 2,
            config.depth - config.radius * 2
        );
        
        const material = new THREE.MeshStandardMaterial({ color: config.color });
        const mainMesh = new THREE.Mesh(mainBox, material);
        group.add(mainMesh);

        // Add rounded edges with cylinders
        const edgeGeometry = new THREE.CylinderGeometry(config.radius, config.radius, config.height - config.radius * 2, config.segments);
        
        // 4 vertical edges
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const x = Math.cos(angle) * (config.width / 2 - config.radius);
            const z = Math.sin(angle) * (config.depth / 2 - config.radius);
            
            const edge = new THREE.Mesh(edgeGeometry, material);
            edge.position.set(x, 0, z);
            group.add(edge);
        }

        // Add corner spheres
        const cornerGeometry = new THREE.SphereGeometry(config.radius, config.segments, config.segments);
        
        for (let y = -1; y <= 1; y += 2) {
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const x = Math.cos(angle) * (config.width / 2 - config.radius);
                const z = Math.sin(angle) * (config.depth / 2 - config.radius);
                
                const corner = new THREE.Mesh(cornerGeometry, material);
                corner.position.set(x, y * (config.height / 2 - config.radius), z);
                group.add(corner);
            }
        }

        group.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.fourjs.add(group);
        return group;
    }

    // Star geometry
    star(options = {}) {
        const config = {
            innerRadius: 0.5,
            outerRadius: 1,
            points: 5,
            depth: 0.2,
            color: 0xffff00,
            ...options
        };

        const shape = new THREE.Shape();
        
        for (let i = 0; i < config.points * 2; i++) {
            const angle = (i / (config.points * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? config.outerRadius : config.innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: config.depth,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 8
        });

        const material = new THREE.MeshStandardMaterial({ color: config.color });
        const star = new THREE.Mesh(geometry, material);
        star.castShadow = true;

        this.fourjs.add(star);
        return star;
    }

    // Torus knot variations
    torusKnot(options = {}) {
        const config = {
            radius: 1,
            tube: 0.3,
            tubularSegments: 100,
            radialSegments: 16,
            p: 2,
            q: 3,
            color: 0xff00ff,
            ...options
        };

        const geometry = new THREE.TorusKnotGeometry(
            config.radius,
            config.tube,
            config.tubularSegments,
            config.radialSegments,
            config.p,
            config.q
        );

        const material = new THREE.MeshStandardMaterial({ color: config.color });
        const knot = new THREE.Mesh(geometry, material);
        knot.castShadow = true;

        this.fourjs.add(knot);
        return knot;
    }

    // Fractal tree
    fractalTree(options = {}) {
        const config = {
            depth: 5,
            trunkHeight: 2,
            trunkRadius: 0.1,
            branchAngle: Math.PI / 6,
            branchScale: 0.7,
            color: 0x8B4513,
            leafColor: 0x228B22,
            ...options
        };

        const tree = new THREE.Group();
        
        const createBranch = (height, radius, depth, position, rotation) => {
            if (depth <= 0) {
                // Add leaves
                const leafGeometry = new THREE.SphereGeometry(radius * 3, 8, 8);
                const leafMaterial = new THREE.MeshStandardMaterial({ color: config.leafColor });
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                leaf.position.copy(position);
                leaf.position.y += height;
                tree.add(leaf);
                return;
            }

            // Create branch
            const branchGeometry = new THREE.CylinderGeometry(radius * 0.8, radius, height, 8);
            const branchMaterial = new THREE.MeshStandardMaterial({ color: config.color });
            const branch = new THREE.Mesh(branchGeometry, branchMaterial);
            
            branch.position.copy(position);
            branch.position.y += height / 2;
            branch.rotation.copy(rotation);
            branch.castShadow = true;
            tree.add(branch);

            // Create child branches
            const newHeight = height * config.branchScale;
            const newRadius = radius * config.branchScale;
            const branchTop = position.clone();
            branchTop.y += height;

            // Left branch
            const leftRotation = rotation.clone();
            leftRotation.z += config.branchAngle;
            createBranch(newHeight, newRadius, depth - 1, branchTop, leftRotation);

            // Right branch
            const rightRotation = rotation.clone();
            rightRotation.z -= config.branchAngle;
            createBranch(newHeight, newRadius, depth - 1, branchTop, rightRotation);

            // Center branch (sometimes)
            if (Math.random() > 0.3) {
                createBranch(newHeight, newRadius, depth - 1, branchTop, rotation);
            }
        };

        createBranch(
            config.trunkHeight,
            config.trunkRadius,
            config.depth,
            new THREE.Vector3(0, 0, 0),
            new THREE.Euler(0, 0, 0)
        );

        this.fourjs.add(tree);
        return tree;
    }

    // Hexagonal grid
    hexGrid(options = {}) {
        const config = {
            radius: 1,
            rows: 10,
            cols: 10,
            height: 0.2,
            spacing: 0.1,
            color: 0x666666,
            randomHeight: false,
            ...options
        };

        const group = new THREE.Group();
        const hexGeometry = new THREE.CylinderGeometry(config.radius, config.radius, config.height, 6);
        const material = new THREE.MeshStandardMaterial({ color: config.color });

        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                const hex = new THREE.Mesh(hexGeometry, material);
                
                const x = col * (config.radius * 2 + config.spacing) * 0.866;
                const z = row * (config.radius * 1.5 + config.spacing) + (col % 2) * (config.radius * 0.75 + config.spacing * 0.5);
                
                let y = 0;
                if (config.randomHeight) {
                    y = Math.random() * config.height * 2;
                }
                
                hex.position.set(x, y, z);
                hex.castShadow = true;
                hex.receiveShadow = true;
                group.add(hex);
            }
        }

        this.fourjs.add(group);
        return group;
    }
}
