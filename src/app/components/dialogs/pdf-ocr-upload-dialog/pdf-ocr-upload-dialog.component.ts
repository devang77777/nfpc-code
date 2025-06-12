import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { OrderService } from '../../main/transaction/orders/order.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Customer } from '../../main/master/customer/customer-dt/customer-dt.component';
import { MasterService } from '../../main/master/master.service';
import { Subscription, Subject, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
type AOA = any[][];
@Component({
  selector: 'app-pdf-ocr-upload-dialog',
  templateUrl: './pdf-ocr-upload-dialog.component.html',
  styleUrls: ['./pdf-ocr-upload-dialog.component.scss']
})
export class PdfOcrUploadDialogComponent implements OnInit {

  public importForm: FormGroup;
  public fieldFrom: FormGroup;
  private router: Router;
  public importFile: any = {};
  public filesList: string[] = [];
  public removable = true;
  public data: any = [];
  public fileInfo: string;
  public panelOpenState: boolean = false;
  public unmappedList = [];
  public unMappedCount;
  public fieldList: any = [];
  public duplicate: any = [];
  public activeTab: boolean = false;
  public isActive: boolean = false;
  public isOptional = false;
  public selected: string;
  public customers: Customer[] = [];
  public filterCustomer: Customer[] = [];
  filterValue = '';
  itemfilterValue = '';
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  stepIndex: number = 0;
  public isLoading: boolean;
  public page = 0;
  keyUp = new Subject<string>();

  constructor(
    router: Router,
    private formBuilder: FormBuilder,
    private commonToasterService: CommonToasterService,
    private orderService: OrderService,
    private dialog: MatDialogRef<PdfOcrUploadDialogComponent>,
    private masterService: MasterService,
  ) {
    Object.assign(this, { router });
  }

  ngOnInit(): void {
    this.importForm = this.formBuilder.group({
      customer_file: ['', Validators.required],
      customerFormControl: ['', Validators.required]
    });
    this.keyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(100),
      )),
    ).subscribe(res => {
      if (!res) {
        res = '';
      }
      this.filterCustomers(res);
    });

  }
  getCustomerList() {
    this.isLoading = true;
    this.masterService.customerDetailDDlListTable({}).subscribe((result) => {
      this.isLoading = false;
      this.customers = result.data;
      this.filterCustomer = result.data.slice(0, 30);
    })
  }

  filterCustomers(customerName: string) {
    this.page = 1;
    if (this.customers.length === 0) {
      this.getCustomerList();
    }
    this.filterValue = customerName.toLowerCase().trim() || "";
    // this.customers = [];
    this.filterCustomer = this.customers
      .filter(x => x.customer_code?.toLowerCase().trim().indexOf(this.filterValue) > -1 || x.name?.toLowerCase().trim().indexOf(this.filterValue) > -1)
    // this.filterCustomer = [];
    // this.isLoading = true
    // this.lookup$.next(this.page)
  }
  backToMain() {
    this.router.navigate(['transaction/delivery']).then();
  }

  mapChange(event) {
    if (this.fieldList.length > 0) {
      for (let i = 0; i < this.fieldList.length; i++) {
        if (this.fieldList[i] === event) {
          this.fieldList.splice(i, 1);
          this.commonToasterService.showWarning(
            'Warrning',
            event + ' Column has been matched with multiple columns.'
          );
        }
      }
      this.fieldList.push(event);
      //console.log(this.fieldList);
    } else {
      this.fieldList.push(event);
    }
  }
  onScroll() {

    var totalPages = this.customers.length / 30;
    if (this.filterCustomer.length == this.customers.length) return;
    this.page = this.page + 30;
    var pageEndNumber = 30 + this.page;
    this.filterCustomer = [...this.filterCustomer, ...this.customers.slice(this.page, pageEndNumber)]

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
      //console.log(this.data);
      this.selected = this.data[0][0];
      //console.log(this.selected);
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
    this.moveToNext("Preview");
  }

  importData() {

    let importdata = {
      'file': this.fileInfo,
      'skipduplicate': 1,
      mappedFields: this.fieldList
    };
    const formData = new FormData();
    formData.append('delivery_update_file', this.fileInfo);

    this.orderService.updateDelivery(formData).subscribe((res: any) => {
      if (res.status) {
        this.backToMain();
        this.commonToasterService.showSuccess(
          'Success',
          res.message
        );
      }
    });
    //console.log(importdata);
  }

  public openForm() {
    this.router.navigate(['transaction/order', 'add']);
  }
  public customerControlDisplayValue(customer: any): string {
    if (customer?.user) {
      return `${customer?.user?.customer_info?.customer_code ? customer?.user?.customer_info?.customer_code : ''} ${customer?.user?.firstname ? customer?.user?.firstname + ' ' + customer?.user?.lastname : ''} `

    } else
      return `${customer?.customer_code ? customer?.customer_code : ''} ${customer?.name ? customer?.name : ''} `
  }
  close(closeType?: any) {
    this.dialog.close();
  }
}
