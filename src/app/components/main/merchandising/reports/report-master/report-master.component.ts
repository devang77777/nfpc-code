import { ReportService } from './../report.service';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit, ViewChild, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { Subscription, Subject } from 'rxjs';
import { MasterService } from '../../../master/master.service';
import { Customer } from '../../../master/customer/customer-dt/customer-dt.component';
import { ScheduleDialogComponent } from 'src/app/components/dialogs/schedule-dialog/schedule-dialog.component';
import { DatePipe } from '@angular/common';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-report-master',
  templateUrl: './report-master.component.html',
  styleUrls: ['./report-master.component.scss'],
})
export class ReportMasterComponent extends BaseComponent implements OnInit, OnChanges {
  @ViewChild('formDrawer') formDrawer: MatDrawer;
  public reportNavOptions: any[] = [];
  public activeRoute: string;
  public SelectedRport = '';
  public intervalSelected: FormControl;
  public customerSelected: FormControl;
  public showSidePanle = false;
  public selectedReportData = [];
  public domain = window.location.host;
  org_name = localStorage.getItem('org_name');
  itemfilterValue = '';
  oldModule = '';
  public filterItem = [];
  channelList: any = [];
  intervals = [
    { id: 'today', name: 'Today' },
    { id: 'current_week', name: 'This Week' },
    { id: 'current_month', name: 'This Month' },
    { id: 'current_quarter', name: 'This Quarter' },
    { id: 'current_year', name: 'This Year' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'previous_week', name: 'Previous Week' },
    { id: 'previous_month', name: 'Previous Month' },
    { id: 'previous_quarter', name: 'Previous Quarter' },
    { id: 'previous_year', name: 'Previous Year' },
    { id: 'custom', name: 'Custom' },
  ];
  customers = [];
  cust_List = [];
  filterCustomer = [];
  selectedPopover: string;
  start_date: any;
  end_date: any;
  del_start_date: any;
  del_end_date: any;
  dateRange = ''
  export_type = '';
  export = 0;
  module_name = '';
  sideFiltersForm;
  regionList = [];
  zoneList = [];
  routeList = [];
  divisionList = [];
  supervisorList = [];
  salesmanList = [];
  customerList = [];
  warehouseList = [];
  vehiclesList = [];
  itemList = [];
  userList = [];
  createdUserList = [];
  helperList: any = [];
  previousModule = '';
  public isLoading: boolean;
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public lookup$: Subject<any> = new Subject();
  filterValue: string = "";
  private subscriptions: Subscription[] = [];
  public customerFormControl: FormControl;
  itemCategoryList = [];
  settings = {};
  isSubmitted = false;
  constructor(
    private route: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dataEditor: DataEditor,
    private ReportService: ReportService,
    private fds: FormDrawerService,
    private fb: FormBuilder,
    private masterService: MasterService,
    public datepipe: DatePipe,
    private detChange: ChangeDetectorRef,
    private cts: CommonToasterService,

  ) {
    super('reports');
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.formDrawer);
  }


  openFilters() {
    if (this.previousModule === '') {
      this.previousModule = this.getModuleType();
    } else {
      if (this.previousModule != this.getModuleType()) {
        this.sideFiltersForm.reset();
        this.previousModule = this.getModuleType();
      }
    }
    this.fds.setFormName('Report-Filters');
    this.fds.setFormType("Filters");
    this.fds.open();
  }

  close() {
    this.fds.close();
  }
  runReport() {
    // if (this.SelectedRport == 'Customer Statement') {
    //   this.getCustomerReport();
    // } else {
    this.setValidators();
    if (this.activeRoute === 'difot') {
      this.getCfrReportData();
    } else if (this.activeRoute === 'truck-utilisation') {
      if (this.sideFiltersForm.value?.level == "1") {
        this.getTruckReportData();
      }
      else {
        this.getDatabyFilter();
      }
    } else if (this.activeRoute === 'daily-operation') {
      this.getDailyOperation();
    }
    else if (this.activeRoute === 'delivery-report') {
      this.getDeliveryOperation();
    }
    else if (this.activeRoute === 'delivery-export-report') {
      this.getDeliveryExportOperation();
    }
    else if (this.activeRoute === 'pallet-report') {
      this.getPalletReport();
    }
    else if (this.activeRoute === 'geo-approvals') {
      this.getGeoApproval();
    }
    else {
      this.getDatabyFilter();
    }
  }

  getCfrReportData() {
    this.isSubmitted = true;
    if (this.sideFiltersForm.valid) {
      const body = {
        "start_date": this.sideFiltersForm.value?.start_date,
        "end_date": this.sideFiltersForm.value?.end_date,
        "export": "2",
        "export_type": "xls",
        "export_for": this.sideFiltersForm.value?.level,   // 0 - header , 1 - details
        "zone_id": this.sideFiltersForm.value?.zone_id ? this.sideFiltersForm.value?.zone_id.length > 0 ? this.sideFiltersForm.value?.zone_id[0]?.id : '' : '',
      };
      this.ReportService.cfrReportsData(body).subscribe(res => {
        if (res?.status === true) {
          const filetype = '.file' + body.export_type.toUpperCase();
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    }
  }
  getTruckReportData() {
    this.isSubmitted = true;
    if (this.sideFiltersForm.valid) {
      const body = {
        "start_date": this.sideFiltersForm.value?.start_date,
        "end_date": this.sideFiltersForm.value?.end_date,
        "export": "2",
        "export_type": "xls",
        "report_type": this.sideFiltersForm.value?.level,   // 1 - header , 0 - details
        "region_id": this.sideFiltersForm.value?.zone_id ? this.sideFiltersForm.value?.zone_id.length > 0 ? this.sideFiltersForm.value?.zone_id[0]?.id : '' : '',
        "vehicle_id": this.sideFiltersForm.value?.vehicle_id ? this.sideFiltersForm.value.vehicle_id.length > 0 ? this.sideFiltersForm.value?.vehicle_id[0]?.id : '' : '',
        "salesman_id": this.sideFiltersForm.value.salesman ? this.sideFiltersForm.value.salesman.lngth > 0 ? this.sideFiltersForm.value.salesman[0].id : '' : '',
        module: this.getModuleType(),
      };
      this.ReportService.getReportData(body).subscribe((res) => {
        if (res?.status == true) {
          const filetype = '.file' + body.export_type.toUpperCase();
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    }
  }
  getDailyOperation() {
    const sideFilter = this.sideFiltersForm.value;
    let del_start_date = sideFilter.del_start_date ? sideFilter.del_start_date : null;
    let del_end_date = sideFilter.del_end_date ? sideFilter.del_end_date : null;
    const body = {
      "warehouse_id": sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
      // "warehouse_id": [9],
      "order_number": sideFilter.order_number ? sideFilter.order_number : '',
      "customer_lpo": sideFilter.customer_lp ? sideFilter.customer_lp : '',
      "channel_id": sideFilter.channel_code.length > 0 ? sideFilter.channel_code.map(i => i.id) : [],
      "del_start_date": del_start_date,
      "del_end_date": del_end_date,
      "export": 1,
      "export_type": "CSV",
      "module": "orderSCReport",
      
    };
    this.ReportService.dailyOperationReportsData(body).subscribe((res) => {
      if (res?.status == true) {
        const filetype = '.file' + body.export_type.toUpperCase();
        this.apiService.downloadFile(res.data.file_url, filetype);
      }
    });
  }
  getDeliveryOperation() {
    const sideFilter = this.sideFiltersForm.value;
    let del_start_date = sideFilter.del_start_date ? sideFilter.del_start_date : null;
    let del_end_date = sideFilter.del_end_date ? sideFilter.del_end_date : null;
    console.log(sideFilter?.warehouse_id,"sideFilter?.warehouse_id")
    let codes = []
    sideFilter.warehouse_id.map(i => {

       codes.push(i.itemName.split(" ")[0])
    })
    const body = {
      "branch_plant_code": sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? codes : [] : [],
      "start_date": del_start_date,
      "end_date": del_end_date,
      "export": 0,



    };
    this.ReportService.deliveryData(body).subscribe((res) => {
      if (res?.status == true) {
      console.log(res)
      this.dataEditor.sendData({
        type: CompDataServiceType.REPORT_DATA,
        request: body,
        data: res.data,
      });
        // const filetype = '.file' + body.export_type.toUpperCase();
        // this.apiService.downloadFile(res.data.file_url, filetype);
      }
    });
  }
  dlType:any = 1
  valueFix(dta:any)
  {
    this.dlType = dta

    localStorage.setItem("fix",dta)
  }
  getDeliveryExportOperation() {
    const sideFilter = this.sideFiltersForm.value;
    let del_start_date = sideFilter.start_date ? sideFilter.start_date : null;
    let del_end_date = sideFilter.end_date ? sideFilter.end_date : null;
    console.log(sideFilter?.warehouse_id,"sideFilter?.warehouse_id")
    let codes = []
    sideFilter.warehouse_id.map(i => {

       codes.push(i.itemName.split(" ")[0])
    })
    const body = {
      "branch_plant_code": sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? codes : [] : [],
      "start_date": del_start_date,
      "end_date": del_end_date,
      "export": 0,
      "type":this.dlType,
      "salesman_id": this.sideFiltersForm.value.salesman ? this.sideFiltersForm.value.salesman.lngth > 0 ? this.sideFiltersForm.value.salesman[0].id : '' : '',



    };
    this.ReportService.ReportdeliveryData(body).subscribe((res) => {
      if (res?.status == true) {
      console.log(res)
      this.dataEditor.sendData({
        type: CompDataServiceType.REPORT_DATA,
        request: body,
        data: res.data,
      });
        // const filetype = '.file' + body.export_type.toUpperCase();
        // this.apiService.downloadFile(res.data.file_url, filetype);
      }
    });
  }
  getPalletReport() {
    const sideFilter = this.sideFiltersForm.value;
    let del_start_date = sideFilter.start_date ? sideFilter.start_date : null;
    let del_end_date = sideFilter.end_date ? sideFilter.end_date : null;
    console.log(sideFilter?.warehouse_id,"sideFilter?.warehouse_id")
    let codes = []
    sideFilter.warehouse_id.map(i => {

       codes.push(i.itemName.split(" ")[0])
    })
    const body = {
      "branch_plant_code": sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? codes : [] : [],
      "start_date": del_start_date,
      "end_date": del_end_date,
      "export": 0,
      "salesman_id": this.sideFiltersForm.value.salesman ? this.sideFiltersForm.value.salesman.lngth > 0 ? this.sideFiltersForm.value.salesman[0].id : '' : '',
      "region_id": this.sideFiltersForm.value?.zone_id ? this.sideFiltersForm.value?.zone_id.length > 0 ? this.sideFiltersForm.value?.zone_id[0]?.id : [] : [],
      "divison_id":this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [],
     



    };
    this.ReportService.ReportPalletData(body).subscribe((res) => {
      if (res?.status == true) {
      console.log(res)
      this.close();
      this.dataEditor.sendData({
        type: CompDataServiceType.REPORT_DATA,
        request: body,
        data: res.data,
      });
        // const filetype = '.file' + body.export_type.toUpperCase();
        // this.apiService.downloadFile(res.data.file_url, 'csv');
      }
     
    });
  }

  getGeoApproval() {
    const sideFilter = this.sideFiltersForm.value;
    let del_start_date = sideFilter.start_date ? sideFilter.start_date : null;
    let del_end_date = sideFilter.end_date ? sideFilter.end_date : null;
    console.log(sideFilter?.warehouse_id,"sideFilter?.warehouse_id")
    let codes = []
    sideFilter.warehouse_id.map(i => {

       codes.push(i.itemName.split(" ")[0])
    })
    const body = {
      "salesman_id": sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : 0 : 0,
      "start_date": del_start_date,
      "end_date": del_end_date,
      "export": 0,


    };
    this.ReportService.ReportGeoData(body).subscribe((res) => {
      if (res?.status == true) {
      console.log(res)
      this.dataEditor.sendData({
        type: CompDataServiceType.REPORT_DATA,
        request: body,
        data: res.data,
      });
        // const filetype = '.file' + body.export_type.toUpperCase();
        // this.apiService.downloadFile(res.data.file_url, filetype);
      }
    });
  }
  getCustomerReport() {
    // let start_date = this.start_date.split('/');
    // start_date = start_date[0] + '-' + start_date[1] + '-' + start_date[2];
    // let end_date = this.end_date.split('/');
    // end_date = end_date[0] + '-' + end_date[1] + '-' + end_date[2];
    let start_date = this.start_date;
    let end_date = this.end_date;
    let body = {
      "start_date": start_date,
      "end_date": end_date,
      "export": 0,
      "export_type": "",
      "module": "balance-sheet",
      "customer": this.customerSelected.value
    }
    this.ReportService.merchandisingReports(body).subscribe((res) => {
      if (res?.status == true) {

        this.selectedReportData = res.data;
        this.dataEditor.sendData({
          type: CompDataServiceType.CUSTOMER_DATA,
          request: body,
          data: res.data,
        });
      }
    });
  }
  ngOnInit(): void {
    this.getChannelList();
    this.showSidePanle = true;
    this.settings = {
      classes: "myclass custom-class",
      enableSearchFilter: true,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
      searchBy: ['item_code', 'item_name']
    };
    this.sideFiltersForm = this.fb.group({
      del_start_date: '',
      del_end_date: '',
      start_date: new FormControl(''),
      end_date: new FormControl(''),
      warehouse_id: new FormControl(''),
      order_number: '',
      customer_lpo: '',
      van_id: '',
      level: new FormControl(''),
      division: new FormControl(''),
      region: [[]],
      route: [[]],
      supervisor: [[]],
      salesman: [[]],
      item_category: [[]],
      customer: [[]],
      user_created: [[]],
      item_id: [[]],
      ksm_id: [[]],
      name: [[]],
      vehicle_id: '',
      zone_id: [[]],
      salesGrvReportType: new FormControl(''),
      reportType: new FormControl(''),
      helper: [[]],
      channel_code: new FormControl(),
    });

    this.customerFormControl = new FormControl('');
    const sidebarContainer = document.querySelector('._sidenav');
    sidebarContainer.classList.toggle('collapse_sidenav');
    this.apiService
      .getCustomers().subscribe((res) => {
        this.cust_List = res.data;
      });
    this.apiService.getAllZoneList().subscribe(zone => {
      this.zoneList = zone.data;
    });
    
    this.apiService.getAllInviteUser().subscribe(res => {
      const filterData = res.data.filter(i => i.user?.role?.name === 'ASM' || []);
      const userData = [];
      filterData?.forEach(user => {
        
        user.user.username = user?.user?.firstname + ' ' + user?.user?.lastname;
        userData.push(user.user);
      });
      this.userList = userData;
    });
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.customers = result.data.customers;
      this.customerList = result.data.customers;
      for (let customer of this.customerList) {
        customer['customer_name'] = `${customer.customer_info.customer_code} - ${customer.firstname} ${customer.lastname}`;
        customer['id'] = customer?.customer_info.user_id;
      }
      this.regionList = result.data.region;
      this.routeList = result.data.route;
      this.itemCategoryList = result.data.item_major_category_list;
      this.salesmanList = result.data.salesmans;
      this.filterItem = [...result.data.items];
      this.itemList = result.data.items.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      })
      this.createdUserList = result.data.order_created_user;
      for (let salesman of this.salesmanList) {
        salesman['salesman_name'] = `${salesman.salesman_info.salesman_code} - ${salesman.firstname} ${salesman.lastname}`;
      }
    });

    this.apiService.getLobs().subscribe(lobs => {
      this.divisionList = lobs.data;
    });
    this.apiService.getAllVans().subscribe((response) => {
      this.vehiclesList = response.data.map(i => ({ id: i.id, name: i.description + ' - ' + i.van_code }));
    });
    this.apiService.getHelperData().subscribe(helper => {
      this.helperList = helper.data.map(i => ({ id: i.id, name: i.salesman_code + ' - ' + i.user?.firstname + ' ' + i.user?.lastname }));
    });
    this.intervalSelected = new FormControl('current_week');
    this.customerSelected = new FormControl('');

    this.reportNavOptions = null; // JSON.parse(localStorage.getItem('reportbar'));

    if (!this.reportNavOptions) {
      this.apiService.getReportNavOptions().subscribe((res: any[]) => {
        // this.reportNavOptions = res.filter(i => i.domain == 'presales-prodmobiato' || i.domain == '');
        if (this.domain.split('.')[0] == 'presales-prodmobiato') {
          this.reportNavOptions = res.filter(i => i.domain == 'presales-prodmobiato' || i.domain == '');
        } else if (this.domain.split('.')[0] == 'prodmobiato') {
          this.reportNavOptions = res.filter(i => i.domain == 'prodmobiato' || i.domain == '');
        } else if (this.domain.split('.')[0] == 'devmobiato') {
          this.reportNavOptions = res
        } else if (this.domain.split('.')[0] == 'presales-devmobiato') {
          this.reportNavOptions = res.filter(i => i.domain == 'presales-prodmobiato' || i.domain == '');
        } else if (this.domain.split(':')[0] == 'localhost') {
          this.reportNavOptions = res;
        }
        this.mapReportOptions();
        this.detChange.detectChanges();
        localStorage.setItem('reportbar', JSON.stringify(res));
      });
    } else {
      this.mapReportOptions();
    }

    // this.masterService.customerDetailListTable({ page: this.page, page_size: 10 }).subscribe((result) => {
    //   this.page++;
    //   this.filterCustomer = result.data;
    //   this.total_pages = result.pagination?.total_pages
    // })

    // this.lookup$
    //   .pipe(debounceTime(500), exhaustMap(() => {
    //     return this.masterService.customerDetailListTable({ name: this.filterValue, page: this.page, page_size: this.page_size })
    //   }))
    //   .subscribe(res => {
    //     if (this.filterValue == "") {
    //       if (this.page > 1) {
    //         this.filterCustomer = [...this.filterCustomer, ...res.data];
    //       } else {
    //         this.filterCustomer = res.data;
    //       }
    //       this.page++;
    //       this.total_pages = res?.pagination?.total_pages;
    //     } else {
    //       this.page = 1;
    //       this.filterCustomer = res.data;
    //     }
    //     this.isLoading = false;
    //   });
    // this.subscriptions.push(
    //   this.customerFormControl.valueChanges
    //     .pipe(
    //       debounceTime(200),
    //       startWith<string | Customer>(''),
    //       map((value) => (typeof value === 'string' ? value : value?.user?.firstname)),
    //       map((value: string) => {
    //         return value;
    //       })
    //     ).subscribe((res) => {
    //       this.filterValue = res || "";
    //       this.lookup$.next(this.page)
    //     })
    // );
  }
  ngOnChanges() {
    console.log(this.activeRoute);
  }
  public customerControlDisplayValue(customer: Customer): string {
    return `${customer?.user?.firstname ? customer?.user?.firstname : ''} ${customer?.user?.lastname ? customer?.user?.lastname : ''}`
  }

  // filterCustomers(value) {
  //   this.filterValue = value || "";
  //   this.page = 1;
  //   this.isLoading = true;
  //   this.lookup$.next(this.page)
  //   this.filterCustomer = [];
  // }

  selectedCustomer(): void {
    if (this.customerFormControl.value && this.customerFormControl.value.length > 0)
      this.customerSelected.setValue(this.customerFormControl.value[0].id);
  }

  onScroll() {
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
  }
  getSupervisorsByRegion() {
    let id = this.sideFiltersForm.get('region').value[0]?.id;
    this.ReportService.regionSupervisorSalesman(id).subscribe((result: any) => {
      this.supervisorList = [result.data[0]["salesman_supervisor"]];
    })
    this.filterCustomerData(id);
  }

  getSupervisorsByRoute() {
    let id = this.sideFiltersForm.get('route').value[0]?.id;
    this.ReportService.regionSupervisorSalesman(id).subscribe((result: any) => {
      this.supervisorList = [result.data[0]["salesman_supervisor"]];
      // this.salesmanList = result.data[0]["salesmans"];
    })
  }

  onSelectDivison() {
    this.sideFiltersForm.get('region').setValue([]);
    this.sideFiltersForm.get('route').setValue([]);
    this.filterSalesman();

    var divisions = this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [];
    this.ReportService.customerList(divisions).subscribe((result: any) => {
      this.customerList = [];
      result.data.forEach(element => {
        if (element.customer_id && this.customerList.findIndex(x => x.id == element.customer_id) == -1) {
          var _supervisor = {
            customer_name: element.customer_name,
            id: element.customer_id,
          };

          this.customerList.push(_supervisor);
        }
      });
    })
  }

  // onSelectUSer() {
  //   this.sideFiltersForm.get('ksm_id').setValue([]);
  //   this.sideFiltersForm.get('route').setValue([]);
  //   this.filterSalesman();

  //   var divisions = this.sideFiltersForm.get('ksm_id').value.length > 0 ? this.sideFiltersForm.get('ksm_id').value.map(x => x.id) : [];
  //   this.ReportService.customerList(divisions).subscribe((result: any) => {
  //     this.customerList = [];
  //     result.data.forEach(element => {
  //       if (element.customer_id && this.customerList.findIndex(x => x.id == element.customer_id) == -1) {
  //         var _supervisor = {
  //           customer_name: element.customer_name,
  //           id: element.customer_id,
  //         };

  //         this.customerList.push(_supervisor);
  //       }
  //     });
  //   })
  // }
  filterWarehouse() {
    var divisions = this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [];
    this.apiService.getWarehouse(divisions).subscribe(x => {
      this.warehouseList = x.data;
      this.warehouseList.forEach(element => {
        element.name = element.code + '-' + element.name;
      });
    });
  }
  filterVehicles() {
    if (this.activeRoute === 'sales-quantity' || this.activeRoute == 'loading-chart-by-warehouse' || this.activeRoute == 'loading-chart-final-by-route') {
      this.vehiclesList = [];
      this.apiService.getAllVans().subscribe((response) => {
        response.data.forEach(element => {
          this.vehiclesList.push({ id: element.id, name: element.description + '-' + element.van_code })
        });
      });
    }
  }

  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }

  filterSalesman() {
    this.sideFiltersForm.get('supervisor').setValue([]);
    this.sideFiltersForm.get('salesman').setValue([]);
    const divisions = this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [];
    const regions = this.sideFiltersForm.get('region').value.length > 0 ? this.sideFiltersForm.get('region').value.map(x => x.id) : [];
    const routes = this.sideFiltersForm.get('route').value.length > 0 ? this.sideFiltersForm.get('route').value.map(x => x.id) : [];
    this.ReportService.filterSalesman(divisions, regions, routes).subscribe((result: any) => {
      this.salesmanList = [];
      result.data.forEach(element => {
        if (element.salesman_id && this.salesmanList.findIndex(x => x.id == element.salesman_id) == -1) {
          const _salesman = {
            salesman_name: element.salesman_name,
            id: element.salesman_id,
          };

          this.salesmanList.push(_salesman);
        }
      });
    });

    this.ReportService.getFilterData(divisions, regions, routes).subscribe((result: any) => {
      this.routeList = [];
      this.regionList = [];
      result.data.forEach(element => {
        if (element.region_id && this.regionList.findIndex(x => x.id == element.region_id) == -1) {
          const _region = {
            region_name: element.region_name,
            id: element.region_id,
          };

          this.regionList.push(_region);
        }
        if (element.route_id && this.routeList.findIndex(x => x.id == element.route_id) == -1) {
          const _route = {
            route_name: element.route_name,
            id: element.route_id,
          };

          this.routeList.push(_route);
        }
      });
    });

    this.ReportService.supervisorList(divisions, regions, routes).subscribe((result: any) => {
      this.supervisorList = [];
      result.data.forEach(element => {
        if (element.supervisor_id && this.supervisorList.findIndex(x => x.id == element.salesman_id) == -1) {
          const _supervisor = {
            supervisor_name: element.supervisor_name,
            id: element.supervisor_id,
          };

          this.supervisorList.push(_supervisor);
        }
      });
    });
  }

  filterCustomerData(regionid) {
    if (regionid) {
      this.customerList = [];
      this.customerList = this.customers.filter((x) => x.customer_info.region_id.indexOf(regionid) > -1)
    } else {
      this.customerList = [];
      this.customerList = this.customers;
    }
  }

  getItemCategory() {

  }

  getCustomer() {
    let id = this.sideFiltersForm.get('region').value[0]?.id;
    this.ReportService.regionSupervisorSalesman(id).subscribe((result: any) => {
      this.supervisorList = [result.data[0]["salesman_supervisor"]];
      // this.salesmanList = result.data[0]["salesmans"];
    });
  }

  getSalesmans() {

  }



  mapReportOptions() {
    let reportNavOptions = this.reportNavOptions;
    console.log(reportNavOptions,"reportNavOptions")
    this.reportNavOptions = [];
    reportNavOptions?.forEach(element => {
      if (!this.checkPermission(element.label)) {
        this.reportNavOptions.push(element);
      }
    });
    this.activatedRoute.url.subscribe((response) => {
      if (this.activatedRoute.snapshot.firstChild) {
        this.activeRoute = this.activatedRoute.snapshot.firstChild.routeConfig.path;
        // this.filterDates('current_week');
        this.getModuleType();
        this.filterDates(this.intervals[0].id);

      } else if (this.reportNavOptions.length > 0) {
        this.routeTo(this.reportNavOptions[0].routeTo, 0, this.reportNavOptions[0].label);
      }
    });
  }

  routeTo(routeTo: string, index: number, label: string) {
    if (routeTo.length) {
      this.route.navigate([routeTo]);
      this.activeRoute = routeTo.split('/')[routeTo.split('/').length - 1];
      this.SelectedRport = label;
      this.getModuleType();
      this.filterDates(this.intervalSelected.value);
    }
  }
  setValidators() {
    if (this.activeRoute == 'consolidated-load' || this.activeRoute == 'consolidated-return-load' || this.activeRoute == 'loading-chart-by-warehouse') {
      this.sideFiltersForm.controls['start_date'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['start_date'].updateValueAndValidity();
      this.sideFiltersForm.controls['end_date'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['end_date'].updateValueAndValidity();
      this.sideFiltersForm.controls['division'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['division'].updateValueAndValidity();
      this.sideFiltersForm.controls['warehouse_id'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['warehouse_id'].updateValueAndValidity();
    } else if (
      this.activeRoute == 'daily-crf' ||
      this.activeRoute == 'monthly-kpi' ||
      this.activeRoute == 'ytd-kpi' ||
      this.activeRoute == 'daily-grv' ||
      this.activeRoute == 'daily-cancel-order' || this.activeRoute == 'timesheets' || this.activeRoute == 'salesman-performance' || this.activeRoute == 'driver-loaded-qty') {
      this.sideFiltersForm.controls['start_date'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['start_date'].updateValueAndValidity();
      this.sideFiltersForm.controls['end_date'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['end_date'].updateValueAndValidity();
    } else if (this.activeRoute == 'difot' || this.activeRoute === 'truck-utilisation') {
      this.sideFiltersForm.controls['start_date'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['start_date'].updateValueAndValidity();
      this.sideFiltersForm.controls['end_date'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['end_date'].updateValueAndValidity();
      this.sideFiltersForm.controls['level'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['level'].updateValueAndValidity();
    } else if (this.activeRoute == 'sales-vs-grv') {
      this.sideFiltersForm.controls['salesGrvReportType'].setValidators([Validators.required]);
      this.sideFiltersForm.controls['salesGrvReportType'].updateValueAndValidity();
    }
    else {
      this.sideFiltersForm.controls['start_date'].clearValidators();
      this.sideFiltersForm.controls['start_date'].updateValueAndValidity();
      this.sideFiltersForm.controls['end_date'].clearValidators();
      this.sideFiltersForm.controls['end_date'].updateValueAndValidity();
      this.sideFiltersForm.controls['division'].clearValidators();
      this.sideFiltersForm.controls['division'].updateValueAndValidity();
      this.sideFiltersForm.controls['warehouse_id'].clearValidators();
      this.sideFiltersForm.controls['warehouse_id'].updateValueAndValidity();
      this.sideFiltersForm.controls['level'].clearValidators();
      this.sideFiltersForm.controls['level'].updateValueAndValidity();
      this.sideFiltersForm.controls['salesGrvReportType'].clearValidators();
      this.sideFiltersForm.controls['salesGrvReportType'].updateValueAndValidity();
    }
  }
  isActive(route, label) {
    if (route.indexOf(this.activeRoute) >= 0) {
      this.SelectedRport = label;
      return true;
    }
  }

  toggleSideNav() {
    this.showSidePanle = this.showSidePanle == true ? false : true;
  }
  openScheduleForm() {
    let response: any;
    let data = {
      title: 'Schedule Report',
      subtitle: this.SelectedRport,
    };
    this.dialog
      .open(ScheduleDialogComponent, {
        width: '800px',
        height: 'auto',
        data: data,
      })
      .afterClosed()
      .subscribe((data) => {
      });
  }

  onChangeInterval(event) {
    // if (event == 'custom') {
    //   let start_date = this.start_date.split('/');
    //   start_date = start_date[2] + '-' + start_date[1] + '-' + start_date[0];
    //   let end_date = this.end_date.split('/');
    //   end_date = end_date[2] + '-' + end_date[1] + '-' + end_date[0];
    //   let data: ReportCustomDateFilterModel = {
    //     title: 'Custom Filter',
    //     startdate: start_date,
    //     enddate: end_date,
    //     activeRoute: this.activeRoute
    //   };
    //   this.dialog
    //     .open(ReportCustomFilterComponent, {
    //       width: '800px',
    //       height: 'auto',
    //       data: data,
    //     })
    //     .afterClosed()
    //     .subscribe((data) => {
    //       if (data?.startdate !== undefined && data?.startdate !== "" && data?.enddate !== undefined && data?.enddate !== "") {
    //         let start_date = data.startdate.split('-');
    //         start_date = start_date[2] + '/' + start_date[1] + '/' + start_date[0];
    //         let end_date = data.enddate.split('-');
    //         end_date = end_date[2] + '/' + end_date[1] + '/' + end_date[0];
    //         this.start_date = start_date;
    //         this.end_date = end_date;
    //         this.getDatabyFilter();
    //       }
    //     });
    // } else {
    //   this.filterDates(this.intervalSelected.value);
    // }
  }

  onChangeCustomer(event) {
    this.filterDates(this.intervalSelected.value);

  }

  filterDates(type) {
    let date = new Date();
    let quarter = Math.floor(date.getMonth() / 3);
    let start_date, end_date;
    switch (type) {
      case 'today':
        start_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        end_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        break;
      case 'current_week':
        start_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + (date.getDay() == 0 ? -6 : 1) - date.getDay()
        );
        end_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + (date.getDay() == 0 ? 0 : 7) - date.getDay()
        );
        break;
      case 'current_month':
        start_date = new Date(date.getFullYear(), date.getMonth(), 1);
        end_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      case 'current_quarter':
        start_date = new Date(date.getFullYear(), quarter * 3, 1);
        end_date = new Date(
          start_date.getFullYear(),
          start_date.getMonth() + 3,
          0
        );
        break;
      case 'current_year':
        start_date = new Date(date.getFullYear(), 0, 1);
        end_date = new Date(date.getFullYear(), 11, 31);
        break;
      case 'yesterday':
        start_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 1
        );
        end_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 1
        );
        break;
      case 'previous_week':
        let diffToMonday = date.getDate() - date.getDay();
        start_date = new Date(date.setDate(diffToMonday - 6));
        end_date = new Date(date.setDate(diffToMonday));
        break;
      case 'previous_month':
        start_date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        end_date = new Date(date.getFullYear(), date.getMonth(), 0);
        break;
      case 'previous_quarter':
        start_date = new Date(date.getFullYear(), quarter * 3 - 3, 1);
        end_date = new Date(
          start_date.getFullYear(),
          start_date.getMonth() + 3,
          0
        );
        break;
      case 'previous_year':
        start_date = new Date(date.getFullYear() - 1, 0, 1);
        end_date = new Date(date.getFullYear() - 1, 11, 31);
        break;
      default:
        start_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + (date.getDay() == 0 ? -6 : 1) - date.getDay()
        );
        end_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + (date.getDay() == 0 ? 0 : 7) - date.getDay()
        );
        break;
    }

    // this.start_date =
    //   start_date.getDate() +
    //   '/' +
    //   (start_date.getMonth() + 1) +
    //   '/' +
    //   start_date.getFullYear();
    // this.end_date =
    //   end_date.getDate() +
    //   '/' +
    //   (end_date.getMonth() + 1) +
    //   '/' +
    //   end_date.getFullYear();

    //   this.runReport();
  }

  getDatabyFilter() {
    let body: any;
    let start_date = this.start_date ? this.start_date : null;
    let end_date = this.end_date ? this.end_date : null;

    // let start_date = this.start_date ? this.start_date : new Date()
    // let end_date = this.end_date ? this.end_date : new Date()
    // let start_date = this.start_date.split('/');
    // start_date = start_date[2] + '-' + start_date[1] + '-' + start_date[0];
    // let end_date = this.end_date.split('/');
    // end_date = end_date[2] + '-' + end_date[1] + '-' + end_date[0];
    let sideFilter = this.sideFiltersForm.value;
    this.isSubmitted = true;
    if (this.sideFiltersForm.valid) {
      if (this.activeRoute == 'consolidated-load' || this.activeRoute == 'consolidated-return-load') {
        body = {
          warehouse_id: sideFilter?.warehouse_id ? sideFilter?.warehouse_id.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          channel_id: sideFilter.channel_code.length > 0 ? sideFilter.channel_code.map(i => i.id) : [],
        }

      } else if (this.activeRoute == 'order-details') {

        let del_start_date = sideFilter.del_start_date ? sideFilter.del_start_date : null;
        let del_end_date = sideFilter.del_end_date ? sideFilter.del_end_date : null;
        body = {
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          warehouse_id: sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
          order_number: sideFilter.order_number,
          customer_id: this.customerFormControl?.value ? this.customerFormControl?.value?.length > 0 ? this.customerFormControl.value[0].id : null : null,
          customer_lpo: sideFilter.customer_lpo,
          item_ids: sideFilter.item_id ? sideFilter.item_id?.length > 0 ? sideFilter.item_id.map(i => i.id) : null : null,
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          del_start_date: del_start_date,
          del_end_date: del_end_date,
        }
      } else if (this.activeRoute == 'loading-chart-by-warehouse' || this.activeRoute == 'loading-chart-final-by-route') {
        body = {
          warehouse_id: sideFilter?.warehouse_id ? sideFilter?.warehouse_id.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
          // channel_id: sideFilter.channel_code.length > 0 ? sideFilter.channel_code.map(i => i.id) : [],
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : null : null,
          van_id: sideFilter?.van_id ? sideFilter?.van_id.length > 0 ? sideFilter?.van_id[0]?.id : null : null
        }
      } else if (this.activeRoute == 'difot') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
        }
      } else if (this.activeRoute == 'truck-utilisation') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          report_type: this.sideFiltersForm.value?.level,
          region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
          vehicle_id: sideFilter?.vehicle_id ? sideFilter.vehicle_id.length > 0 ? sideFilter?.vehicle_id[0]?.id : '' : '',
          salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : '' : '',
        }
      } else if (this.activeRoute == 'monthly-kpi') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
        }
      } else if (this.activeRoute == 'ytd-kpi') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          // region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
        }
      } else if (this.activeRoute == 'daily-crf') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          export_for: '0',
          module: this.getModuleType(),
          region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
        }
      }
      else if (this.activeRoute == 'sales-quantity') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          region_id: sideFilter?.region ? sideFilter.region.map(item => item.id) : [],
          van_id: sideFilter?.van_id ? sideFilter?.van_id.length > 0 ? sideFilter?.van_id[0]?.id : [] : [],
        }
      } else if (this.activeRoute == 'return-grv') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
        };
      }
      else if (this.activeRoute == 'daily-grv' || this.activeRoute == 'daily-spot-return') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          ksm_id: '',
          // ksm_id: sideFilter.ksm_id ? sideFilter.ksm_id?.length > 0 ? sideFilter.ksm_id.map(i => i.id) : null : null,
          // module: this.getModuleType()
        };
      } else if (this.activeRoute == 'sales-vs-grv') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          report_type: sideFilter.salesGrvReportType, // 1: KAM, 2:Monthly
          ksm_id: sideFilter.ksm_id ? sideFilter.ksm_id?.length > 0 ? sideFilter.ksm_id.map(i => i.id) : null : null,
          // ksm_id: '',
          module: this.getModuleType()
        };

      } else if (this.activeRoute == 'daily-cancel-order') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          ksm_id: '',
          region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
          // ksm_id: sideFilter.ksm_id ? sideFilter.ksm_id?.length > 0 ? sideFilter.ksm_id.map(i => i.id) : null : null,
          // module: this.getModuleType()
        };
      } else if (this.activeRoute == 'salesman-performance') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          report_type: sideFilter?.reportType,
          module: this.getModuleType(),
          region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
          salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : '' : '',
          helper_id: sideFilter.helper ? sideFilter.helper.length > 0 ? sideFilter.helper[0].id : '' : '',
        }
      }
      else if (this.activeRoute == 'timesheets') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
          salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : [] : [],
        };
      } else if (this.activeRoute == 'driver-loaded-qty') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: this.export,
          export_type: this.export_type,
          report_type: sideFilter?.reportType,
          module: this.getModuleType(),
          salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : '' : '',
          helper_id: sideFilter.helper ? sideFilter.helper.length > 0 ? sideFilter.helper[0].id : '' : '',
          warehouse_id: sideFilter?.warehouse_id ? sideFilter?.warehouse_id.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
        };
      }
      else {
        body = {
          division: sideFilter?.division ? sideFilter?.divisions?.length > 0 ? sideFilter?.division.map(item => item.id) : [] : [],
          region: sideFilter?.region ? sideFilter?.region?.length > 0 ? sideFilter?.region.map(item => item.id) : [] : [],
          route: sideFilter?.route ? sideFilter?.route?.length > 0 ? sideFilter?.route.map(item => item.id) : [] : [],
          supervisor: sideFilter?.supervisor ? sideFilter?.supervisor.length > 0 ? sideFilter?.supervisor.map(item => item.id) : [] : [],
          salesman: sideFilter?.salesman ? sideFilter?.salesman.length > 0 ? sideFilter?.salesman.map(item => item.id) : [] : [],
          start_date: start_date,
          customer_id: (this.activeRoute == 'store-summary' ? this.customerSelected.value : undefined),
          customer: this.customerSelected.value ? [this.customerSelected.value] : "",
          end_date: end_date,
          export: this.export,
          export_type: this.export_type,
          module: this.getModuleType(),
          item_category: sideFilter?.item_category ? sideFilter?.item_category.length > 0 ? sideFilter?.item_category.map(item => item.id) : [] : [],
        };
      }

      if (body.module == "") return false;
      if (this.activeRoute == 'daily-grv') {
        this.ReportService.grvReportsData(body).subscribe((res) => {
          if (res?.status == true) {
            this.close();
            this.selectedReportData = res.data;
            this.dataEditor.sendData({
              type: CompDataServiceType.REPORT_DATA,
              request: body,
              data: res.data,
            });
          }
        });
      } else if (this.activeRoute == 'daily-spot-return') {
        this.ReportService.spotReturnReportsData(body).subscribe((res) => {
          if (res?.status == true) {
            this.close();
            this.selectedReportData = res.data;
            this.dataEditor.sendData({
              type: CompDataServiceType.REPORT_DATA,
              request: body,
              data: res.data,
            });
          }
        });
      } else if (this.activeRoute == 'daily-cancel-order') {
        this.ReportService.dailyCancelOrderReportsData(body).subscribe((res) => {
          if (res?.status == true) {
            this.close();
            this.selectedReportData = res.data;
            this.dataEditor.sendData({
              type: CompDataServiceType.REPORT_DATA,
              request: body,
              data: res.data,
            });
          }
        });
      } else if (this.activeRoute == 'salesman-performance') {
        this.ReportService.salesmanPerformanceReportsData(body).subscribe((res) => {
          if (res?.status == true) {
            this.close();
            this.selectedReportData = res.data;
            this.dataEditor.sendData({
              type: CompDataServiceType.REPORT_DATA,
              request: body,
              data: res.data,
            });
          }
        });
      } else if (this.activeRoute == 'driver-loaded-qty') {
        this.ReportService.driverLoadedReportsData(body).subscribe((res) => {
          if (res?.status == true) {
            this.close();
            this.selectedReportData = res.data;
            this.dataEditor.sendData({
              type: CompDataServiceType.REPORT_DATA,
              request: body,
              data: res.data,
            });
          }
        });
      }
      // else if (this.activeRoute == 'order-details') {
      //   const model = this.sideFiltersForm.value;
      //   console.log(this.sideFiltersForm);
      //   if (
      //     // model.region?.length == 0
      //     // || model.order_number == ''
      //     // || model.customer_lpo == ''
      //     // || model.division == ''
      //     // || model.salesman?.length == 0
      //     // || model.warehouse_id == ''
      //     // || model.item_id?.length == 0
      //     // || model.customer?.length == 0
      //     // || model.van_id == ''
      //     model.start_date == ''
      //     || model.end_date == '') {
      //     this.cts.showError('Please select any one filter to get the Report data');
      //   }
      // }
      else {
        if (this.activeRoute == 'order-details') {
          const model = this.sideFiltersForm.value;
          if (
            model.region?.length == 0
            && model.order_number == ''
            && model.customer_lpo == ''
            && model.division?.length == 0
            && model.salesman?.length == 0
            && model.warehouse_id?.length == 0
            && model.item_id?.length == 0
            && model.customer?.length == 0
            && model.van_id?.length == 0
            && model.start_date == ''
            && model.end_date == '') {
            this.cts.showError('Please select any one filter to get the Report data');
          } else {
            this.ReportService.getReportData(body).subscribe((res) => {
              if (res?.status == true) {
                this.close();
                this.selectedReportData = res.data;

                this.dataEditor.sendData({
                  type: CompDataServiceType.REPORT_DATA,
                  request: body,
                  data: res.data,
                });
              }
            });
          }

        } else {
          this.ReportService.getReportData(body).subscribe((res) => {
            if (res?.status == true) {
              this.close();
              this.selectedReportData = res.data;

              this.dataEditor.sendData({
                type: CompDataServiceType.REPORT_DATA,
                request: body,
                data: res.data,
              });
            }
          });
        }

      }
    }
  }

  exportReport(type) {
    // let start_date = this.start_date.split('/');
    // start_date = start_date[2] + '-' + start_date[1] + '-' + start_date[0];
    // let end_date = this.end_date.split('/');
    // end_date = end_date[2] + '-' + end_date[1] + '-' + end_date[0];
    let start_date = this.start_date
    let end_date = this.end_date
    let sideFilter = this.sideFiltersForm.value;
    let body: any;
    if (this.activeRoute == 'consolidated-load' || this.activeRoute == 'consolidated-return-load') {
      body = {
        warehouse_id: sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
        channel_id: sideFilter.channel_code.length > 0 ? sideFilter.channel_code.map(i => i.id) : [],
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType()
      }
    } else if (this.activeRoute == 'order-details') {
      let del_start_date = sideFilter.del_start_date ? sideFilter.del_start_date : null;
      let del_end_date = sideFilter.del_end_date ? sideFilter.del_end_date : null;
      body = {
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        warehouse_id: sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
        order_number: sideFilter.order_number,
        customer_id: this.customerFormControl?.value ? this.customerFormControl?.value?.length > 0 ? this.customerFormControl.value[0].id : null : null,
        customer_lpo: sideFilter.customer_lpo,
        item_ids: sideFilter.item_id ? sideFilter.item_id?.length > 0 ? sideFilter.item_id.map(i => i.id) : null : null,
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        del_start_date: del_start_date,
        del_end_date: del_end_date,
      }
    } else if (this.activeRoute == 'daily-operation') {
      let del_start_date1 = sideFilter.del_start_date ? sideFilter.del_start_date : null;
      let del_end_date2 = sideFilter.del_end_date ? sideFilter.del_end_date : null;
      body = {
        warehouse_id: sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
        order_number: sideFilter.order_number ? sideFilter.order_number : '',
        customer_lpo: sideFilter.customer_lp ? sideFilter.customer_lp : '',
        del_start_date: del_start_date1,
        del_end_date: del_end_date2,
        export: 1,
        export_type: "CSV",
        module: this.getModuleType(),
      }
    }else if (this.activeRoute == 'delivery-report') {
    let del_start_date1 = sideFilter.del_start_date ? sideFilter.del_start_date : null;
    let del_end_date2 = sideFilter.del_end_date ? sideFilter.del_end_date : null;
    let codes = []
    sideFilter.warehouse_id.map(i => {
     console.log(i,"in")
       codes.push(i.itemName.split(" ")[0])
    })
    const body = {
      "branch_plant_code": sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? codes : [] : [],
      "start_date": del_start_date1,
      "end_date": del_end_date2,
      export: 1,
      export_type: "CSV",
      module: this.getModuleType(),
    }
  }
  else if (this.activeRoute == 'delivery-export-report') {
    let del_start_date1 = sideFilter.del_start_date ? sideFilter.del_start_date : null;
    let del_end_date2 = sideFilter.del_end_date ? sideFilter.del_end_date : null;
    let codes = []
    sideFilter.warehouse_id.map(i => {
     console.log(i,"in")
       codes.push(i.itemName.split(" ")[0])
    })
    const body = {
      "branch_plant_code": sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? codes : [] : [],
      "start_date": del_start_date1,
      "end_date": del_end_date2,
      export: 1,
      "type":this.dlType,
      export_type: "CSV",
      "salesman_id": this.sideFiltersForm.value.salesman ? this.sideFiltersForm.value.salesman.lngth > 0 ? this.sideFiltersForm.value.salesman[0].id : '' : '',

    }
  }
  else if (this.activeRoute == 'pallet-report') {
    let del_start_date1 = sideFilter.del_start_date ? sideFilter.del_start_date : null;
    let del_end_date2 = sideFilter.del_end_date ? sideFilter.del_end_date : null;
    let codes = []
    sideFilter.warehouse_id.map(i => {
     console.log(i,"in")
       codes.push(i.itemName.split(" ")[0])
    })
     body = {
      "start_date": del_start_date1,
      "end_date": del_end_date2,
      export: 1,
      "branch_plant_code": sideFilter?.warehouse_id ? sideFilter?.warehouse_id?.length > 0 ? codes : [] : [],
      "salesman_id": this.sideFiltersForm.value.salesman ? this.sideFiltersForm.value.salesman.lngth > 0 ? this.sideFiltersForm.value.salesman[0].id : '' : '',
      "region_id": this.sideFiltersForm.value?.zone_id ? this.sideFiltersForm.value?.zone_id.length > 0 ? this.sideFiltersForm.value?.zone_id[0]?.id : [] : [],
      "divison_id":this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [],
    }
  }
  else if (this.activeRoute == 'geo-approvals') {
    let del_start_date1 = sideFilter.start_date ? sideFilter.start_date : null;
    let del_end_date2 = sideFilter.end_date ? sideFilter.end_date : null;
    let codes = []
    sideFilter.warehouse_id.map(i => {
     console.log(i,"in")
       codes.push(i.itemName.split(" ")[0])
    })
    const body = {
      "salesman_id": sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : 0 : 0,
      "start_date": del_start_date1,
      "end_date": del_end_date2,
      export: 1,
      export_type: "CSV",
    }
  }
    else if (this.activeRoute == 'loading-chart-by-warehouse' || this.activeRoute == 'loading-chart-final-by-route') {
      body = {
        warehouse_id: sideFilter?.warehouse_id ? sideFilter.warehouse_id.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : 0 : 0,
        van_id: sideFilter?.van_id ? sideFilter?.van_id.length > 0 ? sideFilter?.van_id[0]?.id : null : null
      }
    } else if (this.activeRoute == 'driver-loaded-qty') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        report_type: sideFilter?.reportType,
        warehouse_id: sideFilter?.warehouse_id ? sideFilter?.warehouse_id.length > 0 ? sideFilter.warehouse_id.map(i => i.id) : [] : [],
        salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : '' : '',
        helper_id: sideFilter.helper ? sideFilter.helper.length > 0 ? sideFilter.helper[0].id : '' : '',
      }
    } else if (this.activeRoute == 'timesheets') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
        salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : '' : '',
      }
    } else if (this.activeRoute == 'salesman-performance') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        report_type: sideFilter?.reportType,
        module: this.getModuleType(),
        region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
        salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : '' : '',
        helper_id: sideFilter.helper ? sideFilter.helper.length > 0 ? sideFilter.helper[0].id : '' : '',
      }
    }
    else if (this.activeRoute == 'difot') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
      }
    } else if (this.activeRoute == 'truck-utilisation') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
        vehicle_id: sideFilter?.vehicle_id ? sideFilter.vehicle_id.length > 0 ? sideFilter?.vehicle_id[0]?.id : '' : '',
        salesman_id: sideFilter.salesman ? sideFilter.salesman.length > 0 ? sideFilter.salesman[0].id : '' : '',
      }
    } else if (this.activeRoute == 'monthly-kpi') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
      }
    }
    else if (this.activeRoute == 'ytd-kpi') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        // region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
      }
    }
    else if (this.activeRoute == 'daily-crf') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
      }
    } else if (this.activeRoute == 'sales-quantity') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
        region_id: sideFilter?.region ? sideFilter.region.map(item => item.id) : [],
        van_id: sideFilter?.van_id ? sideFilter?.van_id.length > 0 ? sideFilter?.van_id[0]?.id : [] : [],
      }
    } else if (this.activeRoute == 'return-grv') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
      }
    } else if (this.activeRoute == 'sales-vs-grv') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        // ksm_id: '',
        export: 1,
        export_type: type,
        report_type: sideFilter.salesGrvReportType, // 1: KAM, 2:Monthly
        ksm_id: sideFilter.ksm_id ? sideFilter.ksm_id?.length > 0 ? sideFilter.ksm_id.map(i => i.id) : [] : [],
        module: this.getModuleType()
      };
    }
    else if (this.activeRoute == 'daily-grv' || this.activeRoute == 'daily-spot-return') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        ksm_id: '',
        export: 1,
        export_type: type,
        // ksm_id: sideFilter.ksm_id ? sideFilter.ksm_id?.length > 0 ? sideFilter.ksm_id.map(i => i.id) : null : null,
        // module: this.getModuleType()
      };
    } else if (this.activeRoute == 'daily-cancel-order') {
      body = {
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        ksm_id: '',
        export: 1,
        export_type: type,
        region_id: sideFilter?.zone_id ? sideFilter.zone_id.length > 0 ? sideFilter?.zone_id[0]?.id : '' : '',
        // ksm_id: sideFilter.ksm_id ? sideFilter.ksm_id?.length > 0 ? sideFilter.ksm_id.map(i => i.id) : null : null,
        // module: this.getModuleType()
      };
    } else if (this.activeRoute == 'jp-compliance') {
      if (this.domain.split('.')[0] == 'presales-prodmobiato') {
        body = {
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: 1,
          export_type: type,
          driver_id: sideFilter.salesman[0]?.id || "",
          module: this.getModuleType(),
        }
      } else {
        body = {
          division: sideFilter.division[0]?.id || "",
          region: sideFilter.region[0]?.id || "",
          route: sideFilter.route[0]?.id || "",
          supervisor: sideFilter.supervisor[0]?.id || "",
          salesman: sideFilter.salesman[0]?.id || "",
          start_date: sideFilter.start_date,
          end_date: sideFilter.end_date,
          export: 1,
          export_type: type,
          module: this.getModuleType(),
        };
      }
    } else {
      body = {
        division: sideFilter.division.length > 0 ? sideFilter.division[0]?.id : "",
        region: sideFilter.region.length > 0 ? sideFilter.region[0]?.id : "",
        route: sideFilter.route[0]?.id || "",
        supervisor: sideFilter.supervisor[0]?.id || "",
        salesman: sideFilter.salesman[0]?.id || "",
        start_date: sideFilter.start_date,
        end_date: sideFilter.end_date,
        export: 1,
        export_type: type,
        module: this.getModuleType(),
      };
    }
    let filetype = 'file.' + type;

    if (this.activeRoute == 'daily-grv') {
      this.ReportService.grvReportsData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    } else if (this.activeRoute == 'daily-spot-return') {
      this.ReportService.spotReturnReportsData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    } else if (this.activeRoute == 'daily-cancel-order') {
      this.ReportService.dailyCancelOrderReportsData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    } else if (this.activeRoute == 'salesman-performance') {
      this.ReportService.salesmanPerformanceReportsData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    } else if (this.activeRoute == 'driver-loaded-qty') {
      this.ReportService.driverLoadedReportsData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    } else if (this.activeRoute == 'daily-operation') {
      this.ReportService.dailyOperationReportsData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    }
    else if (this.activeRoute == 'delivery-report') {
      this.ReportService.deliveryData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    }
    else if (this.activeRoute == 'delivery-export-report') {
      this.ReportService.ReportdeliveryData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    }
    else if (this.activeRoute == 'pallet-report') {
      this.ReportService.ReportPalletData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    }
    else if (this.activeRoute == 'geo-approvals') {
      this.ReportService.ReportGeoData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    }
    else {
      this.ReportService.getReportData(body).subscribe((res) => {
        if (res?.status == true) {
          this.apiService.downloadFile(res.data.file_url, filetype);
        }
      });
    }
  }

  getModuleType() {
    this.intervals = [
      { id: 'today', name: 'Today' },
      { id: 'current_week', name: 'This Week' },
      { id: 'current_month', name: 'This Month' },
      { id: 'current_quarter', name: 'This Quarter' },
      { id: 'current_year', name: 'This Year' },
      { id: 'yesterday', name: 'Yesterday' },
      { id: 'previous_week', name: 'Previous Week' },
      { id: 'previous_month', name: 'Previous Month' },
      { id: 'previous_quarter', name: 'Previous Quarter' },
      { id: 'previous_year', name: 'Previous Year' },
      { id: 'custom', name: 'Custom' },
    ];
    let module = '';
    switch (this.activeRoute) {
      case 'competitor-product':
        module = 'merchandiser/competitor-info';
        break;
      case 'new-customer':
        module = 'merchandiser/new-customer';
        break;
      case 'closed-visits':
        module = 'merchandiser/close-visit';
        break;
      case 'order-sumamry':
        module = 'merchandiser/order-summary';
        break;
      case 'order-returns':
        module = 'merchandiser/order-return';
        break;
      case 'visit-summary':
        module = 'merchandiser/visit-summary';
        break;
      case 'photos':
        module = 'merchandiser/photos';
        break;
      case 'timesheets':
        module = 'merchandiser/time-sheet';
        break;
      case 'sos':
        module = 'merchandiser/sos';
        break;
      case 'stock-availability':
        module = 'merchandiser/stock-availability';
        break;
      case 'task-answers':
        module = 'merchandiser/task-answer';
        break;
      case 'task-summary':
        module = 'merchandiser/task-summary';
        break;
      case 'store-summary':
        module = 'merchandiser/store-summary';
        break;
      case 'jp-compliance':
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        module = this.domain.split('.')[0] == 'presales-prodmobiato' ? 'delivery_driver_journey_plan' : 'merchandiser/route-visit';
        break;
      case 'merchandiser-login-log':
        module = 'merchandiser/salesman-login-log';
        break;
      case 'load-sheet':
        module = 'load_sheet';
        break;
      case 'carry-over':
        module = 'carry_over_report';
        break;
      case 'order-reports':
        module = 'order';
        break;
      case 'daily-operation':
        module = 'orderSCReport';
        break;
      case 'customer-sales-per-month':
        module = 'sales_by_customer';
        break;
      case 'van-customer':
        module = 'van_customer_report';
        break;
      case 'daily-field-activity':
        module = 'daily_field_activity_report';
        break;
      case 'product-summary-by-customer-sales':
        module = 'product_summary_customer_sales';
        break;
      case 'visit-analysis-by-van-or-salesman':
        module = 'visit-analysis-van-salesman';
        this.intervals = [
          { id: 'current_week', name: 'This Week' },
          { id: 'previous_week', name: 'Previous Week' },
          { id: 'custom', name: 'Custom' },
        ];
        break;
      case 'sales-analysis':
        module = 'sales_analysis';
        break;
      case 'customer-statement':
        // module = 'customer_statement';
        module = 'merchandiser/balance-sheet';
        break;
      case 'periodic-wise-collection':
        module = 'payment_received';
        break;
      case 'sales-quantity-analysis':
        module = 'salse_quantity_analysis';
        break;
      case 'salesman-performance':
        module = 'salesman-performance';
        break;
      case 'monthly-ageing':
        module = 'customer_payment_report';
        this.intervals = [
          { id: 'current_month', name: 'This Month' },
          { id: 'current_quarter', name: 'This Quarter' },
          { id: 'current_year', name: 'This Year' },
          { id: 'previous_month', name: 'Previous Month' },
          { id: 'previous_quarter', name: 'Previous Quarter' },
          { id: 'previous_year', name: 'Previous Year' },
          { id: 'custom', name: 'Custom' },
        ];
        if (this.intervalSelected.value == 'today' || this.intervalSelected.value == 'current_week' || this.intervalSelected.value == 'previous_week' || this.intervalSelected.value == 'yesterday') {
          this.intervalSelected.setValue('current_month');
        }
        break;
      case 'trip-execution':
        module = 'salseman_trip_report';
        break;
      case 'end-inventory':
        module = 'unload_report';
        break;
      case 'consolidated-load':
        module = 'consolidatedLoadReport';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'consolidated-return-load':
        module = 'consolidate-load-return';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'loading-chart-by-warehouse':
        module = 'loadingChartByWarehouse';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'driver-loaded-qty':
        module = 'driver_commission';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'order-details':
        module = 'orderDetailsReport';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'truck-utilisation':
        module = 'truck-utilisation';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'monthly-kpi':
        module = 'vehicle-utilisation';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'ytd-kpi':
        module = 'vehicle-utilisation-yearly';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'daily-crf':
        module = 'csrf';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'daily-grv':
        module = 'grvreport';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'daily-spot-return':
        module = 'spot_report';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'daily-cancel-order':
        module = 'cancel_return';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'sales-quantity':
        module = 'sales_quantity';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'return-grv':
        module = 'return_grv_Report';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'sales-vs-grv':
        module = 'sales_vs_grv_report';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'difot':
        module = 'difot';
        if (this.intervalSelected.value == 'today' || this.oldModule !== module) {
          this.intervalSelected.setValue('today');
        }
        break;
      case 'loading-chart-final-by-route':
        module = 'itemreport';
        break;
    }
    this.dataEditor.sendData({
      type: CompDataServiceType.REPORT_DATA,
      request: [],
      data: [],
    });
    this.oldModule = module;
    return module;
  }

  checkPermission(value) {
    if (!this.checkDomain() == false) {
      return false;
    }
    let data: any = localStorage.getItem('permissions');
    let userPermissions = [];
    if (!data) return true;
    data = JSON.parse(data);
    let module = data.find((x) => x.moduleName.toLowerCase() === value.toLowerCase());
    if (!module) {
      userPermissions = [];
      return true;
    }
    userPermissions = module.permissions.map((permission) => {
      const name = permission.name.split('-').pop();
      return { name };
    });
    const isView = userPermissions.find((x) => x.name == 'list');
    return isView ? false : true;
  }

  checkDomain() {

    if (this.domain.split(':')[0] == 'localhost') {
      return true;
    } else if (this.domain.split('.')[1] == 'nfpc') {
      return false;
    }
    return true;
  }
  checkIsActiveRoute() {
    if (this.activeRoute == 'consolidated-load' || this.activeRoute == 'consolidated-return-load' || this.activeRoute == 'loading-chart-by-warehouse' || this.activeRoute == 'order-details' || this.activeRoute == 'daily-operation' ||this.activeRoute == 'delivery-report'||this.activeRoute == 'delivery-export-report' || this.activeRoute == 'pallet-report'  ||this.activeRoute == 'geo-approvals' || this.activeRoute == 'sales-quantity' || this.activeRoute == 'sales-vs-grv' || this.activeRoute == 'loading-chart-final-by-route') {
      return 1;
    } else {
      if (this.activeRoute == 'truck-utilisation' || this.activeRoute == 'monthly-kpi' || this.activeRoute == 'ytd-kpi' || this.activeRoute == 'daily-crf' || this.activeRoute == 'difot' || this.activeRoute == 'daily-grv' || this.activeRoute == 'daily-spot-return' || this.activeRoute == 'daily-cancel-order' || this.activeRoute == 'timesheets' || this.activeRoute == 'salesman-performance' || this.activeRoute == 'driver-loaded-qty') {
        return 2;
      } else {
        return 0;
      }
    }
  }
  selectDateRange(value) {
    this.dateRange = value;
    this.del_start_date = null;
    this.del_end_date = null;
    this.start_date = null;
    this.end_date = null;
  }

  onSearch(evt: any) {
    const value = evt.target.value;
    if (value !== '') {
      this.itemfilterValue = value.toLowerCase().trim() || "";
      this.itemList = this.filterItem.filter(x => x.item_code.toLowerCase().trim() === this.itemfilterValue || x.item_name.toLowerCase().trim() === this.itemfilterValue);
      this.itemList = this.itemList.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name };
      });
    } else {
      this.itemList = this.filterItem.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name };
      });
    }
    this.detChange.detectChanges();
  }
}
