import { element } from 'protractor';
import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MerchandisingService } from '../../merchandising.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ModelStock } from '../../shelf-display/model-stock-interface';

@Component({
  selector: 'app-add-planogram',
  templateUrl: './add-planogram.component.html',
  styleUrls: ['./add-planogram.component.scss'],
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
export class AddPlanogramComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public palnogramFormGroup;
  images = [];
  distributionImages = [];
  public selectedIndex = 0;
  customerId;
  private isEdit: boolean;
  public formType: string;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  public customers: any[] = [];
  private subscriptions: Subscription[] = [];
  private deleteDialog: MatDialog;
  dataSource1 = new MatTableDataSource();
  dataSource2 = new MatTableDataSource();
  columnsToDisplay1 = ['name'];
  columnsToDisplay2 = ['name', 'action'];
  destributionData = [];
  expandedElement1: ModelStock | null;
  expandedElement2: ModelStock | null;
  expandedElement2Images = [];
  planogramData: any;

  constructor(
    private fb: FormBuilder,
    fds: FormDrawerService,
    public merService: MerchandisingService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private router: Router,
    public apiService: ApiService
  ) {
    Object.assign(this, { fds, merService, dataEditor });
    this.dataSource1 = new MatTableDataSource<any>();
    this.dataSource2 = new MatTableDataSource<any>();
  }
  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => (this.formType = s));
    this.palnogramFormGroup = this.fb.group({
      name: ['', [Validators.required]],
      customer_id: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      distribution_image: [[]],
    });

    // this.subscriptions.push(
    //   this.merService.getStockLists().subscribe((res: any) => {
    //     this.customers = res.customers.data;
    //   })
    // );

    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customers = result.data.customers.map(item => {
          return {
            ...item,
            lastname: item.lastname + ' - ' + item.customer_info.customer_code
          }
        })
      })
    );

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.palnogramFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
        const data: any = result.data;

        if (data && data.uuid && this.isEdit) {
          let customers = [];
          data.planogram_customer.forEach(element => {
            customers.push({ id: element.customer_id, itemName: `${element.customer?.firstname} ${element.customer?.lastname}` });
          });


          this.palnogramFormGroup.patchValue({
            name: data.name,
            customer_id: customers,
            start_date: data.start_date,
            end_date: data.end_date,
          })
          this.onWriterChange();
          if (data.planogram_customer) {
            data.planogram_customer.forEach(element => {
              element.planogram_distribution.forEach(element2 => {
                let images = [];
                element2.planogram_images.forEach(element3 => {
                  images.push(element3.image_string);
                })
                this.setDistImages(element2.customer_id, element, images, false);
              });
            });

            ////console.log(data.distribution);
            //this.dataSource1 = new MatTableDataSource<any>(data.distribution);
            // data.distribution.forEach(element => {
            //   this.images[element.id] = [];
            //   element.planogramImage.forEach(_element => {
            //     this.images[element.id].push(_element.image_string);
            //   });
            // });
            // //console.log(data.distribution, this.images);
          }

          this.planogramData = data;
          this.isEdit = true;
          //this.onWriterChange();
        }
        return;
      }));
    });
  }

  public getCustomerItems(data) {
    //console.log(data);
    this.expandedElement1 = this.expandedElement1 === data ? null : data;
    this.dataSource2 = new MatTableDataSource<any>(data.distribution);
    this.dataSource2.paginator = this.paginator;
  }

  public getDistributionItems(customer_id, data) {
    this.expandedElement2 = this.expandedElement2 === data ? null : data;
    this.expandedElement2Images = this.getDistImages(customer_id, data);
  }

  public onWriterChange() {
    const value = this.palnogramFormGroup.get('customer_id').value;
    let customers = JSON.parse(JSON.stringify(value))
    customers = customers.map(x => x.id)
    this.subscriptions.push(
      this.merService
        .getDistributionsList(customers)
        .subscribe((res: any) => {
          this.dataSource1 = new MatTableDataSource<any>(res.data);
          this.dataSource1.paginator = this.paginator;
        })
    );
  }
  ngAfterViewChecked() {
    const element: any = document.querySelector('.mat-tab-body-wrapper');
    if (element) {
      element['style'].height = '800px'
    }
  }
  onImageChange(event, customer_id, element) {
    let arr = [];
    if (event.target.files && event.target.files[0]) {
      let filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        const reader = new FileReader();

        reader.onload = (event: any) => {
          arr.push(event.target.result);
        };

        reader.readAsDataURL(event.target.files[i]);
      }
      this.setDistImages(customer_id, element, arr);
      // let distribution_id = element.distribution_id;
      // this.images[distribution_id] = arr;

    }
  }

  setDistImages(customer_id, element, arr, expand = true) {
    //console.log(element);
    let checkImages = this.images.filter((x) => { return x.customer_id == customer_id });
    //console.log(checkImages);
    if (checkImages.length > 0) {
      let indexCustomer = this.images.indexOf(checkImages[0]);
      let checkDist = checkImages[0]['distribution'].filter((x) => { return x.distribution_id == element.id });
      //console.log(checkDist);
      if (checkDist.length > 0) {
        let indexDist = this.images[indexCustomer].distribution.indexOf(checkDist[0]);
        this.images[indexCustomer].distribution[indexDist].images = arr;
        //console.log(this.images);
      } else {
        let distributionobj = {
          distribution_id: element.id,
          images: arr
        };
        this.images[indexCustomer].distribution.push(distributionobj);
      }
    } else {
      let distributionobj = {
        distribution_id: element.id,
        images: arr
      };
      let customerobj = {
        customer_id: customer_id,
        distribution: [
          distributionobj
        ]
      };
      this.images.push(customerobj);
    }

    //console.log(this.images);

    if (this.expandedElement2 !== element && expand == true) {
      this.getDistributionItems(customer_id, element);
    }
  }

  getDistImages(customer_id, element) {
    let checkImages = this.images.filter((x) => { return x.customer_id == customer_id });
    if (checkImages.length > 0) {
      let indexCustomer = this.images.indexOf(checkImages[0]);
      //console.log(checkImages);
      let checkDist = checkImages[0]['distribution'].filter((x) => { return x.distribution_id == element.id });
      if (checkDist.length > 0) {
        let indexDist = this.images[indexCustomer].distribution.indexOf(checkDist[0]);
        //console.log(indexCustomer, indexDist);
        return this.images[indexCustomer].distribution[indexDist].images;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  public removeImg(imgurl, customer_id, element) {
    //console.log(customer_id, element);
    let checkImages = this.images.filter((x) => { return x.customer_id == customer_id });
    if (checkImages.length > 0) {
      let indexCustomer = this.images.indexOf(checkImages[0]);
      //console.log(checkImages);
      let checkDist = checkImages[0]['distribution'].filter((x) => { return x.distribution_id == element.id });
      if (checkDist.length > 0) {
        let indexDist = this.images[indexCustomer].distribution.indexOf(checkDist[0]);
        //console.log(indexCustomer, indexDist);
        let index = this.images[indexCustomer].distribution[indexDist].images.indexOf(imgurl);
        if (index > -1) {
          this.images[indexCustomer].distribution[indexDist].images.splice(index, 1);
        }
      }
    }
    // let index = this.images[id].indexOf(imgurl);
    // if (index > -1) {
    //   this.images[id].splice(index, 1);
    // }
  }

  public savePlanogramData() {
    if (this.palnogramFormGroup.invalid) {
      return false;
    }
    let form = this.palnogramFormGroup.value;
    // let newArr = [];
    // this.images.map((currElement, index) => {
    //   // this.distributionImages[index] = currElement;
    //   let distributionObj = {
    //     customer_id: currElement.customer_id,

    //   };
    //   // distributionObj[index] = currElement;

    //   newArr.push(distributionObj);
    // });
    let sForm = {
      // customer_ids: form.customer_id,
      customer_distribution: this.images,
      start_date: form.start_date,
      name: form.name,
      end_date: form.end_date,
      status: 1,
    };

    if (this.isEdit) {
      this.editPlanogramData(sForm);
      return;
    }

    this.postPlanogramData(sForm);

  }

  postPlanogramData(sForm) {

    this.subscriptions.push(
      this.merService.addPlanogram(sForm).subscribe((res) => {
        let data = res.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.close();
      })
    );
  }

  editPlanogramData(sForm) {


    this.subscriptions.push(
      this.merService.editPlanogram(this.planogramData.uuid, sForm).subscribe((res) => {
        let data = res.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.close();
      })
    );
  }

  public close() {
    this.fds.close();
    this.dataSource1 = new MatTableDataSource<any>([]);
    this.dataSource2 = new MatTableDataSource<any>([]);
    this.palnogramFormGroup.reset();
    this.images = [];
    this.isEdit = false;
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
}
