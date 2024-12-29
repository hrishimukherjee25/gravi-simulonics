import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

let scene, camera, renderer, vectorField, clock;

// Grid Parameters
const gridSize = 50; // Grid size
const gridRange = 5; // Range for X and Y axes
const step = (2 * gridRange) / gridSize; // Step size for each grid point

function init() {
    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

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
    for (let i = 0; i <= gridSize; i++) {
        for (let j = 0; j <= gridSize; j++) {
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

function warpField(x, y, t) {
    const r = Math.sqrt(x * x + y * y) || 1; // Avoid division by zero
    const contraction = Math.exp(-r * r) * Math.cos(2 * Math.PI * t);
    const expansion = Math.exp(-r * r) * Math.sin(2 * Math.PI * t);
    return { contraction, expansion };
}

function updateVectorField(t) {
    const positions = vectorField.geometry.attributes.position.array;
    const origins = vectorField.userData.origins;

    for (let i = 0; i < origins.length / 3; i++) {
        const x = origins[i * 3];
        const y = origins[i * 3 + 1];
        const z = origins[i * 3 + 2];

        const { contraction, expansion } = warpField(x, y, t);

        // Calculate vector components
        const dx = contraction * (x / Math.sqrt(x * x + y * y || 1));
        const dy = expansion * (y / Math.sqrt(x * x + y * y || 1));

        // Update end point
        positions[i * 6 + 3] = x + dx; // End x
        positions[i * 6 + 4] = y + dy; // End y
        positions[i * 6 + 5] = z;      // End z
    }

    vectorField.geometry.attributes.position.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    const t = elapsedTime % 1; // Normalize time to [0, 1]

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
