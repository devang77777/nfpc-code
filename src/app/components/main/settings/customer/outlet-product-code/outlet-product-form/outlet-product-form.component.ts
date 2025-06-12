import { CommonToasterService } from './../../../../../../services/common-toaster.service';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { FormDrawerService } from '../../../services/form-drawer.service';
// import { ApiService } from '../../../services/api.service';
// import { DataEditor } from '../../../services/data-editor.service';
import { Subscription } from 'rxjs';
// import { Utils } from '../../../services/utils';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
// import { OutletProductModel } from '../../datatables/outlet-product-data-table/outlet-product-data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { OutletProductModel } from '../outlet-product-data-table/outlet-product-data-table.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
// import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';

@Component({
  selector: 'app-outlet-product-form',
  templateUrl: './outlet-product-form.component.html',
  styleUrls: ['./outlet-product-form.component.scss'],
})
export class OutletProductFormComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public outletProdFormGroup: FormGroup;
  public opCodeFormControl: FormControl;
  public opNameFormControl: FormControl;
  public customersFormControl: FormControl;
  public itemsFormControl: FormControl;

  public customers: any;
  public items: any;
  public itemSource: any;
  public displayedColumns = ['itemCode', 'outletItemCode', 'actions'];

  public itemFormGroup: FormGroup;
  public itemCodeFormControl: FormControl;
  public outletItemCodeFormControl: FormControl;

  public itemInvalid: boolean;

  public formType: string;
  private isEdit: boolean;
  private outletProductData: OutletProductModel;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  nextCommingNumberofoutletCode: string = '';
  private subscriptions: Subscription[] = [];
  private itemCodeList: {
    item_id: number;
    outlet_item_code: number;
  }[] = [];
  private updateItemCode: {
    index: number;
    isEdit: boolean;
  };
  private toaster: CommonToasterService;
  nextCommingNumberofoutletCodePrefix: any;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    toaster: CommonToasterService
  ) {
    Object.assign(this, { fds, apiService, dataEditor, toaster });
    this.itemSource = new MatTableDataSource<any>();
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  public ngOnInit(): void {
    this.subscriptions.push(
      this.apiService.getCustomers().subscribe((result) => {
        this.customers = result.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getAllItems().subscribe((result) => {
        this.items = result.data;
      })
    );
    this.opCodeFormControl = new FormControl('', [Validators.required]);
    this.opNameFormControl = new FormControl('', [Validators.required]);
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.outletProdFormGroup?.reset();
      this.itemSource = new MatTableDataSource<any>();
      if (this.formType != 'Edit') {
        this.getoutletCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          if (data && data.uuid && this.isEdit) {
            this.opCodeFormControl.setValue(data.code);
            this.opCodeFormControl.disable();
            this.opNameFormControl.setValue(data.name);
            this.customersFormControl.setValue(
              data.outlet_product_code_customers.map(
                (customer) => customer.customer_id
              )
            );
            this.itemsFormControl.setValue(
              data.outlet_product_code_items.map((item) => {
                return {
                  item_id: item.item_id,
                  outlet_product_code: item.outlet_product_code,
                };
              })
            );
            this.outletProductData = data;
            this.isEdit = true;
            if (this.itemsFormControl.value.length) {
              this.updateItemSource();
            }
          }
          return;
        })
      );
    });
    this.opCodeFormControl = new FormControl('', [Validators.required]);
    this.opNameFormControl = new FormControl('', [Validators.required]);
    this.customersFormControl = new FormControl([]);
    this.itemsFormControl = new FormControl([], [Validators.required]);

    this.itemCodeFormControl = new FormControl('', [Validators.required]);
    this.outletItemCodeFormControl = new FormControl('', [Validators.required]);
    this.itemCodeFormControl = new FormControl('', [Validators.required]);
    this.outletItemCodeFormControl = new FormControl('', [Validators.required]);

    this.outletProdFormGroup = new FormGroup({
      vanDescription: this.opCodeFormControl,
      vanPlateNumber: this.opNameFormControl,
      customers: this.customersFormControl,
      items: this.itemsFormControl,
    });

    this.itemFormGroup = new FormGroup({
      itemCode: this.itemCodeFormControl,
      outletItemCode: this.outletItemCodeFormControl,
    });
    this.opCodeFormControl.disable();
  }
  getoutletCode() {
    let nextNumber = {
      function_for: 'outlet_product_codes',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofoutletCode = res.data.number_is;
        this.nextCommingNumberofoutletCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofoutletCode) {
          this.opCodeFormControl.setValue(this.nextCommingNumberofoutletCode);
          this.opCodeFormControl.disable();
        } else if (this.nextCommingNumberofoutletCode == null) {
          this.nextCommingNumberofoutletCode = '';
          this.opCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofoutletCode = '';
        this.opCodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }

  public close() {
    this.fds.close();
    this.outletProdFormGroup.reset();
    this.itemFormGroup.reset();
    this.resetItemSource();
    this.isEdit = false;
  }

  public saveOutletProductCode(): void {
    if (!(this.itemsFormControl.value.length > 0)) {
      this.itemInvalid = true;
    }
    if (this.outletProdFormGroup.invalid) {
      return;
    }

    if (this.isEdit) {
      this.editOutletProductData();

      return;
    }

    this.postOutletProductData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public editItemCode(num: number, itemCodeData: any): void {
    this.itemCodeFormControl.setValue(itemCodeData.item_id);
    this.outletItemCodeFormControl.setValue(itemCodeData.outlet_product_code);
    this.updateItemCode = {
      index: num,
      isEdit: true,
    };
  }

  public deleteItemCode(index: number): void {
    this.itemsFormControl.value.splice(index, 1);
    this.updateItemSource();
  }

  public addItemCode(): void {
    if (this.updateItemCode && this.updateItemCode.isEdit) {
      this.updateExistingItemCode(
        this.updateItemCode && this.updateItemCode.index
      );
    }

    if (this.itemFormGroup.invalid) {
      return;
    }
    const data = this.itemSource.data.find(
      (x) => x.item_id == this.itemCodeFormControl.value
    );
    if (data) {
      this.toaster.showWarning('Duplicate item not allowed');
      return;
    }

    const itemCode = {
      item_id: this.itemCodeFormControl.value,
      outlet_product_code: this.outletItemCodeFormControl.value,
    };
    const itemPrice = this.itemsFormControl.value
      ? this.itemsFormControl.value
      : [];
    this.itemsFormControl.setValue([...itemPrice, itemCode]);
    this.updateItemSource();
  }

  public updateExistingItemCode(index: number): void {
    this.itemsFormControl.value.splice(index, 1, {
      item_id: this.itemCodeFormControl.value,
      outlet_product_code: this.outletItemCodeFormControl.value,
    });
    this.updateItemCode = undefined;
    this.updateItemSource();
  }

  private updateItemSource(): void {
    this.itemSource = new MatTableDataSource<any>(this.itemsFormControl.value);
    this.itemSource.paginator = this.paginator;
    this.itemFormGroup.reset();
  }
  getItemName(id) {
    const data = this.items.find((x) => x.id == id);
    if (data) {
      return `${data.item_code}/${data.item_name}`;
    }
  }
  private resetItemSource(): void {
    this.itemSource = new MatTableDataSource();
  }

  private postOutletProductData(): void {
    const customerIds = this.customersFormControl.value.map((id) => {
      return { customer_id: id };
    });

    this.apiService
      .addNewOutletProductCode({
        name: this.opNameFormControl.value,
        code: this.opCodeFormControl.value,
        customers: customerIds,
        items: this.itemsFormControl.value,
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
        this.resetItemSource();
      });
  }

  private editOutletProductData(): void {
    const customerIds = this.customersFormControl.value.map((id) => {
      return { customer_id: id };
    });

    this.apiService
      .editOutletProductCode(this.outletProductData.uuid, {
        name: this.opNameFormControl.value,
        code: this.opCodeFormControl.value,
        customers: customerIds,
        items: this.itemsFormControl.value,
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
        this.resetItemSource();
      });
  }
  open() {
    let response: any;
    let data = {
      title: 'Outlet Code',
      functionFor: 'outlet_product_codes',
      code: this.nextCommingNumberofoutletCode,
      prefix: this.nextCommingNumberofoutletCodePrefix,
      key: this.nextCommingNumberofoutletCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: '340px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.opCodeFormControl.setValue('');
          this.nextCommingNumberofoutletCode = '';
          this.opCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.opCodeFormControl.setValue(
            res.data.next_coming_number_outlet_product_codes
          );
          this.nextCommingNumberofoutletCode =
            res.data.next_coming_number_outlet_product_codes;
          this.nextCommingNumberofoutletCodePrefix = res.reqData.prefix_code;
          this.opCodeFormControl.disable();
        }
      });
  }
}
