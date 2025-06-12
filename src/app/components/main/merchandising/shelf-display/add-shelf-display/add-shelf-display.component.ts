import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MerchandisingService } from '../../merchandising.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-shelf-display',
  templateUrl: './add-shelf-display.component.html',
  styleUrls: ['./add-shelf-display.component.scss']
})
export class AddShelfDisplayComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public shelfDisplayFormGroup;
  public shelfDisplaydata;
  private isEdit: boolean
  public formType: string;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  public customer: any[] = [];
  private subscriptions: Subscription[] = [];

  constructor(apiService: ApiService, private fb: FormBuilder, fds: FormDrawerService, public merService: MerchandisingService, dataEditor: DataEditor, public dialog: MatDialog,
    private router: Router) {
    Object.assign(this, { fds, apiService, merService, dataEditor });
  }
  public ngOnInit(): void {
    this.fds.formType.subscribe(s => this.formType = s);
    this.shelfDisplayFormGroup = this.fb.group({
      name: ['', [Validators.required]],
      validFrom: ['', [Validators.required]],
      validTo: ['', [Validators.required]],
      height: ['', [Validators.required]],
      width: ['', [Validators.required]],
      depth: ['', [Validators.required]],
      customers: ['', [Validators.required]],
    });
    // this.subscriptions.push(this.apiService.getCustomers().subscribe((res: any) => {
    //   this.customer = res.data;
    // }));

    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customer = result.data.customers.map(item => {
          return {
            ...item,
            lastname: item.lastname + ' - ' + item.customer_info.customer_code
          }
        })
      })
    );

    this.fds.formType.subscribe(s => {
      this.formType = s
      this.shelfDisplayFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      }
      else {
        this.isEdit = true;
      }
      this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
        const data: any = result.data;

        if (data && data.uuid && this.isEdit) {
          let customerObj = [];

          data.distribution_customer.forEach((element) => {
            customerObj.push({ id: element.customer_id, itemName: `${element.customer?.firstname} ${element.customer?.lastname}` });
          });

          this.shelfDisplayFormGroup.patchValue({
            name: data.name,
            validFrom: data.start_date,
            validTo: data.end_date,
            height: data.height,
            width: data.width,
            depth: data.depth,
            customers: customerObj,
          })
          this.shelfDisplaydata = data;
          this.isEdit = true;
        }

        return;
      }));
    });
  }

  public close() {
    this.fds.close();
    this.shelfDisplayFormGroup.reset();
    this.isEdit = false;
  }
  public saveshelfDisplayData(): void {
    if (this.shelfDisplayFormGroup.invalid) {

      return;
    }

    if (this.isEdit) {
      this.editshelfDisplayData();

      return;
    }

    this.postshelfDisplayData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postshelfDisplayData() {
    let form = this.shelfDisplayFormGroup.value;
    let customers = [];
    if (form.customers && form.customers.length > 0) {
      customers = form.customers.map(x => x.id);
    }

    form.status = 1;
    let sForm = {
      name: form.name,
      start_date: form.validFrom,
      end_date: form.validTo,
      height: form.height,
      width: form.width,
      depth: form.depth,
      customer: customers,
      status: form.status
    }
    this.merService.addshelfDisplay(sForm).subscribe((result: any) => {
      let data = result.data;
      data.edit = false;
      this.updateTableData.emit(data);
      this.close();
    });
  }

  private editshelfDisplayData(): void {
    let form = this.shelfDisplayFormGroup.value;
    let customers = [];
    if (form.customers && form.customers.length > 0) {
      customers = form.customers.map(x => x.id);
    }
    form.status = 1;
    let sForm = {
      name: form.name,
      start_date: form.validFrom,
      end_date: form.validTo,
      height: form.height,
      width: form.width,
      depth: form.depth,
      customer: customers,
      status: form.status
    }
    this.merService.editshelfDisplay(this.shelfDisplaydata.uuid, sForm).subscribe((result: any) => {
      this.isEdit = false;
      let data = result.data;
      data.edit = true;
      this.updateTableData.emit(data);
      this.close();
    });
  }

}
