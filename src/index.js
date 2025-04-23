import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { createTextAnimation, updateAnimation, setupMouseInteraction, setupResponsive } from './animation';

let scene, camera, renderer, controls, textMesh, composer;

async function init() {
    console.log('Initializing animation...');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141414);
    scene.fog = new THREE.FogExp2(0x141414, 0.05);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Append renderer to DOM
    const container = document.getElementById('animation-container');
    if (container) {
        container.appendChild(renderer.domElement);
        console.log('Renderer appended to animation-container');
    } else {
        document.body.appendChild(renderer.domElement);
        console.log('Renderer appended to body (container not found)');
    }
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);
    
    // Add point lights for better text illumination
    const pointLight1 = new THREE.PointLight(0xff9000, 1, 10);
    pointLight1.position.set(2, 1, 2);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x0078ff, 1, 10);
    pointLight2.position.set(-2, -1, 2);
    scene.add(pointLight2);
    
    // Create text animation
    console.log('Creating text animation...');
    try {
        textMesh = await createTextAnimation("Yassine Erradouani");
        scene.add(textMesh);
        console.log('Text animation created and added to scene');
    } catch (error) {
        console.error('Error creating text animation:', error);
    }
    
    // Add background particles
    createBackgroundParticles();
    
    // Add post-processing effects
    setupPostProcessing();
    
    // Add controls for interaction
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.minPolarAngle = Math.PI / 2 - 0.5;  // Limit to prevent seeing "behind" text
    controls.maxPolarAngle = Math.PI / 2 + 0.5;
    
    // Setup event listeners for interactivity
    setupMouseInteraction(renderer.domElement, camera);
    setupResponsive(textMesh, camera, renderer);
    
    // Start animation loop
    console.log('Starting animation loop');
    animate();
}

function createBackgroundParticles() {
    const particlesCount = 500;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Create particles in a sphere around the scene
        const radius = 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
        map: createCircleTexture(),
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Animate background particles
    const clock = new THREE.Clock();
    
    function updateBackgroundParticles() {
        const time = clock.getElapsedTime();
        particles.rotation.y = time * 0.05;
    }
    
    return updateBackgroundParticles;
}

function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(16, 16, 16, 0, Math.PI * 2);
    context.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function setupPostProcessing() {
    // Create composer with render pass
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    // Add bloom pass
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,    // strength
        0.3,    // radius
        0.9     // threshold
    );
    composer.addPass(bloomPass);
}

const updateBackgroundParticles = createBackgroundParticles();

function animate() {
    requestAnimationFrame(animate);
    
    // Update controls if using OrbitControls
    if (controls) controls.update();
    
    // Update animations
    updateAnimation(textMesh, camera);
    updateBackgroundParticles();
    
    // Render with post-processing
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

// Initialize when the page loads
window.addEventListener('load', function() {
    console.log('Window loaded, initializing...');
    init();
});