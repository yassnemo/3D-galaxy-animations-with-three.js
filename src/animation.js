import * as THREE from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';

let scene, camera, renderer;
let galaxyParticles = [];
let clock = new THREE.Clock();
let speed = 0.5;
let movingForward = false;
let movingBackward = false;
let movingLeft = false;
let movingRight = false;

// Galaxy parameters
const params = {
  count: 80000,
  size: 0.01,
  radius: 5,
  branches: 5,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
  speedFactor: 2
};

function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.01);

  // Setup camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 6);
  camera.lookAt(0, 0, 0);

  // Setup renderer
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);
  document.getElementById('animation-container').appendChild(renderer.domElement);

  // Create multiple galaxies
  for (let i = 0; i < 5; i++) {
    createGalaxy(
      (Math.random() - 0.5) * 40, // x position
      (Math.random() - 0.5) * 40, // y position
      (Math.random() - 0.5) * 40, // z position
      Math.random() * Math.PI * 2, // rotation
      Math.random() < 0.5 ? '#ff6030' : '#00aaff', // random inside color
      Math.random() < 0.5 ? '#1b3984' : '#8800ff'  // random outside color
    );
  }

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  // Add stars in the background
  createStars();

  // Create navigation instructions
  createInstructions();
  
  // Setup event listeners for navigation
  setupEventListeners();
  
  // Start animation loop
  animate();
}

function createGalaxy(x = 0, y = 0, z = 0, rotation = 0, insideColorHex = '#ff6030', outsideColorHex = '#1b3984') {
  // Create galaxy geometry
  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);
  const scales = new Float32Array(params.count);

  const insideColor = new THREE.Color(insideColorHex);
  const outsideColor = new THREE.Color(outsideColorHex);

  // Create particles with positions based on galaxy shape
  for (let i = 0; i < params.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * params.radius;
    const spinAngle = radius * params.spin;
    const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;

    // Add randomness to position
    const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color
    const mixedColor = new THREE.Color();
    mixedColor.lerpColors(insideColor, outsideColor, radius / params.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Scale (size variation)
    scales[i] = Math.random() * 2 + 0.5;
  }

  // Create galaxy geometry
  const galaxyGeometry = new THREE.BufferGeometry();
  galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  galaxyGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  // Material for galaxy particles
  const galaxyMaterial = new THREE.PointsMaterial({
    size: params.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  // Create the galaxy points
  const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
  
  // Set position and rotation
  galaxyPoints.position.set(x, y, z);
  galaxyPoints.rotation.x = Math.random() * Math.PI;
  galaxyPoints.rotation.y = rotation;
  galaxyPoints.rotation.z = Math.random() * Math.PI/4;
  
  scene.add(galaxyPoints);
  galaxyParticles.push(galaxyPoints);
  
  return galaxyPoints;
}

function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 15000;

  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount * 3; i += 3) {
    // Position stars in a sphere around the scene
    const radius = 100 + Math.random() * 900; // 100 to 1000
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);
    
    // Random star colors (white to blue-ish)
    colors[i] = 0.8 + Math.random() * 0.2;
    colors[i + 1] = 0.8 + Math.random() * 0.2;
    colors[i + 2] = 0.9 + Math.random() * 0.1;
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    sizeAttenuation: false
  });
  
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function createInstructions() {
  const instructions = document.createElement('div');
  instructions.className = 'instructions';
  instructions.innerHTML = `
    <h3>Galaxy Navigation</h3>
    <p>Move: W,A,S,D or Arrow Keys</p>
    <p>Look: Click and Drag Mouse</p>
    <p>Speed Boost: Hold Shift</p>
    <button id="hide-instructions">Got it!</button>
  `;
  
  document.body.appendChild(instructions);
  
  document.getElementById('hide-instructions').addEventListener('click', () => {
    instructions.classList.add('hidden');
  });
}

function setupEventListeners() {
  // Keyboard controls for movement
  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        movingForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        movingBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        movingLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        movingRight = true;
        break;
      case 'ShiftLeft':
        speed = 1.5; // Sprint mode
        break;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        movingForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        movingBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        movingLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        movingRight = false;
        break;
      case 'ShiftLeft':
        speed = 0.5; // Normal speed
        break;
    }
  });

  // Mouse controls for looking around
  let isDragging = false;
  let previousMousePosition = {
    x: 0,
    y: 0
  };

  renderer.domElement.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  });

  renderer.domElement.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      // Rotate camera based on mouse movement
      camera.rotation.y -= deltaMove.x * 0.01;
      camera.rotation.x -= deltaMove.y * 0.01;
      
      // Limit vertical rotation
      camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch controls
  renderer.domElement.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      isDragging = true;
      previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
  });

  renderer.domElement.addEventListener('touchmove', (event) => {
    if (isDragging && event.touches.length === 1) {
      const deltaMove = {
        x: event.touches[0].clientX - previousMousePosition.x,
        y: event.touches[0].clientY - previousMousePosition.y
      };

      // Rotate camera based on touch movement
      camera.rotation.y -= deltaMove.x * 0.01;
      camera.rotation.x -= deltaMove.y * 0.01;
      
      // Limit vertical rotation
      camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));

      previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
  });

  renderer.domElement.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  // Add shortcut to create a new galaxy at camera position
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      const position = new THREE.Vector3();
      position.copy(camera.position);
      position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ));
      
      createGalaxy(
        position.x, 
        position.y, 
        position.z,
        Math.random() * Math.PI * 2,
        Math.random() < 0.5 ? '#ff6030' : '#00aaff',
        Math.random() < 0.5 ? '#1b3984' : '#8800ff'
      );
    }
  });
}

function updateCamera(delta) {
  // Create direction vector
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.normalize();

  // Create right vector for strafing
  const right = new THREE.Vector3();
  right.crossVectors(camera.up, direction).normalize();
  
  // Forward/backward movement
  if (movingForward) {
    camera.position.addScaledVector(direction, speed * delta * params.speedFactor);
  }
  if (movingBackward) {
    camera.position.addScaledVector(direction, -speed * delta * params.speedFactor);
  }
  
  // Left/right movement (strafing)
  if (movingLeft) {
    camera.position.addScaledVector(right, -speed * delta * params.speedFactor);
  }
  if (movingRight) {
    camera.position.addScaledVector(right, speed * delta * params.speedFactor);
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();
  
  // Update camera position
  updateCamera(delta);
  
  // Rotate galaxies slowly for animation effect
  galaxyParticles.forEach((particles, index) => {
    particles.rotation.y += delta * 0.05 * (index + 1) * 0.1;
  });
  
  // Create gentle floating effect for galaxies
  galaxyParticles.forEach((particles, index) => {
    const i = index + 1;
    particles.position.y += Math.sin(elapsedTime * 0.2 * i) * 0.001;
    particles.position.x += Math.cos(elapsedTime * 0.1 * i) * 0.001;
  });
  
  // Add new galaxies occasionally at random positions
  if (Math.random() < 0.0005 && galaxyParticles.length < 15) {
    createGalaxy(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      Math.random() * Math.PI * 2,
      Math.random() < 0.5 ? '#ff6030' : '#00aaff',
      Math.random() < 0.5 ? '#1b3984' : '#8800ff'
    );
  }
  
  // Render scene
  renderer.render(scene, camera);
}

// Initialize the galaxy
init();