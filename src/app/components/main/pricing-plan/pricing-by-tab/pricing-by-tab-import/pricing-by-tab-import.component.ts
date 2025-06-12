import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MasterService } from '../../../master/master.service';
import { map, distinctUntilChanged, debounceTime, mergeMap, delay } from 'rxjs/operators';
import { PricingPlanService } from '../../pricing-plan.service';
import { Subject, of, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
type AOA = any[][];
@Component({
  selector: 'app-pricing-by-tab-import',
  templateUrl: './pricing-by-tab-import.component.html',
  styleUrls: ['./pricing-by-tab-import.component.scss']
})
export class PricingByTabImportComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public data: any = [];
  public importFile: any = {};
  public filesList: string[] = [];
  public removable = true;
  public fileInfo: string;
  public fieldList: any = [];
  public activeTab: boolean = false;
  public selected: string;
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  formNameGroup: FormGroup;
  formPasswordGroup: FormGroup;
  isLinear = true;
  displayedColumns: string[] = ['itemCode', 'itemDescription', 'itemUom', 'customerCode', 'customerName', 'price', 'startDate', 'endDate', 'pricingKey'];
  customerDisplayedColumns: string[] = ['itemCode', 'itemDesc', 'customerCode', 'customerName', 'uom', 'basePrice', 'discountPrice', 'customerPrice', 'startDate', 'endDate', 'primaryKey']
  isPreview = false;
  tableList: any = [];
  displayTableList: any = [];
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private commonToasterService: CommonToasterService,
    private pricePlanService: PricingPlanService,
    private masterService: MasterService,
    private apiService: ApiService
  ) {
    Object.assign(this, { router });
  }

  ngOnInit(): void {
    this.formNameGroup = this.formBuilder.group({
      pricekey: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    this.formPasswordGroup = this.formBuilder.group({
      customer_file: ['', Validators.required]
    });
  }

  // ngAfterViewInit() {
  //   this.tableList.paginator = this.paginator;
  // }
  backToPricing() {
    this.router.navigate(['transaction/order']).then();
  }

  public selectedFile(data: any): void {
    this.data = data;
    //console.log(this.data);
  }

  backToMain() {
    this.router.navigate(['pricing-plan/pricing']).then();
  }

  onSelectFile(event) {
    if (event.target.files.length > 0) {
      this.fileInfo = event.target.files[0];
      this.filesList.push(event.target.files[0]);
    }

    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.selected = this.data[0][0];
    };

    reader.readAsBinaryString(target.files[0]);
  }

  remove(filesList): void {
    const index = this.filesList.indexOf(filesList);
    if (index >= 0) {
      this.filesList.splice(index, 1);
    }
  }

  moveToNext(tabName) {
    for (let i = 0; i < document.querySelectorAll('.mat-tab-label-content').length; i++) {
      if ((<HTMLElement>document.querySelectorAll('.mat-tab-label-content')[i]).innerText == tabName) {
        (<HTMLElement>document.querySelectorAll('.mat-tab-label')[i]).click();
      }
    }
    this.activeTab = true;
  }

  submitMapFields() {
    //console.log(this.fieldFrom);
    this.moveToNext("Import Engage Customers");
  }

  importData() {

    // let importdata = {
    //   'file': this.fileInfo,
    //   'skipduplicate': 1,
    //   mappedFields: this.fieldList
    // };
    // const formData = new FormData();
    // formData.append('customer_based_bulk_item_price', this.fileInfo);

    // this.apiService.uploadPricingImport(formData).subscribe(res => {
    //   if (res.data) {
    //     this.isPreview = true;
    // this.backToMain();
    // this.commonToasterService.showSuccess(
    //   'Success',
    //   res.message
    // );
    //   }
    // });
    //console.log(importdata);
    const model = {
      customer_based_bulk_item_price: this.fileInfo,
      start_date: this.formNameGroup.controls['startDate']?.value,
      end_date: this.formNameGroup.controls['endDate']?.value,
      price_key: this.formNameGroup.controls['pricekey']?.value

    }
    this.pricePlanService.importCustomerBasePricing(model).subscribe(res => {
      if (res.data) {
        this.displayTableList = res.data;
        this.tableList = new MatTableDataSource(res.data);
        this.tableList.paginator = this.paginator;
        // this.tableList = res.data;
        this.isPreview = true;
        // this.backToMain();
        // this.commonToasterService.showSuccess(
        //   'Success',
        //   res.message
        // );
      }
    });
  }
  submitFile() {
    // const formData = new FormData();
    // formData.append('customer_based_bulk_item_price', this.fileInfo);
    // this.apiService.uploadPricingImport(formData).subscribe(res => {
    //   if (res.data) {
    //     this.isPreview = true;
    //   }
    // });
    const model = {
      data: this.displayTableList
    };
    console.log(model);
    this.pricePlanService.postCustomerBasePricing(model).subscribe(res => {
      if (res.status) {
        this.backToMain();
        this.commonToasterService.showSuccess(
          'Success',
          res.message
        );
      }
    });
  }

}
