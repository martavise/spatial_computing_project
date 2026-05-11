import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
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
  topLight.position.set(0, 5, 5);
  scene.add(topLight);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  
  // loading of 3d objects
  const loader = new GLTFLoader();
  const objLoader = new OBJLoader();

  let lidClosed, lidOpen;

  // for y rotation
  const lidClosedPivot = new THREE.Group();
  const lidOpenPivot = new THREE.Group();

  // position for button spawn
  let buttonAnchor = new THREE.Object3D();


loader.load('/models/fusion_reconstructions/open.glb', (gltf) => {

  lidOpen = gltf.scene;

  scene.add(lidOpen);

  // compute size
  const box = new THREE.Box3().setFromObject(lidOpen);

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  console.log('size:', size);
  console.log('center:', center);

  // center model at origin
  lidOpen.position.sub(center);

  // fit camera to object
  const maxDim = Math.max(size.x, size.y, size.z);

  // to mimik human pov the camera is above the object
  camera.position.set(0, maxDim * 0.8, maxDim * 1.5);
  camera.lookAt(0, maxDim * 0.2, 0);


  });

  /*
  loader.load('/models/closed_cropped.glb', (gltf) => {
    lidClosed = gltf.scene;
    gltf.scene.position.set(0, 0, 0);

    lidClosed.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = 0.6;
      }
    });

    //attach anchor to lid
    buttonAnchor.position.set(0, 0.5, 0);
    lidClosed.add(buttonAnchor);

    // center pivot (WIP)
    lidClosedPivot.add(lidClosed);
    scene.add(lidClosedPivot);

    scene.add(lidClosed);
  });

  loader.load('/models/open_cropped.glb', (gltf) => {
    lidOpen = gltf.scene;
    gltf.scene.position.set(0, 0, 0);
    lidOpen.visible = false;
      lidOpenPivot.add(lidOpen);
      scene.add(lidOpenPivot);
  });

objLoader.load('/models/fusion_reconstructions/Mellotron.obj', (object)){
  scene.add(object);
}
    */


  /*
  zoom with + (zoom in) and - (zoom out) 
  */
  window.addEventListener('keydown', (e) => {
    // zoom in
    if (e.key === '+'
        || e.key === '='
        || e.key === 'Add') {

      camera.position.z -= 0.5;
    }
    // zoom out
    if (e.key === '-'
        || e.key === '_'
        || e.key === 'Subtract') {

      camera.position.z += 0.5;
    }
  });

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

  /*
  pass from one model to the other by pressing "o"
  window.addEventListener('keydown', (e) => {
    if (e.key === 'o') {
      if (lidClosed && lidOpen) {
        lidClosed.visible = !lidClosed.visible;
        lidOpen.visible = !lidOpen.visible;
      }
    }
  });
  */

}