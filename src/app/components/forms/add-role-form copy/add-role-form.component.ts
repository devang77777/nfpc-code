import { distinctUntilChanged } from 'rxjs/operators';
import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-add-role-form',
  templateUrl: './add-role-form.component.html',
  styleUrls: ['./add-role-form.component.scss'],
})
export class AddRoleFormComponent implements OnInit, OnDestroy {
  public roleFormGroup: FormGroup;
  public formType: string;
  uuid: string;
  private isEdit: boolean = false;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  selectedPermission = [];
  reportNavOptions = [];
  private subscriptions: Subscription[] = [];
  permissions: any[] = [];
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    fb: FormBuilder
  ) {
    Object.assign(this, { fds, apiService, dataEditor, fb });
    this.getReportList();
  }

  ngOnInit(): void {
    this.roleFormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      modules: new FormArray([]),
    });



    this.subscriptions.push(
      this.fds.formType.subscribe((x) => {
        this.formType = x;
        this.subscriptions.push(
          this.dataEditor.newData.subscribe(async (result) => {
            const data: any = result.data;
            if (this.formType == 'Add') {
              this.isEdit = false;
              this.uuid = null;
              if (this.permissions.length == 0) {
                await this.getPermission();
              }
            } else if (this.formType === 'Clone') {
              this.bindData(data, 'clone');
              this.isEdit = false;
            } else if (this.formType == 'Edit') {
              this.bindData(data, 'edit');
              this.uuid = data.uuid;
              this.isEdit = true;
            }
          })
        );
      })
    );
  }
  async bindData(data, type) {
    await this.getPermission();
    let assignedPermissions: any[] = data.organisation_role_has_permissions;
    const formArray = this.roleFormGroup.get('modules') as FormArray;
    assignedPermissions.forEach((perm) => {
      const index = formArray.value.findIndex((x) => {
        return x.name.permissions.find((y) => y.id === perm.permission_id);
      });
      if (index > -1) {
        const checked = formArray.value[index].name.permissions.find(
          (x) => x.id === perm.permission_id
        );
        const key = checked.name.split('-').pop();
        formArray.controls[index].patchValue({ [key]: true });
      }
    });
    if (type == 'edit') {
      this.roleFormGroup.get('name').setValue(data.name);
    }

    this.roleFormGroup.get('description').setValue(data.description);
  }
  async getPermission() {
    const response = await this.apiService.getPermission().toPromise();
    this.permissions = response.data;
    this.initForm();
  }

  getReportList() {
    this.reportNavOptions = JSON.parse(localStorage.getItem('reportbar'));
    if (!this.reportNavOptions) {
      this.apiService.getReportNavOptions().subscribe((res: any[]) => {
        this.reportNavOptions = res;
        localStorage.setItem('reportbar', JSON.stringify(res));
      });
    }

  }


  initForm() {
    const formArray = this.roleFormGroup.get('modules') as FormArray;
    formArray.controls.length = 0;
    this.selectedPermission = [];
    this.roleFormGroup.patchValue({ name: '', description: '' });
    this.permissions.forEach((item, index) => {
      this.createForm(item, index);
    });
  }
  createForm(item, index) {
    const formArray = this.roleFormGroup.get('modules') as FormArray;
    let formGroup = new FormGroup({
      name: new FormControl(item),
      all: new FormControl(false),
      edit: new FormControl(false),
      add: new FormControl(false),
      delete: new FormControl(false),
      list: new FormControl(false),
    });

    formArray.push(formGroup);
    this.registerEvent(formArray.controls.length - 1);
  }
  onFullAccess(value, index) {
    //console.log(value, index);
    const formArray = this.roleFormGroup.get('modules') as FormArray;
    const data = formArray.controls[index].value;
    if (value.checked) {
      data.name.permissions.forEach((x) => {
        this.selectedPermission.push(x.id);
      });
    } else {
      const unCheckedArray = Object.keys(data).filter((x) => {
        return x != 'name' && x != 'all';
      });
      unCheckedArray.forEach((key) => {
        const permission = data.name.permissions.find((x) => {
          return x.name.split('-').pop() === key;
        });
        if (permission) {
          const updated = this.selectedPermission.filter(
            (x) => x !== permission.id
          );
          this.selectedPermission = JSON.parse(JSON.stringify(updated));
        }
      });
    }
    formArray.controls[index].patchValue(
      {
        edit: value.checked,
        add: value.checked,
        delete: value.checked,
        list: value.checked,
        all: value.checked,
      },
      { emitEvent: false }
    );
  }
  registerEvent(index) {
    const formArray = this.roleFormGroup.get('modules') as FormArray;
    const newFormGroup = formArray.controls[index] as FormGroup;

    newFormGroup.valueChanges
      .pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((item) => {
        const formArray = this.roleFormGroup.get('modules') as FormArray;
        const checkedArray = Object.keys(item).filter((x) => {
          return x != 'name' && x != 'all' && item[x] == true;
        });
        const unCheckedArray = Object.keys(item).filter((x) => {
          return x != 'name' && x != 'all' && item[x] == false;
        });
        if (checkedArray.length < 4 && checkedArray.length > 0 && item.all) {
          formArray.controls[index].patchValue(
            {
              all: false,
            },
            { onlySelf: true, emitEvent: false }
          );
        } else if (checkedArray.length == 4 && !item.all) {
          formArray.controls[index].patchValue(
            {
              all: true,
            },
            { onlySelf: true, emitEvent: false }
          );
        }

        checkedArray.forEach((key) => {
          const permission = item.name.permissions.find((x) => {
            return x.name.split('-').pop() === key;
          });
          if (permission) {
            this.selectedPermission.push(permission.id);
          }
        });
        unCheckedArray.forEach((key) => {
          const permission = item.name.permissions.find((x) => {
            return x.name.split('-').pop() === key;
          });
          if (permission) {
            const updated = this.selectedPermission.filter(
              (x) => x !== permission.id
            );
            this.selectedPermission = JSON.parse(JSON.stringify(updated));
          }
        });
      });
  }
  get modulesFormArray() {
    return this.roleFormGroup.controls.modules as FormArray;
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  getControls(module) {
    return Object.keys(module.controls).filter((x) => x != 'name');
  }
  createRole() {
    const selectedPermission = [...new Set(this.selectedPermission)];
    this.roleFormGroup.get('permissions');
    if (this.roleFormGroup.invalid) {
      return;
    }
    const model = this.roleFormGroup.value;
    model.permissions = selectedPermission;
    //console.log(model);
    if (this.isEdit) {
      this.apiService
        .editOrganisationRoles(this.uuid, model)
        .subscribe((res) => {
          this.close();
          this.selectedPermission = [];
          this.initForm();
        });
    } else {
      this.apiService.addOrganisationRoles(model).subscribe((res) => {
        this.close();
        this.selectedPermission = [];
        this.initForm();
      });
    }
  }

  public close() {
    this.initForm();
    this.fds.setFormName('role');
    this.fds.close();
  }

  checkAllowedPermission(label) {

    if (label == "Dashboard 1" || label == "Dashboard 2" || label == "Dashboard 3" || label == "Dashboard 4" || label == "Dashboard 5") {
      return true;
    }
    let res = this.reportNavOptions.find(x => x.label == label);
    return res ? true : false;
  }
}
