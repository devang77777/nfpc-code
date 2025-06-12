import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-portfolio-management-detail-page',
  templateUrl: './portfolio-management-detail-page.component.html',
  styleUrls: ['./portfolio-management-detail-page.component.scss'],
})
export class PortfolioManagementDetailPageComponent extends BaseComponent
  implements OnChanges {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() portfolioManagement: any;
  @Input() isDetailVisible: boolean;
  itemMatchRoute: any[] = [];
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();

  itemFormGroup: FormGroup;
  itemsFormControl: FormControl;
  itemSource: any;
  customerSource: any;
  public displayedColumns = ['itemCode', 'itemName', 'store_price', 'vendorItemCode'];
  @ViewChild('itemMatPaginator', { static: true }) itemPaginator: MatPaginator;

  public displayedCustomerColumns = ['customerCode', 'customerName'];
  @ViewChild('cusomterMatPaginator', { static: true }) cutomerPaginator: MatPaginator;
  // @ViewChild(MatPaginator) paginator: MatPaginator;
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
    super('Portfolio Management');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
    this.itemSource = new MatTableDataSource<any>();
    this.itemSource.paginator = this.itemPaginator;
  }

  ngOnInit() {
    this.itemsFormControl = new FormControl([]);
    this.itemFormGroup = new FormGroup({
      items: this.itemsFormControl,
    });
    if (
      this.portfolioManagement !== null ||
      this.portfolioManagement !== undefined
    ) {
      this.setItemValues();
      if (this.itemSource !== null || this.itemSource !== undefined) {
        this.initialised = true;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialised && changes) {
      if (changes.portfolioManagement) {
        let currentValue = changes.portfolioManagement.currentValue;
        this.portfolioManagement = currentValue;
        this.setItemValues();
        this.setCustomerValues();
      }
    }
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  public setItemValues(): void {
    let itemData = [];
    if (
      this.portfolioManagement &&
      this.portfolioManagement.portfolio_management_item.length
    ) {
      this.portfolioManagement.portfolio_management_item.forEach(
        (item, i) => {
          //console.log(item);
          itemData.push({
            item_id: item.item_id,
            item_code: item.item?.item_code,
            item_name: item.item?.item_name,
            store_price: item.store_price,
            vendor_item_code: item.vendor_item_code
          });
        }
      );
      // console.log(itemData);
      if (itemData.length) {
        this.itemsFormControl.setValue(itemData);
        this.itemSource = new MatTableDataSource<any>(
          this.itemsFormControl.value
        );
        this.itemSource.paginator = this.itemPaginator;
      }
    }
    // console.log(this.portfolioManagement.portfolio_management_customer);
  }

  public setCustomerValues(): void {
    let itemData = [];
    if (
      this.portfolioManagement &&
      this.portfolioManagement.portfolio_management_customer.length
    ) {
      this.portfolioManagement.portfolio_management_customer.forEach(
        (item, i) => {
          //console.log(item);
          itemData.push({
            id: item.user?.id,
            customer_code: item.user?.customer_info?.customer_code,
            customer_name: `${item.user?.firstname} ${item.user?.lastname}`,
          });
        }
      );
      // console.log(itemData);
      if (itemData.length) {
        this.customerSource = new MatTableDataSource<any>(itemData);
        this.customerSource.paginator = this.cutomerPaginator;
      }
    }
    // console.log(this.portfolioManagement.portfolio_management_customer);
  }


  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditPortfolioGroupItem(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.portfolioManagement,
    });
    this.formDrawer.setFormName('portfolio-management');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete ${this.portfolioManagement.name}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteRouteGroupItem();
      }
    });
  }

  private deleteRouteGroupItem(): void {
    let delObj = { uuid: this.portfolioManagement.uuid, delete: true };
    this.apiService.deletePortfolio(this.portfolioManagement.uuid).subscribe(result => {
      this.commonToasterService.showInfo(
        'Deleted',
        'Sucessfully Deleted Portfolio Management'
      );
      this.closeDetailView();
      this.updateTableData.emit(delObj);
    });
  }
}
