import { ArrayDataSource } from '@angular/cdk/collections';
import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { NestedTreeControl, FlatTreeControl } from '@angular/cdk/tree';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';
import { MatTreeNestedDataSource, MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';

interface FoodNode {
  id: number,
  uuid: string,
  organisation_id: number,
  parent_id: number,
  name: string,
  status: number;
  children?: FoodNode[];
}
class FoodFlatNode {
  id: number;
  uuid: string;
  organisation_id: number;
  parent_id: number;
  name: string;
  status: number;
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-channel-form',
  templateUrl: './channel-form.component.html',
  styleUrls: ['./channel-form.component.scss']
})
export class ChannelFormComponent implements OnInit {
  showForm = false;
  treeControl: FlatTreeControl<FoodFlatNode>;
  dataSource = new MatTreeNestedDataSource<FoodNode>();
  nestedNodeMap = new Map<FoodNode, FoodFlatNode>();
  flatNodeMap = new Map<FoodFlatNode, FoodNode>();
  treeFlattener: MatTreeFlattener<FoodNode, FoodFlatNode>;
  getLevel = (node: FoodFlatNode) => node.level;
  isExpandable = (node: FoodFlatNode) => node.expandable;
  getChildren = (node: FoodNode): FoodNode[] => node.children;
  transformer = (node: FoodNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.id === node.id
      ? existingNode
      : new FoodFlatNode();
    flatNode.id = node.id;
    flatNode.name = node.name
    flatNode.level = level;
    flatNode.parent_id = node.parent_id;
    flatNode.uuid = node.uuid;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  channels: any[];
  public channelFormGroup: FormGroup;
  // public channelCodeFormControl: FormControl;
  public channelNameFormControl: FormControl;
  public parentIdFormControl: FormControl;
  public formType: string;
  private uuid: string;
  public isEdit: boolean;
  private channelData: any;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private dialog: MatDialog;
  private subscriptions: Subscription[] = [];
  private dialogRef: MatDialogRef<ChannelFormComponent>
  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    dialog: MatDialog,
    dialogRef: MatDialogRef<ChannelFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    Object.assign(this, { apiService, dataEditor, dialog, dialogRef });

    this.treeControl = new FlatTreeControl<FoodFlatNode>(this.getLevel, this.isExpandable);
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    apiService.getAllChannels().subscribe(data => {
      this.dataSource.data = data.data;
    });
  }
  hasChild = (_: number, _nodeData: FoodFlatNode) => _nodeData.expandable;
  ngOnInit() {
    this.channelNameFormControl = new FormControl('', [Validators.required]);
    this.parentIdFormControl = new FormControl();

    this.channelFormGroup = new FormGroup({
      parentId: this.parentIdFormControl,
      channelName: this.channelNameFormControl
    });

    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      const data: any = result.data;
      if (data && data.uuid) {
        this.parentIdFormControl.setValue(data.parent_id);
        this.channelNameFormControl.setValue(data.name);
        // this.categoryFormControl.setValue(data.van_category_id);
        this.channelData = data;
        this.isEdit = true;
      }
      return;
    }));

  }
  ngAfterViewInit() {
  }
  applyChannel(node) {
    this.dialogRef.close({ data: { node: node, dataSource: this.dataSource } });
  }
  editChannel(node) {
    this.showForm = true;
    this.isEdit = true;
    this.uuid = node.uuid;
    this.channelFormGroup.get('channelName').setValue(node.name)
    if (node.level > 0) {
      this.channelFormGroup.get('parentId').setValue(node.parent_id)
    }
    //console.log(node);

  }
  addChannel() {
    this.showForm = true;
    this.isEdit = false;
    this.channelFormGroup.reset();
  }

  counter(i: number) {
    return new Array(i);
  }
  public saveChannelData(): void {
    if (this.channelFormGroup.invalid) {
      Object.keys(this.channelFormGroup.controls).forEach(key => {
        this.channelFormGroup.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEdit) {
      this.editChannelData();

      return;
    }

    this.postChannelData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postChannelData(): void {
    //console.log(this.channelFormGroup.value);
    this.apiService.addChannel({
      parent_id: this.parentIdFormControl.value,
      name: this.channelNameFormControl.value,
      status: "1"
    }).subscribe((result: any) => {
      this.showForm = false;
      this.apiService.getAllChannels().subscribe(data => {
        this.dataSource.data = data.data;
      });
    }, err => {
      alert(err.error.message);
    });
  }

  private editChannelData(): void {
    this.apiService.editChannel(this.uuid, {
      parent_id: this.parentIdFormControl.value,
      name: this.channelNameFormControl.value,
      status: "1"
    }).subscribe((result: any) => {
      this.isEdit = false;
      this.showForm = false;
      this.apiService.getAllChannels().subscribe(data => {
        this.dataSource.data = data.data;
      });
    }, err => {
      alert(err.error.message);
    });
  }
  deleteChannel(uuid): void {
    this.apiService.deleteChannel(uuid).subscribe((res) => {
      this.apiService.getAllChannels().subscribe(data => {
        this.dataSource.data = data.data;
      })
    })
  }
}