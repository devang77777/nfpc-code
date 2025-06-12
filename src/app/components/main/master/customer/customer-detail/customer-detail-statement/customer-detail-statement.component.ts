import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CustomerService } from '../../customer.service';
import { Customer } from '../../customer-dt/customer-dt.component';
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-customer-detail-statement',
  templateUrl: './customer-detail-statement.component.html',
  styleUrls: ['./customer-detail-statement.component.scss'],
})
export class CustomerDetailStatementComponent implements OnInit, OnChanges {
  public statusSelected: any;
  public showStatus: boolean = false;

  public FILTER_WEEK = 'week';
  public FILTER_MONTH = 'month';
  public FILTER_QUARTER = 'quarter';
  public FILTER_YEAR = 'year';

  public salesOptions: any = [
    { id: this.FILTER_WEEK, label: 'This Week' },
    { id: this.FILTER_MONTH, label: 'This Month' },
    { id: this.FILTER_QUARTER, label: 'This Quarter' },
    { id: this.FILTER_YEAR, label: 'This Year' },
  ];
  public filterSelected: any;
  public showFilter: boolean = false;
  public statement;
  public startOfMonth;
  public endOfMonth;
  public dateFilter: FormControl = new FormControl();
  template: any;
  @Input() public customer: Customer;

  constructor(
    private sanitizer: DomSanitizer,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.dateFilter.setValue(this.FILTER_MONTH);
    this.getStartAndEndDate(this.FILTER_MONTH);
    this.getStatementData();
    this.onChangeDateFilter();
  }
  downloadPdf = () => {
    this.customerService
      .downloadPdf({
        customer_id: this.customer?.user_id,
        startdate: this.startOfMonth,
        enddate: this.endOfMonth,
        status: 'pdf',
      })
      .subscribe((res: any) => {
        if (res.status) {
          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.setAttribute('href', `${res.data.file_url}`);
          link.setAttribute('download', `statement.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      });
  };

  getStatementData = () => {
    this.customerService
      .getStatement({
        customer_id: this.customer?.user_id,
        startdate: this.startOfMonth,
        enddate: this.endOfMonth,
      })
      .subscribe((res: any) => {
        if (res.status) {
          this.statement = res.data;
          this.template = this.sanitizer.bypassSecurityTrustHtml(
            this.statement.html_string
          );
        }
      });
  };

  onChangeDateFilter = () => {
    this.dateFilter.valueChanges.subscribe((item) => {
      this.getStartAndEndDate(item);
      this.getStatementData();
    });
  };

  getStartAndEndDate = (type) => {
    this.startOfMonth = moment().startOf(type).format('YYYY-MM-DD');
    this.endOfMonth = moment().endOf(type).format('YYYY-MM-DD');
  };

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.customer.firstChange) {
      this.dateFilter.setValue(this.FILTER_MONTH);
      this.getStartAndEndDate(this.FILTER_MONTH);
      this.getStatementData();
    }
  }
}
