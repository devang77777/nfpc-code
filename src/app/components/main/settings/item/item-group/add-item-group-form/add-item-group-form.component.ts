import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
// import { ItemGroup } from '../../datatables/itemgroup-dt/itemgroup-dt.component';
import { MatDialog } from '@angular/material/dialog';
import { ItemGroup } from '../itemgroup-dt/itemgroup-dt.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
// import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';
import { BaseComponent } from '../../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-add-item-group-form',
  templateUrl: './add-item-group-form.component.html',
  styleUrls: ['./add-item-group-form.component.scss'],
})
export class AddItemGroupFormComponent extends BaseComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public itemFormGroup: FormGroup;
  public itemGroupNameFormControl: FormControl;
  public subCategoryIdFormControl: FormControl;
  public itemGroupCodeFormControl: FormControl;
  nextCommingNumberofitemGroupCode: string = '';
  nextCommingNumberofitemGroupCodePrefix: string = '';
  public formType: string;

  private isEdit: boolean;
  private itemGroupData: ItemGroup;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  isCustomField = false;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    super('Item Group');
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.getCustomFieldStatus();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.itemFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getitemGroupCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          if (data && data.uuid && this.isEdit) {
            this.itemGroupNameFormControl.setValue(data.name);
            this.itemGroupCodeFormControl.setValue(data.code);
            this.itemGroupCodeFormControl.disable();
            // this.subCategoryIdFormControl.setValue(data.item_sub_category.name);
            this.itemGroupData = data;
            this.isEdit = true;
          }
        })
      );
    });
    this.itemGroupNameFormControl = new FormControl('', [Validators.required]);
    this.itemGroupCodeFormControl = new FormControl('', [Validators.required]);
    this.subCategoryIdFormControl = new FormControl('');
    this.itemFormGroup = new FormGroup({
      itemGroupName: this.itemGroupNameFormControl,
      itemGroupCode: this.itemGroupCodeFormControl,
      subCategoryId: this.subCategoryIdFormControl,
    });
    this.itemGroupCodeFormControl.disable();
  }
  getCustomFieldStatus() {
    this.apiService
      .checkCustomFieldStatus({
        organisation_id: 1,
        module_id: 6,
      })
      .subscribe((response) => {
        this.isCustomField =
          response.data.custom_field_status == 0 ? false : true;
      });
  }
  getitemGroupCode() {
    let nextNumber = {
      function_for: 'item_group',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofitemGroupCode = res.data.number_is;
        this.nextCommingNumberofitemGroupCodePrefix = res.data.prefix_is;

        if (this.nextCommingNumberofitemGroupCode) {
          this.itemGroupCodeFormControl.setValue(
            this.nextCommingNumberofitemGroupCode
          );
          this.itemGroupCodeFormControl.disable();
        } else if (this.nextCommingNumberofitemGroupCode == null) {
          this.nextCommingNumberofitemGroupCode = '';
          this.itemGroupCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofitemGroupCode = '';
        this.itemGroupCodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }
  public close() {
    this.fds.close();
    this.itemFormGroup.reset();
    this.isEdit = false;
  }

  public saveItemData(): void {
    if (this.itemFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editItemGroupData();
    } else {
      this.postItemGroupData();
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postItemGroupData(): void {
    this.apiService
      .addItemGroup({
        code: this.itemGroupCodeFormControl.value,
        // "item_sub_category.name" : this.subCategoryIdFormControl.value,
        name: this.itemGroupNameFormControl.value,
        status: '1',
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editItemGroupData(): void {
    this.apiService
      .editItemGroup(this.itemGroupData.uuid, {
        code: this.itemGroupCodeFormControl.value,
        // "item_sub_category.name" : this.subCategoryIdFormControl.value,
        name: this.itemGroupNameFormControl.value,
        status: '1',
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
      title: 'Item group Code',
      functionFor: 'item_group',
      code: this.nextCommingNumberofitemGroupCode,
      prefix: this.nextCommingNumberofitemGroupCodePrefix,
      key: this.nextCommingNumberofitemGroupCode.length
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
          this.itemGroupCodeFormControl.setValue('');
          this.nextCommingNumberofitemGroupCode = '';
          this.itemGroupCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.itemGroupCodeFormControl.setValue(
            res.data.next_coming_number_item_group
          );
          this.nextCommingNumberofitemGroupCode =
            res.data.next_coming_number_item_group;
          this.nextCommingNumberofitemGroupCodePrefix = res.reqData.prefix_code;
          this.itemGroupCodeFormControl.disable();
        }
      });
  }
}
