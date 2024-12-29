import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

let scene, camera, renderer, vectorField, clock;

// Grid Parameters
const gridSize = 100;
const gridRange = 10;
const step = (2 * gridRange) / (gridSize - 1);

function init() {
    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 50;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background
    document.body.appendChild(renderer.domElement);

    // Clock for animation
    clock = new THREE.Clock();

    // Create vector field
    createVectorField();

    animate();
}

function createVectorField() {
    const positions = [];
    const origins = [];

    // Create a grid of vectors
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const x = -gridRange + i * step;
            const y = -gridRange + j * step;
            const z = 0;

            // Start point of the vector
            positions.push(x, y, z);

            // End point (initially same as start point)
            positions.push(x, y, z);

            // Store the origin for future updates
            origins.push(x, y, z);
        }
    }

    // BufferGeometry for efficient updates
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    vectorField = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    // Store origins as user data for reference
    vectorField.userData.origins = origins;
    scene.add(vectorField);
}

function singularityField(x, y, t) {
    const r = Math.sqrt(x * x + y * y) || 1e-5; // Avoid division by zero
    const n = 2; // Power for curvature divergence

    // Diverging curvature
    const curvature = Math.min(100, 1 / Math.pow(r, n)); // Cap for visual clarity

    // Quantum flux (oscillatory effects)
    const quantumFlux = Math.sin(10 * Math.PI * r + t) * Math.exp(-r * 5);

    // Event Horizon Effects (stabilization near threshold)
    const eventHorizonEffect = Math.exp(-Math.abs(r - 1)); // Suppresses vectors near r = 1

    // Combine effects
    const contraction = -curvature + quantumFlux;
    const expansion = curvature + quantumFlux;

    return { contraction, expansion, eventHorizonEffect };
}

function updateVectorField(t) {
    const positions = vectorField.geometry.attributes.position.array;
    const origins = vectorField.userData.origins;

    for (let i = 0; i < origins.length / 3; i++) {
        const x = origins[i * 3];
        const y = origins[i * 3 + 1];
        const z = origins[i * 3 + 2];

        const { contraction, expansion, eventHorizonEffect } = singularityField(x, y, t);

        // Update vector components
        const dx = contraction * (x / Math.sqrt(x * x + y * y || 1)) * eventHorizonEffect;
        const dy = expansion * (y / Math.sqrt(x * x + y * y || 1)) * eventHorizonEffect;

        // Update end point
        positions[i * 6 + 3] = x + dx;
        positions[i * 6 + 4] = y + dy;
        positions[i * 6 + 5] = z;
    }

    vectorField.geometry.attributes.position.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    const t = elapsedTime % 10; // Normalize time for periodic effects

    updateVectorField(t);

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

init();
