import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, DELIVERY_STATUS, ORDER_STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Subscription,Subject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
@Component({
  selector: 'app-advance-search-form-delivery',
  templateUrl: './advance-search-form-delivery.component.html',
  styleUrls: ['./advance-search-form-delivery.component.scss']
})
export class AdvanceSearchFormDeliveryComponent implements OnInit {
  @Input() salesman: Array<any> = [];
  @Input() customers: Array<any> = [];
  @Input() items: Array<any> = [];
  channelList: any[] = [];
   SalesmanFormControl = new FormControl([]);
  salesmanList: any[] = [];
  statusList: Array<any> = STATUS;
  private subscriptions: Subscription[] = [];
  customerID: any = [];
   itemsFormControl = new FormControl([]);
   public filteredItems: any[] = [];
   public itemData: any[] = [];
  orderStatusList: Array<any> = ORDER_STATUS;
  // @Input() salesman: Array<any> = []
  form: FormGroup
  @Input() storageLocation: Array<any> = [];
  branchplantsFormControl = new FormControl([]);
   CustomersFormControl = new FormControl([]);
  constructor(
    private apiService: ApiService,
    private ms: MasterService
  ) { 
  }

  ngOnInit(): void {
     this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
      })
    );
     this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
     this.apiService.getMasterDataLists().subscribe((result: any) => {
      
      this.salesmanList = result.data.salesmans;
      
      for (let salesman of this.salesmanList) {
        salesman['salesman_name'] = `${salesman.salesman_info.salesman_code} - ${salesman.firstname} ${salesman.lastname}`;
      }
    });
    this.form = new FormGroup({
      module: new FormControl('delivery'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      delivery_no: new FormControl(),
      customer_id: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      status: new FormControl(),
      channel_name: new FormControl(),
      // approval_status: new FormControl(),
      storage_location_id: new FormControl(),
      item_id: new FormControl(),
    })
   
  }
  selectionchangedstorageLocation() {
    let storage = this.branchplantsFormControl.value;
    this.form.patchValue({
      storage_location_id: storage.map(i=>i.id)
    });
  }
   selectionchangedCustomer() {
    let user = this.CustomersFormControl.value;

  // Extract the ids from the selected items
  const itemIds = user.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    customer_id: itemIds
  });
    // this.form.patchValue({
    //   customerName: user[0].id
    //   // customerName: user[0].name
    // });
  }

  selectionchangedItems() {
    // let items = this.itemsFormControl.value;
    // this.form.patchValue({
    //   item_id: items[0].id
    // });
    let items = this.itemsFormControl.value;

  // Extract the ids from the selected items
  const itemIds = items.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    item_id: itemIds
  });
  }
   selectionchangedSalesman() {
    let user = this.SalesmanFormControl.value;

  // Extract the ids from the selected items
  const itemIds = user.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    salesman: itemIds
  });
    // this.form.patchValue({
    //   customerName: user[0].id
    //   // customerName: user[0].name
    // });
  }
}
