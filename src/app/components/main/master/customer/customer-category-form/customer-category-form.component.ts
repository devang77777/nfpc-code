import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { map, startWith } from 'rxjs/operators';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
@Component({
  selector: 'app-customer-category-form',
  templateUrl: './customer-category-form.component.html',
  styleUrls: ['./customer-category-form.component.scss'],
})
export class CustomerCategoryFormComponent extends BaseComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public ccFormGroup: FormGroup;
  public ccNameFormControl: FormControl;
  public parentFormControl: FormControl;
  public showForm: boolean;
  public isEditForm: boolean;
  private dialogRef: MatDialogRef<CustomerCategoryFormComponent>;
  nextCommingNumberofCustomercategoryCode: string = '';
  nextCommingNumberofCustomercategoryCodePrefix: string = '';
  private isEdit: boolean;
  private uuid: string;
  public formType: string;
  categoryList: any[] = [];
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  isCustomField = false;
  public isLoaded: boolean = false;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    dialogRef: MatDialogRef<CustomerCategoryFormComponent>
  ) {
    super('Customer Category');
    Object.assign(this, { fds, dialogRef, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => {
      // this.getCustomerCategoryList().subscribe((item) => {
      //   this.categoryList = item;
      //   this.isLoaded = true;
      // });
      this.getCategory();
      this.formType = s;
      this.ccFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any =
            result.type === CompDataServiceType.DATA_EDIT_FORM && result.data;

          if (data && data.uuid && this.isEdit) {
            this.ccNameFormControl.setValue(data.customer_category_name);
            this.isEdit = true;
          }
          return;
        })
      );
    });
    this.ccNameFormControl = new FormControl('', [Validators.required]);
    this.parentFormControl = new FormControl('');
    this.ccFormGroup = new FormGroup({
      name: this.ccNameFormControl,
      parent: this.parentFormControl,
    });
  }
  public applySalesOrganisation(data: any): void {
    this.dialogRef.close(data);
  }
  getCustomerCategoryList() {
    return this.apiService
      .getAllCustomerCategory()
      .pipe(map((result) => result.data));
  }
  public customerCategorySelected(data: any): void {
    this.parentFormControl.setValue(data.id);
  }
  public edit(data: any): void {
    this.ccNameFormControl.setValue(data.name);
    this.parentFormControl.setValue(data.parent_id);
    // this.nodeLevelFormControl.setValue(data.node_level);
    // this.statusFormControl.setValue(data.status);
    this.uuid = data.uuid;
    this.isEditForm = true;
    this.showForm = true;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public close() {
    this.fds.close();
    this.ccFormGroup.reset();
    this.isEdit = false;
  }
  public addCustomerCategory(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.ccFormGroup.reset({
      name: '',
      parent: null,
    });
  }
  public saveCustomerCategoryData(): void {
    if (this.ccFormGroup.invalid) {
      Object.keys(this.ccFormGroup.controls).forEach((key) => {
        this.ccFormGroup.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editCustomerCategory();

      return;
    }

    this.postCustomerCategoryData();
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  editCustomerCategory(): void {
    this.subscriptions.push(
      this.apiService
        .editCustomerCategory(this.uuid, {
          customer_category_name: this.ccNameFormControl.value,
          status: 1,
          parent_id: this.parentFormControl.value,
          node_level: 0,
        })
        .subscribe(() => {
          this.isEditForm = false;
          this.showForm = false;
          this.reset();
          this.getCategory();
        })
    );
  }
  reset() {
    this.ccNameFormControl.patchValue('');
    this.parentFormControl.patchValue('');
    this.isEditForm = false;
  }

  addNewCustomerCategory() {
    this.showForm = true;
    this.reset();
  }

  private postCustomerCategoryData(): void {
    this.apiService
      .addNewCustomerCategory({
        customer_category_name: this.ccNameFormControl.value,
        status: 1,
        parent_id: this.parentFormControl.value,
        node_level: 0,
      })
      .subscribe((result: any) => {
        this.isLoaded = false;
        this.showForm = false;
        this.reset();
        this.getCategory();
      });
  }
  getCategory() {
    this.getCustomerCategoryList().subscribe((item) => {
      this.categoryList = item;
      this.isLoaded = true;
    });
  }
  public delete(data: any): void {
    this.subscriptions.push(
      this.apiService.deleteCustomerCategory(data.uuid).subscribe(() => {
        this.getCategory();
      })
    );
  }
}
