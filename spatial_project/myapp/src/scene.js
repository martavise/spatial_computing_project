import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initScene() {

  // three.js scene
  const scene = new THREE.Scene();


  // perspective camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // renderer 
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);


  // mouse interaction (hovering)
  let mouseX = 0;
  let mouseY = 0;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const button = document.getElementById("openBtn");

  let isHovering = false;

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    mouseX = event.clientX;
    mouseY = event.clientY;
  });


  // lighting
  
  const topLight = new THREE.DirectionalLight(0xffffff, 2);
  topLight.position.set(0, 5, 0);
  topLight.position.set(0, 0, 0); // from above
  scene.add(topLight);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  
  // loading of 3d objects
  const loader = new GLTFLoader();

  let lidClosed, lidOpen;

  // position for button spawn
  let buttonAnchor = new THREE.Object3D();

  loader.load('/models/closed_cropped.glb', (gltf) => {
    lidClosed = gltf.scene;

    lidClosed.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = 0.6;
      }
    });

    //attach anchor to lid
    buttonAnchor.position.set(0, 0.5, 0);
    lidClosed.add(buttonAnchor);

    scene.add(lidClosed);
  });

  loader.load('/models/open_cropped.glb', (gltf) => {
    lidOpen = gltf.scene;
    lidOpen.visible = false;
    scene.add(lidOpen);
  });

  camera.position.z = 3;

  // rotation 
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




  const tempV = new THREE.Vector3();



  function animate() {
    requestAnimationFrame(animate);

    if (lidClosed) {
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(lidClosed, true);
      if ( isHovering) {
        console.log("inside object")

        // get world position of anchor
        tempV.setFromMatrixPosition(buttonAnchor.matrixWorld);
        tempV.project(camera);

        const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-tempV.y * 0.5 + 0.5) * window.innerHeight;

        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
      }
      if (intersects.length > 0) {
        if (!isHovering) {
          isHovering = true;

          // Make more opaque
          lidClosed.traverse((child) => {
            if (child.isMesh) {
              child.material.opacity = 1.0;
            }
          });

          // Show button near mouse
          button.style.display = "block";
        }

      } else {
        if (isHovering) {
          isHovering = false;

          // Back to transparent
          lidClosed.traverse((child) => {
            if (child.isMesh) {
              child.material.opacity = 0.6;
            }
          });

          button.style.display = "none";
        }
      }
    }

    renderer.render(scene, camera);
  }  

  animate();

  button.addEventListener('click', () => {
    if (lidClosed && lidOpen) {
        lidClosed.visible = !lidClosed.visible;
        lidOpen.visible = !lidOpen.visible;
      
      button.style.display = "none";
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'o') {
      if (lidClosed && lidOpen) {
        lidClosed.visible = !lidClosed.visible;
        lidOpen.visible = !lidOpen.visible;
      }
    }
  });

}