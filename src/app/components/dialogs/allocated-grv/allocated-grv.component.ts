import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-allocated-grv',
  templateUrl: './allocated-grv.component.html',
  styleUrls: ['./allocated-grv.component.scss']
})
export class AllocatedGrvComponent implements OnInit {
  vanList: any = [];
  salesmanList: any = [];
  customData: {
    van_id: number,
    salesman_id: number,
    hasConfirmed: boolean
    credit_note_id:number,
  }
  public allocatedGRVForm: FormGroup;
  public matDialogRef: MatDialogRef<AllocatedGrvComponent>;

  constructor(
    private api: ApiService, matDialogRef: MatDialogRef<AllocatedGrvComponent>,
    @Inject(MAT_DIALOG_DATA) customData: any) {
    Object.assign(this, { matDialogRef, customData });
  }
  ngOnInit(): void {
    this.allocatedGRVForm = new FormGroup({
      van_id: new FormControl(''),
      salesman_id: new FormControl(''),
    });
    this.api.getAllVans().subscribe(res => {
      this.vanList = res.data;
    });
    this.api.getSalesMan().subscribe(res => {
      this.salesmanList = res.data.map(item => {
        if (item.user !== null) {
          item['user']['firstname'] = [item.salesman_code,item.user?.firstname].join(" - ")
          return item;
        }
        return item;
      });
    });
  }
  submit() {
    this.customData.hasConfirmed = true;
    this.customData.credit_note_id = this.customData.credit_note_id;
    this.customData.salesman_id=this.allocatedGRVForm.value.salesman_id[0].id;
    // this.customData.van_id=this.allocatedGRVForm.value.van_id[0].id
    this.matDialogRef.close(this.customData);
  }
}
