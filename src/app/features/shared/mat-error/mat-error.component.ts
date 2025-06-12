import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-mat-error',
  templateUrl: './mat-error.component.html',
  styles: []
})
export class MatErrorComponent implements OnInit {
  @Input() control: FormControl;
  constructor() { }

  ngOnInit(): void {
  }
}
