import { Component, OnInit, ViewChild, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { SelectionModel } from '@angular/cdk/collections';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { TargetService } from '../../target.service';
import { Route } from '@angular/compiler/src/core';
import { SalesMan } from '../../../master/salesman/salesman-dt/salesman-dt.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-salesman-load-dt',
  templateUrl: './salesman-load-dt.component.html',
  styleUrls: ['./salesman-load-dt.component.scss']
})
export class SalesmanLoadDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private targetService: TargetService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  @Input() newSalesmanLoadData: any = {};
  selectedColumnFilter: string;

  public allResData = [];
  filterForm: FormGroup;
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'date', title: 'Date', show: true },
    { def: 'trip', title: 'Trip', show: true },
    { def: 'loadPeriodNumber', title: 'Load Period Number', show: true },
    { def: 'order_number', title: 'Order Number', show: true },

    // { def: 'depot', title: 'Depot', show: false },
    { def: 'salesman', title: 'Salesman', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    // { def: 'route', title: 'Route', show: true },
    // { def: 'route_code', title: 'Route Code', show: true },
    { def: 'status', title: 'Status', show: true }
  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'loadPeriodNumber', title: 'Load Period Number', show: true },
  ];


  constructor(
    targetService: TargetService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public fb: FormBuilder,
    public apiService: ApiService,
    deleteDialog: MatDialog) {
    Object.assign(this, { targetService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<SalesmanLoad>();
  }
  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      code: [''],
      depot: [''],
      salesman_name: [''],
      salesman_code: [''],
      // route: [''],
      // rout_code: [''],
      order_number: [''],
      status: [''],
      page: [this.page],
      page_size: [this.pageSize],
      trip: ['']
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getSalesmanLoadList();

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  getSalesmanLoadList() {
    this.subscriptions.push(this.apiService.getAllSalesmanLoad(this.filterForm.value).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getSalesmanLoadList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newSalesmanLoadData && Object.keys(changes.newSalesmanLoadData.currentValue).length > 0) {
        let currentValue = changes.newSalesmanLoadData.currentValue;
        this.newSalesmanLoadData = currentValue;
        this.updateAllData(this.newSalesmanLoadData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.targetService.getSalesmanLoadList(this.page, this.pageSize).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        let tableData = res.data;
        if (data.delete !== undefined && data.delete == true) {
          this.closeDetailView();
        } else {
          if (data.edit !== undefined && data.edit == true) {
            let dataObj = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
            this.openDetailView(dataObj);
          }
        }
      })
    );
    return false;
    let tableData = this.allResData;
    if (data.delete !== undefined && data.delete == true) {
      let indexp = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
      let index = tableData.indexOf(indexp);
      tableData.splice(index, 1);
      this.closeDetailView();
    } else {
      if (data.edit !== undefined && data.edit == true) {
        let indexp = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
        let index = tableData.indexOf(indexp);
        tableData[index] = data;
        this.openDetailView(data);
      } else {
        tableData.unshift(data);
      }

    }
    this.allResData = tableData;
    this.updateDataSource(tableData)
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: SalesmanLoad): void {
    this.isDetailVisible = true;
    const salesman = this.allResData.filter((x) => { return x.uuid == data.uuid });
    this.itemClicked.emit(salesman);
    this.itemClicked.emit(data);
    // this.targetService.getSalesmanLoadDetails(data.uuid).subscribe(res => {
    //   this.itemClicked.emit(res.data);
    //   //console.log(res.data);

    // })
    // this.itemClicked.emit(data);
    this.updateCollapsedColumns();
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

  public checkboxLabel(row?: SalesmanLoad): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editCountry(country: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: country });
    // this.openAddCountry();
  }

  public openDeleteBox(country: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete this country ?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        // this.deleteCountry(country);
      }
    });
  }


  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {
    if (!item) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.pageSize
      });
    }
    this.getSalesmanLoadList();
  }


  // private deleteCountry(country: any): void {
  //   this.apiService.deleteCountry(country.uuid).subscribe(result => {
  //     window.location.reload();
  //   });
  // }



  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}

export interface SalesmanLoad {
  id: number,
  uuid: string,
  organisation_id: number,
  depot_id: number,
  route_id: number,
  salesman_id: number,
  load_date: Date,
  load_type: number,
  load_confirm: number,
  status: number,
  salesman_load_details: any[],
  depot: any,
  route: Route,
  salesman_infos: SalesMan,
  organisation: any
}

// const SalesmanLoadData: SalesmanLoad[] = [
//   {
//     id: 1,
//     date: "2020-06-22",
//     loadPeriodNumber: "00231",
//     depot: "Depot 2",
//     route: "Route 45",
//     loadType: "Delivery Load",
//     salesman: "Salesman A",
//     items: [
//       {
//         name: "item 1",
//         uom: "BOX",
//         quantity: 12
//       },
//       {
//         name: "item 3",
//         uom: "PCS",
//         quantity: 54
//       },
//       {
//         name: "item 4",
//         uom: "PCK",
//         quantity: 14
//       },
//       {
//         name: "item 6",
//         uom: "BOX",
//         quantity: 5
//       }
//     ]
//   },
//   {
//     id: 2,
//     date: "2020-07-29",
//     loadPeriodNumber: "04131",
//     depot: "Depot 7",
//     route: "Route 10",
//     loadType: "Van Load",
//     salesman: "Salesman D",
//     items: [
//       {
//         name: "item 3",
//         uom: "PCS",
//         quantity: 54
//       },
//       {
//         name: "item 4",
//         uom: "PCK",
//         quantity: 14
//       },
//       {
//         name: "item 6",
//         uom: "BOX",
//         quantity: 5
//       }
//     ]
//   }
// ]

