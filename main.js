import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 600, 0.1, 1000);
camera.position.set(2, 2, 2);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, 600);
document.getElementById('visor3D').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Modelo de prueba
const loader = new GLTFLoader();
loader.load('assets/models/duck.gltf', gltf => {
  scene.add(gltf.scene);
  console.log("Modelo cargado");
});

// Puntos geoquímicos de prueba
const geoData = [
  { x: 1, y: 0.5, z: 0, Au_ppm: 0.05 },
  { x: -1, y: 0.5, z: 0, Au_ppm: 0.02 }
];

geoData.forEach(sample => {
  const color = sample.Au_ppm > 0.03 ? 0xff0000 : 0x00ccff;
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(sample.x, sample.y, sample.z);
  scene.add(sphere);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
