import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function initScene(onBack) {
  // meshes unused in the selection
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
  // LABEL OVERLAY SYSTEM
  // ------------------------------------------------
  const labelContainer = document.createElement('div');
  labelContainer.style.position = 'absolute';
  labelContainer.style.top = '0';
  labelContainer.style.left = '0';
  labelContainer.style.width = '100%';
  labelContainer.style.height = '100%';
  labelContainer.style.pointerEvents = 'none'; // non blocca gli eventi mouse
  labelContainer.style.zIndex = '10';
  document.getElementById('app').appendChild(labelContainer);

  // SVG per le linee tratteggiate
  const labelSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  labelSVG.style.position = 'absolute';
  labelSVG.style.top = '0';
  labelSVG.style.left = '0';
  labelSVG.style.width = '100%';
  labelSVG.style.height = '100%';
  labelSVG.style.pointerEvents = 'none';
  labelContainer.appendChild(labelSVG);

  // funzione labels
  function toScreenPosition(obj, camera) {
    const vector = new THREE.Vector3();
    
    // prendi il centro della mesh
    const box = new THREE.Box3().setFromObject(obj);
    box.getCenter(vector);
    
    vector.project(camera);
    
    return {
      x: (vector.x * 0.5 + 0.5) * window.innerWidth,
      y: (-vector.y * 0.5 + 0.5) * window.innerHeight,
      visible: vector.z < 1 // davanti alla camera
    };
  }
  

  const labelDefinitions = [
    {
      id: 'label-lid',
      getMesh: () => lidMesh,
      text: 'see inside',
      icon: '',
      condition: () => lidMesh && lidMesh.visible, // mostra solo quando il lid è visibile
      offset: { x: 120, y: -60 } // offset in px rispetto al punto proiettato
    },
    {
      id: 'label-keys',
      getMesh: () => selectableMeshes.find(m => m.name.toLowerCase().includes('power')),
      text: 'Interactive keyboard',
      icon: '',
      condition: () => lidMesh && lidMesh.visible,
      offset: { x: -200, y: 40 }
    },
    {
      id: 'label-tapes',
      getMesh: () => selectableMeshes.find(m => m.name.toLowerCase().includes('structure004')),
      text: 'About magnetic tape',
      icon: '',
      condition: () => !(lidMesh && lidMesh.visible),
      offset: { x: 130, y: 40 }
    },

  ];

  // Crea gli elementi DOM per ogni label
  const labelElements = {};

  labelDefinitions.forEach(def => {
    // Div etichetta
    const div = document.createElement('div');
    div.id = def.id;
    div.style.position = 'absolute';
    div.style.background = 'rgba(255,255,255,0.92)';
    div.style.color = '#111';
    div.style.padding = '6px 12px';
    div.style.borderRadius = '6px';
    div.style.fontSize = '13px';
    div.style.fontFamily = 'Arial, sans-serif';
    div.style.fontWeight = '500';
    div.style.whiteSpace = 'nowrap';
    div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    div.style.border = '1px solid rgba(0,0,0,0.08)';
    div.style.pointerEvents = 'none';
    div.style.transition = 'opacity 0.3s';
    div.style.opacity = '0';
    div.innerHTML = `${def.icon} ${def.text}`;
    labelContainer.appendChild(div);

    // Linea SVG tratteggiata
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'white');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '5,4');
    line.style.opacity = '0';
    line.style.transition = 'opacity 0.3s';
    // animazione dashoffset per effetto "marching ants"
    line.style.animation = 'dash 1s linear infinite';
    labelSVG.appendChild(line);

    // Piccolo dot sul punto 3D
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', 'white');
    dot.setAttribute('stroke', 'rgba(0,0,0,0.2)');
    dot.setAttribute('stroke-width', '1');
    dot.style.opacity = '0';
    dot.style.transition = 'opacity 0.3s';
    labelSVG.appendChild(dot);

    labelElements[def.id] = { div, line, dot };
  });

  // Aggiungi l'animazione CSS per le linee
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes dash {
      to { stroke-dashoffset: -18; }
    }
  `;
  document.head.appendChild(styleEl);

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
  // IMAGE POPUP 
  // ------------------------------------------------

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
      Each key of the Mellotron can have up to 3 magnetic tapes, each containing a 15s sample registration
    </p>
  `;

  // Assemble modal
  container.appendChild(img);
  container.appendChild(text);
  modal.appendChild(container);
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // ------------------------------------------------
  // Keyboard MODAL
  // ------------------------------------------------
  const powerModal = document.createElement('div');
  powerModal.style.position = 'fixed';
  powerModal.style.top = '0';
  powerModal.style.left = '0';
  powerModal.style.width = '100vw';
  powerModal.style.height = '100vh';
  powerModal.style.backgroundColor = 'rgba(0,0,0,0.85)';
  powerModal.style.display = 'none';
  powerModal.style.alignItems = 'center';
  powerModal.style.justifyContent = 'center';
  powerModal.style.zIndex = '2000';

  const powerContainer = document.createElement('div');
  powerContainer.style.background = '#fff';
  powerContainer.style.padding = '32px';
  powerContainer.style.borderRadius = '12px';
  powerContainer.style.maxWidth = '420px';
  powerContainer.style.fontFamily = 'Arial, sans-serif';
  powerContainer.style.color = '#222';
  powerContainer.style.lineHeight = '1.6';

  powerContainer.innerHTML = `
    <h2> How to Play</h2>
    <p>
      It is possible to test the Mellotron by selecting the wanted keys
      (<strong>Shift + click</strong> to select multiple keys at the same time)
      and then hold <strong>'E'</strong> to play the selected notes.
    </p>
  `;

  powerModal.appendChild(powerContainer);
  document.body.appendChild(powerModal);

  powerModal.addEventListener('click', (e) => {
    if (e.target === powerModal) {
      powerModal.style.display = 'none';
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

  let lidMesh = null;
  let keysGroupCenter = new THREE.Vector3();


  loader.load(
    '/models/fusion_reconstructions/renamed_sections.glb',

    (gltf) => {

      model = gltf.scene;

      scene.add(model)  // add model to scene

      model.scale.set(2, 2, 2);  // make model bigger

      // compute bounding box for camera
      const box =
        new THREE.Box3().setFromObject(model);

      const center =
        box.getCenter(new THREE.Vector3());

      const size =
        box.getSize(new THREE.Vector3());

      model.position.sub(center); // center model to camera

      // place bottom of model on ground
      model.position.y = -box.min.y;

  
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
  // MATERIAL HELPERS
  // --------------------------------------------

  function applyMaterial(mesh, options = {}) {

    const {
      color = 0xffffff,
      metalness = 0,
      roughness = 1,
      transparent = false,
      opacity = 1
    } = options;

    mesh.material = mesh.material.clone();

    mesh.material.color.set(color);

    mesh.material.metalness = metalness;

    mesh.material.roughness = roughness;

    mesh.material.transparent = transparent;

    mesh.material.opacity = opacity;

    mesh.material.needsUpdate = true;

    mesh.userData.originalColor =
      mesh.material.color.clone();
  }

  // --------------------------------------------
  // SELECTABLE RULES
  // --------------------------------------------

  function isSelectable(meshName) {

    return (
      meshName.includes('lid') ||
      meshName.includes('key') ||
      meshName.includes('power') ||
      meshName.includes('tone') ||
      meshName.includes('volume') ||
      meshName.includes('pitch') ||
      meshName.includes('tape_select')||
      meshName.includes('structure004')
    );
  }


  // --------------------------------------------
  // MODEL TRAVERSE
  // --------------------------------------------

  model.traverse((child) => {

    if (child.isMesh) console.log(child.name);


    if (!child.isMesh) return;

    const meshName = child.name.toLowerCase();

    // ignore helper solids
    if (meshName.includes('solid')) {
      return;
    }
    if (meshName.includes('lid')) {
      lidMesh = child;
    }

    if (meshName.includes('key')) {
      selectableMeshes.push(child);
    }

    // --------------------------------------------
    // SELECTABLE STORAGE
    // --------------------------------------------

    if (isSelectable(meshName)) {
      selectableMeshes.push(child);
    }

    // --------------------------------------------
    // NON SELECTABLE
    // --------------------------------------------

    // cables → black
    if (meshName.includes('cable')) {

      applyMaterial(child, {
        color: 0x111111,
        roughness: 0.95,
        metalness: 0
      });
    }

    // belt / cinghia → matte black
    else if (meshName.includes('cinghia')) {

      applyMaterial(child, {
        color: 0x050505,
        roughness: 1,
        metalness: 0
      });
    }

    // cover → white
    else if (meshName.includes('cover')) {

      applyMaterial(child, {
        color: 0xf2f1df,
        roughness: 0.9,
        metalness: 0
      });
    }

    // motherboard → metallic silver
    else if (meshName.includes('motherboard')) {

      applyMaterial(child, {
        color: 0xbfc5cc,
        metalness: 1,
        roughness: 0.3
      });
    }

    // pins → light blue
    else if (meshName.includes('pin')) {

      applyMaterial(child, {
        color: 0x8fd3ff,
        metalness: 0.2,
        roughness: 0.5
      });
    }

    // structure → metallic silver
    else if (
      meshName.includes('structure') ||
      meshName.includes('strucute')
    ) {

      applyMaterial(child, {
        color: 0xd9d9d9,
        metalness: 1,
        roughness: 0.35
      });
    }

    // tape → semi transparent brown/black
    else if (meshName.includes('tape')) {

      applyMaterial(child, {
        color: 0x2b1b0f,
        metalness: 0.1,
        roughness: 0.7,
        transparent: true,
        opacity: 0.7
      });
    }

    // wooden → light wood
    else if (meshName.includes('wooden')) {

      applyMaterial(child, {
        color: 0xd8b58a,
        metalness: 0,
        roughness: 0.9
      });
    }

    // --------------------------------------------
    // SELECTABLES
    // --------------------------------------------

    // lid → white
    else if (meshName.includes('lid')) {

      applyMaterial(child, {
        color: 0xf2f1df,
        roughness: 0.85
      });
    }

    // keys
    else if (meshName.includes('key')) {

      const whiteKeys = [
        'key_1d',
        'key_2d',
        'key_3d'
      ];

      // black keys ending with d, non keys che indicano re maggiore (whiteKeys)
      if (meshName.endsWith('d') && (!(whiteKeys.includes(meshName)))) {

        applyMaterial(child, {
          color: 0x111111,
          roughness: 0.6
        });

      } else {

        applyMaterial(child, {
          color: 0xffffff,
          roughness: 0.8
        });
      }
    }

    // power → red
    else if (meshName.includes('power')) {

      applyMaterial(child, {
        color: 0xff0000,
        roughness: 0.5
      });
    }

    // tone volume pitch → black
    else if (
      meshName.includes('tone') ||
      meshName.includes('volume') ||
      meshName.includes('pitch')
    ) {

      applyMaterial(child, {
        color: 0x111111,
        roughness: 0.7
      });
    }

    // tape select → black
    else if (meshName.includes('tape_select')) {

      applyMaterial(child, {
        color: 0xd9d9d9,
        roughness: 0.4
      });
    }

    // --------------------------------------------
    // FALLBACK
    // --------------------------------------------

    else {

      applyMaterial(child, {
        color: 0xcccccc,
        roughness: 0.8
      });
    }
  });

  console.log(
    "Selectable meshes:",
    selectableMeshes.length
  );

  const keyBox = new THREE.Box3();

  selectableMeshes.forEach(m => keyBox.expandByObject(m));

  keyBox.getCenter(keysGroupCenter);

  window.addEventListener('click', onMouseClick);

  // ------------------------------------------------
  // PART SELECTION + raycast (laser pointer)
  // ------------------------------------------------
  const raycaster = new THREE.Raycaster();

  const mouse = new THREE.Vector2();
  
  ///// LASER POINTER /////

  // laser geometry
  const laserGeometry = new THREE.CylinderGeometry(
    0.01, // top radius
    0.01, // bottom radius
    1,    // height
    8
  );

  const laserMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.9
  });

  const laser = new THREE.Mesh(
    laserGeometry,
    laserMaterial
  );

  scene.add(laser);

  // small glowing dot at hit point
  const dotGeometry = new THREE.SphereGeometry(0.03, 16, 16);

  const dotMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000
  });

  const laserDot = new THREE.Mesh(
    dotGeometry,
    dotMaterial
  );

  scene.add(laserDot);


  let selectedObject = null;
  const selectedKeys = new Set(); // per selezionare più tasti

  function onMouseClick(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(selectableMeshes, true);

    const hit = intersects.find(i => {
      if (i.object.name.toLowerCase().includes('lid') && !lidMesh.visible) {
        return false;
      }
      return true;
    });

    if (!hit) {
      // click su vuoto: deseleziona tutto
      if (!event.shiftKey) {
        selectedKeys.forEach(m => m.material.color.copy(m.userData.originalColor));
        selectedKeys.clear();
        if (selectedObject) {
          selectedObject.material.color.copy(selectedObject.userData.originalColor);
          selectedObject = null;
        }
      }
      return;
    }

    const clicked = hit.object;
    const clickedName = clicked.name.toLowerCase();

    // KEY → selezione multipla con Shift, singola senza
    if (clickedName.includes('key')) {

      if (event.shiftKey) {
        // toggle: se già selezionata, deseleziona
        if (selectedKeys.has(clicked)) {
          clicked.material.color.copy(clicked.userData.originalColor);
          selectedKeys.delete(clicked);
        } else {
          clicked.material.color.set(0x444444);
          selectedKeys.add(clicked);
        }

      } else {
        // click normale: deseleziona tutte le altre keys
        selectedKeys.forEach(m => m.material.color.copy(m.userData.originalColor));
        selectedKeys.clear();
        clicked.material.color.set(0x444444);
        selectedKeys.add(clicked);


        // nascondi labels
        Object.values(labelElements).forEach(el => {
          el.div.style.opacity = '0';
          el.line.style.opacity = '0';
          el.dot.style.opacity = '0';
        });
      }

      selectedObject = null; // non usare più selectedObject per le keys
      console.log("Selected keys:", [...selectedKeys].map(m => m.name));
      return;
    }

    // ripristina selezione keys se si clicca altro
    selectedKeys.forEach(m => m.material.color.copy(m.userData.originalColor));
    selectedKeys.clear();

    // ripristina selectedObject precedente
    if (selectedObject) {
      selectedObject.material.color.copy(selectedObject.userData.originalColor);
    }

    selectedObject = clicked;

    if (clickedName.includes('lid')) {

      selectedObject.visible = false;
      camera.position.set(
        0.0000028409055144181794,
        2.8413612915298456,
        -5.089054094735462e-8
      );
      controls.target.set(0, 0, 0);
      controls.update();

    } else if (clickedName.includes('structure004')) {

      modal.style.display = 'flex';
      selectedObject.material.color.copy(selectedObject.userData.originalColor);

    } else if (clickedName.includes('power')) {

      powerModal.style.display = 'flex';
      selectedObject.material.color.copy(selectedObject.userData.originalColor);

    } else {

      selectedObject.material.color.set(0x444444);
    }

    console.log("Selected:", selectedObject.name);
  }



  // ------------------------------------------------
  // KEYBOARD INTERACTIONS
  // ------------------------------------------------
  window.addEventListener('keydown', onKeyDown);

  // flag per evitare che il suono riparta ad ogni keydown ripetuto
  let eKeyDown = false;
  // tieni traccia dei suoni attivi per poterli stoppare
  const activeSounds = [];

  let soundStopTimeout = null; // timeout per i 15 secondi

  function onKeyDown(e) {

    if (e.key === 'Escape') {
      selectableMeshes.forEach((mesh) => {
        mesh.visible = true;
        mesh.material.color.copy(mesh.userData.originalColor);
        mesh.material.emissive.set(0x000000);
        mesh.material.emissiveIntensity = 0;
      });
      selectedObject = null;
      selectedKeys.clear();
    }

    // suona le keys selezionate solo al primo keydown, non sui repeat
    if ((e.key === 'e' || e.key === 'E') && !eKeyDown) {
      eKeyDown = true;
      playSelectedKeys();
    }

    if (e.key === '+' || e.key === '=' || e.key === 'Add') {
      camera.position.z -= 0.5;
    }
    if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
      camera.position.z += 0.5;
    }
  }

  function onKeyUp(e) {
    if (e.key === 'e' || e.key === 'E') {
      eKeyDown = false;

      // cancella il timeout dei 15s se si rilascia prima
      if (soundStopTimeout) {
        clearTimeout(soundStopTimeout);
        soundStopTimeout = null;
      }
      // stoppa tutti i suoni attivi
      activeSounds.forEach(s => {
        if (s.isPlaying) s.stop();
      });
      activeSounds.length = 0;
    }
  }

  window.addEventListener('keyup', onKeyUp);
  // ------------------------------------------------
  // RESIZE fuction (to have coherence between object and camera)
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

  console.log("Selectable meshes names:", selectableMeshes.map(m => m.name));
    const keyAudioMap = {
      'key_0g':  '/music/Woodwinds/G2-4.wav',
      'key_0gd': '/music/Woodwinds/Gs2-4.wav',
      'key_0a':  '/music/Woodwinds/A2-4.wav',
      'key_0ad': '/music/Woodwinds/As2-4.wav',
      'key_0b':  '/music/Woodwinds/B2-4.wav',
      'key_1c':  '/music/Woodwinds/C3-4.wav',
      'key_1cd': '/music/Woodwinds/Cs3-4.wav',
      'key_1d':  '/music/Woodwinds/D3-4.wav',
      'key_1dd': '/music/Woodwinds/Ds3-4.wav',
      'key_1e':  '/music/Woodwinds/E3-4.wav',
      'key_1f':  '/music/Woodwinds/F3-4.wav',
      'key_1fd': '/music/Woodwinds/Fs3-4.wav',
      'key_1g':  '/music/Woodwinds/G3-4.wav',
      'key_1gd': '/music/Woodwinds/Gs3-4.wav',
      'key_1a':  '/music/Woodwinds/A3-4.wav',
      'key_1ad': '/music/Woodwinds/As3-4.wav',
      'key_1b':  '/music/Woodwinds/B3-4.wav',
      'key_2c':  '/music/Woodwinds/C4-4.wav',
      'key_2cd': '/music/Woodwinds/Cs4-4.wav',
      'key_2d':  '/music/Woodwinds/D4-4.wav',
      'key_2dd': '/music/Woodwinds/Ds4-4.wav',
      'key_2e':  '/music/Woodwinds/E4-4.wav',
      'key_2f':  '/music/Woodwinds/F4-4.wav',
      'key_2fd': '/music/Woodwinds/Fs4-4.wav',
      'key2g':   '/music/Woodwinds/G4-4.wav',
      'key2gd':  '/music/Woodwinds/Gs4-4.wav',
      'key_2a':  '/music/Woodwinds/A4-4.wav',
      'key_2ad': '/music/Woodwinds/As4-4.wav',
      'key_2b':  '/music/Woodwinds/B4-4.wav',
      'key_3c':  '/music/Woodwinds/C5-4.wav',
      'key_3cd': '/music/Woodwinds/Cs5-4.wav',
      'key_3d':  '/music/Woodwinds/D5-4.wav',
      'key_3dd': '/music/Woodwinds/Ds5-4.wav',
      'key_3e':  '/music/Woodwinds/E5-4.wav',
    };
  const keyBuffers = {}; // meshName → AudioBuffer

  Object.entries(keyAudioMap).forEach(([meshName, url]) => {
    audioLoader.load(url, (buffer) => {
      keyBuffers[meshName] = buffer;
    });
  });

  function playSelectedKeys() {
    selectedKeys.forEach(mesh => {
      const meshName = mesh.name.toLowerCase();
      const buffer = keyBuffers[meshName];
      if (!buffer) {
        console.warn('No audio buffer for:', meshName);
        return;
      }
      const keySound = new THREE.Audio(listener);
      keySound.setBuffer(buffer);
      keySound.setLoop(true); // loop mentre tieni premuto
      keySound.setVolume(0.8);
      keySound.play();
      activeSounds.push(keySound); // tieni traccia per stoppare al keyup
    });
      // stoppa automaticamente dopo 15 secondi
    soundStopTimeout = setTimeout(() => {
      activeSounds.forEach(s => {
        if (s.isPlaying) s.stop();
      });
      activeSounds.length = 0;
    }, 7000);
  }
  
  // ------------------------------------------------
  // ANIMATION
  // ------------------------------------------------
  let animationId;
  function animate() {

    animationId =
      requestAnimationFrame(animate);

    controls.update();


    controls.maxPolarAngle = (Math.PI / 2) - 0.04; // limits camera view to above floor level (had to adjusta little, because at PI/2, one could still see under the ground level)
    // update ray visual
    raycaster.setFromCamera(mouse, camera);

    // laser pointer logic
    const origin = raycaster.ray.origin.clone();

    const direction = raycaster.ray.direction.clone();
 
    // intersections with model
    const intersects = raycaster.intersectObjects(
      selectableMeshes,
      true
    );

    let targetPoint;

    // if ray hits object
    if (intersects.length > 0) {

      targetPoint = intersects[0].point;

      laserDot.visible = true;
      laserDot.position.copy(targetPoint);

    } else {

      // extend laser forward
      targetPoint = origin.clone().add(
        direction.multiplyScalar(20)
      );

      laserDot.visible = false;
    }

    // midpoint
    const midpoint = origin.clone().lerp(targetPoint, 0.5);

    // laser length
    const distance = origin.distanceTo(targetPoint);

    // position laser
    laser.position.copy(midpoint);

    // scale to length
    laser.scale.set(1, distance, 1);

    // orient laser
    laser.lookAt(targetPoint);

    // cylinder default axis correction
    laser.rotateX(Math.PI / 2);

    /*
    //to check camera info
    console.log(
      'Camera position:',
      camera.position,
      'Camera rotation:',
      camera.rotation
    );
    */
    

    // Aggiorna label overlay
    labelDefinitions.forEach(def => {
      const el = labelElements[def.id];
      const mesh = def.getMesh();

      if (!mesh || !def.condition()) {
        el.div.style.opacity = '0';
        el.line.style.opacity = '0';
        el.dot.style.opacity = '0';
        return;
      }

      const screen = toScreenPosition(mesh, camera);

      if (!screen.visible) {
        el.div.style.opacity = '0';
        el.line.style.opacity = '0';
        el.dot.style.opacity = '0';
        return;
      }

      const labelX = screen.x + def.offset.x;
      const labelY = screen.y + def.offset.y;

      el.div.style.left = `${labelX}px`;
      el.div.style.top  = `${labelY}px`;
      el.div.style.opacity = '1';

      const divW = el.div.offsetWidth;
      const divH = el.div.offsetHeight;
      const anchorX = def.offset.x > 0 ? labelX : labelX + divW;
      const anchorY = labelY + divH / 2;

      el.line.setAttribute('x1', screen.x);
      el.line.setAttribute('y1', screen.y);
      el.line.setAttribute('x2', anchorX);
      el.line.setAttribute('y2', anchorY);
      el.line.style.opacity = '0.85';

      el.dot.setAttribute('cx', screen.x);
      el.dot.setAttribute('cy', screen.y);
      el.dot.style.opacity = '1';
    });

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
    labelContainer.remove();
    styleEl.remove();

    onBack();
  });

  window.addEventListener('mousemove', onMouseMove);

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  }); 


}


/*
TODO: 
- aggiungi literature reviews (onedrive folder) al main menu
*/

