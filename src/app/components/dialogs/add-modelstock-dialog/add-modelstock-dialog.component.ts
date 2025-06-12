import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { MerchandisingService } from '../../main/merchandising/merchandising.service';
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
  Validators, FormArray
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-add-modelstock-dialog',
  templateUrl: './add-modelstock-dialog.component.html',
  styleUrls: ['./add-modelstock-dialog.component.scss'],
})
export class AddModelStockDialogComponent implements OnInit {
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns = ['select', 'item_code', 'item_name', 'item_uom', 'capacity', 'total_number_of_facing']
  public filterColumns: ColumnConfig[] = [];


  capacityFormControl;
  public item: any;
  public filterItem: any[] = [];
  public selectedItem: any;
  showForm: boolean = false;
  public stockData: any;
  filteredOptions: Observable<string[]>;
  public saveStockForm: boolean = false;
  option: any[] = [];
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
    public fb: FormBuilder,
    public merService: MerchandisingService,
    private cd: ChangeDetectorRef,
    private cts: CommonToasterService,
    @Inject(MAT_DIALOG_DATA) public codeData: any,
    private dialog: MatDialogRef<AddModelStockDialogComponent>
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<any>();
  }
  itemUomLists = [];
  itemsFormGroup;
  public ngOnInit(): void {
    this.itemsFormGroup = this.fb.group({
      capacity: this.fb.array([])
    })
    let capacityFormArray = this.itemsFormGroup.get('capacity') as FormArray;
    this.subscriptions.push(
      this.merService.getmodelStockLists().subscribe((result: any) => {
        this.itemUomLists = result.uoms.data;
        let resLength = result.items.data.length;
        let indexLength = 0;
        result.items.data.forEach((element, i) => {
          capacityFormArray.push(this.addControl(element['uuid']));
          indexLength = i + 1;
          this.cd.detectChanges();
          if (resLength == indexLength) {
            //console.log(capacityFormArray);
            this.dataSource = new MatTableDataSource<any>(result.items.data);
            this.dataSource.paginator = this.paginator;
            this.cd.detectChanges();

          }
        });

      })
    );

    this.filterItem = this.option;
  }

  addControl(item_id) {
    // console.log(this.itemUomLists[0]);
    let fGroup = this.fb.group({
      capacityValue: [''],
      totalFacing: [''],
      item_id: [item_id],
      item_uom_id: [this.itemUomLists[0]?.id]
    })
    return fGroup;
  }

  saveCustomerItems() {
    let selectedItems = this.selections.selected;
    if (selectedItems.length <= 0) {
      return false;
    }
    let form = this.itemsFormGroup.value.capacity;

    let items = [];
    let misingValuescount = 0;
    //console.log(selectedItems, form);
    selectedItems.forEach((element) => {
      let capacity = form.filter(x => x['item_id'] === element['uuid'])[0];
      let controlIndex = form.indexOf(capacity);
      if (capacity.capacityValue == "") {
        // this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['capacityValue'].markAsTouched();
        // this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['capacityValue'].setErrors({ required: true });
        // misingValuescount += 1;
        this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['capacityValue'].setErrors(null);
      } else {
        this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['capacityValue'].setErrors(null);
      }
      if (capacity.totalFacing == "") {
        // this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['totalFacing'].markAsTouched();
        // this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['totalFacing'].setErrors({ required: true });
        // misingValuescount += 1;
        this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['totalFacing'].setErrors(null);
      } else {
        this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['totalFacing'].setErrors(null);
      }
      if (capacity.item_uom_id == "") {
        // this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['totalFacing'].markAsTouched();
        // this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['totalFacing'].setErrors({ required: true });
        // misingValuescount += 1;
        this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['item_uom_id'].setErrors(null);
      } else {
        this.itemsFormGroup.controls.capacity.controls[controlIndex].controls['item_uom_id'].setErrors(null);
      }
      let obj = {
        item_id: element.id,
        item_uom_id: capacity.item_uom_id,
        capacity: capacity.capacityValue || 0,
        total_number_of_facing: capacity.totalFacing || 0
      }
      items.push(obj);
    })


    if (misingValuescount > 0) {
      return false;
    }
    let sForm = {
      customer_id: this.codeData.customer_id,
      distribution_id: this.codeData.distribution_id,
      items: items
    }
    this.merService.addModelStock(sForm).subscribe((result: any) => {
      this.close();
    });
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;

  }

  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.option.filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }


  getPaginatorValue(len: number) {
    return len < 3 ? true : false;
  }

  close(closeType?: any) {
    this.dialog.close();
  }
}
