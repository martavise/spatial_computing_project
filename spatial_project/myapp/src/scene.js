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
  document.body.appendChild(renderer.domElement);

  // lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const loader = new GLTFLoader();

  let lidClosed, lidOpen;

  loader.load('/models/raw/lid_closed.glb', (gltf) => {
    lidClosed = gltf.scene;
    scene.add(lidClosed);
  });

  loader.load('/models/raw/lid_open.glb', (gltf) => {
    lidOpen = gltf.scene;
    lidOpen.visible = false;
    scene.add(lidOpen);
  });

  camera.position.z = 3;

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