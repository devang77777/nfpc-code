import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Customer } from '../../customer-dt/customer-dt.component';
import { NeedApproval } from '../../../master';
import { MasterService } from '../../../master.service';
import { CustomerService } from '../../customer.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-customer-detail-overview',
  templateUrl: './customer-detail-overview.component.html',
  styleUrls: ['./customer-detail-overview.component.scss']
})

export class CustomerDetailOverviewComponent implements OnInit, OnChanges {
  @Input() public customer: Customer;
  @Input() public lobInfo: any;
  public customerIsApproved: boolean = false;

  constructor(private customerService: CustomerService,
    private commonToasterService: CommonToasterService) { }

  ngOnInit(): void {
    this.checkApproval(this.customer);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.customer.firstChange) {
      this.checkApproval(changes.customer.currentValue);
    }
  }

  checkApproval(customer: Customer) {
    if (this.customer) {
      switch (this.customer.need_to_approve) {
        case NeedApproval.NeedNotToApprove:
          this.customerIsApproved = false;
          break;
        case NeedApproval.NeedToApprove:
          this.customerIsApproved = true;
          break;
      }
    }
  }

  approve() {
    if (this.customer && this.customer.objectid) {
      this.customerService.approveCustomer(this.customer.objectid).subscribe((res: any) => {

        const approvedStatus: boolean = res.data.approved_or_rejected;
        if (res.status && approvedStatus) {
          this.commonToasterService.showSuccess("Approved", "Customer has been Approved");
          this.customerIsApproved = false;
        }
      });
    }
  }

  reject() {
    if (this.customer && this.customer.objectid) {
      this.customerService.rejectCustomerApproval(this.customer.objectid).subscribe((res: any) => {
        this.commonToasterService.showSuccess("Reject", "Customer Approval has been Rejected");
        this.customerIsApproved = false;
      });
    }
  }

}
