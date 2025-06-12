import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MerchandisingService } from '../../merchandising.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-complaint-feedback',
  templateUrl: './add-complaint-feedback.component.html',
  styleUrls: ['./add-complaint-feedback.component.scss']
})
export class AddComplaintFeedbackComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public ComplaintFeedbackFormGroup;
  public ComplaintFeedbackdata;
  private isEdit: boolean
  public formType: string;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  public items: any[] = [];
  public merchandiser: any[] = [];
  private subscriptions: Subscription[] = [];
  complaint_id: string;
  complaint_type_list = [
    { id: 'complaint', itemName: 'Complaint' },
    { id: 'suggestion', itemName: 'Suggestion' },
  ]

  constructor(apiService: ApiService, private fb: FormBuilder, fds: FormDrawerService, public merService: MerchandisingService, dataEditor: DataEditor, public dialog: MatDialog,
    private router: Router) {
    Object.assign(this, { fds, apiService, merService, dataEditor });
  }
  public ngOnInit(): void {
    this.complaint_id = localStorage.getItem('id') + Date.now();
    this.fds.formType.subscribe(s => this.formType = s);
    this.ComplaintFeedbackFormGroup = this.fb.group({
      merchandiser: ['', [Validators.required]],
      feedBack: ['', [Validators.required]],
      type: ['', [Validators.required]],
      item: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });

    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.items = result.data.items;
        this.merchandiser = result.data.merchandiser.map(item => {
          if (item.user !== null) {
            item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
            return item;
          }
          return item;
        });
      })
    );

    // this.subscriptions.push(this.merService.getComplaintFeedbackListData().subscribe((res: any) => {
    //   this.merchandiser = res.merchandiser.data;
    //   this.items = res.items.data;
    // }));

    this.fds.formType.subscribe(s => {
      this.formType = s
      this.ComplaintFeedbackFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;

      }
      else {
        this.isEdit = true;
      }
      this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
        const data: any = result.data;
        //console.log(data);
        if (data && data.uuid && this.isEdit) {
          let item = [{ id: data.item_id, itemName: `${data.item.item_name}` }];
          let type = [{ id: data.type, itemName: `${this.capitalizeFirstLetter(data.type)}` }];
          let salesman = [{ id: data.salesman_id, itemName: `${data.salesman.firstname} ${data.salesman.lastname}` }]
          this.ComplaintFeedbackFormGroup.patchValue({
            feedBack: data.title,
            type: type,
            merchandiser: salesman,
            description: data.description,
            item: item,
          })
          this.complaint_id = data.complaint_id;
          this.ComplaintFeedbackdata = data;
          this.isEdit = true;
        }

        return;
      }));
    });
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  public close() {
    this.fds.close();
    this.ComplaintFeedbackFormGroup.reset();
    this.isEdit = false;
  }
  public saveComplaintFeedbackData(): void {
    if (this.ComplaintFeedbackFormGroup.invalid) {

      return;
    }

    let form = this.ComplaintFeedbackFormGroup.value;

    let merch = null, item = null, type = null;
    if (form.merchandiser && form.merchandiser.length > 0) {
      merch = form.merchandiser[0].id
    }
    if (form.item && form.item.length > 0) {
      item = form.item[0].id
    }
    if (form.type && form.type.length > 0) {
      type = form.type[0].id
    }
    form.status = 1;
    let sForm = {
      route_id: null,
      customer_id: 0,
      complaint_id: this.complaint_id,
      title: form.feedBack,
      type: type,
      salesman_id: merch,
      description: form.description,
      item_id: item,
      status: form.status
    }

    if (this.isEdit) {
      this.editComplaintFeedbackData(sForm);

      return;
    }

    this.postComplaintFeedbackData(sForm);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postComplaintFeedbackData(sForm) {
    this.merService.addComplaintFeedback(sForm).subscribe((result: any) => {
      let data = result.data;
      data.edit = false;
      this.updateTableData.emit(data);
      this.close();
    });
  }

  private editComplaintFeedbackData(sForm): void {
    this.merService.editComplaintFeedback(this.ComplaintFeedbackdata.uuid, sForm).subscribe((result: any) => {
      this.isEdit = false;
      let data = result.data;
      data.edit = true;
      this.updateTableData.emit(data);
      this.close();
    });
  }

}
