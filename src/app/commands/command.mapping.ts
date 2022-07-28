import type BaseEntity from '../entities/base.entity';
import type LevelBase from '../levels/base';
import { BlockType } from '../utils/block';

/**
 * Moves a given entity forward in the level.
 *
 * @param {LevelBase} level - The level in which the entity is moving.
 * @param {BaseEntity} entity - The entity to move.
 * @param {Function} finishCallback - The function to call when the movement has completed.
 */
export const moveForward = (level: LevelBase, entity: BaseEntity, finishCallback) => {
  const forwardPosition = level.getMoveForwardPosition(entity);
  if (level.canMoveForward(entity)) {
    entity.doMoveForward(forwardPosition, finishCallback);
  } else {
    entity.doBump(forwardPosition, finishCallback);
  }
};

/**
 * Makes a given entity turn right.
 *
 * @param {BaseEntity} entity - The entity to turn.
 * @param {Function} finishCallback - The function to call when the turn has completed.
 */
export const turnRight = (entity: BaseEntity, finishCallback) => {
  entity.doTurnRight(finishCallback);
};

/**
 * Makes a given entity turn left.
 *
 * @param {BaseEntity} entity - The entity to turn.
 * @param {Function} finishCallback - The function to call when the turn has completed.
 */
export const turnLeft = (entity: BaseEntity, finishCallback) => {
  entity.doTurnLeft(finishCallback);
};

/**
 * Checks if a water block is ahead of the entity.
 *
 * @param {LevelBase} level - The level in which the entity is located.
 * @param {BaseEntity} entity - The entity to check.
 * @param {Function} finishCallback - The function to call when the check has completed.
 */
export const isWater = (level: LevelBase, entity: BaseEntity, finishCallback) => {
  const forwardPosition = level.getMoveForwardPosition(entity);
  const result = level.isPositionOfType(forwardPosition, BlockType.water);
  entity.setResultAnimation(result, finishCallback);
  return result;
};

/**
 * Checks if a lava block is ahead of the entity.
 *
 * @param {LevelBase} level - The level in which the entity is located.
 * @param {BaseEntity} entity - The entity to check.
 * @param {Function} finishCallback - The function to call when the check has completed.
 */
export const isLava = (level: LevelBase, entity: BaseEntity, finishCallback) => {
  const forwardPosition = level.getMoveForwardPosition(entity);
  const result = level.isPositionOfType(forwardPosition, BlockType.lava);
  entity.setResultAnimation(result, finishCallback);
  return result;
};

/**
 * Checks if any entity is ahead of the entity.
 *
 * @param {LevelBase} level - The level in which the entity is located.
 * @param {BaseEntity} entity - The entity to check.
 * @param {Function} finishCallback - The function to call when the check has completed.
 */
export const isObject = (level: LevelBase, entity: BaseEntity, finishCallback) => {
  const forwardPosition = level.getMoveForwardPosition(entity);
  const result = level.isPositionOccupied(forwardPosition);
  entity.setResultAnimation(result, finishCallback, true);
  return result;
};

/**
 * Checks if not any entity is ahead of the entity.
 *
 * @param {LevelBase} level - The level in which the entity is located.
 * @param {BaseEntity} entity - The entity to check.
 * @param {Function} finishCallback - The function to call when the check has completed.
 */
export const isEmpty = (level: LevelBase, entity: BaseEntity, finishCallback) => {
  const forwardPosition = level.getMoveForwardPosition(entity);
  const forwardEntity = level.getGridEntityByPosition(forwardPosition);
  const result = forwardEntity == null || !forwardEntity.willCollide(forwardPosition);
  entity.setResultAnimation(result, finishCallback);
  return result;
};

/**
 * Checks if a block is ahead and on the same or higher level than the entity.
 *
 * @param {LevelBase} level - The level in which the entity is located.
 * @param {BaseEntity} entity - The entity to check.
 * @param {Function} finishCallback - The function to call when the check has completed.
 */
export const isWall = (level: LevelBase, entity: BaseEntity, finishCallback) => {
  const currentPosition = entity.getInGamePosition();
  const forwardPosition = level.getMoveForwardPosition(entity);
  const result = !level.isPositionOnSameOrLowerLevel(currentPosition, forwardPosition);
  entity.setResultAnimation(result, finishCallback);
  return result;
};

/**
 * Checks if a star is ahead of the entity.
 *
 * @param {LevelBase} level - The level in which the entity is located.
 * @param {BaseEntity} entity - The entity to check.
 * @param {Function} finishCallback - The function to call when the check has completed.
 */
export const isStar = (level: LevelBase, entity: BaseEntity, finishCallback) => {
  const forwardPosition = level.getMoveForwardPosition(entity);
  const result = level.isSuccessPosition(forwardPosition);
  entity.setResultAnimation(result, finishCallback);
  return result;
};

/**
 * Checks whether the entity has collected a star.
 *
 * @param {LevelBase} level - The level in which the entity is located.
 * @param {BaseEntity} entity - The entity to check.
 * @param {Function} finishCallback - The function to call when the check has completed.
 */
export const hasStar = (level: LevelBase, entity: BaseEntity, finishCallback) => {
  const currentPosition = entity.getInGamePosition();
  const result = level.isSuccessPosition(currentPosition);
  entity.setResultAnimation(result, finishCallback);
  return result;
};
