import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import { FormControlConfig } from '../shared-interfaces';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss']
})
export class RadioButtonComponent implements OnInit {
  @Output() public checked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public config: FormControlConfig;
  @Input() public isMatStyle: boolean;

  constructor() { }

  public ngOnInit(): void {
  }

  public updateRadioButton(): void {
    this.checked.emit();
  }
}
