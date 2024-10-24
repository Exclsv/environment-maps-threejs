import * as THREE from 'three'
import { setupScene } from './setup-scene'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
// import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
// import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'

// * Setup
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })
const gui = new GUI()
const global = {
  environmentIntensity: 1,
  backgroundBlurriness: 0,
  backgroundIntensity: 1,
}
gui
  .add(global, 'environmentIntensity', 0, 10)
  .min(0)
  .max(10)
  .step(0.01)
  .name('Environment Intensity')
  .onChange(() => {
    scene.environmentIntensity = global.environmentIntensity
  })
gui
  .add(global, 'backgroundBlurriness', 0, 1)
  .min(0)
  .max(1)
  .step(0.01)
  .name('Background Blurriness')
  .onChange(() => {
    scene.backgroundBlurriness = global.backgroundBlurriness
  })
gui
  .add(global, 'backgroundIntensity', 0, 10)
  .min(0)
  .max(10)
  .step(0.01)
  .name('Background Intensity')
  .onChange(() => {
    scene.backgroundIntensity = global.backgroundIntensity
  })

// * GLTF Loader
const gltfLoader = new GLTFLoader()
gltfLoader.setPath('models/')

// * LDR Cube Map
// const textureLoader = new THREE.CubeTextureLoader()
// textureLoader.setPath('environmentMaps/0/')
// const environmentMap = textureLoader.load([
//   'px.png',
//   'nx.png',
//   'py.png',
//   'ny.png',
//   'pz.png',
//   'nz.png',
// ])

// scene.background = environmentMap
// scene.environment = environmentMap

// * HDR Map
// const rgbeLoader = new RGBELoader()
// rgbeLoader.setPath('environmentMaps/')
// rgbeLoader.load('blender-2k.hdr', environment => {
//   /*
//     ^ environment.mapping:
//     This property determines how the environment texture
//     will be mapped/projected in 3D space.

//     ^ THREE.EquirectangularReflectionMapping:
//     This is a constant that specifies the mapping type.
//     Equirectangular mapping is used for converting a 2D panoramic image (like an HDR environment map)
//     into a format that can be used for:
//     - Scene backgrounds
//     - Environment reflections
//     - Image-based lighting

//     An equirectangular projection is like unwrapping a sphere onto a rectangular image, where:
//     - The horizontal axis represents 360 degrees of longitude
//     - The vertical axis represents 180 degrees of latitude
//   */

//   environment.mapping = THREE.EquirectangularReflectionMapping
//   scene.environment = environment
//   // scene.background = environment
// })

// * EXRLoader (HDRI)
// const exrLoader = new EXRLoader()
// exrLoader.setPath('environmentMaps/')
// exrLoader.load('nvidiaCanvas-4k.exr', environment => {
//   environment.mapping = THREE.EquirectangularReflectionMapping

//   scene.environment = environment
//   scene.background = environment
// })

// * LDR Equirectangular (Texture Loader)
// const textureLoader = new THREE.TextureLoader()
// textureLoader.setPath('environmentMaps/blockadesLabsSkybox/')
// const environmentMap = textureLoader.load(
//   'interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg'
// )
// environmentMap.mapping = THREE.EquirectangularReflectionMapping
// environmentMap.colorSpace = THREE.SRGBColorSpace

// scene.environment = environmentMap
// scene.background = environmentMap

// * Ground Projected skybox
// const rgbeLoader = new RGBELoader()
// rgbeLoader.setPath('environmentMaps/2/')
// rgbeLoader.load('2k.hdr', environment => {
//   environment.mapping = THREE.EquirectangularReflectionMapping
//   scene.environment = environment

//   // Skybox
//   const skybox = new GroundedSkybox(environment, 15, 70)
//   // skybox.material.wireframe = true
//   skybox.position.y = 15
//   scene.add(skybox)
// })

// * Real Time Environment Map
const textureLoader = new THREE.TextureLoader()
textureLoader.setPath('environmentMaps/blockadesLabsSkybox/')
const environmentMap = textureLoader.load(
  'interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg'
)
environmentMap.mapping = THREE.EquirectangularReflectionMapping
environmentMap.colorSpace = THREE.SRGBColorSpace
scene.background = environmentMap

scene.environmentIntensity = 1
scene.backgroundBlurriness = 0
scene.backgroundIntensity = 1

// * Holy Donut
const holyDonut = new THREE.Mesh(
  new THREE.TorusGeometry(8, 0.5),
  new THREE.MeshBasicMaterial({
    color: new THREE.Color(10, 4, 2),
  })
)
holyDonut.layers.enable(1)
holyDonut.position.y = 3.5
scene.add(holyDonut)

// * Cube Render Target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  type: THREE.HalfFloatType,
})
scene.environment = cubeRenderTarget.texture

// * Cube Camera
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget)
cubeCamera.layers.set(1)

// * Meshes
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({
    roughness: 0,
    metalness: 1,
    color: 0xaaaaaa,
  })
)
torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

// * Models
gltfLoader.load('FlightHelmet/glTF/FlightHelmet.gltf', gltf => {
  gltf.scene.scale.set(10, 10, 10)
  scene.add(gltf.scene)
})

// * Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()
  // Real time environment map
  if (holyDonut) {
    holyDonut.rotation.x = Math.sin(elapsedTime) * 2

    cubeCamera.update(renderer, scene)
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
