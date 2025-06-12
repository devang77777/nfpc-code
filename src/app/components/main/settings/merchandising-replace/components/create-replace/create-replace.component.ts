import { Subscription } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { ReplaceService } from '../../replace.service';

@Component({
  selector: 'app-create-replace',
  templateUrl: './create-replace.component.html',
  styleUrls: ['./create-replace.component.scss']
})
export class CreateReplaceComponent implements OnInit {

  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public replacementForm: FormGroup;
  @Input() salesmanList = []
  @Input() type = "";
  public formType: string;
  isEdit: boolean = false;
  private subscriptions: Subscription[] = [];
  categories: any[] = [];
  constructor(
    private fds: FormDrawerService,
    private toaster: CommonToasterService,
    private service: ReplaceService,
    public dialog: MatDialog,
    private dataEditor: DataEditor
  ) { }

  public ngOnInit(): void {
    this.replacementForm = new FormGroup({
      uuid: new FormControl(''),
      old_salesman_id: new FormControl('', Validators.required),
      new_salesman_id: new FormControl('', Validators.required),
    });


    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.replacementForm?.reset();
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
            this.replacementForm.patchValue(data);
          }
        })
      );
    });
  }

  public close() {
    this.fds.close();
    this.replacementForm.reset();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  saveReplacement(): void {
    const model = this.replacementForm.value;
    model.status = 1;
    model.new_salesman_id = model.new_salesman_id[0].id;
    model.old_salesman_id = model.old_salesman_id[0].id;
    if (model.new_salesman_id == model.old_salesman_id) {
      this.toaster.showWarning('Warning', 'Salesman from and to cannot be same.');
      return
    }
    if (this.isEdit) {
      this.service.editReplace(model.uuid, model).subscribe((result: any) => {
        this.toaster.showSuccess('Success', 'Merchandising replacement updated successfully.');
        let data = result.data;
        this.updateTableData.emit({ status: 'edit', data });
        this.fds.close();
      });
    } else {
      this.service.saveReplace(model, this.type).subscribe((result: any) => {
        this.toaster.showSuccess('Success', 'Merchandising replacement added successfully.');
        let data = result.data;
        this.updateTableData.emit({ status: 'add', data });
        this.fds.close();
      });
    }
  }

}
