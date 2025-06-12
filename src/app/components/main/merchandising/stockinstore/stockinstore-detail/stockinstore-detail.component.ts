
import { Component, OnInit, Output, EventEmitter, Input, ViewChild, SimpleChanges } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { MerchandisingService } from '../../merchandising.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Stockinstore } from '../stockinstore-interface';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-stockinstore-detail',
  templateUrl: './stockinstore-detail.component.html',
  styleUrls: ['./stockinstore-detail.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class StockinstoreDetailComponent extends BaseComponent implements OnInit {

  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public stock: Stockinstore | any;
  @Input() public isDetailVisible: boolean;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  selectedColumnFilter: string;
  AssignInventorySelectedColumnFilter: string;
  itemFormGroup: FormGroup;
  itemsFormControl: FormControl;
  itemSource: any;
  itemPostSource: any;
  itemPostDetailSource: any;
  expandedElement: any | null;
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['item_code', 'item_name', 'item_uom', 'capacity'];
  public displayeditemPostColumns = ['created_at', 'itemCode', 'item', 'customerCode', 'customer', 'uom', 'capacity', 'qty', 'refill', 'reorder', 'fill', 'out_of_stock'];
  public displayeditemPostDetailColumns = ['created_at', 'item', 'uom', 'expiry_date', 'qty'];
  @ViewChild('tbl1', { read: MatPaginator }) tbl1: MatPaginator;
  @ViewChild('tbl2', { read: MatPaginator }) tbl2: MatPaginator;
  @ViewChild('tbl3', { read: MatPaginator }) tbl3: MatPaginator;
  initialised: boolean = false;
  public dateFilterControl;
  public customerControl;
  public customerFilterControl;
  public customer: any[] = [];
  public items: any[] = [];
  public itemUom: any[] = [];
  public damageData = [];
  public selectedTab = 0;
  public currentDate;
  constructor(public fb: FormBuilder, apiService: ApiService, public merService: MerchandisingService, deleteDialog: MatDialog, private cts: CommonToasterService, dataService: DataEditor, formDrawer: FormDrawerService) {
    super('Stock In Store');
    Object.assign(this, { apiService, merService, deleteDialog, dataService, formDrawer });
    this.itemSource, this.itemPostSource, this.itemPostDetailSource = new MatTableDataSource<any>();
  }

  filterForm: FormGroup;
  AssignInventoryFilterForm: FormGroup;
  filterCustomersFormControl = new FormControl('');
  filterItemsFormControl = new FormControl('');
  filterUomsFormControl = new FormControl('');
  ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate()) < 10) {
      date = '0' + (today.getDate());
    }
    let newdate = today.getFullYear() + '-' + month + '-' + date;
    this.currentDate = newdate;
    this.dateFilterControl = new FormControl(newdate);
    this.customerControl = new FormControl("");
    this.customerFilterControl = new FormControl("");
    this.itemsFormControl = new FormControl([]);
    this.itemFormGroup = new FormGroup({
      items: this.itemsFormControl
    });

    this.filterForm = new FormGroup({
      inventory_id: new FormControl(this.stock?.id),
      all: new FormControl(false),
      date: new FormControl(''),
      uom: new FormControl(''),
      customer: new FormControl(''),
      item: new FormControl(''),
      customer_code: new FormControl(''),
      item_code: new FormControl(''),
    })

    this.AssignInventoryFilterForm = new FormGroup({
      item_uom: new FormControl(''),
      item: new FormControl(''),
      item_code: new FormControl(''),
    })

    // this.merService.getStockInStoreList().subscribe(response => {
    //   this.customer = response.customers.data;
    //   this.items = response.items.data;
    //   this.itemUom = response.itemsUoms.data;
    // })

    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customer = result.data.customers;
        this.items = result.data.items;
        this.itemUom = result.data.item_uom;
      })
    );


    if (this.stock !== null || this.stock !== undefined) {
      this.setItemValues();
      if (this.itemSource !== null || this.itemSource !== undefined) {
        this.initialised = true;
      }
    }
  }

  selectionChangedCustomer() {
    let customer = this.customerControl.value;
    this.customerFilterControl.setValue(customer[0].id)
  }


  onColumnFilterAssignInventory(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.AssignInventoryFilterForm.get(this.AssignInventorySelectedColumnFilter).setValue("");
      // return;
    }
    //Filter only if he click on yes button
    //add the validation here if selected control has the value 

    this.filterDataAssignInventory();
  }

  filterDataAssignInventory() {
    let form = this.AssignInventoryFilterForm.value;
    if (form.item_code == "" && form.item == "") {
      this.setItemValues();
      return false;
    }
    let itemData = [];
    if (this.stock && this.stock.assign_inventory_details.length) {
      let assign_inventory_details = [];
      if (form.item_code !== "" && form.item !== "") {
        assign_inventory_details = this.stock.assign_inventory_details.filter((x) => { return (x.item?.item_code.includes(form.item_code)) && (x.item?.item_name.toLowerCase().includes(form.item.toLowerCase())) });
      } else if (form.item_code !== "") {
        assign_inventory_details = this.stock.assign_inventory_details.filter((x) => { return x.item?.item_code.includes(form.item_code) });
      } else if (form.item !== "") {
        assign_inventory_details = this.stock.assign_inventory_details.filter((x) => { return x.item?.item_name.toLowerCase().includes(form.item.toLowerCase()) });
      }

      assign_inventory_details.forEach((item, i) => {
        itemData.push({
          item_id: item?.item_id,
          item_code: item.item?.item_code,
          item_name: item.item?.item_name,
          item_uom_id: item?.item_uom_id,
          item_uom: item.item_uom?.name,
          capacity: item.capacity
        });
      });
      if (itemData.length) {
        // this.itemsFormControl.setValue(itemData);
        this.itemSource = new MatTableDataSource<any>(itemData);

        this.itemSource.paginator = this.tbl1;
      }
    } else {
      this.itemsFormControl.setValue([]);
      this.itemSource = new MatTableDataSource<any>(this.itemsFormControl.value);
    }
  }

  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
      // return;
    }
    //Filter only if he click on yes button
    //add the validation here if selected control has the value 
    this.filterData();
  }

  filterData() {
    this.subscriptions.push(this.merService.getInventoryPostListNew(this.filterForm.value).subscribe(
      (res) => {
        let inventoryData = [];
        if (res.data.length > 0) {
          inventoryData = res.data;
        }
        this.itemPostSource = new MatTableDataSource<any>(inventoryData);
        this.itemPostSource.paginator = this.tbl2;
      }))
  }
  onColumnFilterOpenAssignInventory(item) {
    this.AssignInventorySelectedColumnFilter = item;
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialised && changes) {
      if (changes.stock.currentValue != changes.stock.previousValue) {
        let currentValue = changes.stock.currentValue;
        this.stock = currentValue;
        this.setItemValues();
        this.selectedColumnFilter = null;
      }
      this.selectedTabChange(this.selectedTab);

    }
  }

  expandList(data, index) {
    this.expandedElement = this.expandedElement === data ? null : data;
    this.itemPostDetailSource = new MatTableDataSource<any>(data.assign_inventory_post_expiry);
    //console.log(this.itemPostDetailSource, index);
    setTimeout(() => {
      this.itemPostDetailSource.paginator = this.tbl3;
    });
  }

  public setItemValues(): void {
    let itemData = [];
    if (this.stock && this.stock.assign_inventory_details.length) {
      this.stock.assign_inventory_details.forEach((item, i) => {
        itemData.push({
          item_id: item?.item_id,
          item_code: item.item?.item_code,
          item_name: item.item?.item_name,
          item_uom_id: item?.item_uom_id,
          item_uom: item.item_uom?.name,
          capacity: item.capacity
        });
      });
      if (itemData.length) {
        this.itemsFormControl.setValue(itemData);
        this.itemSource = new MatTableDataSource<any>(this.itemsFormControl.value);

        this.itemSource.paginator = this.tbl1;
      }
    } else {
      this.itemsFormControl.setValue([]);
      this.itemSource = new MatTableDataSource<any>(this.itemsFormControl.value);
    }
  }

  selectedTabChange(index) {
    switch (index) {
      case 2:
        this.getInventoryPostList('date', this.currentDate);
        break;
      case 3:
        this.getDamageItemList();
        break;
    }
  }

  public getInventoryPostList(filter, value) {
    if (filter == "date") {
      value = this.dateFilterControl.value;
      this.filterForm.get('all').setValue(false);
    }
    if (value == "") return false;
    this.filterForm.get(filter).setValue(value);
    this.filterForm.get('inventory_id').setValue(this.stock.id);
    this.filterData();
    // this.subscriptions.push(this.merService.getInventoryPostList(this.stock.id, filter, value).subscribe(
    //   (res) => {
    //     let inventoryData = [];
    //     if (res.data.length > 0) {
    //       inventoryData = res.data;
    //     }

    //     this.itemPostSource = new MatTableDataSource<any>(inventoryData);
    //     this.itemPostSource.paginator = this.tbl2;

    //   }))
  }

  getDamageItemList() {
    let model = {
      assign_inventory_id: this.stock.id,
      date: '',
      salesman_name: '',
      item_name: '',
      item_code: '',
      customer_name: '',
      customer_code: '',
      today: this.currentDate,
      all: false
    }
    this.subscriptions.push(
      this.merService.getStockDamageItemList(model).subscribe((res) => {
        this.damageData = res.data;
      })
    )
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditstockinstore(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.stock });
    this.formDrawer.setFormName('add-stockinstore');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }



  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Stock In Store ${this.stock.activity_name}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBank();
      }
    });
  }

  public deleteBank(): void {
    let delObj = { uuid: this.stock.uuid, delete: true };
    this.merService.deleteStockinstore(this.stock.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully")
    });
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }


}
