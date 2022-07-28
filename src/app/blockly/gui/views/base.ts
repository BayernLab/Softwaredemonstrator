import GameUIContainer from '../../../utils/game.container';
import type GameScene from '../../../utils/game.scene';
import type WorkspaceView from '../workspace';

export enum ViewType {
  Category,
  Block,
  LineGroup, // parent of inputs and fields in one line
  Input,
  Field,
  Connection, // block's connection point: output, previous, next
  ConnectionInput, // connecton slengthlot for attaching input block
}

export interface Base {
  viewType: ViewType;
  workspace: WorkspaceView;
}

export interface BaseComposite {
  viewType: ViewType;
  workspace: WorkspaceView;
  parent: BaseComposite;
  compositeChildren: BaseComposite[];

  move(x, y);
  getLeafChildren();
}

export abstract class CompositeContainerView extends GameUIContainer implements BaseComposite {
  workspace: WorkspaceView;

  parent: CompositeContainerView;

  compositeChildren: BaseComposite[] = [];

  viewType: ViewType;

  scene: GameScene;

  hasChild = (): boolean => this.compositeChildren.length > 0;

  pinned: CompositeContainerView;

  /**
  * Add child view to this view, default add at last
  * Iterate through all the next views, and add them as well
  */
  addCompositeChild(childView: BaseComposite) {
    if (this.compositeChildren.indexOf(childView) >= 0) {
      return;
    }

    this.compositeChildren.push(childView);
    childView.parent = this;
  }

  /**
  * Remove child view from this view
  * Iterate through all the next views, and remove them as well
  */
  removeCompositeChild(childView: BaseComposite) {
    if (this.compositeChildren.indexOf(childView) < 0) {
      return;
    }

    const index = this.compositeChildren.indexOf(childView, 0);
    this.compositeChildren.splice(index, 1);
    childView.parent = null;
  }

  getTopmostParent(): CompositeContainerView {
    if (this.parent != null) {
      return this.parent.getTopmostParent();
    }
    return this;
  }

  getLeafChildren(): BaseComposite[] {
    const children: BaseComposite[] = [];
    this.compositeChildren.forEach((child) => {
      if (child.compositeChildren.length > 0) {
        children.push(...child.getLeafChildren());
      } else {
        children.push(child);
      }
    });
    if (children.length === 0) {
      children.push(this);
    }
    return children;
  }

  move(x, y) {
    this.workspace.setChildPosition(this, this.x + x, this.y + y);
    (this.workspace as any).updateChildPosition(this);
    this.compositeChildren.forEach((child) => child.move(x, y));
    if (this.pinned) {
      this.pinned.move(2 * x, 2 * y);
    }
  }

  onDestroy() {
    if (this.parent != null) {
      this.parent.removeCompositeChild(this);
    }
  }
}
