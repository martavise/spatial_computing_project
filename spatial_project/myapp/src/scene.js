import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function initScene(onBack) {

  // meshes unues in the selection
  const NON_SELECTABLE = [
    'cover',
    'structure',
    'strucute'
  ];

  // ------------------------------------------------
  // THREE.JS SCENE
  // ------------------------------------------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xD1003B);

  // ------------------------------------------------
  // CAMERA
  // ------------------------------------------------
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 1, 5);

  // ------------------------------------------------
  // RENDERER
  // ------------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.getElementById('app')
    .appendChild(renderer.domElement);


  // ------------------------------------------------
  // AUDIO
  // ------------------------------------------------

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();

  let soundPlaying = false;

  audioLoader.load('/music/A2.wav', (buffer) => {

    sound.setBuffer(buffer);

    sound.setLoop(true);

    sound.setVolume(0.5);
  });

  const soundBtn = document.getElementById('soundBtn');

  soundBtn.addEventListener('click', () => {

    if (!soundPlaying) {

      sound.play();
      soundPlaying = true;
      soundBtn.innerText = '🔇 Sound Off';

    } else {

      sound.pause();
      soundPlaying = false;
      soundBtn.innerText = '🔊 Sound On';
    }
  });

  // ------------------------------------------------
  // BACK BUTTON
  // ------------------------------------------------
  const backButton =
    document.createElement('button');

  backButton.innerText = 'Back to Menu';

  backButton.style.position = 'absolute';
  backButton.style.top = '20px';
  backButton.style.right = '20px';
  backButton.style.zIndex = '1000';

  document.body.appendChild(backButton);

  // ------------------------------------------------
  // IMAGE POPUP BUTTON + MODAL
  // ------------------------------------------------

  // Button
  const imageBtn = document.createElement('button');
  imageBtn.innerText = 'Show Tape Image';

  imageBtn.style.position = 'absolute';
  imageBtn.style.top = '60px';
  imageBtn.style.right = '20px';
  imageBtn.style.zIndex = '1000';

  document.body.appendChild(imageBtn);

  // Modal overlay
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0,0,0,0.85)';
  modal.style.display = 'none';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '2000';

  // Container (split layout)
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px';
  container.style.background = '#fff';
  container.style.padding = '20px';
  container.style.borderRadius = '12px';
  container.style.maxWidth = '90vw';
  container.style.maxHeight = '80vh';
  container.style.overflow = 'hidden';

  // IMAGE SIDE
  const img = document.createElement('img');
  img.src = '/figures/magnetic_tape.webp';
  img.style.width = '400px';
  img.style.height = 'auto';
  img.style.objectFit = 'contain';
  img.style.borderRadius = '8px';

  // TEXT SIDE
  const text = document.createElement('div');
  text.style.width = '300px';
  text.style.overflowY = 'auto';
  text.style.fontFamily = 'Arial, sans-serif';
  text.style.color = '#222';

  text.innerHTML = `
    <h2>Magnetic Tape</h2>
    <p>
      Magnetic tape is a data storage medium that records information magnetically on a thin plastic strip.
    </p>
    <p>
      It was widely used in audio recording, video storage, and early computer backup systems.
    </p>
    <p>
      Each key of the Mellotron can have up to 3 magnetic tapes containing a 15s sample registration
    </p>
  `;

  // Assemble modal
  container.appendChild(img);
  container.appendChild(text);
  modal.appendChild(container);
  document.body.appendChild(modal);


  imageBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // ------------------------------------------------
  // ORBIT CONTROLS
  // ------------------------------------------------
  const controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // ------------------------------------------------
  // LIGHTS
  // ------------------------------------------------
  const ambientLight =
    new THREE.AmbientLight(0xffffff, 1.2);

  scene.add(ambientLight);

  const directionalLight =
    new THREE.DirectionalLight(0xffffff, 2);

  directionalLight.position.set(5, 5, 5);

  scene.add(directionalLight);

  // ------------------------------------------------
  // GROUND
  // ------------------------------------------------

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(50, 50);

  // ------------------------------------------------
  // PARQUET TEXTURE
  // ------------------------------------------------
  const textureLoader = new THREE.TextureLoader();

  const woodTexture = textureLoader.load(
    '/textures/parquet.jpg'
  );

  // repeat texture
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;

  woodTexture.repeat.set(8, 8);

  woodTexture.colorSpace = THREE.SRGBColorSpace;

  const groundMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8,
    metalness: 0
  });

  const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
  );

  // rotate plane to horizontal
  ground.rotation.x = -Math.PI / 2;

  // slightly below model/grid
  ground.position.y = 0;

  // receive shadows/light nicely
  ground.receiveShadow = true;

  scene.add(ground);



  // ------------------------------------------------
  // MODEL
  // ------------------------------------------------
  const loader = new GLTFLoader();

  let model;

  // selectable meshes
  const selectableMeshes = [];

  loader.load(
    '/models/fusion_reconstructions/sectioned.glb',

    (gltf) => {

      model = gltf.scene;

      scene.add(model);

      // --------------------------------------------
      // CENTER MODEL
      // --------------------------------------------
      const box =
        new THREE.Box3().setFromObject(model);

      const center =
        box.getCenter(new THREE.Vector3());

      const size =
        box.getSize(new THREE.Vector3());

      model.position.sub(center);

      // place bottom of model on ground
      model.position.y += size.y / 2;

      // --------------------------------------------
      // FIT CAMERA
      // --------------------------------------------
      const maxDim = Math.max(
        size.x,
        size.y,
        size.z
      );

      camera.position.set(
        0,
        maxDim * 0.5,
        maxDim * 2
      );

      controls.target.set(0, 0, 0);

      // --------------------------------------------
      // STORE SELECTABLE PARTS
      // --------------------------------------------
      model.traverse((child) => {

        if (child.isMesh) {
          const meshName = child.name.toLowerCase();
           // skip non selectable meshes
          if (
            NON_SELECTABLE.some(name =>
              meshName.includes(name)
            )
          ) {
            return;
          }
            // ignore meshes containing "solid"
          if (meshName.includes('solid')) {
            return;
          }

          selectableMeshes.push(child);

          child.material = child.material.clone();

          child.userData.originalColor =
            child.material.color.clone();

          // FORCE WHITE MATERIAL LOOK
          child.material.color = new THREE.Color(0xffffff);

          child.material.metalness = 0;   // removes steel/metal look
          child.material.roughness = 1;   // makes it matte/white plastic-ish

          child.material.needsUpdate = true;
        }
      });
      console.log("Selectable meshes:", selectableMeshes.length);
      console.log('Model loaded');
    }
  );

  window.addEventListener('click', onMouseClick);

  // ------------------------------------------------
  // PART SELECTION
  // ------------------------------------------------
  const raycaster = new THREE.Raycaster();

  const mouse = new THREE.Vector2();

  // visible ray line
  let rayLine;

  const rayMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff00
  });

  const rayGeometry = new THREE.BufferGeometry();

  const rayPoints = [
    new THREE.Vector3(),
    new THREE.Vector3()
  ];

  rayGeometry.setFromPoints(rayPoints);

  rayLine = new THREE.Line(rayGeometry, rayMaterial);

scene.add(rayLine);


  let selectedObject = null;

  function onMouseClick(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(selectableMeshes, true);


    // restore previous selection
    if (selectedObject) {
      selectedObject.material.color.copy(
        selectedObject.userData.originalColor
      );
    }

    if (intersects.length > 0) {

      selectedObject = intersects[0].object;

      // darken selected mesh
      selectedObject.material.color.set(0x444444);

      console.log("Selected:", selectedObject.name);

    } else {

      selectedObject = null;
    }
  }

  // ------------------------------------------------
  // KEYBOARD INTERACTIONS
  // ------------------------------------------------
  window.addEventListener('keydown', onKeyDown);

  function onKeyDown(e) {

    // reset view
    if (e.key === 'Escape') {

    // restore all mesh colors
    selectableMeshes.forEach((mesh) => {

      mesh.visible = true;

      mesh.material.color.set(0xffffff);

      mesh.material.emissive.set(0x000000);

      mesh.material.emissiveIntensity = 0;
    });

    // clear selected object
    selectedObject = null;
  }

    // zoom in
    if (
      e.key === '+' ||
      e.key === '=' ||
      e.key === 'Add'
    ) {

      camera.position.z -= 0.5;
    }

    // zoom out
    if (
      e.key === '-' ||
      e.key === '_' ||
      e.key === 'Subtract'
    ) {

      camera.position.z += 0.5;
    }
  }

  // ------------------------------------------------
  // RESIZE
  // ------------------------------------------------
  window.addEventListener('resize', onResize);

  function onResize() {

    camera.aspect =
      window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }

  // ------------------------------------------------
  // ANIMATION
  // ------------------------------------------------
  let animationId;

  function animate() {

    animationId =
      requestAnimationFrame(animate);

    controls.update();

     // update ray visual
    raycaster.setFromCamera(mouse, camera);

    const origin = raycaster.ray.origin;
    const direction = raycaster.ray.direction;

    rayPoints[0].copy(origin);

    rayPoints[1].copy(
      origin.clone().add(direction.clone().multiplyScalar(100))
    );

    rayGeometry.setFromPoints(rayPoints);


    renderer.render(scene, camera);
  }

  animate();

  // ------------------------------------------------
  // CLEANUP + BACK
  // ------------------------------------------------
  backButton.addEventListener('click', () => {

    cancelAnimationFrame(animationId);

    window.removeEventListener(
      'click',
      onMouseClick
    );

    window.removeEventListener(
      'keydown',
      onKeyDown
    );

    window.removeEventListener(
      'resize',
      onResize
    );

    controls.dispose();

    renderer.dispose();

    renderer.domElement.remove();

    backButton.remove();

    onBack();
  });


  window.addEventListener('mousemove', onMouseMove);

  function onMouseMove(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;

    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
}



/*
TODO: 
- limita camera view 
- metti textures 
- aggiungi bottoni a parti specifiche 
- aggiungi literature reviews (onedrive folder) al main menu
- raycast visibile
- limita elementi selezionabili
- prepara testo informativo
- vedi se aggiungere pitch roll
*/
