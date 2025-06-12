import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
// import { ApiService } from '../../../services/api.service';
// import { DataEditor } from '../../../services/data-editor.service';
// import { Utils } from '../../../services/utils';
// import { ItemUoms } from '../../datatables/itemuoms-dt/itemuoms-dt.component';
import { MatDialog } from '@angular/material/dialog';
import { ItemUoms } from '../itemuoms-dt/itemuoms-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
// import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';
import { BaseComponent } from '../../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-add-item-uoms-form',
  templateUrl: './add-item-uoms-form.component.html',
  styleUrls: ['./add-item-uoms-form.component.scss'],
})
export class AddItemUomsFormComponent extends BaseComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public itemUomsFormGroup: FormGroup;
  public itemUomsCodeFormControl: FormControl;
  public itemUomsNameFormControl: FormControl;
  public itemUoms: any;
  public formType: any;
  private isEdit: boolean;
  private itemUomsData: ItemUoms;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  nextCommingNumberofitemuomCode: string = '';
  isCustomField = false;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    super('UOM');
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.getCustomFieldStatus();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.itemUomsFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getitemuomCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          if (data && data.uuid && this.isEdit) {
            this.itemUomsCodeFormControl.setValue(data.code);
            this.itemUomsCodeFormControl.disable();
            this.itemUomsNameFormControl.setValue(data.name);
            this.itemUomsData = data;
            this.isEdit = true;
          }
          return;
        })
      );
    });
    this.itemUomsCodeFormControl = new FormControl('', [Validators.required]);
    this.itemUomsNameFormControl = new FormControl('', [Validators.required]);
    this.itemUomsFormGroup = new FormGroup({
      code: this.itemUomsCodeFormControl,
      name: this.itemUomsNameFormControl,
    });
    this.itemUomsCodeFormControl.disable();
    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result: any) => {
        this.itemUoms = result.data;
      })
    );
  }
  getCustomFieldStatus() {
    this.apiService
      .checkCustomFieldStatus({
        organisation_id: 1,
        module_id: 7,
      })
      .subscribe((response) => {
        this.isCustomField =
          response.data.custom_field_status == 0 ? false : true;
      });
  }
  public close() {
    this.fds.close();
    this.itemUomsFormGroup.reset();
    this.isEdit = false;
  }
  getitemuomCode() {
    let nextNumber = {
      function_for: 'item_uoms',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofitemuomCode = res.data.number_is;
        if (this.nextCommingNumberofitemuomCode) {
          this.itemUomsCodeFormControl.setValue(
            this.nextCommingNumberofitemuomCode
          );
          this.itemUomsCodeFormControl.disable();
        } else if (this.nextCommingNumberofitemuomCode == null) {
          this.nextCommingNumberofitemuomCode = '';
          this.itemUomsCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofitemuomCode = '';
        this.itemUomsCodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }

  public saveItemUomsData(): void {
    if (this.itemUomsFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editItemUomsData();
      return;
    }
    this.postItemUomsData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postItemUomsData(): void {
    this.apiService
      .addItemUom({
        code: this.itemUomsCodeFormControl.value,
        name: this.itemUomsNameFormControl.value,
        status: 1,
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editItemUomsData(): void {
    this.apiService
      .editItemUom(this.itemUomsData.uuid, {
        code: this.itemUomsCodeFormControl.value,
        name: this.itemUomsNameFormControl.value,
        status: 1,
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  open() {
    let response: any;
    let data = {
      title: 'Item UOM Code',
      functionFor: 'item_uoms',
      code: this.nextCommingNumberofitemuomCode,
      key: this.nextCommingNumberofitemuomCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: '340px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.itemUomsCodeFormControl.setValue('');
          this.nextCommingNumberofitemuomCode = '';
          this.itemUomsCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.itemUomsCodeFormControl.setValue(
            res.data.next_coming_number_item_uoms
          );
          this.nextCommingNumberofitemuomCode =
            res.data.next_coming_number_item_uoms;
          this.itemUomsCodeFormControl.disable();
        }
      });
  }
}
