import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tree-node-container',
  templateUrl: './tree-node-container.component.html',
  styleUrls: ['./tree-node-container.component.scss']
})
export class TreeNodeContainerComponent {
  @Output() public applyData: EventEmitter<any> = new EventEmitter<any>();
  @Output() public editData: EventEmitter<any> = new EventEmitter<any>();
  @Output() public deleteData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public nodeData: any;

  public isExpanded = false;

  constructor() { }

  public toggleExpansion(): void {
    if (this.hasChildren) {
      this.isExpanded = !this.isExpanded;
    }
  }

  public get hasChildren(): boolean {
    return Boolean(this.nodeData.children?.length);
  }

  public applyNode(data?: any): void {
    if (data) {
      this.applyData.emit(data);

      return;
    }

    this.applyData.emit(this.nodeData);
  }

  public editNode(data?: any): void {
    if (data) {
      this.editData.emit(data);

      return;
    }


    this.editData.emit(this.nodeData);
  }

  public deleteNode(data?: any): void {
    if (data) {
      this.deleteData.emit(data);

      return;
    }


    this.deleteData.emit(this.nodeData);
  }
}
