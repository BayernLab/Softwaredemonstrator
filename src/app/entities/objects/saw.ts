import * as THREE from 'three';
import Base3DObject from './base';

/**
 * A 3D object representing a saw.
 * @class SawObject
 * @extends {Base3DObject}
 */
export default class SawObject extends Base3DObject {
  offset = new THREE.Vector3(0, 0, -0.5);

  spawnObject() {
    const svg = this.scene.cache.html.get('saw');
    const shape = this.scene.third.transform.fromSVGtoShape(svg);
    const scale = 100;
    this.mesh = this.scene.third.add.extrude({ shape: shape[0], depth: 5 } as any);
    this.mesh.scale.set(1 / scale, 1 / -scale, 1 / scale);
    this.mesh.castShadow = true;
  }
}
