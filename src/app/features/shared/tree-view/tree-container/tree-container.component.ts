import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-tree-container',
  templateUrl: './tree-container.component.html',
  styleUrls: ['./tree-container.component.scss']
})
export class TreeContainerComponent implements OnInit {
  @Output() public applyData: EventEmitter<any> = new EventEmitter<any>();
  @Output() public editData: EventEmitter<any> = new EventEmitter<any>();
  @Output() public deleteData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public treeData: Array<any>;

  constructor() { }

  ngOnInit(): void {
  }

  public applyNode(data: any): void {
    this.applyData.emit(data);
  }

  public editNode(data: any): void {
    this.editData.emit(data);
  }

  public deleteNode(data: any): void {
    this.deleteData.emit(data);
  }

}
