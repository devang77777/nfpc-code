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
@Component({
  selector: 'app-van-category-form',
  templateUrl: './van-category-form.component.html',
  styleUrls: ['./van-category-form.component.scss'],
})
export class VanCategoryFormComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public vcFormGroup: FormGroup;
  public vcNameFormControl: FormControl;
  public parentFormControl: FormControl;
  public showForm: boolean;
  public isEditForm: boolean;
  public isLoaded: boolean = false;
  private dialogRef: MatDialogRef<VanCategoryFormComponent>;
  nextCommingNumberofVancategoryCode: string = '';
  nextCommingNumberofVancategoryCodePrefix: string = '';
  private isEdit: boolean;
  private uuid: string;
  public formType: string;
  categoryList: any[] = [];
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  isCustomField = false;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    dialogRef: MatDialogRef<VanCategoryFormComponent>
  ) {
    Object.assign(this, { fds, dialogRef, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.getAllVanCategories().subscribe((item) => {
      this.categoryList = item;
      this.isLoaded = true;
    });

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.vcFormGroup?.reset();
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
            this.vcNameFormControl.setValue(data.name);
            this.isEdit = true;
          }
          return;
        })
      );
    });
    this.vcNameFormControl = new FormControl('', [Validators.required]);
    this.parentFormControl = new FormControl('');
    this.vcFormGroup = new FormGroup({
      name: this.vcNameFormControl,
      parent: this.parentFormControl,
    });
  }
  public applySalesOrganisation(data: any): void {
    this.dialogRef.close(data);
  }
  getAllVanCategories() {
    return this.apiService
      .getAllVanCategories()
      .pipe(map((result) => result.data));
  }
  public vanCategorySelected(data: any): void {
    this.parentFormControl.setValue(data.id);
  }
  public edit(data: any): void {
    this.vcNameFormControl.setValue(data.name);
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
    this.vcFormGroup.reset();
    this.isEdit = false;
  }
  public addvanCategory(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.vcFormGroup.reset({
      name: '',
      parent: null,
    });
  }
  public saveVanCategoryData(): void {
    //console.log(this.vcFormGroup);
    if (this.vcFormGroup.invalid) {
      Object.keys(this.vcFormGroup.controls).forEach((key) => {
        this.vcFormGroup.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editVanCategory();

      return;
    }

    this.postVanCategoryData();
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  addNewVanCategory() {
    this.showForm = true;
    this.reset();
  }
  editVanCategory(): void {
    this.subscriptions.push(
      this.apiService
        .editVanCategories(this.uuid, {
          name: this.vcNameFormControl.value,
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
    this.vcNameFormControl.patchValue('');
    this.parentFormControl.patchValue('');
    this.isEditForm = false;
  }
  private postVanCategoryData(): void {
    this.apiService
      .addNewVanCategories({
        name: this.vcNameFormControl.value,
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
    this.getAllVanCategories().subscribe((item) => {
      this.categoryList = item;
      this.isLoaded = true;
    });
  }
  public delete(data: any): void {
    this.subscriptions.push(
      this.apiService.deleteVanCategories(data.uuid).subscribe(() => {
        this.getCategory();
      })
    );
  }
}
