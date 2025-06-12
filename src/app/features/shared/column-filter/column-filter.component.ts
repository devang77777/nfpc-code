import { trigger, transition, style, animate } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-column-filter',
  templateUrl: './column-filter.component.html',
  styleUrls: ['./column-filter.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-3%)' }),
        animate(
          '100ms ease-in',
          style({ transform: 'translateY(0%)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '50ms ease-in',
          style({ transform: 'translateY(-3%)' })
        ),
      ]),
    ]),
  ],
})
export class ColumnFilterComponent implements OnInit, OnChanges {
  isFilter = false;
  @Input() title: string;
  @Input() type: string;
  @Input() selected: string;
  @Input() controlName: string;
  @Output() public close: EventEmitter<any> = new EventEmitter<any>();
  @Output() public changeSelected: EventEmitter<any> = new EventEmitter<any>();
  active = false;
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.controlName != changes.selected?.currentValue) {
      this.isFilter = false;
    }
  }

  ngOnInit(): void {
  }
  filter(): void {
    this.isFilter = !this.isFilter;
    this.changeSelected.emit(this.controlName);
  }
  onClose() {
    this.close.emit(false);
    this.isFilter = false;
    this.active = false;
  }
  onSubmit() {
    this.close.emit(true);
    this.isFilter = false;
    this.active = true;
  }
}
