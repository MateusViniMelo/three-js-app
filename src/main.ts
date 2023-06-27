import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// @ts-ignore
import THREEx3 from "three-x3";
import skyTexture from "./assets/images/white-cloud-blue-sky.jpg";
import gramaBaseColor from "./assets/images/grass/Stylized_Grass_003_basecolor.jpg";
import gramaNormal from "./assets/images/grass/Stylized_Grass_003_normal.jpg";
import gramaHeight from "./assets/images/grass/Stylized_Grass_003_height.png";
import gramaAmbientOclusion from "./assets/images/grass/Stylized_Grass_003_ambientOcclusion.jpg";
import gramaRoughness from "./assets/images/grass/Stylized_Grass_003_roughness.jpg";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Sets the color of the background
// renderer.setClearColor(0xfefefe);

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
const camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 1000);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(115, 47, 146);
orbit.update();

const cubeTextureLoader = new THREE.CubeTextureLoader();

scene.background = cubeTextureLoader.load([
  skyTexture,
  skyTexture,
  skyTexture,
  skyTexture,
  skyTexture,
  skyTexture,
]);

const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
scene.add(light);

const gramaMaterial = new THREE.MeshStandardMaterial({
  map: loader.load(gramaBaseColor),
  normalMap: loader.load(gramaNormal),
  alphaMap: loader.load(gramaHeight),
  aoMap: loader.load(gramaAmbientOclusion),
  roughnessMap: loader.load(gramaRoughness),
  color: 0x00ff00,

  side: THREE.DoubleSide,
});
const planoGeometria = new THREE.PlaneGeometry(80, 80);
const plano = new THREE.Mesh(planoGeometria, gramaMaterial);
plano.receiveShadow = true;
plano.rotation.x = THREE.MathUtils.degToRad(-90);
//scene.add(plano)
const assetLoader = new GLTFLoader();
const vacaLoader = new GLTFLoader();
const cavaloLoader = new GLTFLoader();

let mixerVaca: THREE.AnimationMixer;

let mixerCavalo: THREE.AnimationMixer;
vacaLoader.load("assets/modelos/animais/Cow.gltf", function (gltf) {
  const vaca = gltf.scene;
  vaca.position.y = -1.2;
  mixerVaca = new THREE.AnimationMixer(vaca);

  vaca.traverse(function (node) {
    // @ts-ignore
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
  const clips: THREE.AnimationClip[] = gltf.animations;
  const clip: THREE.AnimationClip = THREE.AnimationClip.findByName(
    clips,
    "Eating"
  );

  const action = mixerVaca.clipAction(clip);
  action.play();
  scene.add(vaca);
});

cavaloLoader.load("assets/modelos/animais/Horse.gltf", function (gltf) {
  const cavalo = gltf.scene;
  cavalo.position.y = -1.5;
  cavalo.position.x = 10;
  cavalo.position.z = 10;
  cavalo.rotation.y = 190;
  mixerCavalo = new THREE.AnimationMixer(cavalo);

  cavalo.traverse(function (node) {
    // @ts-ignore
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
  const clips: THREE.AnimationClip[] = gltf.animations;
  const clip: THREE.AnimationClip = THREE.AnimationClip.findByName(
    clips,
    "Idle_2"
  );

  const action = mixerCavalo.clipAction(clip);
  action.play();


  const lightVaca = new THREE.DirectionalLight(0xffffbb, 0.5);
  lightVaca.position.set(30, 200, 30);

  lightVaca.castShadow = true;

  scene.add(lightVaca);
  lightVaca.target = cavalo;
  scene.add(cavalo);
});

assetLoader.load("assets/modelos/farm/scene.gltf", function (gltf) {
  const model = gltf.scene;

  model.traverse(function (node) {
    // @ts-ignore
    if (node.isMesh) {
      node.receiveShadow = true;
    }
  });

  const lightVaca = new THREE.DirectionalLight(0xffffbb, 0.5);
  lightVaca.position.set(30, 200, 30);

  lightVaca.castShadow = true;

  scene.add(lightVaca);
  lightVaca.target = model;
  scene.add(model);
});

const x3 = new THREEx3(
  {
    THREE,
    OrbitControls,
    camera,
    renderer,
    scene,
  },
  {
    grid: { visible: false },
    axes: { visible: false },
  }
);
//x3.add(lightVaca, { label: "Luz", helper: { visible: false } });
x3.add(camera);

const clock: THREE.Clock = new THREE.Clock();
const clockCavalo: THREE.Clock = new THREE.Clock();
function animate() {
  if (mixerVaca) {
    mixerVaca.update(clock.getDelta());
  }
  if (mixerCavalo) {
    mixerCavalo.update(clockCavalo.getDelta());
  }
  x3.tick();

  x3.fps(() => {
    renderer.render(scene, camera);
  });
}

renderer.setAnimationLoop(animate);
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.physicallyCorrectLights = true;
