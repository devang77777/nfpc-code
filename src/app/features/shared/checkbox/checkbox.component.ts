import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import { FormControlConfig } from '../shared-interfaces';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {
  @Output() public checked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public config: FormControlConfig;

  constructor() { }

  public ngOnInit(): void {
  }

  public updateWeekCheckbox(data: any): void {
    this.checked.emit(data);
  }

}
