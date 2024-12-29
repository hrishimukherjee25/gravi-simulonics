import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

let scene, camera, renderer, vectorField, clock;
let openStrings = [];
let closedStrings = [];

// Grid Parameters
const gridSize = 50;
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

    // Create open and closed strings
    createStrings();

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

function createStrings() {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const openGeometry = new THREE.BufferGeometry();
    const closedGeometry = new THREE.BufferGeometry();

    // Create Open Strings
    for (let i = 0; i < 10; i++) {
        const start = new THREE.Vector3(
            Math.random() * gridRange * 2 - gridRange,
            Math.random() * gridRange * 2 - gridRange,
            0
        );
        const end = new THREE.Vector3(
            Math.random() * gridRange * 2 - gridRange,
            Math.random() * gridRange * 2 - gridRange,
            0
        );

        const points = [start, end];
        openGeometry.setFromPoints(points);

        const openString = new THREE.Line(openGeometry, material);
        openStrings.push({ line: openString, start, end });
        scene.add(openString);
    }

    // Create Closed Strings
    for (let i = 0; i < 5; i++) {
        const points = [];
        for (let theta = 0; theta <= Math.PI * 2; theta += Math.PI / 10) {
            points.push(new THREE.Vector3(
                Math.cos(theta) * 2 + Math.random(),
                Math.sin(theta) * 2 + Math.random(),
                0
            ));
        }
        closedGeometry.setFromPoints(points);

        const closedString = new THREE.LineLoop(closedGeometry, material);
        closedStrings.push(closedString);
        scene.add(closedString);
    }
}

function updateStrings(t) {
    // Oscillate Open Strings
    openStrings.forEach((string) => {
        const dx = Math.sin(t + string.start.x) * 0.5;
        const dy = Math.cos(t + string.start.y) * 0.5;

        string.start.x += dx;
        string.start.y += dy;

        string.line.geometry.setFromPoints([string.start, string.end]);
    });

    // Oscillate Closed Strings
    closedStrings.forEach((string) => {
        const points = string.geometry.attributes.position.array;

        for (let i = 0; i < points.length; i += 3) {
            const x = points[i];
            const y = points[i + 1];
            points[i] = x + Math.sin(t) * 0.1;
            points[i + 1] = y + Math.cos(t) * 0.1;
        }

        string.geometry.attributes.position.needsUpdate = true;
    });
}

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    updateStrings(elapsedTime);

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

init();
