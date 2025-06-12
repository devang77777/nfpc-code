import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Utils } from 'src/app/services/utils';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { OrderService } from '../../order.service';

@Component({
  selector: 'app-order-type-form',
  templateUrl: './order-type-form.component.html',
  styleUrls: ['./order-type-form.component.scss']
})
export class OrderTypeFormComponent implements OnInit, OnDestroy {

  public formGroup: FormGroup;
  private use_forCheck: string[] = ['Customer', 'Depot'];
  private router: Router;
  private elementRef: ElementRef;
  private subscriptions: Subscription[] = [];
  private matDialogRef: MatDialogRef<OrderTypeFormComponent>;

  constructor(private commonToasterService: CommonToasterService,
    private orderService: OrderService, elementRef: ElementRef, router: Router, matDialogRef: MatDialogRef<OrderTypeFormComponent>) {
    Object.assign(this, { elementRef, router, matDialogRef });
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      use_for: new FormControl('', Validators.required),
      prefix_code: new FormControl('', Validators.required),
      start_range: new FormControl('', Validators.required),
      end_range: new FormControl('', Validators.required)
    });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public closeModal(): void {
    this.matDialogRef.close();
  }

  public postTypeData(): void {
    if (this.formGroup.invalid) {
      const invalidControl = Object.keys(this.formGroup.controls).find((key: string) => {
        return this.formGroup.controls[key].invalid;
      });
      const invalidElem = this.elementRef.nativeElement.querySelector(`[formControlName=${invalidControl}]`);
      invalidElem.focus();
      return;
    }
    const val = this.use_forCheck.includes(this.formGroup.controls.use_for.value)
    if (!val) {
      this.commonToasterService.showWarning("Order Type Incorrect", "Order type should be 'Customer', 'Depot'");
      return;
    }
    else {
      this.saveOrderType();
    }
  }

  public saveOrderType() {
    this.subscriptions.push(this.orderService.addOrderType(this.formGroup.value).subscribe((result) => {
      //console.log(result.data);
      if (result.status) {
        this.commonToasterService.showSuccess("Order Type", "Order type sucessfully added");
        this.subscriptions.push(this.orderService.orderTypeList().subscribe((res: any) => {
          if (res.status && res.data) {
            this.matDialogRef.close(res.data);
          }
          else {
            this.matDialogRef.close();
          }
        }));
      }
    },
      (error) => {
        this.commonToasterService.showError("Fail", "Failed adding Order type!!!, Please try again.");
      }));
  }
}