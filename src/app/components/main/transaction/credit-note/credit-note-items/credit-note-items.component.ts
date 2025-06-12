import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-credit-note-items',
  templateUrl: './credit-note-items.component.html',
  styleUrls: ['./credit-note-items.component.scss'],
})
export class CreditNoteItemsComponent implements OnInit {
  itemsForm: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public itemsData: any[],
    public dialog: MatDialogRef<CreditNoteItemsComponent>
  ) { }

  ngOnInit(): void {
    this.itemsForm = new FormGroup({
      items: new FormArray([]),
    });
    const formArray = this.itemsForm.controls.items as FormArray;
    this.itemsData.forEach(() => formArray.push(new FormControl(false)));
  }
  get itemsFormArray() {
    return this.itemsForm.controls.items as FormArray;
  }
  submit() {
    const selectedItems = this.itemsForm.value.items
      .map((checked, i) => (checked ? this.itemsData[i] : null))
      .filter((v) => v !== null);
    //console.log(selectedItems);
    this.dialog.close(selectedItems);
  }
}
