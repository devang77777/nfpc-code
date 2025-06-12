import { ReasonService } from './../../reason.service';
import { Subscription } from 'rxjs';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-create-reason',
  templateUrl: './create-reason.component.html',
  styleUrls: ['./create-reason.component.scss'],
})
export class CreateReasonComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public reasonForm: FormGroup;
  public formType: string;
  isEdit: boolean = false;
  private subscriptions: Subscription[] = [];
  categories: any[] = [];
  constructor(
    private fds: FormDrawerService,
    private toaster: CommonToasterService,
    private service: ReasonService,
    public dialog: MatDialog,
    private dataEditor: DataEditor
  ) { }

  public ngOnInit(): void {
    this.reasonForm = new FormGroup({
      uuid: new FormControl(''),
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
    });
    this.categories = [
      { id: 'Receipt Reason', name: 'Receipt Reason' },
      { id: 'Visit Reason', name: 'Visit Reason' },
      { id: 'Non Service Reason', name: 'Non Service Reason' },
      { id: 'Good Return Reason', name: 'Good Return Reason' },
      { id: 'Bad Return Reason', name: 'Bad Return Reason' },
      { id: 'Debit Note Reason', name: 'Debit Note Reason' },
      { id: 'Order Process Reason', name: 'Order Process Reason' },
    ];

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.reasonForm?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          if (data && data.uuid && this.isEdit) {
            this.isEdit = true;
            this.reasonForm.patchValue(data);
          }
        })
      );
    });
  }

  public close() {
    this.fds.close();
    this.reasonForm.reset();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  saveReason(): void {
    const model = this.reasonForm.value;
    model.status = 1;
    if (this.isEdit) {
      this.service.editReason(model.uuid, model).subscribe((result: any) => {
        this.toaster.showSuccess('Success', 'Reason updated successfully.');
        let data = result.data;
        this.updateTableData.emit({ status: 'edit', data });
        this.fds.close();
      });
    } else {
      this.service.saveReason(model).subscribe((result: any) => {
        this.toaster.showSuccess('Success', 'Reason added successfully.');
        let data = result.data;
        this.updateTableData.emit({ status: 'add', data });
        this.fds.close();
      });
    }
  }
}
