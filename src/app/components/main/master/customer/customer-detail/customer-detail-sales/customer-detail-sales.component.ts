import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CustomerService } from '../../customer.service';
import {
  Customer,
} from '../../customer-dt/customer-dt.component';
import { FormControl } from '@angular/forms';
import { PAGE_SIZE } from 'src/app/app.constant';

@Component({
  selector: 'app-customer-detail-sales',
  templateUrl: './customer-detail-sales.component.html',
  styleUrls: ['./customer-detail-sales.component.scss'],
})
export class CustomerDetailSalesComponent implements OnInit {
  @Input() public customer: Customer;
  public goToTransaction: any;
  public transactionList: any = [
    { id: 'invoice', value: 'Invoice' },
    { id: 'collection', value: 'Customer Payment' },
    { id: 'estimation', value: 'Estimate' },
    { id: 'delivery_detail', value: 'Delivery Challan' },
    { id: 'expense', value: 'Expense' },
    { id: 'creditnote', value: 'Credit Note' },
  ];
  
  public salesmanTabs = {
    invoice: false,
    collection: false,
    delivery_detail: false,
    estimation: false,
    expense: false,
    isRecurringExpense: false,
    creditnote: false,
  };
  public salesOptions: any = [
    'All',
    'Draft',
    'Client Viewed',
    'Partially Paid',
    'Overdue',
    'Paid',
    'Void',
  ];

  displayedColumns: string[] = [
    'date',
    'invoice',
    'amount',
    'balancedue',
    'status',
  ];
  displayedColumnsExpense: string[] = [
    
  ];
  displayedColumnsCollection: string[] = [
    'collection_number',
    'invoice_amount',
    'payment_mode',
  ];
  displayedColumnsDelivery: string[] = [
    'delivery_number',
    'delivery_date',
    'grand_total',
    'status',
  ];
  displayedColumnsCreditNotes: string[] = [
    'credit_note_number',
    'credit_note_date',
    'grand_total',
    'status',
  ];
 
  dataSource = new MatTableDataSource<any>();
  invoices = new MatTableDataSource<CustomerDetail>();
  creditNotes = new MatTableDataSource<CustomerDetail>();
  expense = new MatTableDataSource<CustomerDetail>();
  deliveryDetail = new MatTableDataSource<CustomerDetail>();
  estimation = new MatTableDataSource<CustomerDetail>();
  collection = new MatTableDataSource<CustomerDetail>();
  tabFilter: FormControl = new FormControl();
  currentTab:string;
 response:any;
 pageSize=PAGE_SIZE;;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.tabFilter.valueChanges.subscribe((item) => {
      let element: HTMLElement = document.querySelector(
        `#${item.split(' ').join('')}Btn`
      ) as HTMLElement;
      if (!element) return;
      element.click();
    });
   
  }
  onToggleTab(tabName) {
    if(!this.salesmanTabs[tabName]){
      this.dataSource.data=[]
      this.getDetail(tabName,1)
    }
    Object.keys(this.salesmanTabs).forEach((item) => {
      if (item === tabName) return;
      this.salesmanTabs[item] = false;
    });
    this.salesmanTabs[tabName] = !this.salesmanTabs[tabName];
   
  }
  onPageFired(data){
    this.getDetail(this.currentTab,data['pageIndex']+1)
  }
  getDetail(tabName,page) {
    this.currentTab=tabName;
    this.customerService
      .getCustomerDetail(this.customer.user_id, page, this.pageSize,tabName)
      .subscribe((res: any) => {
        if (res.status) {
          this.response=res.data;
          this.dataSource.data = res.data.data
        }
      });
  }
}

export interface CustomerDetail {
  id: number;
  uuid: string;
  customer_id: number;
  invoice_number: string;
  invoice_date: string | Date | null;
  grand_total: string;
  status: string | null;
  pending_amount: any;
  delivery_number: string;
  collection_number: string;
  delivery_date: string | Date | null;
  expense_date: string | Date | null;
  reference: string;
  expense_category: string | null;
}
