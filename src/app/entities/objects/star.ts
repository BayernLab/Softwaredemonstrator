import * as THREE from 'three';
import Base3DObject from './base';

/**
 * A 3D object representing a fence.
 * @class StarObject
 * @extends {Base3DObject}
 */
export default class StarObject extends Base3DObject {
  offset = new THREE.Vector3(0, 0.5, 0);

  spawnObject() {
    const svg = this.scene.cache.html.get('star');
    const shape = this.scene.third.transform.fromSVGtoShape(svg);
    const scale = this.blockSegments === 1 ? 950 : 1300;
    this.mesh = this.scene.third.add.extrude({ shape: shape[0], depth: 100 } as any, { basic: { color: 0xffd851 } });
    this.mesh.scale.set(1 / scale, 1 / -scale, 1 / scale);
    // (this.mesh.material as any).color.setHex(0xffd851);
    this.mesh.castShadow = true;
  }
}
