import { KeyDisplay } from "./utils";
import { CharacterControls } from "./characterControls";
import * as THREE from "three";
// @ts-ignore
import THREEx3 from "three-x3";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 15;
orbitControls.enablePan = false;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
orbitControls.update();

// LIGHTS
light();

// FLOOR

// MODEL WITH ANIMATIONS
let characterControls: CharacterControls;
new GLTFLoader().load("models/Farmer.gltf", function (gltf) {
  const model = gltf.scene;
  model.position.x = -7
  model.traverse(function (object: any) {
    if (object.isMesh) object.castShadow = true;
  });
  scene.add(model);

  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });

  characterControls = new CharacterControls(
    model,
    mixer,
    animationsMap,
    orbitControls,
    camera,
    "Idle"
  );
});

// MODEL FARM
let mixerFazenda: THREE.AnimationMixer;
new GLTFLoader().load("models/scene.gltf", function (gltf) {
  const model = gltf.scene;
  model.scale.set(0.8, 0.8, 0.8);
  model.position.y = -0.2;
  model.traverse(function (object: any) {
    if (object.isMesh) object.receiveShadow = true;
  });
  scene.add(model);


   mixerFazenda = new THREE.AnimationMixer(model);
   const clips: THREE.AnimationClip[] = gltf.animations;
   const clip: THREE.AnimationClip = THREE.AnimationClip.findByName(
     clips,
     "prop|Cylinder.001Action"
   );

   const action = mixerFazenda.clipAction(clip);
   action.play();
});

// MODEL COW
let mixerVaca: THREE.AnimationMixer;
new GLTFLoader().load("models/Cow.gltf", function (gltf) {
  const model = gltf.scene;
  model.scale.set(0.3, 0.3, 0.3);
    model.position.x = -6;
    model.position.z = 5;

  model.traverse(function (object: any) {
    if (object.isMesh) object.castShadow = true;
  });

  mixerVaca = new THREE.AnimationMixer(model);
  const clips: THREE.AnimationClip[] = gltf.animations;
  const clip: THREE.AnimationClip = THREE.AnimationClip.findByName(
    clips,
    "Eating"
  );

  const action = mixerVaca.clipAction(clip);
  action.play();

  scene.add(model);
});

// MODEL HORSE
let mixerCavalo: THREE.AnimationMixer;
new GLTFLoader().load("models/Horse_White.gltf", function (gltf) {
  const model = gltf.scene;
  model.scale.set(0.37, 0.37, 0.37);
  model.rotation.y = 30;
  model.position.x = -6;
  model.position.z = 1;
  model.traverse(function (object: any) {
    if (object.isMesh) object.castShadow = true;
  });

  mixerCavalo = new THREE.AnimationMixer(model);
  const clips: THREE.AnimationClip[] = gltf.animations;
  const clip: THREE.AnimationClip = THREE.AnimationClip.findByName(
    clips,
    "Idle"
  );

  const action = mixerCavalo.clipAction(clip);
  action.play();

  scene.add(model);
});

// MODEL DONKEY

let mixerBurro: THREE.AnimationMixer;
new GLTFLoader().load("models/Donkey.gltf", function (gltf) {
  const model = gltf.scene;

  model.scale.set(0.37, 0.37, 0.37);
  model.rotation.y = -30;
  model.position.x = -4;
  model.position.z = 8;

  model.traverse(function (object: any) {
    if (object.isMesh) object.castShadow = true;
  });
  scene.add(model);

  mixerBurro = new THREE.AnimationMixer(model);
  const clips: THREE.AnimationClip[] = gltf.animations;
  const clip: THREE.AnimationClip = THREE.AnimationClip.findByName(
    clips,
    "Idle_2"
  );

  const action = mixerBurro.clipAction(clip);
  action.play();
});

// CONTROL KEYS
const keysPressed = {};
const keyDisplayQueue = new KeyDisplay();
document.addEventListener(
  "keydown",
  (event) => {
    keyDisplayQueue.down(event.key);
    if (event.shiftKey && characterControls) {
      characterControls.switchRunToggle();
    } else {
      (keysPressed as any)[event.key.toLowerCase()] = true;
    }
  },
  false
);
document.addEventListener(
  "keyup",
  (event) => {
    keyDisplayQueue.up(event.key);
    (keysPressed as any)[event.key.toLowerCase()] = false;
  },
  false
);

const clock = new THREE.Clock();
const clockVaca: THREE.Clock = new THREE.Clock();
const clockCavalo: THREE.Clock = new THREE.Clock();
const clockBurro: THREE.Clock = new THREE.Clock();
const clockFazenda: THREE.Clock = new THREE.Clock();
// ANIMATE
function animate() {
  let mixerUpdateDelta = clock.getDelta();
  if (characterControls) {
    characterControls.update(mixerUpdateDelta, keysPressed);
  }
  if (mixerVaca) {
    mixerVaca.update(clockVaca.getDelta());
  }
  if (mixerCavalo) {
    mixerCavalo.update(clockCavalo.getDelta());
  }
  if (mixerBurro) {
    mixerBurro.update(clockBurro.getDelta());
  }
  if (mixerFazenda) {
    mixerFazenda.update(clockFazenda.getDelta());
  }
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

document.body.appendChild(renderer.domElement);
animate();

// DEBUG

//x3.add(lightVaca, { label: "Luz", helper: { visible: false } });
//x3.add(camera);

// RESIZE HANDLER
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  keyDisplayQueue.updatePosition();
}
window.addEventListener("resize", onWindowResize);

function light() {
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 0.7));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-60, 100, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  scene.add(dirLight);
  // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}
