import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MerchandisingService } from '../../merchandising.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-add-stockinstore',
  templateUrl: './add-stockinstore.component.html',
  styleUrls: ['./add-stockinstore.component.scss'],
})
export class AddStockinstoreComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public stockinstoreFormGroup;
  public ItemCodeFormControl;
  public ItemUomCodeFormControl;
  public capacityFormControl;
  public stockinstoredata;
  private isEdit: boolean;
  public formType: string;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  public customer: any[] = [];
  public itemData: any[] = [];
  public itemUomData: any[] = [];
  public uomFilter: any[] = [];
  private subscriptions: Subscription[] = [];
  depots: any;
  public displayedColumns = ['itemUom', 'itemName', 'capacity', 'actions'];
  public itemSource: any;
  private itemCodeList: {
    item_id: number;
    item_uom_id: number;
  }[] = [];
  private updateItemCode: {
    index: number;
    isEdit: boolean;
  };

  constructor(
    private fb: FormBuilder,
    fds: FormDrawerService,
    public merService: MerchandisingService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private router: Router,
    private apiService: ApiService
  ) {
    Object.assign(this, { fds, merService, dataEditor, apiService });
    this.itemSource = new MatTableDataSource<any>();
  }
  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => (this.formType = s));
    this.ItemCodeFormControl = new FormControl('', [Validators.required]);
    this.ItemUomCodeFormControl = new FormControl('', [Validators.required]);
    this.capacityFormControl = new FormControl('',);
    this.stockinstoreFormGroup = this.fb.group({
      activityName: ['', [Validators.required]],
      validFrom: ['', [Validators.required]],
      validTo: ['', [Validators.required]],
      customers: ['', [Validators.required]],
      assignInventoryDetails: [[]],
    });

    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customer = result.data.customers.map(item => {
          return {
            ...item,
            lastname: item.lastname + ' - ' + item.customer_info.customer_code
          }
        })

        this.itemData = result.data.items;
        this.itemUomData = result.data.item_uom;
      })
    );
    // this.subscriptions.push(
    //   this.merService.getStockLists().subscribe((res: any) => {
    //     this.customer = res.customers.data;
    //     this.itemData = res.items.data;
    //     this.itemUomData = res.uoms.data;
    //   })
    // );

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.stockinstoreFormGroup?.reset();
      this.updateItemSource([]);
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;

          if (data && data.uuid && this.isEdit) {
            let customerObj = [];
            let itemUomObj = [];
            data.assign_inventory_customer.forEach((element) => {
              customerObj.push({ id: element.customer_id, itemName: `${element.customer?.firstname} ${element.customer?.lastname}` });
            });

            data.assign_inventory_details.forEach((element) => {
              itemUomObj.push({
                item_id: element.item?.id,
                item_name: element.item?.item_name,
                item_uom_id: element.item_uom?.id,
                item_uom_name: element.item_uom?.name,
                capacity: element.capacity
              });
            });
            this.stockinstoreFormGroup.patchValue({
              activityName: data.activity_name,
              validFrom: data.valid_from,
              validTo: data.valid_to,
              customers: customerObj,
              assignInventoryDetails: itemUomObj,
            });

            this.updateItemSource(itemUomObj);
            this.stockinstoredata = data;
            this.isEdit = true;
          }

          return;
        })
      );
    });
  }

  getUomListByItem(selectedItemId) {
    let itemFilter = this.itemData.filter(
      (item) => item.id == parseInt(selectedItemId)
    )[0];

    let uomFilter = this.itemUomData.filter(
      (item) => item.id == parseInt(itemFilter['lower_unit_uom_id'])
    );

    let secondaryUomFilterIds = [];
    let secondaryUomFilter = [];
    let itemArray: any[] = [];
    if (itemFilter.item_main_price && itemFilter.item_main_price.length) {
      itemFilter.item_main_price.forEach((item) => {
        secondaryUomFilterIds.push(item.item_uom_id);
      });
      this.itemUomData.forEach((item) => {
        if (secondaryUomFilterIds.includes(item.id)) {
          secondaryUomFilter.push(item);
        }
      });
    }

    if (uomFilter.length && secondaryUomFilter.length) {
      itemArray = [...uomFilter, ...secondaryUomFilter];
    } else if (uomFilter.length) {
      itemArray = [...uomFilter];
    } else if (secondaryUomFilter.length) {
      itemArray = [...secondaryUomFilter];
    }

    this.uomFilter = itemArray;
  }

  public editItemCode(num: number, itemCodeData: any): void {
    this.ItemCodeFormControl.setValue(itemCodeData.item_id);
    this.getUomListByItem(itemCodeData.item_id);
    this.ItemUomCodeFormControl.setValue(itemCodeData.item_uom_id);
    this.capacityFormControl.setValue(itemCodeData.capacity);
    this.updateItemCode = {
      index: num,
      isEdit: true,
    };
  }

  public deleteItemCode(index: number): void {
    let ItemFormControl = this.stockinstoreFormGroup.value
      .assignInventoryDetails;
    ItemFormControl.splice(index, 1);
    this.updateItemSource(ItemFormControl);
  }

  public addItemCode(): void {
    if (this.updateItemCode && this.updateItemCode.isEdit) {
      this.updateExistingItemCode(
        this.updateItemCode && this.updateItemCode.index
      );
    }
    let ItemFormControl =
      this.stockinstoreFormGroup.value.assignInventoryDetails == null
        ? []
        : this.stockinstoreFormGroup.value.assignInventoryDetails;
    if (
      this.ItemCodeFormControl.value == '' ||
      this.ItemUomCodeFormControl.value == ''
    ) {
      return;
    }
    let check1 = undefined;
    check1 = ItemFormControl.filter(
      (x) => x['item_id'] === this.ItemCodeFormControl.value
    );
    if (check1 !== undefined && check1.length > 0) {
      return;
    }

    let itemName = '';
    let itemUom = '';
    let itemCapcity = this.capacityFormControl.value;
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value) {
        itemName = item.item_name;
      }
    });
    this.itemUomData.forEach((item, i) => {
      if (item.id == this.ItemUomCodeFormControl.value) {
        itemUom = item.name;
      }
    });
    const itemCode = {
      item_id: this.ItemCodeFormControl.value,
      item_name: itemName,
      item_uom_id: this.ItemUomCodeFormControl.value,
      item_uom_name: itemUom,
      capacity: itemCapcity
    };
    this.itemCodeList.push(itemCode);
    ItemFormControl.push(itemCode);
    this.stockinstoreFormGroup.patchValue({
      assignInventoryDetails: ItemFormControl,
    });
    this.updateItemSource(ItemFormControl);
  }

  public updateExistingItemCode(index: number): void {
    let itemName = '';
    let itemUom = '';
    let itemCapacity = this.capacityFormControl.value;
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value) {
        itemName = item.item_name;
      }
    });
    this.itemUomData.forEach((item, i) => {
      if (item.id == this.ItemUomCodeFormControl.value) {
        itemUom = item.name;
      }
    });
    let ItemFormControl = this.stockinstoreFormGroup.value
      .assignInventoryDetails;
    ItemFormControl.splice(index, 1, {
      item_id: this.ItemCodeFormControl.value,
      item_name: itemName,
      item_uom_id: this.ItemUomCodeFormControl.value,
      item_uom_name: itemUom,
      capacity: itemCapacity,
    });
    this.updateItemCode = undefined;
    this.updateItemSource(ItemFormControl);
  }

  private updateItemSource(ItemFormControl): void {
    //console.log(ItemFormControl);
    this.itemSource = new MatTableDataSource<any>(ItemFormControl);
    this.itemSource.paginator = this.paginator;
    this.ItemCodeFormControl.setValue('');
    this.ItemUomCodeFormControl.setValue('');
    this.capacityFormControl.setValue('');
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  private resetItemSource(): void {
    this.itemSource = new MatTableDataSource();
  }

  public close() {
    this.fds.close();
    this.stockinstoreFormGroup.reset();
    this.updateItemSource([]);
    this.isEdit = false;
  }
  public saveStockinstoreData(): void {
    if (this.stockinstoreFormGroup.invalid) {
      return;
    }

    if (this.isEdit) {
      this.editStockinstoreData();

      return;
    }

    this.postStockinstoreData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postStockinstoreData() {
    let form = this.stockinstoreFormGroup.value;
    let customers = [];
    if (form.customers && form.customers.length > 0) {
      customers = form.customers.map(x => x.id);
    }

    form.status = 1;
    let sForm = {
      activity_name: form.activityName,
      valid_from: form.validFrom,
      valid_to: form.validTo,
      customers: customers,
      assign_inventory_details: form.assignInventoryDetails,
      status: form.status,
    };
    this.merService.addStockinstore(sForm).subscribe((result: any) => {
      let data = result.data;
      data.edit = false;
      this.updateTableData.emit(data);
      this.fds.close();
    });
  }

  private editStockinstoreData(): void {
    let form = this.stockinstoreFormGroup.value;
    let customers = [];
    if (form.customers && form.customers.length > 0) {
      customers = form.customers.map(x => x.id);
    }

    form.status = 1;
    let sForm = {
      activity_name: form.activityName,
      valid_from: form.validFrom,
      valid_to: form.validTo,
      customers: customers,
      assign_inventory_details: form.assignInventoryDetails,
      status: form.status,
    };
    this.merService
      .editStockinstore(this.stockinstoredata.uuid, sForm)
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }
}
