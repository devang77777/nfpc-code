import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ApiService } from 'src/app/services/api.service';

export const LOCATION = {
  country: false,
  region: false,
  area: false,
  subArea: false,
  route: false,
};
@Component({
  selector: 'app-promotion-form-key-combination',
  templateUrl: './promotion-form-key-combination.component.html',
  styleUrls: ['./promotion-form-key-combination.component.scss'],
})
export class PromotionFormKeyCombinationComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public editData: any;

  public isVisible = false;
  public itemsFormControl: FormControl;
  public locationsFormControl: FormControl;
  public customersFormControl: FormControl;

  public keyCombinationFormGroup: FormGroup;
  public locationFormGroup: FormGroup;
  public customerFormGroup: FormGroup;
  public itemFormGroup: FormGroup;

  public locationsControlData = [
    { value: 'country', label: 'Country' },
    { value: 'regions', label: 'Region' },
    { value: 'area', label: 'Area' },
    // { value: 'subArea', label: 'Sub Area' },
    { value: 'route', label: 'Route' },
  ];
  public customersControlData = [
    { value: 'salesOrganisation', label: 'Sales Organisation' },
    { value: 'channel', label: 'Channel' },
    // { value: 'subChannel', label: 'Sub Channel' },
    { value: 'customerCategory', label: 'Customer Category' },
    { value: 'customer', label: 'Customer' },
  ];
  public itemsControlData = [
    { value: 'majorCategory', label: 'Major Category' },
    // { value: 'subCategory', label: 'Sub Category' },
    { value: 'itemGroup', label: 'Item Group' },
  ];
  public keyCombinations = [];
  public preDefinedKeys = [];
  public keyIndex: FormControl;
  public key: FormControl;
  private subscriptions: Subscription[] = [];

  constructor(private apiService: ApiService) { }

  public ngOnInit(): void {
    this.apiService.getCombiantionList().subscribe((res) => {
      this.preDefinedKeys = res.data;
    });
    this.keyIndex = new FormControl();
    this.key = new FormControl();
    this.locationFormGroup = new FormGroup({
      country: new FormControl(false),
      regions: new FormControl(false),
      area: new FormControl(false),
      subArea: new FormControl(false),
      route: new FormControl(false),
    });
    this.customerFormGroup = new FormGroup({
      salesOrganisation: new FormControl(false),
      channel: new FormControl(false),
      subChannel: new FormControl(false),
      customerCategory: new FormControl(false),
      customer: new FormControl(false),
    });
    this.itemFormGroup = new FormGroup({
      majorCategory: new FormControl(false),
      subCategory: new FormControl(false),
      itemGroup: new FormControl(false),
    });
    this.keyCombinationFormGroup = new FormGroup({});
    this.itemsFormControl = new FormControl([]);
    this.customersFormControl = new FormControl([]);
    this.locationsFormControl = new FormControl([]);

    this.keyCombinationFormGroup.addControl('items', this.itemsFormControl);
    this.keyCombinationFormGroup.addControl(
      'locations',
      this.locationsFormControl
    );
    this.keyCombinationFormGroup.addControl(
      'customers',
      this.customersFormControl
    );
    this.overviewFormGroup.addControl(
      'keyCombination',
      this.keyCombinationFormGroup
    );
    this.overviewFormGroup.addControl('combinationKeyPlan', this.key);
  }
  public ngOnChanges() {
    //console.log('editData: ', this.editData);
    if (this.editData) {
      this.isVisible = true;
      this.keyIndex.patchValue(this.editData.combination_key_value);
      this.key.setValue(this.editData.combination_plan_key_id);
      if (this.editData.combination_key_value.includes('Country')) {
        this.locationFormGroup.get('country').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Region')) {
        this.locationFormGroup.get('regions').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Area')) {
        this.locationFormGroup.get('area').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Route')) {
        this.locationFormGroup.get('route').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Sales Organisation')) {
        this.customerFormGroup.get('salesOrganisation').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Channel')) {
        this.customerFormGroup.get('channel').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Customer Category')) {
        this.customerFormGroup.get('customerCategory').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Customer')) {
        this.customerFormGroup.get('customer').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Major Category')) {
        this.itemFormGroup.get('majorCategory').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Item Group')) {
        this.itemFormGroup.get('itemGroup').setValue(true);
      }
      if (this.editData.combination_key_value.includes('Material')) {
        this.itemFormGroup.get('item').setValue(true);
      }
      this.updateCheckbox();
    }
  }

  setSelection() {
    this.isVisible = true;
    this.locationFormGroup.reset();
    this.customerFormGroup.reset();
    this.itemFormGroup.reset();
    this.preDefinedKeys.forEach((key) => {
      if (key.combination_key == this.keyIndex.value) {
        this.key.setValue(key.id);
      }
    });
    if (this.keyIndex.value.includes('Country')) {
      this.locationFormGroup.get('country').setValue(true);
    }
    if (this.keyIndex.value.includes('Region')) {
      this.locationFormGroup.get('regions').setValue(true);
    }
    if (this.keyIndex.value.includes('Area')) {
      this.locationFormGroup.get('area').setValue(true);
    }
    if (this.keyIndex.value.includes('Route')) {
      this.locationFormGroup.get('route').setValue(true);
    }
    if (this.keyIndex.value.includes('Sales Organisation')) {
      this.customerFormGroup.get('salesOrganisation').setValue(true);
    }
    if (this.keyIndex.value.includes('Channel')) {
      this.customerFormGroup.get('channel').setValue(true);
    }
    if (this.keyIndex.value.includes('Customer Category')) {
      this.customerFormGroup.get('customerCategory').setValue(true);
    }
    if (this.keyIndex.value.includes('Customer/')) {
      this.customerFormGroup.get('customer').setValue(true);
    }
    if (this.keyIndex.value.includes('Major Category')) {
      this.itemFormGroup.get('majorCategory').setValue(true);
    }
    if (this.keyIndex.value.includes('Item Group')) {
      this.itemFormGroup.get('itemGroup').setValue(true);
    }
    // this.keyCombinations[this.keyIndex].forEach((x) => {
    //   if (this.locationFormGroup.contains(x)) {
    //     this.locationFormGroup.get(x).setValue(true);
    //   } else if (this.customerFormGroup.contains(x)) {
    //     this.customerFormGroup.get(x).setValue(true);
    //   } else if (this.itemFormGroup.contains(x)) {
    //     this.itemFormGroup.get(x).setValue(true);
    //   }
    // });
    this.updateCheckbox();
  }
  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public updateCheckbox(): void {
    this.locationsFormControl.setValue(this.locationFormGroup.value);
    this.customersFormControl.setValue(this.customerFormGroup.value);
    this.itemsFormControl.setValue(this.itemFormGroup.value);
  }
}
