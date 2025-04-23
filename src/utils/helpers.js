import * as THREE from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

const loadFont = async (fontUrl) => {
    const response = await fetch(fontUrl);
    const fontData = await response.json();
    return fontData;
};

const createTextGeometry = (text, font, size = 1, height = 0.1) => {
    const textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size: size,
        height: height,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 5
    });
    return textGeometry;
};

export { loadFont, createTextGeometry };

/**
 * Creates a particle system with the specified number of particles
 * @param {number} count - Number of particles to create
 * @returns {THREE.Points} - The particle system
 */
export function createParticleSystem(count) {
    // Create particle geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const colorChoices = [
        new THREE.Color(0xffeb3b),  // Yellow
        new THREE.Color(0xff9800),  // Orange
        new THREE.Color(0x4caf50),  // Green
        new THREE.Color(0x00bcd4),  // Teal
        new THREE.Color(0x3f51b5),  // Indigo
        new THREE.Color(0x9c27b0)   // Purple
    ];
    
    // Fill positions with random values
    for (let i = 0; i < count; i++) {
        // Position particles in a cloud around the text
        const radius = 3 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);  // x
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);  // y
        positions[i * 3 + 2] = radius * Math.cos(phi);  // z
        
        // Random color from our palette
        const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Random size
        sizes[i] = Math.random() * 5 + 1;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Particle material with custom shader for better looking points
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    return new THREE.Points(particlesGeometry, particlesMaterial);
}

/**
 * Updates the particle system animation
 * @param {THREE.Points} particleSystem - The particle system to update
 * @param {number} time - Current elapsed time
 */
export function updateParticleSystem(particleSystem, time) {
    if (!particleSystem || !particleSystem.geometry.attributes.position) return;
    
    const positions = particleSystem.geometry.attributes.position;
    
    // Animate particles
    for (let i = 0; i < positions.count; i++) {
        // Use unique animation pattern for each particle based on index
        const idx = i * 3;
        
        // Get current position
        const x = positions.array[idx];
        const y = positions.array[idx + 1];
        const z = positions.array[idx + 2];
        
        // Create subtle motion patterns
        positions.array[idx] = x + Math.sin(time * 0.1 + i * 0.01) * 0.01;
        positions.array[idx + 1] = y + Math.cos(time * 0.1 + i * 0.01) * 0.01;
        positions.array[idx + 2] = z + Math.sin(time * 0.2 + i * 0.01) * 0.01;
    }
    
    positions.needsUpdate = true;
}

/**
 * Creates a subtle bloom post-processing effect
 * @param {THREE.WebGLRenderer} renderer - The renderer
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Camera} camera - The camera
 */
export function createBloomEffect(renderer, scene, camera) {
    const renderScene = new RenderPass(scene, camera);
    
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,   // strength
        0.4,   // radius
        0.85   // threshold
    );
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    
    return composer;
}