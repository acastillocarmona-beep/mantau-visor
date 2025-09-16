import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / 600, 0.1, 10000);
camera.position.set(1000, 1000, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, 600);
document.getElementById('visor3D').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1000, 1000, 1000);
scene.add(light);

// Modelo Leapfrog
const loader = new GLTFLoader();
loader.load('assets/models/mantau_surf_a.glb', gltf => {
  scene.add(gltf.scene);
});

// Geoquímica
let spheres = [];
let geoData = [];

fetch('assets/data/converted.json')
  .then(res => res.json())
  .then(data => {
    geoData = data;
    renderSpheres('Au_ppm');
  });

function renderSpheres(elementKey) {
  spheres.forEach(s => scene.remove(s));
  spheres = [];

  geoData.forEach(sample => {
    const value = sample[elementKey];
    if (value === undefined) return;

    const geometry = new THREE.SphereGeometry(10, 8, 8);
    const color = value > 0.03 ? 0xff0000 : 0x00ccff;
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(sample.x, sample.y, sample.z);
    sphere.userData = { ...sample, elementKey };
    scene.add(sphere);
    spheres.push(sphere);
  });
}

document.getElementById('elementSelector').addEventListener('change', e => {
  renderSpheres(e.target.value);
});

const tooltip = document.getElementById('tooltip');
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / 600) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(spheres);

  const intersect = intersects.find(obj => obj.object.userData.Sample_ID);
  if (intersect) {
    const data = intersect.object.userData;
    tooltip.style.display = 'block';
    tooltip.style.left = event.clientX + 10 + 'px';
    tooltip.style.top = event.clientY + 10 + 'px';
    tooltip.innerHTML = `
      <strong>${data.Sample_ID}</strong><br>
      ${data.elementKey.replace('_ppm', '')}: ${data[data.elementKey]} ppm
    `;
  } else {
    tooltip.style.display = 'none';
  }
}

window.addEventListener('mousemove', onMouseMove);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
