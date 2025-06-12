import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-custom-pagging',
  templateUrl: './custom-pagging.component.html',
  styleUrls: ['./custom-pagging.component.scss']
})
export class CustomPaggingComponent implements OnInit {
  @Input() length: number = 0;
  endNumber: number = 10;
  startNumber: number = 0;
  pageNumber: number = 10;
  ngOnInit(): void {

  }
  previousPage() {
    if (this.startNumber > 0) {
      if (this.length == this.endNumber) {
        this.endNumber = this.length - this.startNumber;
        this.endNumber = this.length - this.endNumber;
      } else
        this.endNumber = this.endNumber - this.pageNumber;

      this.startNumber = this.startNumber - this.pageNumber;

    }
  }

  nextPage() {
    if (this.length > this.endNumber) {
      this.startNumber = this.startNumber + this.pageNumber;
      this.endNumber = this.endNumber + this.pageNumber;
      if (this.length < this.endNumber) {
        this.endNumber = this.length;
      }
    }
  }

}
