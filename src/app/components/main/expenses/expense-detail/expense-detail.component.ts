import { ExpenseService } from './../expense.service';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
} from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import {
  CompDataServiceType,
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { Expenses } from '../expensesdt/expensesdt.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss'],
})
export class ExpenseDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public expense: Expenses | any;
  @Input() public isDetailVisible: boolean;
  emailData: any;
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  private sanitizer: DomSanitizer;
  expenseTemplate: any;
  expensService: ExpenseService;

  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    private cts: CommonToasterService,
    dataService: DataEditor,
    expensService: ExpenseService,
    formDrawer: FormDrawerService,
    sanitizer: DomSanitizer
  ) {
    super('Expenses');
    Object.assign(this, {
      apiService,
      sanitizer,
      expensService,
      deleteDialog,
      dataService,
      formDrawer,
    });
  }

  ngOnInit(): void {
    // this.getDocument('print');
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.expense?.currentValue != changes.expense?.previousValue) {
      this.initForm(changes.expense.currentValue);
      if (!this.expenseTemplate) {
        this.getDocument('print');
      }
    }
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an expense`;
    const message = `${orgName} sent you an expense`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'expense',
    };
  }
  public openEditexpense(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.expense,
    });
    this.formDrawer.setFormName('add-expense');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteBank();
        }
      });
  }

  public deleteBank(): void {
    this.apiService.deleteExpenses(this.expense.uuid).subscribe((result) => {
      this.cts.showInfo('Expense deleted sucessfully');
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({
        type: CompDataServiceType.CLOSE_DETAIL_PAGE,
        uuid: this.expense.uuid,
      });
    });
  }
  getDocument = (type) => {
    const model = {
      id: this.expense.id,
    };
    if (type == 'pdf') {
      model['status'] = 'pdf';
    }
    this.expensService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.expenseTemplate = this.sanitizer.bypassSecurityTrustHtml(
            res.data.html_string
          );
        } else {
          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.setAttribute('href', `${res.data.file_url}`);
          link.setAttribute('download', `statement.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      }
    });
  };
  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
