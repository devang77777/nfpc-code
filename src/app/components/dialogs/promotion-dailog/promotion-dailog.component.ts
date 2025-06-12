import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-promotion-dailog',
  templateUrl: './promotion-dailog.component.html',
  styleUrls: ['./promotion-dailog.component.scss']
})
export class PromotionDailogComponent implements OnInit {
  @Output() sendResponse: EventEmitter<any> = new EventEmitter<any>();
  offerItems:Array<any>=[]
  offerForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<PromotionDailogComponent>,
  ) {}


  ngOnInit(): void {
    this.offerForm = new FormGroup({
      items: new FormArray([])
    });
    this.offerItems = this.data.data.offer_items;
    this.addCheckboxes();
  }
  close() {
    this.dialog.close(false);
  }

  private addCheckboxes() {
    const formArray: FormArray = this.offerForm.get('items') as FormArray;
    this.offerItems.forEach(() => formArray.push(new FormControl(false)));
  }
  onSubmit(){
    const selectedOrders = this.offerForm.get('items').value
      .map((v, i) => v ? this.offerItems[i]: null)
      .filter(v => v !== null);
      this.sendResponse.emit(selectedOrders);
      this.dialog.close();
  }
}


