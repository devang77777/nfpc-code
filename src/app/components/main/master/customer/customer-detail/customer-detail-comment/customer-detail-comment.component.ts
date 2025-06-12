import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {CustomerService} from '../../customer.service';
import {Customer} from '../../customer-dt/customer-dt.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {first} from 'rxjs/operators';


@Component({
  selector: 'app-customer-detail-comment',
  templateUrl: './customer-detail-comment.component.html',
  styleUrls: ['./customer-detail-comment.component.scss']
})
export class CustomerDetailCommentComponent implements OnInit, OnChanges {
  commentForm: FormGroup;
  today: Date = new Date();
  commentData: any[] = [];
  @Input() notOpenedFromOverViewRightPanel: boolean = true;
  @Input() public customer: Customer;
  public comments = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private toaster: CommonToasterService
  ) {}

  ngOnInit(): void {
    this.createContactForm();
  //  this.comments = JSON.parse(localStorage.getItem('comment'));
    this.commentData = this.comments !== null ? this.comments : [];
    this.getComments();
  }

  createContactForm(){
    this.commentForm = this.formBuilder.group({
      comment: ['', [ Validators.required ]]
    });
  }

  getComments() {
    this.customerService.commentList(this.customer?.user_id)
      .pipe(first())
      .subscribe((res: any) => {
      if (res.status) {
        this.commentData = res.data;
      }
    });
  }

  onSubmit() {
    this.commentData.unshift(this.commentForm.value);
    this.customerService.addComment({
      customer_id: this.customer.user_id,
      ...this.commentForm.value
    }).subscribe((res: any) => {
      // check the response
      if (res.status) {
        this.toaster.showSuccess('Success', res.message);
      }
    });
   // localStorage.setItem('comment', JSON.stringify(this.commentData));
    this.commentForm.reset();
  }

  deleteComent(index: any, id: number){
    this.commentData = this.commentData.filter((a) => a !== this.commentData[index]);
    this.customerService.deleteComment(id).subscribe((res: any) => {
      if (res.status) {
        this.toaster.showSuccess('Success', res.message);
      }
    });

   // localStorage.setItem('comment', JSON.stringify(this.commentData));
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!changes.customer?.firstChange) {
      this.getComments();
    }
  }
}
