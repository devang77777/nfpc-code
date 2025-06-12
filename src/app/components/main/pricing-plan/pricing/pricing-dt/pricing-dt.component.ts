import {
  Component,
  OnInit,
  ViewChild,
  Output,
  Input,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
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
  selector: 'app-pricing-dt',
  templateUrl: './pricing-dt.component.html',
  styleUrls: ['./pricing-dt.component.scss'],
})
export class PricingDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newPricingData: any = {};
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  selectedColumnFilter: string;

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
  filterForm: FormGroup;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Name', show: true },
    { def: 'start_date', title: 'Start Date', show: true },
    { def: 'end_date', title: 'End Date', show: true },
    { def: 'status', title: 'Status', show: true },
    { def: 'action', title: 'Action', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Name', show: true },
  ];

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public fb: FormBuilder,
    deleteDialog: MatDialog,
    private router: Router,
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Pricing>();
  }
  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [''],
      start_date: [''],
      end_date: [''],
      status: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllPricingPlan();

    // this.dataSource = new MatTableDataSource<Pricing>(pricing);
    // this.dataSource.paginator = this.paginator;

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
  }

  getAllPricingPlan() {
    this.subscriptions.push(
      this.apiService
        .getAllPricingPlan(this.filterForm.value)
        .subscribe((pricing: any) => {
          this.apiResponse = pricing;
          this.allResData = pricing.data;
          this.updateDataSource(pricing.data);
        })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getAllPricingPlan();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newPricingData &&
        Object.keys(changes.newPricingData.currentValue).length > 0
      ) {
        let currentValue = changes.newPricingData.currentValue;
        this.newPricingData = currentValue;
        this.updateAllData(this.newPricingData);
      }
    }
  }

  updateAllData(data) {
    this.getAllPricingPlan();
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
    this.getAllPricingPlan();
  }
  public openDetailView(data: Pricing): void {
    this.isDetailVisible = true;
    //console.log(data);

    this.apiService.getPricingPlan(data.uuid).subscribe((res) => {
      let data = res.data;
      data.keyCombinations = this.getKeyCombination(data);
      this.itemClicked.emit(data);
    });
    this.updateCollapsedColumns();
  }
  private getKeyCombination(pricing) {
    let keyCombination: any[] = [];
    let keys: string[] = pricing.combination_key_value.split('/');
    keys.forEach((key) => {
      if (key == 'Country') {
        let data: any[] = pricing.p_d_p_countries;
        let country: any[] = [];
        data.map((data) => {
          country.push(data.country);
        });
        keyCombination.push({ title: key, data: country });
      } else if (key == 'Region') {
        let data: any[] = pricing.p_d_p_regions;
        let region: any[] = [];
        data.map((data) => {
          data.region.name = data.region.region_name;
          region.push(data.region);
        });
        keyCombination.push({ title: key, data: region });
      } else if (key == 'Area') {
        let data: any[] = pricing.p_d_p_areas;
        let area: any[] = [];
        data.map((data) => {
          data.area.name = data.area.area_name;
          area.push(data.area);
        });
        keyCombination.push({ title: key, data: area });
      } else if (key == 'Route') {
        let data: any[] = pricing.p_d_p_routes;
        let route: any[] = [];
        data.map((data) => {
          data.route.name = data.route.route_name;
          route.push(data.route);
        });
        keyCombination.push({ title: key, data: route });
      } else if (key == 'Sales Organisation') {
        let data: any[] = pricing.p_d_p_sales_organisations;
        let salesOrganisation: any[] = [];
        data.map((data) => {
          salesOrganisation.push(data.sales_organisation);
        });
        keyCombination.push({ title: key, data: salesOrganisation });
      } else if (key == 'Channel') {
        let data: any[] = pricing.p_d_p_channels;
        let channel: any[] = [];
        data.map((data) => {
          channel.push(data.channel);
        });
        keyCombination.push({ title: key, data: channel });
      } else if (key == 'Customer Category') {
        let data: any[] = pricing.p_d_p_customer_categories;
        let customerCategory: any[] = [];
        data.map((data) => {
          data.customer_category.name =
            data.customer_category.customer_category_name;
          customerCategory.push(data.customer_category);
        });
        keyCombination.push({ title: key, data: customerCategory });
      } else if (key == 'Customer') {
        let data: any[] = pricing.p_d_p_customers;
        let customer: any[] = [];
        data.map((data) => {
          if (data.customer_info) {
            data.customer_info.user.name =
              data.customer_info.user.firstname +
              ' ' +
              data.customer_info.user.lastname + ' - ' + data.customer_info.customer_code;
            customer.push(data.customer_info.user);
          }
        });
        keyCombination.push({ title: key, data: customer });
      } else if (key == 'Major Category') {
        let data: any[] = pricing.p_d_p_item_major_categories;
        let category: any[] = [];
        data.map((data) => {
          category.push(data.item_major_category);
        });
        keyCombination.push({ title: key, data: category });
      } else if (key == 'Item Group') {
        let data: any[] = pricing.p_d_p_item_groups;
        let itemGroup: any[] = [];
        data.map((data) => {
          itemGroup.push(data.item_group);
        });
        keyCombination.push({ title: key, data: itemGroup });
      }
    });

    let data: any[] = pricing.p_d_p_items;
    let item: any[] = [];
    data.map((data) => {
      data.item.name = data?.item?.item_name + ' - ' + data?.item?.item_code;
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
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }
  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }
  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: Pricing): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
  }

  copyPromotionData(data) {
    this.dataEditor.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: data,
    });
    this.router.navigate([
      `pricing-plan/pricing/edit/${data.uuid}?mode=copy`,
    ]);
  }
}
export interface Pricing {
  uuid: string;
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}
