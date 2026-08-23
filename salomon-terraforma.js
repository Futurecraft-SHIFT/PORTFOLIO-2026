import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const mount = document.getElementById('salomonTerraformaScene');

if (mount && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
  renderer.setClearColor(0xf8f6f1, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mount.appendChild(renderer.domElement);

  camera.position.set(0, .1, 8.6);
  const world = new THREE.Group();
  scene.add(world);
  const hemi = new THREE.HemisphereLight(0xfff6e8, 0x5d2c1d, 2.45);
  const key = new THREE.DirectionalLight(0xffe0c6, 4.2);
  key.position.set(3.4, 5.8, 6);
  const rim = new THREE.DirectionalLight(0xb65b3b, 2.25);
  rim.position.set(-5, 1.2, -2);
  scene.add(hemi, key, rim);

  const mixer = new THREE.AnimationMixer(world);
  const objects = {};
  const loader = new GLTFLoader();
  const normalise = (model, size, position, rotation) => {
    const box = new THREE.Box3().setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    const largest = Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);
    model.position.sub(centre);
    model.scale.setScalar(size / largest);
    model.position.add(position);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
    model.traverse((child) => {
      if (child.isMesh) { child.castShadow = false; child.receiveShadow = false; }
    });
  };
  const load = (keyName, url, size, position, rotation) => loader.load(url, (gltf) => {
    const model = gltf.scene;
    normalise(model, size, position, rotation);
    objects[keyName] = model;
    world.add(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip, model).play());
  });

  load('terrain', 'assets/salomon-terraforma-s.glb', 7.3, new THREE.Vector3(0, -.25, -.75), new THREE.Euler(0, 0, 0));
  load('arch', 'assets/salomon-terraforma-arch.glb', 7.8, new THREE.Vector3(0, -.18, -.35), new THREE.Euler(0, 0, 0));
  load('sneaker', 'assets/salomon-terraforma-sneaker.glb', 3.25, new THREE.Vector3(.35, .1, 1.4), new THREE.Euler(.05, -.48, .04));
  load('wordmark', 'assets/salomon-wordmark.glb', 2.5, new THREE.Vector3(.1, -.2, .92), new THREE.Euler(0, 0, 0));

  const clock = new THREE.Clock();
  const resize = () => {
    const { width, height } = mount.getBoundingClientRect();
    camera.aspect = width / height;
    camera.position.z = width < 760 ? 10.1 : 8.6;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  new ResizeObserver(resize).observe(mount);
  resize();

  let inView = true;
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: .04 }).observe(mount);
  const render = () => {
    requestAnimationFrame(render);
    if (!inView) return;
    const elapsed = clock.getElapsedTime();
    const delta = clock.getDelta();
    mixer.update(delta);
    world.rotation.y = Math.sin(elapsed * .16) * .085;
    world.rotation.x = Math.sin(elapsed * .11) * .025;
    if (objects.sneaker) {
      objects.sneaker.rotation.y += delta * .36;
      objects.sneaker.position.y = .1 + Math.sin(elapsed * .75) * .14;
    }
    if (objects.wordmark) objects.wordmark.position.y = -.2 + Math.sin(elapsed * .75 + .9) * .025;
    camera.position.x = Math.sin(elapsed * .12) * .12;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  render();
}
