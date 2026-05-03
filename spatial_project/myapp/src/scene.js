import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initScene() {

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  // lighting
  
  const topLight = new THREE.DirectionalLight(0xffffff, 2);
  topLight.position.set(0, 5, 0);
  topLight.position.set(0, 0, 0); // from above
  scene.add(topLight);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const loader = new GLTFLoader();

  let lidClosed, lidOpen;

  loader.load('/models/closed_cropped.glb', (gltf) => {
    lidClosed = gltf.scene;
    scene.add(lidClosed);
  });

  loader.load('/models/raw/lid_open.glb', (gltf) => {
    lidOpen = gltf.scene;
    lidOpen.visible = false;
    scene.add(lidOpen);
  });

  camera.position.z = 3;

  const slider = document.getElementById('rotationSlider');

  slider.addEventListener('input', (e) => {
    const angle = THREE.MathUtils.degToRad(e.target.value);

    if (lidClosed && lidClosed.visible) {
      lidClosed.rotation.y = angle;
    }

    if (lidOpen && lidOpen.visible) {
      lidOpen.rotation.y = angle;
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('keydown', (e) => {
    if (e.key === 'o') {
      if (lidClosed && lidOpen) {
        lidClosed.visible = !lidClosed.visible;
        lidOpen.visible = !lidOpen.visible;
      }
    }
  });

}