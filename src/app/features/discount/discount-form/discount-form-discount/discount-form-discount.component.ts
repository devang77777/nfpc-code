import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-discount-form-discount',
  templateUrl: './discount-form-discount.component.html',
  styleUrls: ['./discount-form-discount.component.scss'],
})
export class DiscountFormDiscountComponent implements OnInit {
  @Input() public overviewFormGroup: FormGroup;
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
    this.discountValueFormControl = new FormControl('');
    this.applyOnQuantityFormControl = new FormControl('');
    this.overviewFormGroup.addControl('name', this.nameFormControl);
    this.overviewFormGroup.addControl('sdate', this.sdateFormControl);
    this.overviewFormGroup.addControl('edate', this.edateFormControl);
    this.overviewFormGroup.addControl('discountType', this.discountTypeFormControl);
    this.overviewFormGroup.addControl('type', this.typeFormControl);
    this.overviewFormGroup.addControl('discountPercentange', this.discountPercentageFormControl);
    this.overviewFormGroup.addControl('discountApplyOn', this.applyOnFormControl);
    this.overviewFormGroup.addControl('discountValue', this.discountValueFormControl)
    this.overviewFormGroup.addControl('discountQuantity', this.applyOnQuantityFormControl)
  }
}
// discountPercentageFormControl
// applyOnFormControl
// applyOnValueFormControl
// discountValueFormControl
// applyOnFormControl