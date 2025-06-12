import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { RouteItemGrouping } from '../route-groupdt/route-groupdt.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from '../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-route-group-detail',
  templateUrl: './route-group-detail.component.html',
  styleUrls: ['./route-group-detail.component.scss'],
})
export class RouteGroupDetailComponent extends BaseComponent
  implements OnChanges {
  @Input() routeItemGroup: RouteItemGrouping;
  @Input() isDetailVisible: boolean;
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  itemMatchRoute: any[] = [];
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();

  itemFormGroup: FormGroup;
  itemsFormControl: FormControl;
  itemSource: any;
  public displayedColumns = ['itemCode', 'itemName'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  initialised: boolean = false;
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  constructor(
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService
  ) {
    super('Route Item Grouping');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit() {
    this.itemsFormControl = new FormControl([]);
    this.itemFormGroup = new FormGroup({
      items: this.itemsFormControl,
    });
    if (this.routeItemGroup !== null || this.routeItemGroup !== undefined) {
      this.setItemValues();
      if (this.itemSource !== null || this.itemSource !== undefined) {
        this.initialised = true;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialised && changes) {
      if (changes.routeItemGroup) {
        let currentValue = changes.routeItemGroup.currentValue;
        this.routeItemGroup = currentValue;
        this.setItemValues();
      }
    }
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  public setItemValues(): void {
    let itemData = [];
    if (this.routeItemGroup.route_item_grouping_details.length) {
      this.routeItemGroup.route_item_grouping_details.forEach((item, i) => {
        itemData.push({
          item_id: item.item_id,
          item_code: item.item.item_code,
          item_name: item.item.item_name,
        });
      });
      if (itemData.length) {
        this.itemsFormControl.setValue(itemData);
        this.itemSource = new MatTableDataSource<any>(
          this.itemsFormControl.value
        );
        this.itemSource.paginator = this.paginator;
      }
    }
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditRouteGroupItem(): void {
    this.formDrawer.setFormName('routeItemGroup');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.routeItemGroup,
    });
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.routeItemGroup.name}?`,
          hasConfirmed: false,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteRouteGroupItem();
        }
      });
  }

  private deleteRouteGroupItem(): void {
    let delObj = { uuid: this.routeItemGroup.uuid, delete: true };
    this.apiService
      .deleteRouteItemGroup(this.routeItemGroup.uuid)
      .subscribe((result) => {
        this.commonToasterService.showInfo(
          'Deleted',
          'Sucessfully Deleted Route Item Group'
        );
        this.closeDetailView();
        this.updateTableData.emit(delObj);
      });
  }
}
