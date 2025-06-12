import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-export-form',
  templateUrl: './export-form.component.html',
  styleUrls: ['./export-form.component.scss']
})
export class ExportFormComponent implements OnInit {


  @Input() public title: string;
  @Output() public exportInfo: EventEmitter<any> = new EventEmitter<any>();

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];

  // public deliveryService: DeliveryService;
  private datePipe: DatePipe

  constructor(datePipe: DatePipe,
  ) {
    Object.assign(this, {});
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    })

  }

  exportData() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    //console.log(this.export);

    let info = {
      'criteria': this.export.type,
      'start_date': this.export.startDate,
      'end_date': this.export.endDate,
      'file_type': this.export.fileType,
      'is_password_protected': 'no'
    }
    this.exportInfo.emit(info);
  }

}
