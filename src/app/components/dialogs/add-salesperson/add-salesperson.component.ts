import { Component, OnInit, ViewChild, Inject, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddStockDialogComponent } from '../add-stock-dialog/add-stock-dialog.component';
import { Warehouse } from '../../main/settings/warehouse/warehouse-dt/warehouse-dt.component';
import { SalesPerson } from '../../pages/Salesmann/salesmandt/salesmandt.component';
import { Subscription } from 'rxjs'
import { Utils } from 'src/app/services/utils';
@Component({
  selector: 'app-add-salesperson',
  templateUrl: './add-salesperson.component.html',
  styleUrls: ['./add-salesperson.component.scss']
})
export class AddSalespersonComponent implements OnInit {

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() readonly addPaymentTerms: EventEmitter<any> = new EventEmitter<any>();
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  public bankFormGroup: FormGroup;
  public NameFormControl: FormControl;
  public emailFormControl: FormControl;
  public item: any;
  public filterItem: any[] = [];
  public selectedItem: any;
  showForm: boolean = false;
  public stockData: any;
  public salesPersondata: any[] = []
  public saveStockForm: boolean = false;
  option: any[] = [
  ];
  public tableHeads = ['Name', 'Email'];
  public items = [
    {
      code: 'IO009',
      name: 'Cola',
      uom: 'CASE',
      batch: '45',
      qty: 3,
    },
    {
      code: 'IO008',
      name: 'Pepsi',
      uom: 'CASE',
      batch: '45',
      qty: 8,
    },
  ];

  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];

  private allColumns: ColumnConfig[] = [
    { def: 'code', title: 'Code', show: true },
    { def: 'name', title: 'Name', show: true },
    { def: 'email', title: 'Manager', show: true },
  ];

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog,
    private formbuider: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public codeData: any,
    private dialog: MatDialogRef<AddStockDialogComponent>
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Warehouse>();
  }

  public ngOnInit(): void {
    this.buildForm();
    //console.log("codedata",this.codeData)
    this.displayedColumns = this.allColumns;
    this.dataSource = new MatTableDataSource<any>(this.stockData);
    this.dataSource.paginator = this.paginator;

    this.getwarehouselist();
  }
  getwarehouselist() {
    this.subscriptions.push(this.apiService.getSalesperson().subscribe((brandData: any) => {
      this.stockData = brandData.data;
      this.salesPersondata = this.stockData
      this.dataSource = new MatTableDataSource<any>(this.stockData);
      this.dataSource.paginator = this.paginator;
    }));

  }

  buildForm() {
    this.NameFormControl = new FormControl('', [Validators.required]);
    this.emailFormControl = new FormControl('', [Validators.required]);
    // this.areaManagerContactFormControl = new FormControl('', [Validators.required]);
    this.bankFormGroup = new FormGroup({
      name: this.NameFormControl,
      email: this.emailFormControl
    });
  }


  addNewStock() {
    this.showForm = true;
    this.bankFormGroup.reset();

  }
  saveStock() {
    let responseData = [];
    this.saveStockForm = true;
    if (this.bankFormGroup.invalid) {
      return;
    }
    this.apiService.addSalesperson({
      name: this.NameFormControl.value,
      email: this.emailFormControl.value,

    }).subscribe((result: any) => {
      if (result.status) {
        this.getwarehouselist();


      }

      this.addPaymentTerms.emit(result.data)
      this.dialog.close()
    });


  }

  itemDisplayValue(value: any): string {
    return value ? `${value.item_name}` : '';
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  getPaginatorValue(len: number) {
    return len < 3 ? true : false;
  }
  closeDialog() {
    this.dialog.close(true)
  }

  cancelForm() {
    this.showForm = false
    this.bankFormGroup.reset();
  }

  close(closeType?: any) {
    this.dialog.close(true);
  }

}
