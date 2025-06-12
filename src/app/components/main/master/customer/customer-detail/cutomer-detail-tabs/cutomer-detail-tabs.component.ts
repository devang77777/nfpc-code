import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { Customer } from '../../customer-dt/customer-dt.component';
@Component({
  selector: 'app-cutomer-detail-tabs',
  templateUrl: './cutomer-detail-tabs.component.html',
  styleUrls: ['./cutomer-detail-tabs.component.scss']
})
export class CutomerDetailTabsComponent implements OnInit {
  @Input() public customer: Customer | any;
  @Input() public lobInfo: any;
  constructor() { }

  ngOnInit(): void {
  }

}
