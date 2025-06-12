import { Subscription } from 'rxjs';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { DriverReplacementService } from '../driver-replacement.service';
import { OrderService } from '../../../transaction/orders/order.service';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-driver-replacement-create',
  templateUrl: './driver-replacement-create.component.html',
  styleUrls: ['./driver-replacement-create.component.scss']
})
export class DriverReplacementCreateComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectionchanged: EventEmitter<any> = new EventEmitter<any>();
  public replacementSalesmenForm: FormGroup;
  public replacementVanForm: FormGroup;
  @Input() salesmanList = [];
  @Input() vehicleList = [];
  @Input() reasonList = [];
  filterForm: FormGroup;
  public formType: string;
  isEdit: boolean = false;
  private subscriptions: Subscription[] = [];
  categories: any[] = [];
  selectedValue = '1';
  orders: any = [];
  ordersData:any=[]
  selectedOrders: any[] = [];
  storageLocation: any[] = [];
  dropdownSettings:any;
  dropdownSettings2:any;

  constructor(
    private fds: FormDrawerService,
    private toaster: CommonToasterService,
    private service: DriverReplacementService,
    public dialog: MatDialog,
    private dataEditor: DataEditor,
    private orderService: OrderService,
    public apiService:ApiService
  ) {
  }

  public ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: false,
      text:"Select Orders",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      classes:"myclass custom-class"
    };
    this.dropdownSettings2 = {
      singleSelection: false,
      text:"Select Branch",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      classes:"myclass custom-class"
    };
    const date = new Date();
    this.replacementSalesmenForm = new FormGroup({
      startdate: new FormControl(date),
      reason_id: new FormControl('', Validators.required),
      branch_plant_code:new FormControl('', Validators.required),
      baseFormControl: new FormControl('1'),
      old_salesman_id: new FormControl('', Validators.required),
      new_salesman_id: new FormControl('', Validators.required),
      order_id: new FormControl([], Validators.required),
    });
    this.replacementVanForm = new FormGroup({
      startdate: new FormControl(date),
      reason_id: new FormControl('', Validators.required),
      baseFormControl: new FormControl('1'),
      old_van_id: new FormControl('', Validators.required),
      new_van_id: new FormControl('', Validators.required),
      order_id: new FormControl('', Validators.required),
    });
    this.filterForm = new FormGroup({
      order_number: new FormControl([]),
      branch_plant_code: new FormControl(''),
      customer_code: new FormControl(''),
      customer_lpo: new FormControl(''),
      date: new FormControl(''),
      due_date: new FormControl(''),
      delivery_date: new FormControl(''),
      current_stage: new FormControl(''),
      customer_name: new FormControl(''),
      route_code: new FormControl(''),
      route_name: new FormControl(''),
      salesman_code: new FormControl(''),
      salesman: new FormControl(''),
      page: new FormControl(1),
      page_size: new FormControl(1000),
      approval_status: new FormControl(''),
      invoice_number: new FormControl('')
    });
    this.apiService.getLocationStorageListById().subscribe(res => {
     let locationItem = []
      res.data.map((chng:any)=>{
        locationItem.push({
          id:chng.code,
          itemName:`${chng.code} - ${chng.name}`
        })
      })
      this.storageLocation = [...locationItem];
    });
    // this.fds.formType.subscribe((s) => {
    //   this.formType = s;
    //   this.replacementSalesmenForm?.reset();
    //   if (this.formType != 'Edit') {
    //     this.isEdit = false;
    //   } else {
    //     this.isEdit = true;
    //   }
    //   this.subscriptions.push(
    //     this.dataEditor.newData.subscribe((result) => {
    //       const data: any = result.data;
    //       if (data && data.uuid && this.isEdit) {
    //         this.isEdit = true;
    //         this.replacementSalesmenForm.patchValue(data);
    //       }
    //     })
    //   );
    // });

  }

  // public ngOnChanges():void{

  // }
  data = [];
  selectedItems = [];

  public close() {
    this.fds.close();
    this.replacementSalesmenForm.reset();
  }

  onItemSelect(item: any) {

    this.selectionchanged.emit(item);
    this.filterForm.get('branch_plant_code')?.setValue(item.id);

    this.subscriptions.push(
      this.orderService
        .orderList(this.filterForm.value)
        .subscribe((result) => {
          console.log(result.data)
          this.orders = result.data;
          result.data.map((val:any)=>{
            this.ordersData.push({id:val.id,itemName:val.order_number})
          })
          // this.dataSource.paginator = this.paginator;
        })
    );
    console.log(item)
    // this.changeFunc(item)
  }
  OnItemDeSelect(item: any) {
    //console.log(item);
    //console.log(this.selectedItems);
    this.selectionchanged.emit();
  }
  onSelectAll(items: any) {
    this.replacementSalesmenForm.controls['branch_plant_code'].setValue(items);

    this.selectionchanged.emit();
  }
  onDeSelectAll(items: any) {
    this.replacementSalesmenForm.controls['branch_plant_code'].setValue(items);
    this.selectionchanged.emit();
  }
  // selectionchangedstorageLocation() {
  //   const storage = this.storageLocationFormControl.value;
  //   this.exportForm.patchValue({
  //     storage_location_id: storage[0].id
  //   });
  // }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  dateByOrder:any
  public getOrderList(event) {
    this.dateByOrder = event.target.value
    this.filterForm.get('delivery_date')?.setValue(event.target.value);


  }
  saveReplacement(): void {
    let model;
    if (this.selectedValue === '1') {
      const formData = this.replacementSalesmenForm.value;
      let order_ids_data = []
      formData.order_id.map((ids:any)=>{
        order_ids_data.push(ids.itemName)
      })
      model = {
        new_salesman_id: formData.new_salesman_id[0].id,
        old_salesman_id: formData.old_salesman_id[0].id,
        branch_plant_code:formData.branch_plant_code[0].id,
        date: formData.startdate,
        reason_id: formData.reason_id[0].id,
        old_van_id: null,
        new_van_id: null,
        order_id: order_ids_data
      }
      if (model.new_salesman_id == model.old_salesman_id) {
    console.log(model,"model")

        this.toaster.showWarning('Warning', 'Salesman from and to cannot be same.');
        return
      }
    } else {
      const formData = this.replacementVanForm.value;
      model = {
        new_salesman_id: null,
        old_salesman_id: null,
        date: formData.startdate,
        reason_id: formData.reason_id[0].id,
        old_van_id: +formData.old_van_id,
        new_van_id: +formData.new_van_id,
        order_id: formData.order_id[0].itemName
      }
      if (model.old_van_id == model.new_van_id) {
        this.toaster.showWarning('Warning', 'Van from and to cannot be same.');
        return
      }
    }
    console.log(model,"model")
    this.service.saveReplace(model).subscribe((result: any) => {
      this.toaster.showSuccess('Success', result.message);
      let data = result.data;
      this.updateTableData.emit({ status: 'add', data });
      this.fds.close();
    });
  }
  changeType(value) {
    this.selectedValue = value;
    if (value === '1') {
      this.replacementVanForm.reset();
    } else {
      this.replacementSalesmenForm.reset();
    }
  }

}
