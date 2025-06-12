import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { MerchandisingService } from '../../merchandising.service';
import { Subscription } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-msl-compliance',
  templateUrl: './msl-compliance.component.html',
  styleUrls: ['./msl-compliance.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class MslComplianceComponent implements OnInit {

  selectedColumnFilter: string;
  customerFilter: boolean = false;
  selected: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChildren('innerTables') innerTables: QueryList<MatTable<any>>;
  @ViewChildren('innerSort') innerSort: QueryList<MatSort>;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  //expandedElement: any;

  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  // public displayedColumns = ['date', 'merchandiserCode', 'merchandiserName', 'journeyPlan', 'planedJourney', 'totalJourney', 'journeyPlanPercent', 'unPlanedJourney', 'unPlanedJourneyPercent'];
  //public displayedColumns = ['date', 'merchandiserCode', 'merchandiserName', 'customerCode', 'customerName', 'itemCode', 'itemName', 'modelCapacity', 'goodSaleableQty', 'isPerform', 'outOfStock'];
  public displayedColumns = ['date', 'merchandiserCode', 'merchandiserName', 'mslItem', 'outOfStock', 'mslPercentage'];
  innerDisplayedColumns = ['street', 'zipCode', 'city'];
  expandedElement: any | null;
  dateFilterControl: FormControl;
  filterForm: FormGroup;
  innerDetails: boolean;
  innerData: any[] = [];
  constructor(
    private merService: MerchandisingService,
    public dataEditor: DataEditor,
    public fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef

  ) {
    this.itemSource = new MatTableDataSource<any>();
  }
  requset: any;
  data = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      salesman_name: [''],
      salesman_code: [''],
      customer_code: [''],
      customer_name: [''],
      channel_name: [''],
      item_code: [''],
      item_name: [''],
      salesman_id: ['']
    });

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA && value.request.module.includes('msl')) {
          //if(value.request.module == 'msl-by-customer'){
            //this.customerFilter = true;
            this.updateColumns(value);
          //}
          //else{
            //this.customerFilter = false;
            //this.updateColumns(value.request.module, value?.data);
          //}
          //console.log(value.data);
        }
      })
    );
  }

  toggleRow(element) {
    this.showDetail(element)
    // element.addresses && (element.addresses as MatTableDataSource<Address>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
    // this.cd.detectChanges();
    // this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<Address>).sort = this.innerSort.toArray()[index]);
}

expandList(data) {
  this.showDetail(data)
}


showDetail(element){
  this.requset = '';
  this.requset = {

  }
  if(this.selected == 'salesman'){
//   var body = {
//     "date": element?.date,
//     "module": "msl-by-salesman-detail",
//     "salesman_id" : element?.salesman_id
// }
this.requset ={
  "date": element?.date,
  "module": "msl-by-salesman-detail",
  "salesman_id" : element?.salesman_id
}
  }
  else if(this.selected == 'customer'){
  //   var  body = {
  //     "date": element?.date,
  //     "module": "msl-by-customer-detail",
  //     "customer_id" : element?.customer_id
  // }
  this.requset = {
    "date": element?.date,
    "module": "msl-by-customer-detail",
    "customer_id" : element?.customer_id
  }
}
  else{
    this.requset = {
      "date": element?.date,
      "module": "msl-by-channel-detail",
      "channel_id" : element?.channe_id ? element?.channe_id : element?.channel_id
    }
}
  //Object.assign(body, this.requset);
  this.subscriptions.push(
  this.merService.getReportData(this.requset).subscribe((res) => {
    let data = res?.data
    this.innerDetails = true;
    this.innerData = res?.data;
    this.expandedElement = this.expandedElement === element ? null : element;
    // res.data && (res as MatTableDataSource<any>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
    // this.cd.detectChanges();
    // this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<any>).sort = this.innerSort.toArray()[index]);
    //this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<Address>).sort = this.innerSort.toArray()[index]);
  })
  )
}
applyFilter(filterValue: string) {
  this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<any>).filter = filterValue.trim().toLowerCase());
}

  updateColumns(val){
    //value.request.module, value?.data
    if(val.request.module == 'msl-by-customer'){
    this.displayedColumns[1] = 'customerCode';
    this.displayedColumns[2] = 'customerName'
    this.customerFilter = true;
    this.selected = 'customer';
  }
  else if(val.request.module == 'msl-by-salesman'){
    this.displayedColumns[1] = 'merchandiserCode';
    this.displayedColumns[2] = 'merchandiserName'
    this.customerFilter = false;
    this.selected = 'salesman';
  }
  else{
    this.displayedColumns = []
    this.displayedColumns = ['date', 'channelName', 'mslItem', 'outOfStock', 'mslPercentage'];
    //this.displayedColumns[1] = 'merchandiserCode';
    //this.displayedColumns[2] = 'merchandiserName'
    this.customerFilter = false;
    this.selected = 'channel';
  }
  this.data = val.data;
  this.requset = val.request;
  this.updateTableData(val.data);
}

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      this.filterForm.get(this.selectedColumnFilter).setValue("");
    }
    this.filterData();
  }
  filterData() {
    // let form = this.filterForm.value;
    // let filterIn = this.data;
    // let data = [];
    // data = filterIn.filter((x) => { return ((x.date.includes(form.date)) && (x.merchandiserCode.toLowerCase().includes(form.salesman_code.toLowerCase())) && (x.merchandiserName.toLowerCase().includes(form.salesman_name.toLowerCase()))) });
    //this.updateTableData(data);
    // debugger
    let body = this.filterForm.value;
    Object.assign(body, this.requset);
    this.subscriptions.push(
    this.merService.getReportData(body).subscribe((res) => {
      if (res?.status == true) {
        this.dataEditor.sendData({
          type: CompDataServiceType.REPORT_DATA,
          request: this.requset,
          data: res.data,
        });
      }
    })
    )
  }

  updateTableData(data = []) {
    let newData = data ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;

  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
    this.itemSource = null;
    this.elementRef.nativeElement.remove();
  }

  onSortData(sort) {
    if (!sort.active || sort.direction === '') {
      // this.updateTableData(this.data)
      return;
    }
    let data = this.itemSource.data.slice().sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date': return this.compare(a.date, b.date, isAsc);
        case 'merchandiserCode': return this.compare(a.merchandiserCode, b.merchandiserCode, isAsc);
        case 'merchandiserName': return this.compare(a.merchandiserName, b.merchandiserName, isAsc);
        case 'customerCode': return this.compare(a.customerCode, b.customerCode, isAsc);
        case 'customerName': return this.compare(a.customerName, b.customerName, isAsc);
        case 'itemCode': return this.compare(a.itemCode, b.itemCode, isAsc);
        case 'itemName': return this.compare(a.itemName, b.itemName, isAsc);
        case 'modelCapacity': return this.compare(a.modelCapacity, b.modelCapacity, isAsc);
        case 'goodSaleableQty': return this.compare(a.goodSaleableQty, b.goodSaleableQty, isAsc);
        case 'isPerform': return this.compare(a.isPerform, b.isPerform, isAsc);
        case 'outOfStock': return this.compare(a.outOfStock, b.outOfStock, isAsc);
        default: return 0;
      }
    });
    this.updateTableData(data);
    //console.log(sort);
  }
  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }


}
