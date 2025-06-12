import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-discount-form-slab-table',
  templateUrl: './discount-form-slab-table.component.html',
  styleUrls: ['./discount-form-slab-table.component.scss'],
})
export class DiscountFormSlabTableComponent implements OnInit, OnChanges {
  @Input() discountType: string;
  @Input() overviewFormGroup: FormGroup;
  @Input() editData: any[];
  data: SlabData[] = [{ min_slab: '', max_slab: '', value: '', percentage: '' }];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = ['min_slab', 'max_slab', 'value', 'percentage', 'action'];
  rows: FormArray = this.fb.array([]);
  discountSlabFormGroup: FormGroup = this.fb.group({
    orderItemFormArray: this.rows,
  });

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit() {
    this.data.forEach((d: SlabData) => this.addRow());
    this.updateView();

  }
  ngOnChanges() {
    if (this.discountType === '1') {
      this.displayColumns = ['min_slab', 'max_slab', 'value', 'action'];
    } else {
      this.displayColumns = ['min_slab', 'max_slab', 'percentage', 'action'];
    }
    this.overviewFormGroup.addControl('slab', this.discountSlabFormGroup)
    if (this.editData) {
      this.editData.forEach(slab => {
        let row = this.fb.group({
          min_slab: [slab.min_slab],
          max_slab: [slab.max_slab],
          value: [slab.value],
          percentage: [slab.percentage]
        });
        this.rows.push(row);
      })
      setTimeout(() => {
        this.rows.removeAt(this.rows.length-1);
        this.updateView();
      }, 10);

    }
  }

  emptyTable() {
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }
  }

  addRow() {
    if (this.rows.length > 0) {
      const row = this.fb.group({
        min_slab: [this.min_slab],
        max_slab: ['', Validators.min(this.min_slab + 1)],
        value: [''],
        percentage: [''],
      });
      this.rows.push(row);
    } else {
      const row = this.fb.group({
        min_slab: ['0'],
        max_slab: ['', Validators.min(1)], //min value of mislab, bind with current input value
        value: [''],
        percentage: [''],
      });
      this.rows.push(row);
    }
    this.updateView();
  }
  addRowInvalid(): boolean {
    if (
      !this.discountSlabFormGroup.valid ||
      this.initialmin_slab > this.initialmax_slab ||
      this.max_slab > this.min_slab ||
      this.max_slab == ''
    ) {
      return true;
    } else {
      return false;
    }
  }
  deleteRowInvalid(): boolean {
    if (this.rows.length <= 1) {
      return true;
    }
    else {
      return false;
    }
  }
  deleteItem(index) {
    this.rows.removeAt(index);
    this.updateView();
  }
  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  isFirstRow(index) {
    if (index === 0) {
      return true;
    } else {
      return false;
    }
  }

  get initialmin_slab() {
    return this.discountSlabFormGroup.get('orderItemFormArray').value[0]
      .min_slab;
  }
  get initialmax_slab() {
    return this.discountSlabFormGroup.get('orderItemFormArray').value[0]
      .max_slab;
  }
  get min_slab() {
    return (
      this.discountSlabFormGroup.get('orderItemFormArray').value[
        this.rows.length - 1
      ].max_slab
    );
  }
  get max_slab() {
    return this.discountSlabFormGroup.get('orderItemFormArray').value[
      this.rows.length - 1
    ].max_slab;
  }
}

export interface SlabData {
  min_slab: string;
  max_slab: string;
  value: string;
  percentage: string;
}
