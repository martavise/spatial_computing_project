import './style.css';
import { initScene } from './scene.js';

const app = document.getElementById('app');



function renderLandingPage() {

  app.innerHTML = `
    <div id="landingPage">

      <h1>Mellotron Simulation</h1>

      <div class="menuButtons">

        <button id="startDemoBtn">
          Go to the demo
        </button>

        <button id="learnBtn">
          Learn about the instrument
        </button>

        <button id="literatureBtn">
          Literature Reviews
        </button>

        <button id="schaulagerBtn">
          Visit the instrument at Fribourg
        </button>

      </div>

    </div>
  `;

  // START DEMO
  document
    .getElementById('startDemoBtn')
    .addEventListener('click', () => {

      app.innerHTML = '';

      // IMPORTANT:
      initScene(renderLandingPage);
    });

  // WIKIPEDIA
  document
    .getElementById('learnBtn')
    .addEventListener('click', () => {

      window.open(
        'https://en.wikipedia.org/wiki/Mellotron',
        '_blank'
      );
    });

  // ONEDRIVE FOLDER, LITERATURE REVIEW
  document
    .getElementById('literatureBtn')
    .addEventListener('click', () => {

      window.open(
        'https://unifrch-my.sharepoint.com/:f:/g/personal/marta_visetti_unifr_ch/IgBBvKtI-kSHSIHPBN6sg7HiASuWCmrUobj9sz3U0EWmxDA?e=gFBaod',
        '_blank'
      );
    });

  // SMEM VISIT
  document
    .getElementById('schaulagerBtn')
    .addEventListener('click', () => {

      window.open(
        'https://www.smemmusic.ch/en/schaulager',
        '_blank'
      );
    });
}

// initial page
renderLandingPage();


