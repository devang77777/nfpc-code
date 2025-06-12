import { CommonToasterService } from './../../../../services/common-toaster.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-add-salesman',
  templateUrl: './add-salesman.component.html',
  styleUrls: ['./add-salesman.component.scss'],
})
export class AddSalesmanComponent implements OnInit {
  public bankFormGroup: FormGroup;
  public NameFormControl: FormControl;
  public emailFormControl: FormControl;
  nextCommingNumberofBankCode: string = '';

  public formType: string;

  private isEdit: boolean;
  private bankData: any;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  depots: any;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    private router: Router,
    private ctc: CommonToasterService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    // this.fds.formType.subscribe(s => this.formType = s);
    // this.fds.formType.subscribe(s => {
    //   this.formType = s
    //   if (this.bankFormGroup) {
    //     this.bankFormGroup.reset();
    //   }
    //   if (this.formType != 'Edit') {
    //     this.getBankCode()
    //     this.isEdit = false;
    //   }
    //   else {
    //     this.isEdit = true;
    //   }
    // });

    //
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.bankFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;

          if (data && data.uuid && this.isEdit) {
            this.NameFormControl.setValue(data.name);
            this.emailFormControl.setValue(data.email);
            //this.areaManagerContactFormControl.setValue(data.area_manager_contact);

            // this.categoryFormControl.setValue(data.van_category_id);
            this.bankData = data;
            this.isEdit = true;
          }

          return;
        })
      );
    });
    this.NameFormControl = new FormControl('', [Validators.required]);
    this.emailFormControl = new FormControl('', [Validators.required]);
    // this.areaManagerContactFormControl = new FormControl('', [Validators.required]);
    this.bankFormGroup = new FormGroup({
      name: this.NameFormControl,
      email: this.emailFormControl,
    });
  }

  public close() {
    this.fds.close();
    this.bankFormGroup.reset();
    this.isEdit = false;
  }

  public saveBankData(): void {
    if (this.bankFormGroup.invalid) {
      return;
    }

    if (this.isEdit) {
      return;
    }

    this.postBankData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postBankData(): void {
    //console.log(this.bankFormGroup.value);
    this.apiService
      .addSalesperson({
        name: this.NameFormControl.value,
        email: this.emailFormControl.value,
      })
      .subscribe((result: any) => {
        this.fds.close().then((success) => {
          this.ctc.showSuccess('', 'Navigate to Estimate');
          this.router.navigate(['/estimate/add']);
        });
      });
  }
}
