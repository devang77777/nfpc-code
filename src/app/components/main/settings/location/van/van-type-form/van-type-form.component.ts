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
  selector: 'app-van-type-form',
  templateUrl: './van-type-form.component.html',
  styleUrls: ['./van-type-form.component.scss'],
})
export class VanTypeFormComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public vtFormGroup: FormGroup;
  public vtNameFormControl: FormControl;
  public parentFormControl: FormControl;
  public showForm: boolean;
  public isEditForm: boolean;
  public isLoaded: boolean = false;
  private dialogRef: MatDialogRef<VanTypeFormComponent>;
  nextCommingNumberofVantypeCode: string = '';
  private isEdit: boolean;
  private uuid: string;
  public formType: string;
  typeList: any[] = [];
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  isCustomField = false;
  nextCommingNumberofVantypeCodePrefix: any;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    dialogRef: MatDialogRef<VanTypeFormComponent>
  ) {
    Object.assign(this, { fds, dialogRef, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.getAllVanTypes().subscribe((item) => {
      this.typeList = item;
      this.isLoaded = true;
    });

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.vtFormGroup?.reset();
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
            this.vtNameFormControl.setValue(data.name);
            this.isEdit = true;
          }
          return;
        })
      );
    });
    this.vtNameFormControl = new FormControl('', [Validators.required]);
    this.parentFormControl = new FormControl('');
    this.vtFormGroup = new FormGroup({
      name: this.vtNameFormControl,
      parent: this.parentFormControl,
    });
  }
  public applySalesOrganisation(data: any): void {
    this.dialogRef.close(data);
  }
  getAllVanTypes() {
    return this.apiService
      .getAllVanTypes()
      .pipe(map((result) => result.data));
  }
  public vanTypeSelected(data: any): void {
    this.parentFormControl.setValue(data.id);
  }
  public edit(data: any): void {
    this.vtNameFormControl.setValue(data.name);
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
    this.vtFormGroup.reset();
    this.isEdit = false;
  }
  public addvanType(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.vtFormGroup.reset({
      name: '',
      parent: null,
    });
  }
  public saveVanTypeData(): void {
    if (this.vtFormGroup.invalid) {
      Object.keys(this.vtFormGroup.controls).forEach((key) => {
        this.vtFormGroup.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editVanType();

      return;
    }

    this.postVanTypesData();
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  editVanType(): void {
    this.subscriptions.push(
      this.apiService
        .editVanTypes(this.uuid, {
          name: this.vtNameFormControl.value,
          status: 1,
          parent_id: this.parentFormControl.value,
          node_level: 0,
        })
        .subscribe(() => {
          this.isEditForm = false;
          this.showForm = false;
          this.reset();
          this.getType();
        })
    );
  }
  reset() {
    this.vtNameFormControl.patchValue('');
    this.parentFormControl.patchValue('');
    this.isEditForm = false;
  }
  private postVanTypesData(): void {
    this.apiService
      .addNewVanTypes({
        name: this.vtNameFormControl.value,
        status: 1,
        parent_id: this.parentFormControl.value,
        node_level: 0,
      })
      .subscribe((result: any) => {
        this.isLoaded = false;
        this.reset();
        this.getType();
      });
  }
  getType() {
    this.getAllVanTypes().subscribe((item) => {
      this.typeList = item;
      this.isLoaded = true;
    });
  }

  addNewVanType() {
    this.showForm = true;
    this.reset();
  }

  public delete(data: any): void {
    this.subscriptions.push(
      this.apiService.deleteVanTypes(data.uuid).subscribe(() => {
        this.getType();
      })
    );
  }
}
