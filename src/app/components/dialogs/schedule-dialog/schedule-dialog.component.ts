import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, Validators, } from '@angular/forms';
@Component({
  selector: 'app-schedule-dialog',
  templateUrl: './schedule-dialog.component.html',
  styleUrls: ['./schedule-dialog.component.scss']
})
export class ScheduleDialogComponent implements OnInit {

  intervals = [
    { id: 'today', name: 'Today' },
    { id: 'current-week', name: 'This Week' },
    { id: 'current-month', name: 'This Month' },
    { id: 'current-quarter', name: 'This Quarter' },
    { id: 'current-year', name: 'This Year' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'prev-week', name: 'Previous Week' },
    { id: 'prev-month', name: 'Previous Month' },
    { id: 'prev-quarter', name: 'Previous Quarter' },
    { id: 'prev-year', name: 'Previous Year' },
    { id: 'custom', name: 'Custom' },
  ];

  hours = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
  ];
  minutes = [
    '00',
    '30'
  ];

  constructor(
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public scheduleData: any,
    public dialog: MatDialogRef<ScheduleDialogComponent>,
    public apiService: ApiService
  ) { }

  public scheduleForm;

  ngOnInit(): void {
    this.scheduleForm = this.fb.group({
      frequency: ['', Validators.required],
      date: ['', Validators.required],
      hours: ['', Validators.required],
      minutes: ['', Validators.required],
      emailRecipients: ['', Validators.required],
      additionalRecipients: [''],
      reportAs: ['', Validators.required]
    });
  }
  onSchedule() {
    let data = this.scheduleForm.value;
    //console.log(data);
    this.close();
  }

  close() {
    this.dialog.close();
  }

}
