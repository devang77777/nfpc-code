import { Subscription, BehaviorSubject } from 'rxjs';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { CommonModelService } from 'src/app/services/common-model.service';
import { Warehouse } from '../warehouse-dt/warehouse-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { AddStockDialogComponent } from 'src/app/components/dialogs/add-stock-dialog/add-stock-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MatDrawer } from '@angular/material/sidenav';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-warehouse-detail-page',
  templateUrl: './warehouse-detail-page.component.html',
  styleUrls: ['./warehouse-detail-page.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class WarehouseDetailPageComponent implements OnInit, AfterViewInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public warehouse: Warehouse | any;
  @Input() public isDetailVisible: boolean;
  public stockData: any[] = [];
  public subscriptions: Subscription[] = [];
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public currentIndex: number = 0;
  public displayedColumns = ['storage_code', 'storage_name', 'storage_type', 'action'];

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  private drawerNameSubject = new BehaviorSubject('');
  public formName = this.drawerNameSubject.asObservable();
  private drawerTypeSubject = new BehaviorSubject('');
  public formType = this.drawerTypeSubject.asObservable();
  private drawer: MatDrawer;
  selectedStorageItems = [];
  expandedElement: null;
  @ViewChild('locationStorageDrawer') locationStorageDrawer: MatDrawer;
  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    private cts: CommonToasterService
  ) {
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
    this.dataSource = new MatTableDataSource<Warehouse>();
  }

  ngOnInit(): void {
    this.dataService.nextSubjectDataObj.subscribe((res: any) => {
      if (JSON.stringify(res) != '{}') {
        this.dataSource.data = res;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataSource.data = [];
        this.dataSource.paginator = this.paginator;
      }
    });
  }
  ngAfterViewInit() {
    this.drawer = this.locationStorageDrawer;
    this.dataSource.paginator = this.paginator;
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditWarehouse(): void {
    this.formDrawer.setFormName('warehouse');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.warehouse,
    });
  }

  closeStorageDrawer() {
    this.drawer.close();
  }

  public toggleStatus(): void {
    // this.warehouse.vendor = this.warehouse.status === 0 ? 1 : 0;
    let action = this.warehouse.status === 0 ? 'active' : 'inactive';
    let ids = [];
    ids.push(this.warehouse.uuid);
    let body = {
      module: 'Warehouse',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.cts.showSuccess('Success', 'Action Successfull');
          body['edit'] = true;
          this.updateTableData.emit(body);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }

  public getStorageItems(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
    if (this.expandedElement == null) {
      return false;
    }
    this.subscriptions.push(
      this.apiService.getStorageItemList(data.id).subscribe(
        (res) => {
          this.selectedStorageItems = res.data;
        })
    )
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: { title: `Are you sure want to delete  ${this.warehouse.code}` },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deletewarehouse();
        }
      });
  }

  public deletewarehouse(): void {
    let delObj = { uuid: this.warehouse.uuid, delete: true };
    this.apiService.deletewarehouse(this.warehouse.uuid).subscribe((result) => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");
    });
  }

  public addStock(data) {
    this.deleteDialog
      .open(AddStockDialogComponent, {
        width: '800px',
        height: 'auto',
        hasBackdrop: true,
        position: {
          top: '5px',
        },
        data: data,
      })
      .afterClosed()
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.selectedStorageItems = data;
        }
      });
  };
  editStock(data) {
    this.drawerNameSubject.next('location-storage');
    this.drawerTypeSubject.next('Edit');
    this.drawer.open();
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: data,
      isEdit: true
    });
  }

  public addStorage() {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.warehouse,
      isEdit: false
    });
    this.drawerNameSubject.next('location-storage');
    this.drawerTypeSubject.next("Add");
    this.drawer.open();
  }

  updateLocationTableData(data) {
    this.updateTableData.emit(data);
  }
  downloadWareHouseReport() {
    let body = {
      "type": "stock",
      "name": ""
    };
    switch (this.warehouse.name) {
      case 'W1':
        body.name = "W1 - Stock";
        break;
      case 'W7':
        body.name = "W7 - Stock";
        break;
      case 'W8':
        body.name = "W8 - Stock";
        break;
    }

    this.apiService.getSalesmanData(body).subscribe(
      (res) => {

      })
  }
}
