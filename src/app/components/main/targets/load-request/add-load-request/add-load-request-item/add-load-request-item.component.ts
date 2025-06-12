import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { map, startWith, exhaustMap, distinctUntilChanged } from 'rxjs/operators';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MasterService } from 'src/app/components/main/master/master.service';

@Component({
  selector: 'app-add-load-request-item',
  templateUrl: './add-load-request-item.component.html',
  styleUrls: ['./add-load-request-item.component.scss']
})
export class AddLoadRequestItemComponent implements OnInit {
  @Input() salesmanLoadFormGroup: FormGroup;
  @Input() editData: any;
  depotid: any;
  public pageTitle: string;
  public isEditForm: boolean;
  public uuid: string;

  public itemTableHeaders: any[] = [];
  itemQtyAvlaible = [];
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public uomArray = [];
  public orderFormGroup: FormGroup;
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();

  private router: Router;
  private apiService: ApiService;
  private masterService: MasterService;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  filterValue = '';
  itemfilterValue = '';
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  public isLoading: boolean;
  routeItemQtyRecords: any[] = [];;

  constructor(apiService: ApiService, private dataService: DataEditor, formBuilder: FormBuilder, router: Router, route: ActivatedRoute, masterService: MasterService) {
    Object.assign(this, { apiService, dataService, formBuilder, router, route, masterService });
  }

  public ngOnInit(): void {

    this.orderFormGroup = new FormGroup({
      'items': this.initItemFormArray()
    });
    this.subscriptions.push(
      this.masterService.itemDetailListTable({ page: this.itempage, page_size: 10 }).subscribe((result) => {
        this.itempage++;
        this.items = result.data;
        this.addItemFilterToControl(0);
        this.filteredItems = result.data;
        this.item_total_pages = result.pagination?.total_pages
      })
    );
    // this.subscriptions.push(this.apiService.getAllItems().subscribe(result => {
    //   this.items = result.data;
    //   this.addItemFilterToControl(0);
    //   // this.isItemFormReady = true;
    // }));
    this.subscriptions.push(this.apiService.getAllItemUoms().subscribe(result => {
      this.uoms = result.data;
    }));
    this.salesmanLoadFormGroup.addControl('items', this.orderFormGroup.controls['items'])
    this.itemlookup$
      .pipe(exhaustMap(() => {
        return this.masterService.itemDetailListTable({ item_name: this.itemfilterValue.toLowerCase(), page: this.itempage, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        if (this.itemfilterValue == "") {
          if (this.itempage > 1) {
            this.items = [...this.items, ...res.data];

            this.filteredItems = [...this.filteredItems, ...res.data];
          } else {
            this.items = res.data;
            this.filteredItems = res.data;
          }
          this.itempage++;
          this.item_total_pages = res?.pagination?.total_pages;
        } else {
          this.itempage = 1;
          this.filteredItems = res.data;
        }
      });
    this.dataService.depotId.subscribe(res => {
      this.depotid = res;
      this.onHandQtyCheck();
    });

  }

  onScrollItem() {
    console.log(this.item_total_pages, this.itempage)
    if (this.item_total_pages < this.itempage) return;
    this.isLoading = true;
    this.itemlookup$.next(this.itempage);
  }

  public ngOnChanges() {
    this.isEditForm = this.router.url.includes('/edit/');
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    if (this.editData) {
      console.log(this.editData);
      const itemControl = this.orderFormGroup.controls['items'] as FormArray;
      itemControl.removeAt(0);
      this.editData.salesman_load_details.forEach((item, index) => {
        let row = this.formBuilder.group({
          'item': [{ id: item.item?.id, name: item.item?.item_name }],
          'uom': [item.item_uom],
          'qty': [item.load_qty],
          'uom_list': []
        })
        // //console.log(row);
        // this.uomArray.push([this.uoms])


        // replace timeout by condition when item isselected
        setTimeout(() => {
          this.onItemSelection({ id: item.item?.id, name: item.item?.item_name }, index);
        }, 1000)

        itemControl.push(row);
      })

      // this.setupEditFormControls(this.editData);
    } else {

    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
  }
  public setupEditFormControls(editData): void {
    editData.salesman_load_details.forEach((item, index: number) => {
      this.addItemForm(item);
      this.itemDidSearched(item, index, true);
    });
  }
  public addItemForm(item?: any): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    if (item) {
      itemControls.push(this.formBuilder.group({
        'item': new FormControl({ id: item.item?.id, name: item.item?.item_name }, [Validators.required]),
        'uom': new FormControl(item.item_uom, [Validators.required]),
        'qty': new FormControl(item.load_qty, [Validators.required]),
        'onhand_qty': new FormControl(''),
        'uom_list': new FormControl([item.uom_info])
      }));
    } else {
      itemControls.push(this.formBuilder.group({
        'item': new FormControl('', [Validators.required]),
        'uom': new FormControl(undefined, [Validators.required]),
        'qty': new FormControl('1', [Validators.required]),
        'onhand_qty': new FormControl(''),
        'uom_list': new FormControl([])
      }));
    }

    this.uomArray.push([])
    this.addItemFilterToControl(itemControls.controls.length - 1);
  }
  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    formArray.push(this.formBuilder.group({
      'item': new FormControl('', [Validators.required]),
      'uom': new FormControl(undefined, [Validators.required]),
      'qty': new FormControl('1', [Validators.required]),
      'onhand_qty': new FormControl(''),
      'uom_list': new FormControl([])
    }));
    this.uomArray.push([]);
    return formArray;
  }


  public itemDidSearched(data: any, index: number, isFromEdit?: boolean): void {
    //
    if (isFromEdit) {
      const selectedItem = this.items.find((item: Item) => item.id === data.item_id);
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      const uomControl = itemFormGroup.controls.uom;
      this.setUpRelatedUom(selectedItem, itemFormGroup);
    }
    else if (!isFromEdit) {

      const selectedItem = this.items.find((item: Item) => item.id === data.id);
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      const uomControl = itemFormGroup.controls.uom;
      this.setUpRelatedUom(selectedItem, itemFormGroup);
    }

    // uomControl.setValue(selectedItem.lower_unit_uom_id);
    // this.showSpinner = false;
  }

  public isStockCheck(data) {
    if (!data.controls.uom.value) {
      return;
    }
    console.log(data);
    console.log(this.salesmanLoadFormGroup.value);
    const model = {
      item_id: data.controls.item.value.id,
      item_uom_id: data.controls.uom.value,
      item_qty: data.controls.qty.value || 1,
      // route_id: this.salesmanLoadFormGroup.get('route').value || 0,
      depot_id: this.depotid || 0,
    };
    this.apiService
      .isStockCheck(model)
      .pipe()
      .subscribe((result) => {
        this.itemQtyAvlaible[data.item.id] = result.data;
      }, err => {
        this.itemQtyAvlaible[data.controls['item'].value?.id] = false;

      })
  }

  public onHandQtyCheck() {
    let items = [];


    this.itemFormControls.controls.forEach(element => {
      if (element.value.item.id)
        items.push(element.value.item.id);
    });

    if (items.length == 0) {
      return;
    }
    const model = {
      depot_id: this.depotid || 0,
      item_id: items
    };
    this.apiService
      .onHandQtyCheck(model)
      .pipe()
      .subscribe((result) => {
        this.routeItemQtyRecords = result.data;
        this.filterQtyHand();
      }, err => {
        this.filterQtyHand();
      });
  }

  filterQtyHand() {
    this.itemFormControls.controls.forEach(element1 => {
      var index = 0;

      this.routeItemQtyRecords?.forEach(element => {

        index++;
        if (element1.value.item.id == element.item_id) {
          element1.get('onhand_qty').setValue(element.qty);
          index--;
        }

        if (index == this.routeItemQtyRecords?.length) {
          element1.get('onhand_qty').setValue(0.00);
        }
      });
      if (this.routeItemQtyRecords.length == 0) {
        element1.get('onhand_qty').setValue(0.00);

      }
    });
  }

  setUpRelatedUom(selectedItem: any, formGroup: FormGroup) {
    //
    const uomControl = formGroup.controls.uom;
    const baseUomFilter = this.uoms.filter((item) => item.id == parseInt(selectedItem.lower_unit_uom_id));
    if (baseUomFilter.length) {
      formGroup.controls.uom_list.setValue([...baseUomFilter]);
    }
    const secondaryUomFilterIds = [];
    const secondaryUomFilter = [];
    if (selectedItem.item_main_price && selectedItem.item_main_price.length) {
      selectedItem.item_main_price.forEach((item) => {
        secondaryUomFilterIds.push(item.item_uom_id);
      });
      this.uoms.forEach((item) => {
        if (secondaryUomFilterIds.includes(item.id)) {
          secondaryUomFilter.push(item);
        }
      });
      if (secondaryUomFilter.length) {
        formGroup.controls.uom_list.setValue([...baseUomFilter, ...secondaryUomFilter]);
      }
    }
    if (baseUomFilter.length) {
      uomControl.setValue(selectedItem.lower_unit_uom_id);
    }
    else {
      uomControl.setValue(secondaryUomFilter[0].id);
    }
  }




  private addItemFilterToControl(index: number): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    this.itemNameSubscriptions.push(
      newFormGroup.controls['item'].valueChanges
        .pipe(
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        )
        .pipe(
          startWith<string | Item>(''),
          map((value) => (typeof value === 'string' ? value : value.item_name)),
          map((value: string) => {
            return value;
          })
        ).subscribe((res) => {
          this.itemfilterValue = res || "";
          this.itempage = 1;
          this.itemlookup$.next(this.itempage)
        })
    );

    // this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(newFormGroup.valueChanges.subscribe(result => {
      const groupIndex = itemControls.controls.indexOf(newFormGroup);

      if (newFormGroup.controls['item'].value && newFormGroup.controls['uom'].value) {
        //this.isStockCheck(result);
        //this.showError(result);
        const params: any = {
          item: result.item.id,
          uom: result.uom,
          qty: result.qty
        };
        // this.subscriptions.push(this.apiService.getOrderItemStats(params).subscribe(stats => {
        //   this.payloadItems[groupIndex] = this.setupPayloadItemArray(newFormGroup, stats.data);
        //   this.generateOrderFinalStats();
        // }));
      }

      if (newFormGroup.controls['onhand_qty'].value) {
        this.showError(result);
      }
    }));

  }
  showError(data) {
    if (parseInt(data.onhand_qty) >= parseInt(data.qty)) {
      this.itemQtyAvlaible[data.item.id] = true;
      console.log(this.itemQtyAvlaible);
    } else {
      this.itemQtyAvlaible[data.item.id] = false;
      console.log(this.itemQtyAvlaible);
    }
  }
  public addItem(): void {
    this.addItemForm();
  }
  onItemSelection(event, i) {
    //console.log(event, i);
    let selectedItem;
    let filteredUOMs: any[] = [];
    this.items.forEach(item => {
      if (item.id == event.id) {
        selectedItem = item
      }
    })
    //console.log(selectedItem);
    if (selectedItem) {
      let secondaryUOMs = [];
      selectedItem?.item_main_price.forEach(uom => {
        secondaryUOMs.push(uom.item_uom);
      })
      filteredUOMs = [...filteredUOMs, ...secondaryUOMs]
      filteredUOMs.push(selectedItem?.item_uom_lower_unit)
    }
    this.uomArray[i] = filteredUOMs;
    this.onHandQtyCheck();
    this.isStockCheck(this.itemFormControls.controls[i]);
  }
  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();

    return this.items.filter(item =>
      item.item_name.toLowerCase().includes(filterValue) ||
      item.item_code.toLowerCase().includes(filterValue)
    );
  }
  public deleteItemRow(index: number): void {
    const itemControls = this.orderFormGroup.get('items') as FormArray;
    itemControls.removeAt(index);

    this.itemNameSubscriptions.splice(index, 1);
    this.itemControlSubscriptions.splice(index, 1);
    this.uomArray.splice(index, 1);
  }

  public get itemFormControls() {
    let itemsarray = this.orderFormGroup?.get('items') as FormArray;
    return itemsarray;
  }
  // public get itemFormControls(): AbstractControl[] {
  //   const itemControls = this.orderFormGroup.get('items') as FormArray;

  //   return itemControls.controls;
  // }
  public itemsControlDisplayValue(item?: { id: string; name: string; code: string }): string | undefined {
    return item ? item.code + " " + item.name : undefined;
  }
  public itemControlValue(item: Item): { id: string; name: string; code: string } {
    return { id: item.id, name: item.item_name, code: item.item_code };
  }

}

const ITEM_ADD_FORM_TABLE_HEADS: any[] = [
  { id: 0, key: 'sequence', label: '#' },
  { id: 1, key: 'item', label: 'Item Name' },
  { id: 2, key: 'uom', label: 'UOM' },
  { id: 3, key: 'qty', label: 'Quantity' },
];