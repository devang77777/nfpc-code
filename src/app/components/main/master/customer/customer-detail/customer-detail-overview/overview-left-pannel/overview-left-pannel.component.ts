import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Customer } from '../../../customer-dt/customer-dt.component';

@Component({
  selector: 'app-overview-left-pannel',
  templateUrl: './overview-left-pannel.component.html',
  styleUrls: ['./overview-left-pannel.component.scss'],
})
export class OverviewLeftPannelComponent implements OnInit {
  public showCollapsedAttr = true;
  public showCollapsedAddr = true;
  public showCollapsedPartner = true;
  constructor() { }
  @Input() public customer: any;
  @Input() public lobInfo: any;

  ngOnInit(): void {
    //console.log(this.customer);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lobInfo.previousValue != changes.lobInfo.currentValue) {
      if (changes.lobInfo.currentValue) {
        this.customer['customer_category'] = changes.lobInfo.currentValue?.customer_category;
        this.customer['channel'] = changes.lobInfo.currentValue?.channel;
        this.customer['region'] = changes.lobInfo.currentValue?.region;
        this.customer['customer_type'] = changes.lobInfo.currentValue?.customer_type;
        this.customer['customer_merchandiser'] = changes.lobInfo.currentValue?.customer_merchandiser;
        this.customer['ship_to_party'] = changes.lobInfo.currentValue?.ship_to_party;
        this.customer['sold_to_party'] = changes.lobInfo.currentValue?.sold_to_party;
        this.customer['payer'] = changes.lobInfo.currentValue?.payer;
        this.customer['bill_to_payer'] = changes.lobInfo.currentValue?.bill_to_payer;
        this.customer['credit_limit'] = changes.lobInfo.currentValue?.credit_limit;
      }
    }
  }
}
