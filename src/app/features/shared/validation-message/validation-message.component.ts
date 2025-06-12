import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  templateUrl: './validation-message.component.html',
  styles: []
})
export class ValidationMessageComponent implements OnInit {
  @Input() control: FormControl;
  constructor() { }
  ngOnInit() {
  }
}
