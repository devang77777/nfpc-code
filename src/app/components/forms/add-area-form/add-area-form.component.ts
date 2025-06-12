import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';

@Component({
  selector: 'app-add-area-form',
  templateUrl: './add-area-form.component.html',
  styleUrls: ['./add-area-form.component.scss']
})
export class AddAreaFormComponent implements OnInit, OnDestroy {
  public areaFormGroup: FormGroup;
  public depotIdFormControl: FormControl;
  public areaCodeFormControl: FormControl;
  public areaNameFormControl: FormControl;
  public areaManagerFormControl: FormControl;
  public areaManagerContactFormControl: FormControl;
  public depots: any;
  public formType: string;

  private isEdit: boolean;
  private areaData: any;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  constructor(fds: FormDrawerService, apiService: ApiService, dataEditor: DataEditor, public dialog: MatDialog) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe(s => this.formType = s);
    this.depotIdFormControl = new FormControl('', [Validators.required]);
    this.areaCodeFormControl = new FormControl('', [Validators.required]);
    this.areaNameFormControl = new FormControl('', [Validators.required]);
    this.areaManagerFormControl = new FormControl('', [Validators.required]);
    this.areaManagerContactFormControl = new FormControl('');

    this.areaFormGroup = new FormGroup({
      areaCode: this.areaCodeFormControl,
      areaName: this.areaNameFormControl,
      depotId: this.depotIdFormControl,
      areaManager: this.areaManagerFormControl,
      areaManagerContact: this.areaManagerContactFormControl
    });
    this.subscriptions.push(this.apiService.getAllDepots().subscribe((result: any) => {
      this.depots = result.data;
      //console.log(this.depots);

    }));
    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      const data: any = result.data;
      if (data && data.uuid) {
        this.depotIdFormControl.setValue(data.depot_id);
        this.areaCodeFormControl.setValue(data.area_code);
        this.areaNameFormControl.setValue(data.area_name);
        this.areaManagerFormControl.setValue(data.area_manager);
        this.areaManagerContactFormControl.setValue(data.area_manager_contact);

        // this.categoryFormControl.setValue(data.van_category_id);
        this.areaData = data;
        this.isEdit = true;
      }
      return;
    }));
  }
  public close() {
    this.fds.close();
    this.areaFormGroup.reset();
    this.isEdit = false;
  }

  public saveAreaData(): void {
    if (this.areaFormGroup.invalid) {
      Object.keys(this.areaFormGroup.controls).forEach(key => {
        this.areaFormGroup.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEdit) {
      this.editAreaData();

      return;
    }

    this.postAreaData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postAreaData(): void {
    //console.log(this.areaFormGroup.value);
    this.apiService.addArea({
      depot_id: this.depotIdFormControl.value,
      area_code: this.areaCodeFormControl.value,
      area_name: this.areaNameFormControl.value,
      area_manager: this.areaManagerFormControl.value,
      area_manager_contact: this.areaManagerContactFormControl.value,
      status: "1"
    }).subscribe((result: any) => {
      this.fds.close().then(success => {
        window.location.reload();
      });
    }, err => {
      alert(err.error.message);
    });
  }

  private editAreaData(): void {
    this.apiService.editArea(this.areaData.uuid, {
      depot_id: this.depotIdFormControl.value,
      area_code: this.areaCodeFormControl.value,
      area_name: this.areaNameFormControl.value,
      area_manager: this.areaManagerFormControl.value,
      area_manager_contact: this.areaManagerContactFormControl.value,
      status: "1"
    }).subscribe((result: any) => {
      this.isEdit = false;
      this.fds.close().then(success => {
        window.location.reload();
      });
    }, err => {
      alert(err.error.message);
    });
  }
  open() {
    let data = {
      title: 'Area Code',
      functionFor: 'bank_information',
      code: this.areaCodeFormControl.value
    };

    this.dialog.open(CodeDialogComponent, {
      width: '500px',
      height: '340px',
      data: data
    })
  }
}


//   onSubmit() {
//     //console.log(JSON.stringify(this.areaForm.value));
//     this.apiService.addArea(JSON.stringify(this.areaForm.value)).subscribe(res => {
//       //console.log(res);
//       window.location.reload();
//     })
//   }
//   getDepots() {
//     this.apiService.getAllDepots().subscribe((res: any) => {
//       this.depots = res.data
//     })
//   }
//   close() {
//     this.fds.close()
//   }

// }
