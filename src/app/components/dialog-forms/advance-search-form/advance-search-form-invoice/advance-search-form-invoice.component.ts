import { Component, OnInit, Input, ChangeDetectorRef,SimpleChanges } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { STATUS, INVOICE_STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Subscription,Subject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
@Component({
  selector: 'app-advance-search-form-invoice',
  templateUrl: './advance-search-form-invoice.component.html',
  styleUrls: ['./advance-search-form-invoice.component.scss']
})
export class AdvanceSearchFormInvoiceComponent implements OnInit {
  @Input() salesman: Array<any> = [];
   SalesmanFormControl = new FormControl([]);
  salesmanList: any[] = [];
  channelList: any[] = [];
  @Input() items: Array<any> = [];
  @Input() customers: Array<any> = [];
  itemsFormControl = new FormControl([]);
   selectedItems = [];
  //  customers: any=[];
   public filterItem = [];
   settings = {};
   itemfilterValue = '';
   public filteredItems: any[] = [];
   public itemData: any[] = [];
    public ItemCodeFormControl: FormControl;
    uomList: any = [];
  form: FormGroup;
  statusList: Array<any> = INVOICE_STATUS;
  // @Input() salesman: Array<any> = [];
  @Input() storageLocation: Array<any> = [];
  customersFormControl = new FormControl([]);

  branchplantsFormControl = new FormControl([]);
  private subscriptions: Subscription[] = [];
    customerID: any = [];
    CustomersFormControl = new FormControl([]);
  constructor(private detChange: ChangeDetectorRef,private apiService: ApiService,private ms: MasterService
  ) { }

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
    this.ItemCodeFormControl = new FormControl([], [Validators.required]);
    this.form = new FormGroup({
      module: new FormControl('invoice'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      invoice_no: new FormControl(),
      customer_id: new FormControl(),
      salesman: new FormControl(),
      channel_name: new FormControl(),
      order_no: new FormControl(),
      customer_lpo_no: new FormControl(),
      storage_location_id: new FormControl(),
      item_id: new FormControl(),
      erp_status: new FormControl(),
      syncdate: new FormControl(),
      creationDate: new FormControl(),
    });
     
   
  }
  

    ngOnChanges(changes: SimpleChanges) {
      if (changes.items?.currentValue != changes.items?.previousValue) {
        this.filterItem = [...this.items];
        this.items = this.items.map(i => {
          return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
        });
      }
    };


  selectionchangedstorageLocation() {
    const storage = this.branchplantsFormControl.value;
    let storageIds = storage.map((item: any) => item.id);
    this.form.patchValue({
      storage_location_id: storageIds
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
    let items = this.SalesmanFormControl.value;

  // Extract the ids from the selected items
  const itemIds = items.map((item: any) => item.id);
  // Extract the ids from the selected items
  // const itemIds = user.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    salesman: itemIds
  });
    // this.form.patchValue({
    //   customerName: user[0].id
    //   // customerName: user[0].name
    // });
  }

  resetForm() {
    this.form.reset();
    this.SalesmanFormControl.reset();
    this.CustomersFormControl.reset();
    this.itemsFormControl.reset();
    this.branchplantsFormControl.reset();
    this.ItemCodeFormControl.reset();
  }
}
