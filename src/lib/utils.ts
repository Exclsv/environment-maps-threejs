import { Mesh, MeshStandardMaterial, Scene } from 'three'

export const updateAllMaterials = (scene: Scene) => {
  /*
    The traverse method in Three.js is a powerful utility function that allows you to iterate
    through all objects in a scene graph, including the scene itself and all of its descendants
    (children, grandchildren, etc.). 
  */
  scene.traverse(node => {
    if (node instanceof Mesh && node.material instanceof MeshStandardMaterial) {
      console.log(node)
      // ! Now use only environmentIntensity to set the intensity of the environment map for the scene
      scene.environmentIntensity = 10

      // ! node.material.envMapIntensity = 10 - Will not work anymore

      // & LINK: https://github.com/mrdoob/three.js/pull/27903
    }
  })
}
