import { Component, OnInit, ViewChild, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DetailsService } from 'src/app/services/details.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CompDataServiceType } from 'src/app/services/constants';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-discount-dt',
  templateUrl: './discount-dt.component.html',
  styleUrls: ['./discount-dt.component.scss']
})
export class DiscountDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newDiscountData: any = {};
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  filterForm: FormGroup;


  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  selectedColumnFilter: string;

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Name', show: true },
    { def: 'start_date', title: 'Start Date', show: true },
    { def: 'end_date', title: 'End Date', show: true }

  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Name', show: true },
  ];


  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public fb: FormBuilder,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Discount>();
  }
  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [''],
      start_date: [''],
      end_date: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getAllDiscounts();
    // this.dataSource = new MatTableDataSource<Discount>(discount);
    // this.dataSource.paginator = this.paginator;

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  getAllDiscounts() {
    this.subscriptions.push(this.apiService.getAllDiscounts(this.filterForm.value).subscribe((discount: any) => {
      this.apiResponse = discount;
      this.allResData = discount.data;
      this.updateDataSource(discount.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getAllDiscounts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newDiscountData && Object.keys(changes.newDiscountData.currentValue).length > 0) {
        let currentValue = changes.newDiscountData.currentValue;
        this.newDiscountData = currentValue;
        this.updateAllData(this.newDiscountData);
      }
    }
  }

  updateAllData(data) {
    this.getAllDiscounts();
    this.selections = new SelectionModel(true, []);
    if (data.delete !== undefined && data.delete == true) {
      this.closeDetailView();
    }
    return false;
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: Discount): void {
    this.isDetailVisible = true;
    let discountDetails;
    this.apiService.getDiscount(data.uuid).subscribe(res => {
      discountDetails = res.data;
      discountDetails.keyCombinations = this.getKeyCombination(discountDetails)
      this.itemClicked.emit(discountDetails);
      this.updateCollapsedColumns();
    })
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.pageSize
      });
    }
    this.getAllDiscounts();
  }

  private getKeyCombination(discount) {
    let keyCombination: any[] = [];
    let keys: string[] = discount.combination_key_value.split('/');
    keys.forEach((key) => {
      if (key == 'Country') {
        let data: any[] = discount.p_d_p_countries;
        let country: any[] = [];
        data.map((data) => {
          country.push(data.country);
        });
        keyCombination.push({ title: key, data: country });
      } else if (key == 'Region') {
        let data: any[] = discount.p_d_p_regions;
        let region: any[] = [];
        data.map((data) => {
          data.region.name = data.region.region_name;
          region.push(data.region);
        });
        keyCombination.push({ title: key, data: region });
      } else if (key == 'Area') {
        let data: any[] = discount.p_d_p_areas;
        let area: any[] = [];
        data.map((data) => {
          data.area.name = data.area.area_name;
          area.push(data.area);
        });
        keyCombination.push({ title: key, data: area });
      } else if (key == 'Route') {
        let data: any[] = discount.p_d_p_routes;
        let route: any[] = [];
        data.map((data) => {
          data.route.name = data.route.route_name;
          route.push(data.route);
        });
        keyCombination.push({ title: key, data: route });
      } else if (key == 'Sales Organisation') {
        let data: any[] = discount.p_d_p_sales_organisations;
        let salesOrganisation: any[] = [];
        data.map((data) => {
          salesOrganisation.push(data.sales_organisation);
        });
        keyCombination.push({ title: key, data: salesOrganisation });
      } else if (key == 'Channel') {
        let data: any[] = discount.p_d_p_channels;
        let channel: any[] = [];
        data.map((data) => {
          channel.push(data.channel);
        });
        keyCombination.push({ title: key, data: channel });
      } else if (key == 'Customer Category') {
        let data: any[] = discount.p_d_p_customer_categories;
        let customerCategory: any[] = [];
        data.map((data) => {
          data.customer_category.name =
            data.customer_category.customer_category_name;
          customerCategory.push(data.customer_category);
        });
        keyCombination.push({ title: key, data: customerCategory });
      } else if (key == 'Customer') {
        let data: any[] = discount.p_d_p_customers;
        let customer: any[] = [];
        data.map((data) => {
          data.customer_info.user.name =
            data.customer_info.user.firstname +
            ' ' +
            data.customer_info.user.lastname;
          customer.push(data.customer_info.user);
        });
        keyCombination.push({ title: key, data: customer });
      } else if (key == 'Major Category') {
        let data: any[] = discount.p_d_p_item_major_categories;
        let category: any[] = [];
        data.map((data) => {
          category.push(data.item_major_category);
        });
        keyCombination.push({ title: key, data: category });
      }
      else if (key == 'Item Group') {
        let data: any[] = discount.p_d_p_item_groups;
        let itemGroup: any[] = [];
        data.map(data => {
          itemGroup.push(data.item_group);
        })
        keyCombination.push({ title: key, data: itemGroup })
      }
    });

    let data: any[] = discount.p_d_p_items;
    let item: any[] = [];
    data.map((data) => {
      data.item.name = data.item.item_name;
      item.push(data.item);
    });
    keyCombination.push({ title: 'Item', data: item });
    return keyCombination;
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }
  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }
  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: Discount): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editArea(area: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: area });
    this.openAddArea();
  }

  public openDeleteBox(area: any): void {
    // this.deleteDialog.open(DeleteConfirmModalComponent, {
    //   width: '500px',
    //   data: { title: `Are you sure want to delete this area ?` }
    // }).afterClosed().subscribe(data => {
    //   if (data.hasConfirmed) {
    //     this.deleteArea(area);
    //   }
    // });
  }

  private deleteArea(area: any): void {
    this.apiService.deleteArea(area.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddArea(): void {
    this.fds.setFormName('area');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}
export interface Discount {
  id: string;
  uuid: string;
  name: string;
  start_date: string;
  end_date: string;
  type: string;
  discount_type: string;
  discount_percentage: string;
  discount_value: string;
  discount_apply_on: string;
  discount_applied_quantity: string;
  discount_applied_value: string;
  slab: any[];
}
const discount: Discount[] = [
  {
    id: "2",
    uuid: "",
    name: "discount 1",
    start_date: "Mar 28, 2015",
    end_date: "Dec 15, 2019",
    type: "normal",
    discount_type: "percentage",
    discount_percentage: "10",
    discount_value: "",
    discount_apply_on: "quantity",
    discount_applied_quantity: "12",
    discount_applied_value: "",
    slab: [
      {
        min_slab: "0",
        max_slab: "50",
        percentage: "",
        value: "10"
      },
      {
        min_slab: "51",
        max_slab: "100",
        percentage: "",
        value: "5"
      },
      {
        min_slab: "101",
        max_slab: "251",
        percentage: "",
        value: "2"
      }
    ]
  },
  {
    id: "2",
    uuid: "",
    name: "discount 2",
    start_date: "Mar 28, 2015",
    end_date: "Dec 15, 2019",
    type: "slab",
    discount_type: "fixed",
    discount_percentage: "",
    discount_value: "",
    discount_apply_on: "",
    discount_applied_quantity: "",
    discount_applied_value: "",
    slab: []
  }
]