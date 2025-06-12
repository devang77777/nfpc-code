import { Component, OnInit, Input } from '@angular/core';
import { STATUS } from '../../../../app.constant';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-advance-search-form-asset-track',
  templateUrl: './advance-search-form-asset-track.component.html',
  styleUrls: ['./advance-search-form-asset-track.component.scss'],
})
export class AdvanceSearchFormAssetTrackComponent implements OnInit {
  statusList: Array<any> = STATUS;
  @Input() salesman: Array<any> = [];
  @Input() customer: Array<any> = [];
  form: FormGroup;
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('asset-tracking'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      customer: new FormControl(),
    });
  }
}
