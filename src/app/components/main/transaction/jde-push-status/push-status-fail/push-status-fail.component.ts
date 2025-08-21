import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators,FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, Subject, of } from 'rxjs';
import { Customer } from '../../../transaction/collection/collection-models';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, mergeMap, delay } from 'rxjs/operators';
import { MasterService } from '../../../master/master.service';
import { Router } from '@angular/router';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { SelectionModel } from '@angular/cdk/collections';
import { OrderModel} from 'src/app/components/main/transaction/orders/order-models'
import { Inject } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JdePushStatusService } from '../jde-push-status.service';
@Component({
  selector: 'app-push-status-fail',
  templateUrl: './push-status-fail.component.html',
  styleUrls: ['./push-status-fail.component.scss']
})
export class PushStatusFailComponent implements OnInit {
 selectedCode: any = [];
  showExportButton: boolean = false;
  // isExpansionDetailRow = (i: number, row: any) => row === this.expandedRow;
  // isExpansionDetailRow = (index: number, row: any): boolean => row.hasOwnProperty('isExpandedRow');
  // isExpansionDetailRow = (i: number, row: any) => row.isExpandedRow === true;
  isExpansionDetailRow = (index: number, row: any) => {
  return row === this.expandedElement;
};
  isExpansionDriverlRow = (index: number, row: any) => {
  return row === this.openDriverElement;
};
  isExpansionRouteRow = (index: number, row: any) => {
  return row === this.openRouteCodeElement;
};
// isExpansionDetailRow = (index: number, row: any): boolean => {
//   return row === this.expandedRow;
// };
expandedRow: any;
  // expandedRow: any = null;
    mainDisplayedColumns: string[] = ['customerCode'];
  mainDataSource = [
    { customer_code: 'CUST001', id: 1 },
    { customer_code: 'CUST002', id: 2 }
  ];
  salesmanList = [];
 list:any = []
  public expandedElement: any | null = null;
  public openDriverElement: any | null = null;
  public openRouteCodeElement: any | null = null;
  cus_id: any= [];
   @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
    public selections = new SelectionModel(true, []);
  editingElement: any = null;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  isColumnFilter = false;
  vehiclesList = [];
  warehouseList: any = [];
  channelList: any = [];
  status_list: any = [];
  divisionList = [];
  sideFiltersForm;
  customerForm;
  activeCustomerPriceForm;
  activeCustomerUpdateEndDatePriceForm;
  selectedItems = [];
  settings = {};
  activeCustomerSettings = {};
  itemfilterValue = '';
  public filterItem = [];
  customerList: any = [];
  items: any = [];
  public dataSource: MatTableDataSource<any>;
  public customerDataSource: MatTableDataSource<any>;
  public activeCustomerPriceDataSource: MatTableDataSource<any>;
  public jdePushStatusDataSource: MatTableDataSource<any>;
  public jdePushStatusSalesmanDataSource: MatTableDataSource<any>;
  public expandedDataSource: MatTableDataSource<any>;
  public updateEndDatePriceDataSource: MatTableDataSource<any>;
  public customerFormControl: FormControl;
  public statusFormControl: FormControl;
  public channelFormControl: FormControl;
  keyUp = new Subject<string>();
  channelKeyUp = new Subject<string>();
  
  public filterCustomer: Customer[] = [];
  // public filterChannel: Channel[] = [];
  
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  // public page = 0;
  filterValue = '';
  public isEditForm: boolean;
  public is_lob: boolean = false;
  public selectedPaymentTermId: number;
  customerLobList = [];
  channelIdList : any;
  public lookup$: Subject<any> = new Subject();
  selectedIndex = 0;
  public date : any =[]
  public salesman_code : any =[]
 
   customerDisplayedColumns2: string[] = ['trxDate','driverCode','invoiceNumber','invoiceType','status','failed_message']
  
  constructor(
    public fb: FormBuilder,
    private api: ApiService,
    private detChange: ChangeDetectorRef,
    private masterService: MasterService,
    private router: Router,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<PushStatusFailComponent>,
    private modalService : JdePushStatusService,
  ) {
  }

  ngOnInit(): void {
    let modal = this.modalService.getModal()
    console.log(modal);
    this.getList();
  }

  getList(){
    let modal = this.modalService.getModal()
    console.log(modal);

    this.api.getJdePushStatusFailedOrder(modal).subscribe(res => {
        
      // this.apiResponse = res;
      this.activeCustomerPriceDataSource = new MatTableDataSource<any>(res.data);

    });
  }

 exportSalesmanDateWiseTotalInvoice(){
  let modal = this.modalService.getModal()
  let body = {
    date: modal?.date,
    "export": 1,
  };

   this.api.getJdePushStatusFailedOrder(body).subscribe(
        (result: any) => {
          if (result.status) {
            this.api.downloadFile(result.data.file_url,'csv');
          }
        }
      );
 }

  public close() {
    this.dialogRef.close();
  }
}
