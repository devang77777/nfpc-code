import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CollectionModel, InfoModal } from '../collection-models';
import {
  OrderModel,
  apiOrderMapper,
} from 'src/app/components/main/transaction/orders/order-models';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CollectionService } from '../collection.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DomSanitizer } from '@angular/platform-browser';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss'],
})
export class CollectionDetailComponent implements OnInit, OnDestroy {
  public uuid: string;
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public collectionData: any;
  @Input() public invoiceData: any;
  @Input() public isDetailVisible: boolean;
  @Output() public toggleHistory: EventEmitter<any> = new EventEmitter<any>();
  emailData: any;
  public tableHeaders: InfoModal[] = [];
  public invoices = [];
  private dataService: DataEditor;
  private collectionService: CollectionService;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  public isEditDelete: boolean = false;
  public invoicesFormGroups: FormArray;
  public selectedInvoicesFormGroups: FormArray;
  public enableManual = false;
  private formBuilder: FormBuilder;
  public discount: FormControl;
  public clearAmt: FormControl;
  public shelf_rent: FormControl;
  public allocatedAmount: FormControl;
  public isEdit: boolean = false;
  public showAddInvoice: boolean = false;
  public showEditInvoice: boolean = true;
  public hasApprovalPending: boolean = false;
  public displayedColumns = ['customer_code', 'customername', 'invoicenumber', 'grand_total', 'pending_amount', 'itype', 'paid_amount', 'Action'];
  public displayedInvoiceColumns = ['select', 'customer_code', 'customername', 'invoicenumber', 'grand_total', 'pending_amount', 'itype'];
  public disableInvoiceChecbox: boolean = false;
  collectionTemplate: any;
  private sanitizer: DomSanitizer;
  allocatedAmountFormControl: FormControl = new FormControl('');
  selectedInvoiceDataSource: MatTableDataSource<any>;
  invoiceDataSource: MatTableDataSource<any>;
  @ViewChild('selectedInvoiceMatPaginator', { static: true }) selectedInvoicePaginator: MatPaginator;
  @ViewChild('invoiceMatPaginator', { static: true }) invoicePaginator: MatPaginator;
  selectedColumnFilter: any;
  filterColumnName: any;
  checkboxStates = {};
  paidAmountArr = {};
  constructor(
    public apiService: ApiService,
    collectionService: CollectionService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    sanitizer: DomSanitizer,
    private commonToasterService: CommonToasterService
  ) {
    Object.assign(this, {
      apiService,
      collectionService,
      dataService,
      dialogRef,
      elemRef,
      formBuilder,
      router,
      route,
      sanitizer,
    });

    this.selectedInvoiceDataSource = new MatTableDataSource<any>();
    this.invoiceDataSource = new MatTableDataSource<any>();

  }

  public ngOnInit(): void {
    this.discount = new FormControl('');
    this.clearAmt = new FormControl('');
    this.shelf_rent = new FormControl('');
    this.allocatedAmount = new FormControl('');
    this.tableHeaders = [...INVOICE_TABLE_HEADERS];
    this.tableHeaders.splice(5, 0, { id: 4, name: 'Pending Amount' });
  }

  onToggleHistory() {
    this.toggleHistory.emit(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("render");
    console.log(this.invoiceData);
    this.allocatedAmountFormControl.setValue(0);

    if (changes.collectionData?.currentValue != changes.collectionData?.previousValue) {
      this.initForm(changes.collectionData.currentValue);
      this.uuid = this.collectionData.uuid;
      this.hasApprovalPending =
        this.collectionData.need_to_approve == 'yes' ? true : false;
      this.isEditDelete =
        this.collectionData.current_stage == 'Approved' ? false : true;

      this.clearAmt.setValue(this.collectionData?.invoice_amount);
      this.discount.setValue(this.collectionData.discount);
      if (this.collectionData.id) {
        this.getDocument('print');
      }
    }
    if (changes.invoiceData?.currentValue !== changes.invoiceData?.previousValue) {
      var _invoices = this.collectionData.collectiondetails;
      this.invoices = [];
      var obj = this;
      this.invoiceData.forEach((element, key) => {
        element.position = key;
        obj.checkboxStates[key] = false

      });
      var allocatedAmount = 0;
      _invoices.forEach(function (invoice) {
        if (invoice.type == 3) {
          invoice.itype = "Credit";
          invoice.pending_amount = -Math.abs(invoice.pending_amount);
          invoice.amount = -Math.abs(invoice.amount);
          invoice.invoice = invoice.credit_note;
          if (invoice.credit_note)
            invoice.invoice["invoice_number"] = invoice.credit_note?.credit_note_number
        } else if (invoice.type == 1) {
          invoice.itype = "Invoice";
        } else {
          invoice.itype = "Debit";
          invoice.invoice = invoice.debit_note
          if (invoice.debit_note)
            invoice.invoice["invoice_number"] = invoice.debit_note?.debit_note_number
        }

        var _invoiceData = obj.invoiceData.find(x => x.invid == invoice.invoice_id && x.itype == invoice.itype);
        var _invoiceDataIndex = obj.invoiceData.findIndex(x => x.invid == invoice.invoice_id && x.itype == invoice.itype);
        if (_invoiceData) {
          obj.checkboxStates[_invoiceDataIndex] = true

          // obj.invoiceData.splice(_invoiceDataIndex, 1);
          _invoiceData.paid_amount = invoice.amount;

        } else {
          _invoiceData = {
            customer_code: invoice.customer?.customer_info?.customer_code,
            customer_group_id: null,
            customer_id: invoice.customer?.id,
            customername: invoice.customer?.firstname + " " + invoice.customer?.lastname,
            grand_total: invoice.amount,
            invdate: invoice.created_at,
            invduedate: invoice.created_at,
            invid: invoice.invoice_id,
            invoicenumber: invoice.invoice?.invoice_number,
            itype: invoice.itype,
            lob_id: null,
            pending_amount: Number(invoice.amount) + Number(invoice.pending_amount),
            paid_amount: invoice.amount,
            position: obj.invoiceData.length
          }
          obj.invoiceData.push(_invoiceData);
          obj.checkboxStates[_invoiceData.position] = true

        }
        allocatedAmount = allocatedAmount + Number(invoice.amount);
        obj.paidAmountArr[_invoiceData.position] = _invoiceData.paid_amount;
        obj.invoices.push(_invoiceData);
      });
      this.allocatedAmountFormControl.setValue(allocatedAmount.toFixed(2));
      // this.collectionData.invoice_amount = allocatedAmount.toFixed(2);
      this.collectionData.invoice_amount = Number(allocatedAmount.toFixed(2)) - (Number(this.discount.value));

      this.clearAmt.setValue(allocatedAmount.toFixed(2));

      this.sortInvoice();

      this.selectedInvoiceDataSource = new MatTableDataSource(this.invoices);
      this.selectedInvoiceDataSource.paginator = this.selectedInvoicePaginator;

      this.invoiceDataSource = new MatTableDataSource(this.invoiceData);
      this.invoiceDataSource.paginator = this.invoicePaginator;



      // if ((Number(this.allocatedAmountFormControl.value)) == Number(this.collectionData.invoice_amount)) {
      //   this.disableInvoiceChecbox = true;
      // }
      // this.setupSelectedInvoicesFormControl(this.invoices);

      // this.setupInvoicesFormControl(this.invoiceData);
    }

    // this.openInvoiceDetail();
  }
  public ngOnDestroy() { }
  getPaymentName(id) {
    switch (id) {
      case '1':
        return 'cash';
        break;
      case '2':
        return 'check';
        break;
      case '3':
        return 'Advance Payment';
      default:
        return 'Unknown';
        break;
    }
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an collection`;
    const message = `${orgName} sent you an collection`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'collection',
    };
  }
  getDocument = (type) => {
    const model = {
      id: this.collectionData.id,
    };
    if (type == 'pdf') {
      model['status'] = 'pdf';
    }
    this.collectionService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.collectionTemplate = this.sanitizer.bypassSecurityTrustHtml(
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
  editTable() {
    this.isEdit = true;
  }

  deleteItemRow(invoice) {

    let i = this.invoices.findIndex(x => x.position == invoice.position);
    var element = this.invoices[i];

    this.invoices.splice(i, 1);
    // this.invoiceData.push(element);
    this.sortInvoice();
    this.resetSelectedInvoiceList();
    setTimeout(() => {
      if (invoice.position)
        this.paidAmountArr[invoice.position] = 0;
      this.checkboxStates[invoice.position] = false;

    }, 100);
    this.selectedInvoiceDataSource = new MatTableDataSource(this.invoices);
    this.selectedInvoiceDataSource.paginator = this.selectedInvoicePaginator;

    this.invoiceDataSource = new MatTableDataSource(this.invoiceData);
    this.invoiceDataSource.paginator = this.invoicePaginator;

    // if ((Number(this.allocatedAmountFormControl.value)) < Number(this.collectionData.invoice_amount)) {
    //   this.disableInvoiceChecbox = false;
    // }
  }

  sortInvoice() {
    var debitArray = [];
    var creditArray = [];
    var invoiceArray = [];
    this.invoices.forEach(x => {
      switch (x.itype) {
        case 'Debit':
          debitArray.push(x);
          break;
        case 'Credit':
          creditArray.push(x);
          break;
        case 'Invoice':
          invoiceArray.push(x);
          break;
      }
    });
    this.invoices = [...creditArray, ...invoiceArray, ...debitArray];
  }

  updatePaidBal(ev, invoice) {
    if (ev.checked == true) {
      this.invoiceData.map((x, k) => {
        if (invoice.position == x.position) {
          this.invoices.push(x);
          this.sortInvoice();
          this.checkPaidAmount(x, x.pending_amount);
        }
      });
    } else {
      var _invoiceDataIndex = this.invoices.findIndex(x => x.position == invoice.position);
      if (_invoiceDataIndex > -1) {
        this.invoices.splice(_invoiceDataIndex, 1);
        this.sortInvoice();
        this.resetSelectedInvoiceList();
        setTimeout(() => {
          this.selectedInvoiceDataSource = new MatTableDataSource(this.invoices);
          this.selectedInvoiceDataSource.paginator = this.selectedInvoicePaginator;

        }, 100);

      }
    }

  }

  checkPaidAmount(invoice, value) {
    value = Number(value);
    invoice.paid_amount = value;
    this.paidAmountArr[invoice.position] = value;

    let i = this.invoices.findIndex(item => item.position == invoice.position);
    let _invoice = this.invoices.filter(item => item.position != invoice.position);

    var allocatedAmount = 0;
    var shelf_rent = 0;
    _invoice.forEach(x => {

      if (x.itype !== "Debit") {
        allocatedAmount = allocatedAmount + Number(x.paid_amount);
      } else {
        shelf_rent = shelf_rent + Math.abs(x.paid_amount);
      }

    });
    this.allocatedAmountFormControl.setValue(allocatedAmount.toFixed(2));
    this.collectionData.invoice_amount = Number(allocatedAmount.toFixed(2)) - (Number(this.discount.value));

    this.clearAmt.setValue(allocatedAmount.toFixed(2));

    if (invoice.itype == "Credit" || invoice.itype == "Debit") {
      invoice.paid_amount = -Math.abs(value);

      if (-Math.abs(Number(invoice.pending_amount)) > value) {
        invoice.paid_amount = -Math.abs(Number(invoice.pending_amount));
      }
      this.paidAmountArr[invoice.position] = invoice.paid_amount;

      if (invoice.itype == "Debit") {
        shelf_rent = shelf_rent + Math.abs(invoice.paid_amount);
      }

    } else {

      if (Number(invoice.pending_amount) < value) {
        invoice.paid_amount = Number(invoice.pending_amount);
      } else {
        if (value < 0) {
          value = 0;
        }
        invoice.paid_amount = value;
      }

      this.paidAmountArr[invoice.position] = invoice.paid_amount;
    }

    if (invoice.itype != "Debit") {
      allocatedAmount = (Number(this.allocatedAmountFormControl.value) + Number(invoice.paid_amount));
      this.allocatedAmountFormControl.setValue(allocatedAmount.toFixed(2));
      this.clearAmt.setValue(allocatedAmount.toFixed(2));
      if (invoice.position)
        this.paidAmountArr[invoice.position] = invoice.paid_amount;
      this.invoices[i] = invoice;

    }
    this.collectionData.invoice_amount = Number(allocatedAmount.toFixed(2)) - (Number(this.discount.value)) - shelf_rent;
    this.shelf_rent.setValue(-Math.abs(shelf_rent).toFixed(2));

    this.selectedInvoiceDataSource = new MatTableDataSource();
    this.selectedInvoiceDataSource = new MatTableDataSource(this.invoices);
    this.selectedInvoiceDataSource.paginator = this.selectedInvoicePaginator;

  }

  resetSelectedInvoiceList() {

    var amount = 0 + Number(this.collectionData.invoice_amount);
    var allocateAmount = 0;
    var shelf_rent = 0;
    this.invoices.forEach((item) => {
      item.paid_amount = Number(item.paid_amount);
      this.paidAmountArr[item.position] = item.paid_amount;
      if (item.itype != "Debit") {
        if (item.itype == 'Invoice') {
          allocateAmount = (allocateAmount + parseFloat(item.paid_amount))
        }
        if (item.itype == 'Credit') {
          if (allocateAmount <= 0) {
            allocateAmount = (allocateAmount + parseFloat(item.paid_amount))
          } else
            allocateAmount = allocateAmount - parseFloat(item.paid_amount)
        }

      }

      if (item.itype == "Debit") {
        shelf_rent = shelf_rent + Math.abs(item.paid_amount);
      }

    });

    this.shelf_rent.setValue(-Math.abs(shelf_rent).toFixed(2));
    this.allocatedAmountFormControl.setValue(allocateAmount.toFixed(2));
    this.collectionData.invoice_amount = Number(allocateAmount.toFixed(2)) - (Number(this.discount.value)) - Math.abs(this.shelf_rent.value);
    this.clearAmt.setValue(allocateAmount.toFixed(2));

  }
  public get invoiceForms(): AbstractControl[] {
    return this.invoicesFormGroups.controls;
  }

  public get selecteInvoiceForms(): AbstractControl[] {
    return this.selectedInvoicesFormGroups.controls;
  }


  public clearInvoice(index: number): void {
    this.invoices.splice(index, 1);
    this.invoicesFormGroups.removeAt(index);
  }
  saveDetail() {

  }
  saveRelease() {
    let body = {
      "collection_status": "Release",
      "collection_id": this.collectionData?.id
    }
    this.collectionService.addRelease(body).subscribe((res) => {
      this.commonToasterService.showSuccess(
        'Success',
        'Collection updated successfuly.'
      );
    })
  }
  saveBounce() {
    let body = {
      "collection_status": "Bounce",
      "collection_id": this.collectionData?.id
    }
    this.collectionService.addRelease(body).subscribe((res) => {
      this.commonToasterService.showSuccess(
        'Success',
        'Collection updated successfuly.'
      );
    })
  }

  savePost() {
    this.apiService.chequeActionOdoo(this.collectionData.uuid).subscribe((res) => {
      this.commonToasterService.showSuccess(
        'Success',
        'Collection updated successfuly.'
      );
    })
  }



  cancelEdit() {
    this.isEdit = false;
    // this.showAddInvoice = false;
    // this.showEditInvoice = true;
    // this.closeDetailView();
  }
  openInvoiceAddDetail() {
    this.showEditInvoice = true;
    this.showAddInvoice = false;
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.isEdit = false;
    this.showAddInvoice = false;
    this.showEditInvoice = true;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  approve() {
    if (this.collectionData && this.collectionData.objectid) {
      this.apiService.approveItem(this.collectionData.objectid)
        .subscribe((res: any) => {
          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.commonToasterService.showSuccess(
              'Approved',
              'Collection has been Approved'
            );
            this.hasApprovalPending = false;
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.collectionData.id }
            });
          }
        });
    }
  }

  reject() {
    if (this.collectionData && this.collectionData.objectid) {
      this.apiService
        .rejectItemApproval(this.collectionData.objectid)
        .subscribe((res: any) => {
          this.commonToasterService.showSuccess(
            'Reject',
            'Collection Approval has been Rejected'
          );
          this.hasApprovalPending = false;
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.collectionData.id }
          });
        });
    }
  }



  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
    this.filterColumnName = item;
  }
  onColumnFilter(item) {

  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    var r = this.filterColumnName;
    this.selectedInvoiceDataSource.filterPredicate = function (data: any, filterValue: string) {
      return data[r].trim().toLocaleLowerCase().indexOf(filterValue.trim().toLocaleLowerCase()) >= 0;
    };
    this.selectedInvoiceDataSource.filter = filterValue;

  }

  applyInvoiceFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    var r = this.filterColumnName;
    this.invoiceDataSource.filterPredicate = function (data: any, filterValue: string) {
      return data[r].trim().toLocaleLowerCase().indexOf(filterValue.trim().toLocaleLowerCase()) >= 0;
    };
    this.invoiceDataSource.filter = filterValue;

  }


  public saveCollection(): void {
    // if (Number(this.allocatedAmountFormControl.value) !== Number(this.collectionData.invoice_amount)) {
    //   return;
    // }
    const form = JSON.parse(JSON.stringify(this.collectionData));
    var array = [];
    var shelf_rent = 0;
    this.invoices.forEach(element => {
      var type;
      if (element.paid_amount !== 0) {
        if (element.itype == "Credit") {
          type = 3;
        } else if (element.itype == "Invoice") {
          type = 1;
        } else {
          type = 2;
          shelf_rent = Number(shelf_rent + Math.abs(element.paid_amount));
        }
        array.push({
          invoice_id: element.invid,
          amount: Math.abs(element.paid_amount),
          type: type,
          customer_id: this.collectionData.customer_id,
          lob_id: this.collectionData.lob_id || ""
        })

      }
    });
    form['items'] = array;
    form.collection_number = this.collectionData.value;
    form.invoice_amount = this.allocatedAmountFormControl.value - shelf_rent - this.discount.value;
    form.shelf_rent = shelf_rent;
    form.allocate_amount = this.allocatedAmountFormControl.value;
    form.cleared_amount = this.clearAmt.value;
    form.source = 3;
    form.discount = this.discount.value;
    form.collection_number = this.collectionData.collection_number;
    // form.collection_type = this.collectionData.payemnt_type;
    // form.payemnt_type = this.collectionData.collection_type;
    console.log('Form', form);
    this.collectionService.editCollectionByKey(this.collectionData.uuid, form).subscribe(
      (response) => {
        this.closeDetailView();
      },
      (error) => { }
    );
  }

  applyDiscount(value) {
    this.collectionData.invoice_amount = Number(this.allocatedAmountFormControl.value) - Number(value) - Math.abs(this.shelf_rent.value);
  }

}

const INVOICE_TABLE_HEADERS: InfoModal[] = [
  { id: 0, name: '#' },
  { id: 1, name: 'Customer Code' },
  { id: 2, name: 'Customer Name' },
  { id: 3, name: 'Invoice Number' },
  { id: 5, name: 'Total Amount' },
  { id: 6, name: 'Paid Amount' },
];
