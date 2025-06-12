import { Component, OnInit, Input } from '@angular/core';
import { STATUS } from '../../../../app.constant';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-advance-search-form-campaign',
  templateUrl: './advance-search-form-campaign.component.html',
  styleUrls: ['./advance-search-form-campaign.component.scss'],
})
export class AdvanceSearchFormCampaignComponent implements OnInit {
  statusList: Array<any> = STATUS;
  @Input() salesman: Array<any> = [];
  @Input() customers: Array<any> = [];
  form: FormGroup;
  constructor() {}

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('campaign'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      salesman: new FormControl(),
      customerName: new FormControl(),
    });
  }
}
