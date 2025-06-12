import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-expenses',
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.scss'],
})
export class AddExpensesComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  foods: Food[] = [
    {
      value: '1',
      viewValue: 'category1',
      routeValue: 'Customer1',
      bank: 'SBI',
    },
    {
      value: '2',
      viewValue: 'category2',
      routeValue: 'Customer2',
      bank: 'BOI',
    },
    {
      value: '3',
      viewValue: 'category3',
      routeValue: 'Customer3',
      bank: 'ICICI',
    },
  ];
  public expenseFormGroup: FormGroup;
  public categoryFormControl: FormControl;
  public DateFormControl: FormControl;
  private isEdit: boolean;
  public amoounteFormControl: FormControl;
  public referenceFormControl: FormControl;
  public noteFormControl: FormControl;
  public customerFormControl: FormControl;
  public expensedata: any;
  public opencashiertable: boolean = false;
  public formType: string;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  public expenseCategiry: any[] = [];
  public customer: any[] = [];
  private subscriptions: Subscription[] = [];
  depots: any;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private router: Router
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => (this.formType = s));
    this.categoryFormControl = new FormControl('', [Validators.required]);
    this.DateFormControl = new FormControl('', [Validators.required]);
    this.amoounteFormControl = new FormControl('', [Validators.required]);
    this.referenceFormControl = new FormControl('');
    this.noteFormControl = new FormControl('');
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.expenseFormGroup = new FormGroup({
      date: this.DateFormControl,
      amount: this.amoounteFormControl,
      category: this.categoryFormControl,
      reference: this.referenceFormControl,
      note: this.noteFormControl,
      customer: this.customerFormControl,
    });
    this.apiService.expenseCategory().subscribe((res: any) => {
      this.expenseCategiry = res.data;
    });
    this.apiService.getCustomers().subscribe((res: any) => {
      this.customer = res.data;
    });

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.expenseFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;

          if (data && data.uuid && this.isEdit) {
            this.categoryFormControl.setValue(data.expense_category_id);
            this.customerFormControl.setValue(data.customer_id);
            this.DateFormControl.setValue(data.expense_date);
            this.referenceFormControl.setValue(data.reference);
            this.amoounteFormControl.setValue(data.amount);
            this.noteFormControl.setValue(data.description),
              //this.areaManagerContactFormControl.setValue(data.area_manager_contact);

              // this.categoryFormControl.setValue(data.van_category_id);
              (this.expensedata = data);
            this.isEdit = true;
          }

          return;
        })
      );
    });
  }

  // public close() {
  //   this.router.navigate(['/expenses']);
  //   this.expenseFormGroup.reset();
  // }
  public close() {
    this.fds.close();
    this.expenseFormGroup.reset();
    this.isEdit = false;
  }
  public saveBankData(): void {
    if (this.expenseFormGroup.invalid) {
      return;
    }

    if (this.isEdit) {
      this.editBankData();

      return;
    }

    this.postBankData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postBankData(): void {
    ////console.log(this.bankFormGroup.value);
    this.apiService
      .addExpenses({
        expense_category_id: this.categoryFormControl.value,
        customer_id: this.customerFormControl.value,
        expense_date: this.DateFormControl.value,
        reference: this.referenceFormControl.value,
        description: this.noteFormControl.value,
        amount: this.amoounteFormControl.value,
        note: this.noteFormControl.value,
        status: 1,
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editBankData(): void {
    this.apiService
      .editExpense(this.expensedata.uuid, {
        expense_category_id: this.categoryFormControl.value,
        customer_id: this.customerFormControl.value,
        expense_date: this.DateFormControl.value,
        reference: this.referenceFormControl.value,
        description: this.noteFormControl.value,
        amount: this.amoounteFormControl.value,
        note: this.noteFormControl.value,
        status: 1,
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }
}
interface Food {
  value: string;
  viewValue: string;
  routeValue: string;
  bank: string;
}
