import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { ApiService } from 'src/app/services/api.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss'],
})
export class SendEmailComponent implements OnInit {
  emailForm: FormGroup;
  @Input() data;
  @Output() public submit: EventEmitter<any> = new EventEmitter<any>();
  @Output() public close: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private service: ApiService,
    private toaster: CommonToasterService
  ) {}

  ngOnInit(): void {
    this.emailForm = new FormGroup({
      to_email: new FormControl(this.data.email, [
        Validators.required,
        Validators.email,
      ]),
      subject: new FormControl(this.data.subject, [Validators.required]),
      message: new FormControl(this.data.message, [Validators.required]),
    });
  }
  ngAfterViewChecked() {
    const popover = document.querySelector('.popover');
    if (!popover) return;

    const width = '420px';
    popover['style'].maxWidth = width;
    popover['style'].width = width;
  }
  onSendEmail() {
    const model = this.emailForm.value;
    this.close.emit();
    this.service.sendEmail({ type: this.data.type, ...model }).subscribe(
      (res: any) => {
        this.toaster.showSuccess('Success', 'Email sent sucessfully');
      },
      (error) => {
        this.toaster.showError('Error', 'Unable to process the request');
      }
    );
  }
  onClose() {
    this.close.emit();
  }
}
