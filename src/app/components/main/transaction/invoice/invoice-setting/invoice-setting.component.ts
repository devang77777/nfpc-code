import { ValidatorService } from './../../../../../services/validator.service';
import { InvoiceServices } from './../invoice.service';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-invoice-setting',
  templateUrl: './invoice-setting.component.html',
  styleUrls: ['./invoice-setting.component.scss'],
})
export class InvoiceSettingComponent implements OnInit {
  form: FormGroup;
  @Input() invoiceData: any;
  @Input() random: any;
  orgName: string;
  @Output() close = new EventEmitter();
  @Output() reminder = new EventEmitter();
  constructor(
    private service: InvoiceServices,
    private toaster: CommonToasterService
  ) {}

  ngOnInit(): void {
    this.orgName = localStorage.getItem('org_name');
    this.initForm();
  }
  initForm() {
    this.form = new FormGroup({
      invoice_id: new FormControl(this.invoiceData.id),
      is_automatically: new FormControl(true),
      message: new FormControl(''),
      reminder: new FormArray([]),
    });
    this.addItem();
  }
  onClose() {
    this.close.emit(true);
  }
  ngOnChanges(changes: SimpleChanges) {
    this.initForm();
  }
  addItem(): void {
    const array = this.form.get('reminder') as FormArray;
    const form = new FormGroup({
      reminder_day: new FormControl(0, [
        Validators.required,
        ValidatorService.numbersOnly,
      ]),
      date_prefix: new FormControl('before'),
    });
    array.push(form);
  }
  onSubmit() {
    const model = this.form.value;
    if (model.is_automatically) {
      model.reminder = [];
    }
    this.service.addReminder(model).subscribe((result) => {
      this.initForm();
      this.toaster.showSuccess('Reminder added');
      this.close.emit(true);
      this.reminder.emit(result.data);
    });
  }
  remove(i) {
    const array = this.form.get('reminder') as FormArray;
    array.controls.splice(i, 1);
  }
}
