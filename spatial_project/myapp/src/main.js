import './style.css';
import { initScene } from './scene.js';

const app = document.getElementById('app');



function renderLandingPage() {

  app.innerHTML = `
    <div id="landingPage">

      <h1>Melletron Simulation</h1>

      <div class="menuButtons">

        <button id="startDemoBtn">
          Go to the demo
        </button>

        <button id="learnBtn">
          Learn about the instrument
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
}

// initial page
renderLandingPage();


