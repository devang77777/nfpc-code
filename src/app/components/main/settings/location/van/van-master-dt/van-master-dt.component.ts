import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-van-master-dt',
  templateUrl: './van-master-dt.component.html',
  styleUrls: ['./van-master-dt.component.scss']
})
export class VanMasterDtComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<VanMaster>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'vanCode', title: 'Van Code', show: true },
    { def: 'vanPlate', title: 'Plate Number', show: true },
    { def: 'vanDescription', title: 'Description', show: true },
    { def: 'fuelReading', title: 'Fuel reading', show: true },
    { def: 'status', title: 'Status', show: true }

  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'vanDescription', title: 'Description', show: true }
  ];
  @Input() public newVanData: any;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public fb: FormBuilder,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<VanMaster>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      vanCode: [''],
      vanPlate: [''],
      vanDescription: [''],
      fuelReading: [''],
      status: [''],
      // route_code: [''],
      // route_name: [''],
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllVans();
    this.subscriptions.push(this.apiService.getAllVans().subscribe((vans: any) => {
      this.dataSource = new MatTableDataSource<VanMaster>(vans.data);
      this.dataSource.paginator = this.paginator;
    }));

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }
   selectedColumnFilter:any = []
   filterForm: FormGroup;
   vanCodeInput:any;
   plateInput:any;
   vandescInput:any;
   fuelInput:any;
   statusInput:any;



  // onColumnFilterOpen(item) {
  //   this.selectedColumnFilter = item

  //   console.log(item,"jkl")
  //   console.log(this.vanCodeInput,"jiii")

  // }


  onColumnFilter(status) {
    console.log(status,"jiii")
    console.log(this.vanCodeInput,"jiii")
    let filter:any = {}


if(status)
{
    filter = {
      "van_code": this.vanCodeInput?this.vanCodeInput:"",
      "plate_number": this.plateInput?this.plateInput:"",
      "van_description": this.vandescInput?this.vandescInput:"",
      "fuel_reading": this.fuelInput?this.fuelInput:"",
      "status": this.statusInput?this.statusInput:""
      }
      this.apiService.filterVans(filter).subscribe((res)=>{
        console.log(res)
          this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      })
      console.log(filter,"jkl")
    }
    else{
      filter = {
        "van_code": this.vanCodeInput?this.vanCodeInput:"",
        "plate_number": this.plateInput?this.plateInput:"",
        "van_description": this.vandescInput?this.vandescInput:"",
        "fuel_reading": this.fuelInput?this.fuelInput:"",
        "status": this.statusInput?this.statusInput:""
        }
      // console.log(filter)
      this.apiService.filterVans(filter).subscribe((res)=>{
        console.log(res)
          this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      })
    if(!this.vanCodeInput && !this.fuelInput && !this.statusInput && !this.vandescInput && !this.plateInput)
    {
      this.getAllVans()

  }
}

    // if (!status) {
    //   // Find the selected control and reset its value only (not others)
    //   // this.filterForm.patchValue({ date: null })
    //   this.filterForm.get(this.selectedColumnFilter).setValue(null);
    // } else {
    //   this.filterForm.patchValue({
    //     page: 1,
    //     page_size: this.pageSize
    //   });
    // }
    // this.getCreditNotes();
  }
  getAllVans() {
    this.subscriptions.push(this.apiService.getAllVansDt(this.page, this.pageSize).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getAllVans();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newVanData && Object.keys(changes.newVanData.currentValue).length > 0) {
        let currentValue = changes.newVanData.currentValue;
        this.newVanData = currentValue;
        this.updateAllData(this.newVanData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getAllVansDt(this.page, this.pageSize).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        this.selections = new SelectionModel(true, []);
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

  public openDetailView(data: VanMaster): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
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

  public checkboxLabel(row?: VanMaster): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editVan(van: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: van });
    this.openAddVan();
  }

  public openDeleteBox(van: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Van ${van.van_code}?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteVan(van);
      }
    });
  }

  private deleteVan(van: any): void {
    this.apiService.deleteVan(van.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddVan(): void {
    this.fds.setFormName('add-van');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}
export interface VanMaster {
  capacity: string;
  category: {
    id: string;
    name: string;
  };
  id: number;
  name: string;
  description: string;
  organisation_id: string;
  plate_number: string;
  type: string;
  uuid: string;
  van_category_id: string;
  van_code: string;
  van_status: number;
  van_type_id: string;
}
