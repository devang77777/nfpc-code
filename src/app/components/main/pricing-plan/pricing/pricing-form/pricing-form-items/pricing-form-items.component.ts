import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-pricing-form-items',
  templateUrl: './pricing-form-items.component.html',
  styleUrls: ['./pricing-form-items.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PricingFormItemsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public editData: any;

  pricingFormGroup: FormGroup;
  itemPriceFormGroup: FormGroup;
  // itemPriceFormArray: FormArray;
  itemPriceFormControl: FormControl;
  keyCombinationFormControl: FormControl;
  items: any[] = [];
  dataSource;
  columnsToDisplay = ['name', 'description', 'actions'];
  expandedElement: any | null;
  public nameFormControl: FormControl;
  public sdateFormControl: FormControl;
  public edateFormControl: FormControl;

  public baseUomPrice: FormControl;

  private apiService: ApiService;
  private subscriptions: Subscription[] = [];
  isPriceRangeActive: boolean = false;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }
  ngOnInit(): void {
    this.apiService.getOrganisationSettings(localStorage.getItem('organisationGeneralRangeuuId'))
      .subscribe(res => {
        this.isPriceRangeActive = res.data?.main_price_active == '1'
      });
    let selectedItems = [];
    this.subscriptions.push(
      this.itemIdControl.valueChanges.subscribe(() => {
        selectedItems = this.items.filter((data) => {
          if (this.itemIdControl.value.includes(data.id)) return data;
        });
        this.dataSource = new MatTableDataSource(selectedItems);
        let formarray = this.itemPriceFormGroup.get(
          'itemPriceFormArray'
        ) as FormArray;
        this.clearFormArray(formarray);
        selectedItems.forEach((x) => {

          let item_main_price = JSON.parse(JSON.stringify(x.item_main_price));
          item_main_price.push({
            item_id: x.id,
            item_uom_id: x.lower_unit_uom_id,
            item_price: x.lower_unit_item_price,
            status: "1",
            item_uom: { name: x.item_uom_lower_unit?.name }
          })

          this.addItems(item_main_price);
        });
      })
    );


    this.nameFormControl = new FormControl('');
    this.sdateFormControl = new FormControl('');
    this.edateFormControl = new FormControl('');
    this.keyCombinationFormControl = new FormControl('');
    this.pricingFormGroup = new FormGroup({});
    this.itemPriceFormGroup = new FormGroup({
      itemPriceFormArray: new FormArray([]),
    });
    this.itemPriceFormControl = new FormControl();
    this.overviewFormGroup.addControl('name', this.nameFormControl);
    this.overviewFormGroup.addControl('start_date', this.sdateFormControl);
    this.overviewFormGroup.addControl('end_date', this.edateFormControl);
    this.overviewFormGroup.addControl('item_ids', this.itemPriceFormControl);
    this.overviewFormGroup.addControl('pricing_unformated', this.itemPriceFormGroup);
    this.overviewFormGroup.addControl('combination_key_value', this.keyCombinationFormControl);
  }
  public ngOnChanges() {
    if (this.editData) {
      this.nameFormControl.setValue(this.editData.name);
      this.sdateFormControl.setValue(this.editData.start_date);
      this.edateFormControl.setValue(this.editData.end_date);


      //convert edit data item uom pricing

      // let items:any[] = this.editData.p_d_p_items;
      // let itemPricing: any[] = [];
      // items.forEach(item => {
      //   itemPricing.push({
      //     name: item.item.item_name,
      //     description: '',
      //     uoms: [{ name: item.item_uom.name, item_id: item.item_id, item_uom_id: item.item_uom_id, price: item.price }]
      //   })
      // })
      // var output = [];

      // itemPricing.forEach(function (item) {
      //   var existing = output.filter(function (v, i) {
      //     return v.name == item.name;
      //   });
      //   if (existing.length) {
      //     var existingIndex = output.indexOf(existing[0]);
      //     output[existingIndex].uoms = output[existingIndex].uoms.concat(item.uoms);
      //   } else {
      //     // item.uoms = [item.uoms];
      //     output.push(item);
      //   }
      // });
      // this.editData.p_d_p_items = output;

      //


    }
    this.subscriptions.push(
      // this.subscriptions.push(
      this.apiService.getAllItems().subscribe((result: any) => {
        this.items = result.data;
        let selectedItems = this.items.filter((data) => {
          if (this.itemIdControl.value.includes(data.id)) return data;
        });
        this.dataSource = new MatTableDataSource(selectedItems);
        let formarray = this.itemPriceFormGroup.get(
          'itemPriceFormArray'
        ) as FormArray;
        this.clearFormArray(formarray);
        selectedItems.forEach((x) => {
          let item_main_price = JSON.parse(JSON.stringify(x.item_main_price));
          item_main_price.push({
            item_id: x.id,
            item_uom_id: x.lower_unit_uom_id,
            item_price: x.lower_unit_item_price,
            status: "1",
            item_uom: { name: x.item_uom_lower_unit?.name }
          })
          this.addItems(item_main_price);
        });

      })
      // );
      // this.apiService.getAllItems().subscribe((items) => {
      //   this.items = items.data;
      //   this.dataSource = new MatTableDataSource(this.items);
      //   this.items.forEach((x) => {
      //     x.item_main_price.push({
      //       item_id: x.id,
      //       item_uom_id: x.lower_unit_uom_id,
      //       item_price: x.lower_unit_item_price,
      //       status: "1",
      //       item_uom: { name: x.item_uom_lower_unit?.name }
      //     })
      //     this.addItems(x.item_main_price);
      //   });
      // })
    );

  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  removeElement(row) {
    let index = this.dataSource.filteredData.indexOf(row);
    const data = [...this.dataSource.data]
    data.splice(index, 1);
    this.dataSource = new MatTableDataSource(data);
    let formarray = this.itemPriceFormGroup.get(
      'itemPriceFormArray'
    ) as FormArray;
    formarray.removeAt(index);
  }
  addItems(uoms) {
    let uomFormArray = new FormArray([]);
    uoms.forEach((uom) => {
      uomFormArray.push(this.adduoms(uom));
    });

    let formarray = this.itemPriceFormGroup.get(
      'itemPriceFormArray'
    ) as FormArray;
    formarray.push(uomFormArray);
  }

  get itempriceForm() {
    return this.itemPriceFormGroup.get(
      'itemPriceFormArray'
    ) as FormArray;
  }

  adduoms(uom) {
    //console.log("this uom: ", uom);
    if (this.editData) {
      let items: any[] = this.editData.p_d_p_items;
      // let priceFormControl = new FormControl('');
      let priceFormControl = '';
      let maxPriceFormControl = '';
      // items.forEach(item =>{
      //   if(item.uoms.item_id == uom.item_id && item.)
      // })
      items.forEach(item => {
        if (item.item_id == uom.item_id && item.item_uom_id == uom.item_uom_id) {
          priceFormControl = item.price;
          maxPriceFormControl = item.max_price;
        }
      })
      return new FormGroup({
        item_id: new FormControl(uom.item_id),
        item_uom_id: new FormControl(uom.item_uom_id),
        item_uom_name: new FormControl(uom.item_uom.name),
        price: new FormControl(priceFormControl),
        max_price: new FormControl(maxPriceFormControl)
      });

    }
    else {
      return new FormGroup({
        item_id: new FormControl(uom.item_id),
        item_uom_id: new FormControl(uom.item_uom_id),
        item_uom_name: new FormControl(uom.item_uom.name),
        price: new FormControl(''),
        max_price: new FormControl('')
      });
    }

  }
  isItemSelected(element): boolean {
    let itemIds: any[] = [];
    if (this.itemIdControl.value) {
      itemIds = this.itemIdControl.value;
      if (itemIds.includes(element.id)) {
        return false;
      } else {
        return true;
      }
    }
  }
  get itemIdControl() {
    return this.overviewFormGroup.get('item_ids');
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }
}


