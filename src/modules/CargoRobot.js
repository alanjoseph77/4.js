import * as THREE from 'three';

export class CargoRobot {
    constructor(fourjs) {
        this.fourjs = fourjs;
        this.components = {};
    }

    create(options = {}) {
        const robot = new THREE.Group();
        robot.name = 'CargoRobot';

        // Default configuration
        const config = {
            scale: 1,
            position: [0, 0, 0],
            head: { type: 'dome', color: 0x00ff00, size: 0.8 },
            body: { type: 'cylinder', color: 0x0066cc, size: [1.2, 2, 1.2] },
            arms: { type: 'articulated', color: 0xff6600, size: 1 },
            legs: { type: 'hydraulic', color: 0x666666, size: 1 },
            chest: { type: 'panel', color: 0x333333, size: 0.8 },
            shoulders: { type: 'spherical', color: 0x888888, size: 0.4 },
            hands: { type: 'gripper', color: 0xffaa00, size: 0.3 },
            feet: { type: 'magnetic', color: 0x444444, size: 0.6 },
            antenna: { type: 'telescopic', color: 0xff0000, size: 0.1 },
            eyes: { type: 'led', color: 0x00ffff, size: 0.2 },
            backpack: { type: 'cargo', color: 0x996633, size: 0.8 },
            joints: { type: 'mechanical', color: 0x555555, size: 0.2 },
            ...options
        };

        // Create components
        this.createHead(robot, config.head);
        this.createBody(robot, config.body);
        this.createArms(robot, config.arms);
        this.createLegs(robot, config.legs);
        this.createChest(robot, config.chest);
        this.createShoulders(robot, config.shoulders);
        this.createHands(robot, config.hands);
        this.createFeet(robot, config.feet);
        this.createAntenna(robot, config.antenna);
        this.createEyes(robot, config.eyes);
        this.createBackpack(robot, config.backpack);
        this.createJoints(robot, config.joints);

        // Apply transformations
        robot.scale.setScalar(config.scale);
        robot.position.set(...config.position);

        // Add to scene
        this.fourjs.add(robot);

        // Store reference for animations
        robot.components = this.components;

        return robot;
    }

    createHead(robot, config) {
        const head = new THREE.Group();
        head.name = 'head';

        let geometry;
        switch (config.type) {
            case 'dome':
                geometry = new THREE.SphereGeometry(config.size, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
                break;
            case 'cubic':
                geometry = new THREE.BoxGeometry(config.size, config.size, config.size);
                break;
            case 'cylindrical':
                geometry = new THREE.CylinderGeometry(config.size, config.size, config.size, 8);
                break;
            default:
                geometry = new THREE.SphereGeometry(config.size, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        }

        const material = new THREE.MeshStandardMaterial({ color: config.color });
        const headMesh = new THREE.Mesh(geometry, material);
        headMesh.castShadow = true;
        headMesh.receiveShadow = true;

        head.add(headMesh);
        head.position.set(0, 2.5, 0);
        robot.add(head);
        this.components.head = head;
    }

    createBody(robot, config) {
        const body = new THREE.Group();
        body.name = 'body';

        // Ensure size is an array with default values
        const size = Array.isArray(config.size) ? config.size : [1.2, 2, 1.2];
        const [radiusTop, height, radiusBottom] = size;

        let geometry;
        switch (config.type) {
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8);
                break;
            case 'box':
                geometry = new THREE.BoxGeometry(radiusTop, height, radiusBottom);
                break;
            case 'capsule':
                // Create capsule using cylinder with spheres on top/bottom
                const capsuleGroup = new THREE.Group();
                const cylinderGeom = new THREE.CylinderGeometry(radiusTop, radiusTop, height, 8);
                const topSphereGeom = new THREE.SphereGeometry(radiusTop, 8, 8);
                const bottomSphereGeom = new THREE.SphereGeometry(radiusTop, 8, 8);
                
                const capsuleMaterial = new THREE.MeshStandardMaterial({ color: config.color });
                
                const cylinder = new THREE.Mesh(cylinderGeom, capsuleMaterial);
                const topSphere = new THREE.Mesh(topSphereGeom, capsuleMaterial);
                const bottomSphere = new THREE.Mesh(bottomSphereGeom, capsuleMaterial);
                
                topSphere.position.y = height / 2;
                bottomSphere.position.y = -height / 2;
                
                cylinder.castShadow = true;
                cylinder.receiveShadow = true;
                topSphere.castShadow = true;
                topSphere.receiveShadow = true;
                bottomSphere.castShadow = true;
                bottomSphere.receiveShadow = true;
                
                capsuleGroup.add(cylinder);
                capsuleGroup.add(topSphere);
                capsuleGroup.add(bottomSphere);
                
                body.add(capsuleGroup);
                body.position.set(0, 1, 0);
                robot.add(body);
                this.components.body = body;
                return;
            default:
                geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8);
        }

        const material = new THREE.MeshStandardMaterial({ color: config.color });
        const bodyMesh = new THREE.Mesh(geometry, material);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;

        body.add(bodyMesh);
        body.position.set(0, 1, 0);
        robot.add(body);
        this.components.body = body;
    }

    createArms(robot, config) {
        const arms = new THREE.Group();
        arms.name = 'arms';

        for (let side of [-1, 1]) {
            const arm = new THREE.Group();
            
            // Upper arm
            const upperArmGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8);
            const upperArmMaterial = new THREE.MeshStandardMaterial({ color: config.color });
            const upperArm = new THREE.Mesh(upperArmGeometry, upperArmMaterial);
            upperArm.castShadow = true;
            upperArm.position.set(0, -0.3, 0);
            
            // Lower arm
            const lowerArmGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1, 8);
            const lowerArm = new THREE.Mesh(lowerArmGeometry, upperArmMaterial);
            lowerArm.castShadow = true;
            lowerArm.position.set(0, -1.1, 0);

            arm.add(upperArm);
            arm.add(lowerArm);
            arm.position.set(side * 1.5, 1.8, 0);
            
            arms.add(arm);
        }

        robot.add(arms);
        this.components.arms = arms;
    }

    createLegs(robot, config) {
        const legs = new THREE.Group();
        legs.name = 'legs';

        for (let side of [-1, 1]) {
            const leg = new THREE.Group();
            
            // Thigh
            let thighGeometry;
            switch (config.type) {
                case 'hydraulic':
                    thighGeometry = new THREE.CylinderGeometry(0.3, 0.25, 1.5, 6);
                    break;
                case 'mechanical':
                    thighGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
                    break;
                default:
                    thighGeometry = new THREE.CylinderGeometry(0.3, 0.25, 1.5, 6);
            }
            
            const thighMaterial = new THREE.MeshStandardMaterial({ color: config.color });
            const thigh = new THREE.Mesh(thighGeometry, thighMaterial);
            thigh.castShadow = true;
            thigh.position.set(0, -0.4, 0);
            
            // Shin
            const shinGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1.3, 6);
            const shin = new THREE.Mesh(shinGeometry, thighMaterial);
            shin.castShadow = true;
            shin.position.set(0, -1.4, 0);

            leg.add(thigh);
            leg.add(shin);
            leg.position.set(side * 0.6, -0.5, 0);
            
            legs.add(leg);
        }

        robot.add(legs);
        this.components.legs = legs;
    }

    createChest(robot, config) {
        const chest = new THREE.Group();
        chest.name = 'chest';

        let geometry;
        switch (config.type) {
            case 'panel':
                geometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
                break;
            case 'curved':
                geometry = new THREE.SphereGeometry(0.4, 8, 8, 0, Math.PI);
                break;
            default:
                geometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
        }

        const material = new THREE.MeshStandardMaterial({ color: config.color });
        const chestMesh = new THREE.Mesh(geometry, material);
        chestMesh.castShadow = true;

        chest.add(chestMesh);
        chest.position.set(0, 1.5, 0.6);
        robot.add(chest);
        this.components.chest = chest;
    }

    createShoulders(robot, config) {
        const shoulders = new THREE.Group();
        shoulders.name = 'shoulders';

        for (let side of [-1, 1]) {
            const shoulderGeometry = new THREE.SphereGeometry(config.size, 8, 8);
            const shoulderMaterial = new THREE.MeshStandardMaterial({ color: config.color });
            const shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
            shoulder.castShadow = true;
            shoulder.position.set(side * 1.2, 1.8, 0);
            shoulders.add(shoulder);
        }

        robot.add(shoulders);
        this.components.shoulders = shoulders;
    }

    createHands(robot, config) {
        const hands = new THREE.Group();
        hands.name = 'hands';

        for (let side of [-1, 1]) {
            const hand = new THREE.Group();
            
            // Palm
            const palmGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.2);
            const palmMaterial = new THREE.MeshStandardMaterial({ color: config.color });
            const palm = new THREE.Mesh(palmGeometry, palmMaterial);
            palm.castShadow = true;
            
            // Fingers (gripper style)
            for (let i = 0; i < 3; i++) {
                const fingerGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.05);
                const finger = new THREE.Mesh(fingerGeometry, palmMaterial);
                finger.position.set((i - 1) * 0.1, 0.3, 0);
                hand.add(finger);
            }

            hand.add(palm);
            hand.position.set(side * 1.5, 0.2, 0);
            hands.add(hand);
        }

        robot.add(hands);
        this.components.hands = hands;
    }

    createFeet(robot, config) {
        const feet = new THREE.Group();
        feet.name = 'feet';

        for (let side of [-1, 1]) {
            let footGeometry;
            switch (config.type) {
                case 'magnetic':
                    footGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
                    break;
                case 'tracked':
                    footGeometry = new THREE.BoxGeometry(0.8, 0.2, 1.2);
                    break;
                default:
                    footGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
            }
            
            const footMaterial = new THREE.MeshStandardMaterial({ color: config.color });
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.castShadow = true;
            foot.receiveShadow = true;
            foot.position.set(side * 0.6, -2.1, 0);
            feet.add(foot);
        }

        robot.add(feet);
        this.components.feet = feet;
    }

    createAntenna(robot, config) {
        const antenna = new THREE.Group();
        antenna.name = 'antenna';

        const antennaGeometry = new THREE.CylinderGeometry(config.size, config.size, 1, 4);
        const antennaMaterial = new THREE.MeshStandardMaterial({ color: config.color });
        const antennaMesh = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antennaMesh.castShadow = true;

        // Tip
        const tipGeometry = new THREE.SphereGeometry(config.size * 2, 8, 8);
        const tipMaterial = new THREE.MeshStandardMaterial({ 
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.3
        });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.set(0, 0.6, 0);

        antenna.add(antennaMesh);
        antenna.add(tip);
        antenna.position.set(0, 3.2, 0);
        robot.add(antenna);
        this.components.antenna = antenna;
    }

    createEyes(robot, config) {
        const eyes = new THREE.Group();
        eyes.name = 'eyes';

        for (let side of [-1, 1]) {
            const eyeGeometry = new THREE.SphereGeometry(config.size, 8, 8);
            const eyeMaterial = new THREE.MeshStandardMaterial({ 
                color: config.color,
                emissive: config.color,
                emissiveIntensity: 0.5
            });
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(side * 0.3, 2.5, 0.4);
            eyes.add(eye);
        }

        robot.add(eyes);
        this.components.eyes = eyes;
    }

    createBackpack(robot, config) {
        const backpack = new THREE.Group();
        backpack.name = 'backpack';

        const backpackGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const backpackMaterial = new THREE.MeshStandardMaterial({ color: config.color });
        const backpackMesh = new THREE.Mesh(backpackGeometry, backpackMaterial);
        backpackMesh.castShadow = true;

        backpack.add(backpackMesh);
        backpack.position.set(0, 1.5, -0.8);
        robot.add(backpack);
        this.components.backpack = backpack;
    }

    createJoints(robot, config) {
        const joints = new THREE.Group();
        joints.name = 'joints';

        // Joint positions
        const jointPositions = [
            [0, 2.2, 0],      // neck
            [-1.2, 1.8, 0],   // left shoulder
            [1.2, 1.8, 0],    // right shoulder
            [-1.5, 0.8, 0],   // left elbow
            [1.5, 0.8, 0],    // right elbow
            [-0.6, 0.2, 0],   // left hip
            [0.6, 0.2, 0],    // right hip
            [-0.6, -1.2, 0],  // left knee
            [0.6, -1.2, 0]    // right knee
        ];

        jointPositions.forEach(pos => {
            const jointGeometry = new THREE.SphereGeometry(config.size, 6, 6);
            const jointMaterial = new THREE.MeshStandardMaterial({ color: config.color });
            const joint = new THREE.Mesh(jointGeometry, jointMaterial);
            joint.position.set(...pos);
            joint.castShadow = true;
            joints.add(joint);
        });

        robot.add(joints);
        this.components.joints = joints;
    }
}
