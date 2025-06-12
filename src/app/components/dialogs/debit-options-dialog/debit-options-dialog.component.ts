import { ValidatorService } from './../../../services/validator.service';
import { Component, OnInit, Inject, Output, EventEmitter, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { computeDecimalDigest } from '@angular/compiler/src/i18n/digest';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-debit-options-dialog',
  templateUrl: './debit-options-dialog.component.html',
  styleUrls: ['./debit-options-dialog.component.scss']
})
export class DebitOptionsDialogComponent implements OnInit {
  @Output() sendResponse: EventEmitter<any> = new EventEmitter<any>();
  public dataSource = [];
  displayedColumns = ['option', 'name'];
  constructor(
    private commonToasterService: CommonToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<DebitOptionsDialogComponent>,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
  }
  public label = this.data?.label;
  Form: FormGroup;
  ngOnInit(): void {
    this.Form = this.fb.group({
      date: [''],
      customer: ['', [Validators.required]]
    })
  }

  searchCustomer() {
    let form = this.Form.value;

    if (form.date == "") return false;

    let date = new Date(form.date);
    form['year'] = date.getFullYear();
    form['month'] = '' + (date.getMonth() + 1);

    if ((date.getMonth() + 1) < 10) {
      form['month'] = '0' + (date.getMonth() + 1);
    }
    let type = this.data.type;
    switch (type) {
      case 'shelf_rent':
        this.filterShelfRent(form);
        break;
      case 'listing_fees':
        this.filterListingFee(form);
        break;
      case 'rebate_discount':
        this.filterRebateDiscount(form);
        break;
    }
  }

  filterShelfRent(form) {
    this.apiService.shelfRentFilter(form).subscribe((res) => {
      this.dataSource = res.data;
    })
  }

  filterListingFee(form) {
    this.apiService.lsitingFeeFilter(form).subscribe((res) => {
      this.dataSource = res.data;
    })
  }

  filterRebateDiscount(form) {
    this.apiService.rebateDiscountFilter(form).subscribe((res) => {
      this.dataSource = res.data;
    })
  }

  genterateDebitNote() {
    let form = this.Form.value;
    let date = new Date(form.date);
    form['year'] = date.getFullYear();
    form['month'] = '' + (date.getMonth() + 1);

    if ((date.getMonth() + 1) < 10) {
      form['month'] = '0' + (date.getMonth() + 1);
    }
    form['type'] = this.data.type;
    form['shelf_rent_id'] = "";
    form['listing_fee_id'] = "";
    form['rebate_discount_id'] = "";
    if (form['type'] == 'shelf_rent') {
      form['shelf_rent_id'] = form.customer[0].id;
    } else if (form['type'] == 'listing_fees') {
      form['listing_fee_id'] = form.customer[0].id;
    } else {
      form['rebate_discount_id'] = form.customer[0].id;
    }
    this.apiService.saveDebitNoteDiscount(form).subscribe((res) => {
      this.sendResponse.emit(res);
      this.close(true);
    })

  }

  close(closeType?: any) {
    this.dialog.close(closeType);
  }

  getPaginatorValue(len: number) {
    return len < 3 ? true : false;
  }

}
