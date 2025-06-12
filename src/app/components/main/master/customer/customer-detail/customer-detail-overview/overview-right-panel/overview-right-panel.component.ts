import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CustomerService } from '../../../customer.service';
import { Customer } from '../../../customer-dt/customer-dt.component';

@Component({
  selector: 'app-overview-right-panel',
  templateUrl: './overview-right-panel.component.html',
  styleUrls: ['./overview-right-panel.component.scss'],
})
export class OverviewRightPanelComponent implements OnInit, OnChanges {
  @Input() public customer: Customer;
  @Input() public lobInfo: any;
  
  public notOpenedFromOverViewRightPanel: boolean = false;
  public canvas: any;
  public ctx: any;
  public data: any;
  public options: any;
  public invoiceData = [];
  public chartFilters = [
    { id: 6, name: 'Last 6 Months' },
    { id: 12, name: 'Last 12 Months' },
  ];
  public selectOption;
  public balance;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    /* this.data = {
      labels: [],//['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'First Dataset',
          data: [] //[65, 59, 80, 81, 56, 55, 40]
        }
      ]
    };*/
    this.selectOption = this.getFilterFirstOption();
    this.options = {
      title: {
        display: true,
        text: 'Income and Expense',
        fontSize: 16,
      },
      legend: {
        position: 'bottom',
      },
    };
    this.getInvoiceChartData(this.getFilterFirstOption());
    this.getBalanceData();
  }

 
  getInvoiceChartData = (month) => {
    this.customerService
      .getInvoiceChart({
        customer_id: this.customer?.user_id,
        totalMonths: month,
      })
      .subscribe((res: any) => {
        if (res.status) {
          const lables = [];
          const balances = [];
          const expenseBalance = [];
          this.invoiceData = res.data;
          this.invoiceData.forEach((item) => {
            lables.push(item.yearmonth);
            balances.push(item.balance);
            expenseBalance.push(item.expenseBalance);
          });

          this.data = {
            labels: lables,
            datasets: [
              {
                label: 'Income',
                backgroundColor: '#a9d47d',
                data: balances,
              },
              {
                label: 'Expense',
                backgroundColor: '#42A5F5',
                data: expenseBalance,
              },
            ],
          };
        }
      });
  };

  getBalanceData = () => {
    this.customerService
      .getBalance(this.customer?.user_id)
      .subscribe((res: any) => {
        if (res.status) {
          this.balance = res.data;
        }
      });
  };

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.customer.firstChange) {
      this.getBalanceData();
      this.selectOption = this.getFilterFirstOption();
      this.getInvoiceChartData(this.getFilterFirstOption());
    }

    if (changes.lobInfo.previousValue != changes.lobInfo.currentValue) {
      if (changes.lobInfo.currentValue) {
        this.customer['credit_days'] = changes.lobInfo.currentValue?.credit_days;
      }
    }
  }

  getFilterFirstOption = () => {
    return this.chartFilters[0]?.id;
  };

  ngAfterViewInit() {
    /* this.canvas = document.getElementById('myChart');
    this.ctx = this.canvas.getContext('2d');
    let myChart = new Chart(this.ctx, {
      type: 'pie',
      data: {
          labels: ["New", "In Progress", "On Hold"],
          datasets: [{
              label: '# of Votes',
              data: [1,2,3],
              backgroundColor: [
                  'rgba(255, 99, 132, 1)',2744823
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        display: true
      }
    });
  }*/
  }
}
