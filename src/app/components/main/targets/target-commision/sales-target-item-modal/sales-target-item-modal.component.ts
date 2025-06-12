import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';

import {SalesTargetHeaderDetail, SalesTargetItemDetail, SalesTargetItemModalData, TargetControl, SALES_TARGET_HEAD_HEADER_QTY, SALES_TARGET_HEAD_HEADER_FIXED_QTY, SALES_TARGET_HEAD_HEADER_VALUE, SALES_TARGET_HEAD_HEADER_FIXED_VALUE} from '../sales-target-model';
import { ItemAddTableHeader } from 'src/app/components/main/transaction/orders/order-models';



@Component({
  selector: 'app-sales-target-item-modal',
  templateUrl: './sales-target-item-modal.component.html',
  styleUrls: ['./sales-target-item-modal.component.scss'],
})
export class SalesTargetItemModalComponent implements OnInit {
  // public dialogRef: MatDialogRef<SalesTargetItemModalComponent>;
  public customData: SalesTargetItemModalData;
  public isDetailModal: boolean;

  public targetControl: TargetControl;
  public headTableHeadersQty: ItemAddTableHeader[] = [];
  public headTableHeadersValue: ItemAddTableHeader[] = [];
  public headTableHeadersFixedQty: ItemAddTableHeader[] = [];
  public headTableHeadersFixedValue: ItemAddTableHeader[] = [];

  private formBuilder: FormBuilder;
  constructor(
    private dialogRef: MatDialogRef<SalesTargetItemModalComponent>,
    @Inject(MAT_DIALOG_DATA) customData: SalesTargetItemModalData,
    formBuilder: FormBuilder
  ) {
    Object.assign(this, { dialogRef, customData, formBuilder });
  }

  public ngOnInit() {
    this.targetControl = this.customData.targetControl;
    this.headTableHeadersQty = SALES_TARGET_HEAD_HEADER_QTY;
    this.headTableHeadersValue = SALES_TARGET_HEAD_HEADER_VALUE;
    this.headTableHeadersFixedQty = SALES_TARGET_HEAD_HEADER_FIXED_QTY;
    this.headTableHeadersFixedValue = SALES_TARGET_HEAD_HEADER_FIXED_VALUE;

    if (this.customData.itemDetail) {
      this.isDetailModal = true;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public add(): void {
    this.dialogRef.close(this.customData);
  }

  public get headersFormControls(): AbstractControl[] {
    const headersControls = this.customData.item.get('targets') as FormArray;

    return headersControls.controls;
  }

  public addHeader(): void {
    this.addHeaderForm();
  }

  public addHeaderForm(item?: SalesTargetHeaderDetail): void {
    const headerControls = this.customData.item.controls['targets'] as FormArray;

    if (item) {
      headerControls.push(
        this.formBuilder.group({
          fixed_qty: new FormControl(item.fixed_qty),
          fixed_value: new FormControl(item.fixed_value),
          from_qty: new FormControl(item.from_qty),
          to_qty: new FormControl(item.to_qty),
          from_value: new FormControl(item.from_value),
          to_value: new FormControl(item.to_value),
          commission: new FormControl(item.commission),
        })
      );
    } else {
      headerControls.push(
        this.formBuilder.group({
          fixed_qty: new FormControl(0),
          fixed_value: new FormControl(0),
          from_qty: new FormControl(0),
          to_qty: new FormControl(0),
          from_value: new FormControl(0),
          to_value: new FormControl(0),
          commission: new FormControl(0),
        })
      );
    }
  }

  public deleteHeadersRow(index: number): void {
    const headersControls = this.customData.item.get('targets') as FormArray;

    headersControls.removeAt(index);
  }
}

