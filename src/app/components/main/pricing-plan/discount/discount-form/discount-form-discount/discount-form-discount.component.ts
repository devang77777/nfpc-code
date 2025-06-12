import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-discount-form-discount',
  templateUrl: './discount-form-discount.component.html',
  styleUrls: ['./discount-form-discount.component.scss'],
})
export class DiscountFormDiscountComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public editData;
  discountFormGroup: FormGroup;
  nameFormControl: FormControl;
  sdateFormControl: FormControl;
  edateFormControl: FormControl;
  typeFormControl: FormControl;
  discountTypeFormControl: FormControl;
  discountPercentageFormControl: FormControl;
  applyOnFormControl: FormControl;
  applyOnValueFormControl: FormControl;
  discountValueFormControl: FormControl;
  applyOnQuantityFormControl: FormControl;
  constructor() { }

  ngOnInit(): void {
    this.discountFormGroup = new FormGroup({});
    this.nameFormControl = new FormControl('');
    this.sdateFormControl = new FormControl('');
    this.edateFormControl = new FormControl('');
    this.discountTypeFormControl = new FormControl('');
    this.typeFormControl = new FormControl('');
    this.discountPercentageFormControl = new FormControl('');
    this.applyOnFormControl = new FormControl('');
    this.applyOnValueFormControl = new FormControl('');
    this.discountValueFormControl = new FormControl('');     //temp 
    this.applyOnQuantityFormControl = new FormControl('');
    this.overviewFormGroup.addControl('name', this.nameFormControl);
    this.overviewFormGroup.addControl('sdate', this.sdateFormControl);
    this.overviewFormGroup.addControl('edate', this.edateFormControl);
    this.overviewFormGroup.addControl('discountType', this.discountTypeFormControl);
    this.overviewFormGroup.addControl('type', this.typeFormControl);
    this.overviewFormGroup.addControl('discountPercentage', this.discountPercentageFormControl);
    this.overviewFormGroup.addControl('discountApplyOn', this.applyOnFormControl);
    this.overviewFormGroup.addControl('discountValue', this.discountValueFormControl)
    this.overviewFormGroup.addControl('discountApplyOnValue', this.applyOnValueFormControl)
    this.overviewFormGroup.addControl('discountQuantity', this.applyOnQuantityFormControl)
  }
  ngOnChanges(): void {
    if (this.editData) {
      this.nameFormControl.setValue(this.editData.name);
      this.sdateFormControl.setValue(this.editData.start_date);
      this.edateFormControl.setValue(this.editData.end_date);
      this.discountTypeFormControl.setValue(this.editData.discount_type);
      this.typeFormControl.setValue(this.editData.type);
      this.discountPercentageFormControl.setValue(this.editData?.discount_percentage);
      this.applyOnFormControl.setValue(this.editData.discount_apply_on);
      this.discountValueFormControl.setValue(this.editData.discount_value);
      this.applyOnQuantityFormControl.setValue(this.editData.qty_to);
      this.applyOnValueFormControl.setValue(this.editData.qty_to);
    }
  }
}