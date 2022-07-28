import { ExtendedObject3D, THREE } from '@enable3d/phaser-extension';
import Matter from 'matter-js';
import type GameScene from '../../utils/game.scene';
import type BlocklyInstructor from './instructor';
import { Setting } from '../../utils/settings';
import { AnimationKey } from '../../utils/animate';

/**
 * A view that represents the handle of an instructor. It can be dragged to move the instructor around the screen. It views a preview of the instructor's robot and animates it accordingly.
 * @class InstructorDragHandle
 * @extends Phaser.Physics.Matter.Image
 */
export default class InstructorDragHandle extends Phaser.Physics.Matter.Image {
  scene: GameScene;

  preview: THREE.Group;

  previewAnims: any;

  public instructor: BlocklyInstructor;

  isMoving = false;

  isRotating = false;

  initialX = 0;

  initialY = 0;

  dropedCallback: () => void;

  currentDragStartTime = 0;

  private isDragging = false;

  constructor(instructor: BlocklyInstructor, x: number, y: number, color: number) {
    super(instructor.scene.matter.world, x, y, 'robotcircle', null, {
      circleRadius: 100,
      frictionAir: 0.1,
      friction: 0.2,
      restitution: 0.5,
      chamfer: 1,
    });

    this.instructor = instructor;
    this.setTint(color).setAlpha(0.5).setBounce(0.5);
    this.initialX = x;
    this.initialY = y;
    Matter.Body.setInertia(this.body as any as Matter.Body, Infinity);
    // do not rotate when colliding
    this.setInteractive({ draggable: true });
    this.addPlayerPreview(color);

    this.scene.rexUI.add.drag(this);
    this.on('dragstart', (_pointer) => this.dragstart(), this);
    this.on('drag', () => this.drag(), this);
    this.on('dragend', (pointer, _dragX, _dragY, dropped) => this.dragend(pointer, dropped), this);

    instructor.scene.add.existing(this);
  }

  public update(_time, _delta): void {
    if (this.isMoving && !this.isDragging && Math.abs(this.body.velocity.x) <= 0.1 && Math.abs(this.body.velocity.y) <= 0.1) {
      this.isMoving = false;
    }

    if (this.preview) {
      const dx = (this.x / this.scene.cameras.main.width) * 2 - 1;
      const dy = -(this.y / this.scene.cameras.main.height) * 2 + 1;
      const position: THREE.Vector3 = this.scene.third.transform.from2dto3d(dx, dy, 10);
      const camera = this.scene.third.camera as THREE.OrthographicCamera;
      const zoomFactor = (camera.top - camera.bottom) / camera.zoom;

      if (position) {
        this.preview.position.set(position.x, position.y, position.z);
        this.preview.quaternion.copy(camera.quaternion);
        this.preview.rotation.z = -Phaser.Math.Angle.Normalize(this.rotation);
        this.preview.scale.set(1, 1, 1).multiplyScalar(zoomFactor * 0.015);
      }
    }
  }

  /**
   * Reset the player drag handle to the initial state.
   */
  public reset() {
    this.previewAnims.play(AnimationKey.IDLE, 0, true);
  }

  /**
   * Destroys the object and removes it from the scene.
   *
   * @param {boolean} [_fromScene=false] - Indicates whether the object is being destroyed as part of the scene destruction.
   * @returns {void}
   */
  destroy(_fromScene?: boolean): void {
    this.preview.visible = false;
    this.scene.third.scene.remove(this.preview);
    super.destroy();
  }

  private dragstart() {
    this.currentDragStartTime = Date.now();
    this.isMoving = true;
    this.isDragging = true;
  }

  private dragend(pointer: Phaser.Input.Pointer, dropped) {
    let shouldDamp = true;
    if (this.x < 100) {
      this.x = 50;
      shouldDamp = false;
    } else if (this.x > this.scene.cameras.main.width - 100) {
      this.x = this.scene.cameras.main.width - 50;
      shouldDamp = false;
    }
    if (this.y < 100) {
      this.y = 50;
      shouldDamp = false;
    } else if (this.y > this.scene.cameras.main.height - 100) {
      this.y = this.scene.cameras.main.height - 50;
      shouldDamp = false;
    }
    if (dropped) {
      shouldDamp = false;
    }
    if (shouldDamp && Date.now() - this.currentDragStartTime > 125) {
      const maxVelocity = 150;
      const minVelocity = 1;
      let xVelocity = Math.abs(pointer.velocity.x) < minVelocity ? 0 : Math.abs(pointer.velocity.x);
      xVelocity = Math.sign(pointer.velocity.x) * (xVelocity > maxVelocity ? maxVelocity : xVelocity);
      let yVelocity = Math.abs(pointer.velocity.y) <= minVelocity ? 0 : Math.abs(pointer.velocity.y);
      yVelocity = Math.sign(pointer.velocity.y) * (yVelocity > maxVelocity ? maxVelocity : yVelocity);
      this.setVelocity(xVelocity, yVelocity);
    }
    this.isDragging = false;
    this.isRotating = false;
  }

  private drag() {
    const pointers: any[] = [];
    this.scene.game.input.pointers
      .filter((pointer) => pointer.active)
      .every((pointer) => {
        if (Phaser.Geom.Rectangle.Overlaps(this.getBounds(), new Phaser.Geom.Rectangle(pointer.x, pointer.y, 5, 5))) {
          pointers.push(pointer);
          if (pointers.length === 2) {
            // someone is rotating so break the loop
            this.isRotating = true;
            return true;
          }
        }
        return false;
      });
    if (this.isRotating) {
      const p0 = pointers[0].prevPosition;
      const p1 = pointers[0].position;
      const a0 = Phaser.Math.Angle.Between(this.x, this.y, p0.x, p0.y);
      const a1 = Phaser.Math.Angle.Between(this.x, this.y, p1.x, p1.y);
      const deltaRotation = Phaser.Math.Angle.Wrap(a1 - a0);
      this.rotation += deltaRotation;
    }
  }

  private async addPlayerPreview(color: number) {
    const mesh = new ExtendedObject3D();
    await this.scene.third.load.gltf('robot').then((gltf) => {
      mesh.add(gltf.scene);

      mesh.traverse((child) => {
        if (child.isMesh) {
          if (child.name.toLowerCase().indexOf('head_3') >= 0) {
            child.material = new THREE.MeshLambertMaterial({ color });
          } else if (
            child.name.toLowerCase().indexOf('torso_3') >= 0 ||
            child.name.toLowerCase().indexOf('lowerlegr_1') >= 0 ||
            child.name.toLowerCase().indexOf('lowerlegl_1') >= 0 ||
            child.name.toLowerCase().indexOf('shoulderl_1') >= 0 ||
            child.name.toLowerCase().indexOf('shoulderr_1') >= 0 ||
            child.name.toLowerCase().indexOf('armr') >= 0 ||
            child.name.toLowerCase().indexOf('arml') >= 0 ||
            child.name.toLowerCase().indexOf('handr_1') >= 0 ||
            child.name.toLowerCase().indexOf('handl_1') >= 0 ||
            child.name.toLowerCase().indexOf('_') < 0
          ) {
            child.material = new THREE.MeshLambertMaterial({ color: this.scene.getSetting(Setting.bodyColor) });
          }
        }
      });

      // animations
      this.scene.third.animationMixers.add(mesh.anims.mixer);
      gltf.animations.forEach((animation) => {
        mesh.anims.add(animation.name, animation);
      });
      mesh.anims.play(AnimationKey.IDLE);
      this.scene.time.delayedCall(Math.random() * 2000, () => mesh.anims.play(AnimationKey.WAVE));
      return mesh;
    });
    this.preview = new THREE.Group();
    this.previewAnims = mesh.anims;
    this.preview.add(mesh);
    this.preview.position.set(100, 0, 100);
    mesh.position.set(0, -2.1, 0);
    this.preview.rotation.order = 'YXZ';
    this.scene.third.add.existing(this.preview);
  }
}
