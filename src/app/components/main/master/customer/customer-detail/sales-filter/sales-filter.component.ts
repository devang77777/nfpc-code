import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sales-filter',
  templateUrl: './sales-filter.component.html',
  styleUrls: ['./sales-filter.component.scss']
})
export class SalesFilterComponent {
  @Input() salesOptions: Array<any> = [];
  @Input() selected: any=false;
  isActive=false;
}
