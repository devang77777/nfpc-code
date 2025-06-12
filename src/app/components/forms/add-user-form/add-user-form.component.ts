import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';

@Component({
  selector: 'app-add-user-form',
  templateUrl: './add-user-form.component.html',
  styleUrls: ['./add-user-form.component.scss']
})
export class AddUserFormComponent implements OnInit {
  isFirst = false;
  roles;
  isEdit: boolean;
  userData: any;
  warehouseList: any = [];
  editData: any;
  selectedItems: any;
  dropdownSettings = {}
  constructor(
    private apiService: ApiService,
    private fds: FormDrawerService,
    private dataEditor: DataEditor,
    private cdref: ChangeDetectorRef) {
    this.dropdownSettings = {
      singleSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: false,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom'
    };
    this.apiService.getwarehouseMainList().subscribe((result: any) => {
      this.warehouseList = result.data.map(i => ({ 'id': i.id, 'itemName': i.name + '-' + i.code }))
      if (this.editData?.user_branch_plant_assing && this.isEdit) {
        let userBranchPlant: any = [];
        userBranchPlant = this.editData.user_branch_plant_assing.map(i => ({ 'id': i.storagelocation.id, 'name': i.storagelocation.name, 'code': i.storagelocation.code }));
        this.user_branch_plant.setValue(userBranchPlant);
      }
    });
  }
  inviteUserFormGroup: FormGroup;

  ngOnInit(): void {

    this.apiService.getAllOrganisationRoles().subscribe(data => {
      this.roles = data.data;
    })
    this.fds.formType.subscribe(res => {
      if (res == "Edit") {
        this.isEdit = true;
      }
      else {
        this.isEdit = false;
      }
    })

    this.dataEditor.newData.subscribe(result => {
      const data: any = result.data;
      this.editData = data;
      if (data && data.uuid) {
        if (data?.firstname) {
          this.firstname.setValue(data?.firstname);
        } else {
          this.firstname.setValue(data?.user?.firstname);
        }

        if (data?.lastname) {
          this.lastname.setValue(data?.lastname);
        } else {
          this.lastname.setValue(data?.user?.lastname);
        }

        if (data?.email) {
          this.email.setValue(data?.email);
        } else {
          this.email.setValue(data?.user?.email);
        }

        if (data?.mobile) {
          this.mobile.setValue(data?.mobile);
        } else {
          this.mobile.setValue(data?.user?.mobile);
        }


        this.role_id.setValue(data?.role_id);
        this.email.disable;
        this.userData = data;
        this.isEdit = true;
      }
      return;
    });
    this.inviteUserFormGroup = new FormGroup({
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      mobile: new FormControl('', Validators.required),
      role_id: new FormControl('', Validators.required),
      status: new FormControl(1),
      user_branch_plant: new FormControl([])
    })
  }

  get firstname() {
    return this.inviteUserFormGroup.get('firstname') as FormControl;
  }
  get lastname() {
    return this.inviteUserFormGroup.get('lastname') as FormControl;
  }
  get email() {
    return this.inviteUserFormGroup.get('email') as FormControl;
  }
  get mobile() {
    return this.inviteUserFormGroup.get('mobile') as FormControl;
  }
  get role_id() {
    return this.inviteUserFormGroup.get('role_id') as FormControl;
  }
  get user_branch_plant() {
    return this.inviteUserFormGroup.get('user_branch_plant') as FormControl;
  }
  inviteUser() {
    this.firstname.markAsDirty;
    this.lastname.markAsDirty;
    this.email.markAsDirty;
    this.mobile.markAsDirty;
    this.role_id.markAsDirty;
    if (this.inviteUserFormGroup.valid) {
      this.inviteUserFormGroup.value.user_branch_plant = this.inviteUserFormGroup.value.user_branch_plant.map(i => i.id)
      if (this.isEdit) {
        let requestPayload = {
          firstname: this.inviteUserFormGroup.value.firstname,
          lastname: this.inviteUserFormGroup.value.lastname,
          mobile: this.inviteUserFormGroup.value.mobile,
          role_id: this.inviteUserFormGroup.value.role_id,
          status: 1,
          user_branch_plant: this.inviteUserFormGroup.value.user_branch_plant
        }
        this.apiService.updateInviteUser(this.userData.uuid, requestPayload).subscribe((res) => {
          this.close();
        })
      }
      else {
        this.apiService.inviteUser(this.inviteUserFormGroup.value).subscribe((res) => {
          //console.log(res);
          this.close();
        })
      }
    }
    else {

    }

  }
  close() {
    this.inviteUserFormGroup.reset();
    this.fds.close();
    this.fds.setFormType('user');
    this.isFirst = false;
  }
  ngAfterContentChecked() {
    if (this.editData?.user_branch_plant_assing.length > 0 && !this.isFirst) {
      this.isFirst = true;
      this.selectedItems = this.editData?.user_branch_plant_assing.map(i => ({ 'id': i.storagelocation.id, 'itemName': i.storagelocation.code + ' - ' + i.storagelocation.name }));
    }
    this.cdref.detectChanges();
  }
}
