import type BaseEntity from '../entities/base.entity';
import FenceEntity from '../entities/fence.entity';
import MovingEntity from '../entities/moving.entity';
import TreeEntity from '../entities/tree.entity';
import type LevelBase from '../levels/base';
import { EntityType } from '../levels/entity';

/**
 * Represents a definition for a game entity.
 * @class EntityDefinition
 */
export class EntityDefinition {
  /**
   * The type of the entity.
   *
   * @type {string}
   */
  type: string;

  /**
   * The position of the entity.
   *
   * @type {THREE.Vector3}
   */
  position: THREE.Vector3;

  /**
   * The rotation of the entity, in degree.
   *
   * @type {number}
   */
  rotation: number;

  /**
   * Additional properties of the entity.
   *
   * @type {any}
   */
  properties: any;
}

/**
 * Creates a new entity based on a definition.
 *
 * @param {LevelBase} level - The level that the entity belongs to.
 * @param {string} identifier - A unique identifier for the entity.
 * @param {EntityDefinition} entityDefinition - The definition of the entity.
 * @returns {BaseEntity} The newly created entity.
 */
export const createEntity = (level: LevelBase, identifier: string, entityDefinition: EntityDefinition): BaseEntity => {
  let entity = null;
  const properties = { ...entityDefinition.properties };
  switch (entityDefinition.type) {
    case EntityType.tree:
      entity = new TreeEntity(level.scene, identifier, properties);
      break;
    case EntityType.fence:
      entity = new FenceEntity(level.scene, identifier, properties);
      break;
    case EntityType.mover:
      properties.target = properties.target.clone().add(level.mapOffset);
      entity = new MovingEntity(level.scene, identifier, properties);
      break;
    default:
      throw new Error(`No entity with type ${entityDefinition.type}`);
  }
  return entity;
};
