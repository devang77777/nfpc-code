import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-tax-rates',
  templateUrl: './add-tax-rates.component.html',
  styleUrls: ['./add-tax-rates.component.scss']
})
export class AddTaxRatesComponent implements OnInit {

  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public taxFormGroup;

  private isEdit: boolean;
  public formType: string;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  public items: any[] = [];
  private subscriptions: Subscription[] = [];
  destributionData = [];
  taxData: any;

  constructor(
    private fb: FormBuilder,
    fds: FormDrawerService,
    public apiService: ApiService,
    dataEditor: DataEditor,
    private router: Router
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }
  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => (this.formType = s));
    this.taxFormGroup = this.fb.group({
      name: ['', [Validators.required]],
      rate: ['', [Validators.required]],
      type: [''],
    });

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.taxFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
        const data: any = result.data;

        if (data && data.uuid && this.isEdit) {
          this.taxFormGroup.patchValue({
            name: data.name,
            rate: data.rate,
            type: data.type,
          })
          this.taxData = data;
          this.isEdit = true;
        }
        return;
      }));
    });
  }
  public saveTaxData() {
    if (this.taxFormGroup.invalid) {
      return false;
    }
    let form = this.taxFormGroup.value;
    let sForm = {
      name: form.name,
      rate: form.rate,
      type: form.type,
      status: 1,
    };

    if (this.isEdit) {
      this.editTaxData(sForm);
      return;
    }

    this.postTaxData(sForm);

  }

  postTaxData(sForm) {
    this.subscriptions.push(
      this.apiService.addTax(sForm).subscribe((res) => {
        let data = res.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      })
    );
  }

  editTaxData(sForm) {
    this.subscriptions.push(
      this.apiService.editTax(this.taxData.uuid, sForm).subscribe((res) => {
        let data = res.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      })
    );
  }

  public close() {
    this.fds.close();
    this.taxFormGroup.reset();
    this.isEdit = false;
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
