import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Warehouse } from '../../main/settings/warehouse/warehouse-dt/warehouse-dt.component';

@Component({
  selector: 'app-add-stock-dialog',
  templateUrl: './add-stock-dialog.component.html',
  styleUrls: ['./add-stock-dialog.component.scss'],
})
export class AddStockDialogComponent implements OnInit {
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns = ['item_code', 'item_name', 'name', 'batch', 'qty']
  public filterColumns: ColumnConfig[] = [];

  stockFormBGroup: FormGroup;
  itemFormControl: FormControl;
  uomFormControl: FormControl;
  quantityFormControl: FormControl;
  batchFormControl: FormControl;
  public item: any;
  public filterItem: any[] = [];
  public selectedItem: any;
  showForm: boolean = false;
  public stockData: any;
  filteredOptions: Observable<string[]>;
  public saveStockForm: boolean = false;
  option: any[] = [
  ];
  public tableHeads = ['Item Code', 'Item Name', 'Uom', 'Batch', 'Qty'];
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

    this.getwarehouselist();

    this.subscriptions.push(
      this.apiService.getAllItems().subscribe((result: any) => {
        //console.log('areas : ', result.data);
        this.option = result.data;
      })
    );

    this.filterItem = this.option;
  }
  getwarehouselist() {
    this.subscriptions.push(
      this.apiService.getStockList(this.codeData.id).subscribe((result: any) => {
        this.dataSource.data = result.data;
        this.dataSource.paginator = this.paginator;
      })
    );

  }

  buildForm() {
    this.itemFormControl = new FormControl('', [Validators.required]);
    this.uomFormControl = new FormControl('', [Validators.required]);
    this.quantityFormControl = new FormControl('', [Validators.required]);
    this.batchFormControl = new FormControl('');

    this.stockFormBGroup = this.formbuider.group({
      itemname: this.itemFormControl,
      uom: this.uomFormControl,
      quantity: this.quantityFormControl,
      batch: this.batchFormControl
    });

    this.uomFormControl.disable();
  }

  filterChangeTrigger() {
    this.filteredOptions = this.itemFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
    this.filterItem = this.option;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.option.filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }

  addNewStock() {
    this.showForm = true;
    this.stockFormBGroup.reset();
  }

  getSearchData() {
    let store = this.itemFormControl.value;
    if (store.length) {
      this.filterItem = [];
      this.filterItem = this.option.filter((item, i) => {
        return item.item_name.toLowerCase().includes(store.toLowerCase());
      });
    } else {
      this.filterItem = [];
      this.filterItem = this.option;
    }
  }

  getuomname() {
    this.option.forEach((item, i) => {
      ;
      if (item.item_name == this.itemFormControl.value) {
        let val = item.item_main_price.length ? item.item_main_price[0].item_uom.name : ''
        this.uomFormControl.setValue(val);
        this.selectedItem = item;
      }
    });
  }

  saveStock() {
    this.saveStockForm = true;
    if (this.stockFormBGroup.invalid) {
      return;
    }
    this.apiService.addStockItem({
      warehouse_id: this.codeData.id,
      item_id: this.selectedItem.id,
      item_uom_id: this.selectedItem.item_main_price[0].item_uom.id,
      qty: this.quantityFormControl.value,
      batch: this.batchFormControl.value
    }).subscribe((res: any) => {

      if (res.status) {
        this.getwarehouselist();
        this.uomFormControl.reset()
        this.uomFormControl.setErrors(null);

        this.itemFormControl.reset()
        this.itemFormControl.setErrors(null)

        this.quantityFormControl.reset()
        this.quantityFormControl.setErrors(null)

        this.batchFormControl.reset()
        this.batchFormControl.setErrors(null)
      }

    });


  }

  itemDisplayValue(value: any): string {
    return value ? `${value.item_name}` : '';
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }


  getPaginatorValue(len: number) {
    return len < 3 ? true : false;
  }

  cancelForm() {
    this.showForm = false
    this.stockFormBGroup.reset();
  }

  close(closeType?: any) {
    this.dialog.close(this.dataSource.data);
  }
}
