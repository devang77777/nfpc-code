import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-import',
  templateUrl: './order-import.component.html',
  styleUrls: ['./order-import.component.scss']
})
export class OrderImportComponent implements OnInit {
  public importForm: FormGroup;
  public fieldFrom: FormGroup;
  private router: Router;
  public importFile: any = {};
  public filesList: string[] = [];
  public removable = true;
  public fileInfo: string;

  public fieldList: any = [];


  stepIndex: number = 0;

  constructor(
    router: Router,
    private formBuilder: FormBuilder,
    private commonToasterService: CommonToasterService,
    private orderService: OrderService
  ) {
    Object.assign(this, { router });
  }

  ngOnInit(): void {
    this.importForm = this.formBuilder.group({
      customer_file: ['', Validators.required],
    });

  }

  backToMain() {
    this.router.navigate(['transaction/order']).then();
  }


  onSelectFile(event) {
    if (event.target.files.length > 0) {
      this.fileInfo = event.target.files[0];
      this.filesList.push(event.target.files[0]);
      this.removable = true;
    }
  }

  remove(filesList): void {
    const index = this.filesList.indexOf(filesList);
    if (index >= 0) {
      this.filesList.splice(index, 1);
      this.removable = false;
    }
  }

  importData() {

    let importdata = {
      'file': this.fileInfo,
    };
    const formData = new FormData();
    formData.append('order_update_file', this.fileInfo);
    this.orderService.updateOrder(formData).subscribe((res: any) => {
      if (res.status) {
        this.backToMain();
        this.commonToasterService.showSuccess(
          'Success',
          res.message
        );
      } else {
        console.log(res.error)
      }
    }, err => {
      if (err.error.errors.length > 0) {
        err.error.errors.forEach(element => {
          this.commonToasterService.showError(element);
        });
      }
    });
  }
}
