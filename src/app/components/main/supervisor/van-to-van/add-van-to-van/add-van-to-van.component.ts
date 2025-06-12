import { CommonToasterService } from './../../../../../services/common-toaster.service';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';
import {
  VanToVanModel,
  VanToVanItemsPayload,
  ITEM_VANTOVAN_TABLE_HEADS,
  VAN_LIST,
} from '../van-to-van.model';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  ItemAddTableHeader,
  OrderItemsPayload,
  ApiItemPriceStats,
} from 'src/app/components/main/transaction/orders/order-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-van-to-van',
  templateUrl: './add-van-to-van.component.html',
  styleUrls: ['./add-van-to-van.component.scss'],
})
export class AddVanToVanComponent implements OnInit {
  public todaydate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  public pageTitle: string;
  public isEditForm: boolean;
  public uuid: string;
  public isDepotOrder: boolean;
  public vanCode: string;
  public nextOrderNumber: string;
  public orderData: VanToVanModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public stockAdjstDetailCount: number = 0;
  public stockAdjstItemid: number[] = [];
  public vanFormGroup: FormGroup;
  public sourceFormControl: FormControl;
  public destinationFormControl: FormControl;
  public dateFormControl: FormControl;
  public codeFormControl: FormControl;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public payloadItems: VanToVanItemsPayload[] = [];
  public warehouses: {
    id: number;
    name: string;
  }[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedSourceVanId: any[] = [];
  public selectedDestVanId: any[] = [];

  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private elemRef: ElementRef;
  private finalVanPayload: any = {};
  public nextCommingNumberofOrderCode: string;
  nextCommingNumberofOrderCodePrefix: any;

  constructor(
    apiService: ApiService,
    private CommonToasterService: CommonToasterService,
    private datePipe: DatePipe,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      elemRef,
      formBuilder,
      router,
      route,
    });
  }

  public ngOnInit(): void {
    this.isEditForm = this.router.url.includes(
      'supervisor/van-to-van-transfer/edit'
    );
    this.itemTableHeaders = ITEM_VANTOVAN_TABLE_HEADS;
    this.sourceFormControl = new FormControl('', [Validators.required]);
    this.destinationFormControl = new FormControl('', [Validators.required]);
    this.dateFormControl = new FormControl('', [Validators.required]);
    this.codeFormControl = new FormControl('', [Validators.required]);

    this.vanFormGroup = this.formBuilder.group({
      source_route_id: this.sourceFormControl,
      destination_route_id: this.destinationFormControl,
      date: this.dateFormControl,
      code: this.codeFormControl,
      items: this.initItemFormArray(),
    });

    this.selectedSourceVanId = this.route.snapshot.data[
      'resolved'
    ].routedata.data;
    this.selectedDestVanId = this.route.snapshot.data[
      'resolved'
    ].routedata.data;
    this.subscriptions.push(
      this.apiService.getAllItems().subscribe((result) => {
        if (result.data.length) {
          let data = [];
          result.data.forEach((item) => {
            data.push(item);
          });
          this.items = data;
        }
      })
    );

    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result) => {
        this.uoms = result.data;
      })
    );

    if (this.isEditForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Van To Van Transfer';
      this.orderData = this.route.snapshot.data['returnvan'].returnPurchase;
      // this.apiService.getVanToVanById(this.uuid).subscribe((item) => {
      //   this.orderData = item.data;
      // });

      // this.orderData = this.route.snapshot.data['grn'];
      this.setupEditFormControls(this.orderData);
    } else {
      this.pageTitle = 'Add Van To Van Transfer';
      this.addItemFilterToControl(0);
    }

    this.warehouses = VAN_LIST.data;
    if (!this.isEditForm) {
      this.getOrderCode();
      this.codeFormControl.enable();
    } else {
      this.codeFormControl.disable();
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  getOrderCode() {
    let nextNumber = {
      function_for: 'van_to_van_transfer',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofOrderCode = res.data.number_is;
        this.nextCommingNumberofOrderCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofOrderCode) {
          this.codeFormControl.setValue(this.nextCommingNumberofOrderCode);
          this.codeFormControl.disable();
        } else if (this.nextCommingNumberofOrderCode == null) {
          this.nextCommingNumberofOrderCode = '';
          this.codeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofOrderCode = '';
        this.codeFormControl.enable();
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Van to Van  Code',
      functionFor: 'van_to_van_transfer',
      code: this.nextCommingNumberofOrderCode,
      prefix: this.nextCommingNumberofOrderCodePrefix,
      key: this.nextCommingNumberofOrderCode.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.codeFormControl.setValue('');
          this.nextCommingNumberofOrderCode = '';
          this.codeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          //this.grnNumber = res.data.next_coming_number_goodreceiptnote
          this.codeFormControl.setValue(
            res.data.next_coming_number_van_to_van_transfer
          );
          this.nextCommingNumberofOrderCode =
            res.data.next_coming_number_van_to_van_transfer;
          this.nextCommingNumberofOrderCodePrefix = res.reqData.prefix_code;
          this.codeFormControl.disable();
        }
      });
  }
  public setupEditFormControls(editData: VanToVanModel): void {
    const customer = this.isDepotOrder
      ? undefined
      : this.customers &&
      this.customers.find((cust) => cust.id === editData.id);
    this.filteredCustomers.push(customer);

    this.sourceFormControl.setValue(editData[0].sourceroute?.id);
    this.destinationFormControl.setValue(editData[0].destinationroute?.id);
    this.dateFormControl.setValue(editData[0].date);
    this.codeFormControl.setValue(editData[0].code);
    this.stockAdjstDetailCount = editData[0].vantovantransferdetail.length;
    editData[0].vantovantransferdetail.forEach(
      (item: VanToVanItemsPayload, index: number) => {
        this.stockAdjstItemid.push(item.id);
        this.addItemForm(item);
      }
    );
  }

  public addItemForm(item?: any): void {
    const itemControls = this.vanFormGroup.controls['items'] as FormArray;

    if (item) {
      itemControls.push(
        this.formBuilder.group({
          //'item': new FormControl(item.item_id, [ Validators.required ]),
          item: new FormControl(
            { id: item.item.id, name: item.item.item_name },
            [Validators.required]
          ),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          quantity: new FormControl(item.quantity, [Validators.required]),
          item_code: new FormControl(item.item_code, [Validators.required]),
        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          item_code: new FormControl(undefined, [Validators.required]),
          quantity: new FormControl(1, [Validators.required]),
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }

  // public sourceChanged(data: MatSelectChange): void {
  //   this.selectedSourceVanId = data.value;
  //   this.sourceFormControl.setValue(data.value);
  // }

  // public destinationChanged(data: MatSelectChange): void {
  //   this.selectedDestVanId = data.value;
  //   this.destinationFormControl.setValue(data.value);
  // }

  public goToGRNS(): void {
    this.router.navigate(['supervisor/van-to-van-transfer']);
  }

  public addItem(): void {
    this.addItemForm();
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );
    return selectedUom ? selectedUom.name : '';
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.vanFormGroup.get('items') as FormArray;
    return itemControls.controls;
  }

  public itemControlValue(item: Item): { id: string; name: string } {
    return { id: item.id, name: item.item_name };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
  }): string | undefined {
    return item ? item.name : undefined;
  }

  public customerControlDisplayValue(customer: Customer): string {
    return customer
      ? `${customer.user.firstname} ${customer.user.lastname}`
      : '';
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.vanFormGroup.get('items') as FormArray;
    itemControls.removeAt(index);
    this.itemNameSubscriptions.splice(index, 1);
    this.itemControlSubscriptions.splice(index, 1);
    this.payloadItems.splice(index, 1);
  }

  public itemDidSearched(data: any, index: number): void {
    const selectedItem = this.items.find((item: Item) => item.id === data.id);
    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    const uomControl = itemFormGroup.controls.item_uom_id;
    const itemCodeControl = itemFormGroup.controls.item_code;

    uomControl.setValue(selectedItem.lower_unit_uom_id);
    itemCodeControl.setValue(selectedItem.item_code);

    this.updatePayloadItem(itemFormGroup, index);
  }

  public updatePayloadItem(itemFormGroup: FormGroup, index: number): void {
    const payloadItem: VanToVanItemsPayload = {
      item: itemFormGroup.value.item,
      item_code: itemFormGroup.value.item_code,
      item_id: itemFormGroup.value.item.id,
      item_qty: itemFormGroup.value.quantity,
      item_uom_id: itemFormGroup.value.item_uom_id,
      quantity: itemFormGroup.value.quantity,
    };

    this.payloadItems[index] = payloadItem;
  }

  public postFinalOrder(target: string): void {
    const finalPayload = {
      ...this.vanFormGroup.value,
    };
    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;
    this.finalVanPayload = { ...finalPayload };
    this.makeOrderPostCall(target);
  }

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);
    if (this.isEditForm) {
      return formArray;
    }
    formArray.push(
      this.formBuilder.group({
        item: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        quantity: new FormControl(1, [Validators.required]),
        item_code: new FormControl(undefined, [Validators.required]),
      })
    );
    return formArray;
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.vanFormGroup.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    this.itemNameSubscriptions.push(
      newFormGroup.controls['item'].valueChanges
        .pipe(
          startWith<string | Item>(''),
          map((value) => (typeof value === 'string' ? value : value.item_name)),
          map((value: string) => {
            return value ? this.filterItems(value) : this.items.slice();
          })
        )
        .subscribe((result: Item[]) => {
          this.filteredItems = result;
        })
    );

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.valueChanges.subscribe((result) => {
        const groupIndex = itemControls.controls.indexOf(newFormGroup);
        this.updatePayloadItem(newFormGroup, groupIndex);
      })
    );
  }

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();
    return this.items.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue)
    );
  }

  public checkFormValidation(): boolean {
    if (!this.isDepotOrder && this.sourceFormControl.invalid) {
      Utils.setFocusOn('sourceFormField');
      return false;
    }
    if (this.isDepotOrder && this.destinationFormControl.invalid) {
      Utils.setFocusOn('destFormField');
      return false;
    }
    if (this.dateFormControl.invalid) {
      Utils.setFocusOn('vanDate');
      return false;
    }
    return true;
  }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: ApiItemPriceStats
  ): VanToVanItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_qty: form.controls.quantity.value,
      item_uom_id: form.controls.item_uom_id.value,
      item_code: form.controls.item_code.value,
      quantity: form.controls.quantity.value,
    };
  }

  private makeOrderPostCall(target: string): void {
    if (!this.checkFormValidation()) {
      return;
    }
    if (
      this.finalVanPayload.source_route_id ==
      this.finalVanPayload.destination_route_id
    ) {
      this.CommonToasterService.showError(
        '',
        'Source Route and Destination Route cannnot be same'
      );
      return;
    } else {
      if (target === 'order') {
        if (this.isEditForm) {
          this.finalVanPayload.items.forEach((item, i) => {
            if (i < this.stockAdjstDetailCount) {
              item['id'] = this.stockAdjstItemid[i];
            } else if (i > this.stockAdjstDetailCount - 1) {
              item['id'] = 0;
            }
          });
          this.finalVanPayload['code'] = this.codeFormControl.value;
          this.subscriptions.push(
            this.apiService
              .editVantoVan(this.orderData[0].uuid, this.finalVanPayload)
              .subscribe((result) => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Edited Successfully!Please check the table'
                );
                this.router.navigate(['supervisor/van-to-van-transfer']);
              })
          );
        } else {
          this.finalVanPayload['code'] = this.codeFormControl.value;
          this.subscriptions.push(
            this.apiService
              .addVantoVan(this.finalVanPayload)
              .subscribe((result) => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Added Successfully!Please check the table'
                );
                this.router.navigate(['supervisor/van-to-van-transfer']);
              })
          );
        }
      }
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
