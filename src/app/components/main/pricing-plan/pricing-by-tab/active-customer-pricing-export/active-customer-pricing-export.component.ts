import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatRadioChange } from '@angular/material/radio';
import {CommonToasterService} from 'src/app/services/common-toaster.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { FormBuilder } from '@angular/forms';
type AOA = any[][];
@Component({
  selector: 'app-active-customer-pricing-export',
  templateUrl: './active-customer-pricing-export.component.html',
  styleUrls: ['./active-customer-pricing-export.component.scss']
})
export class ActiveCustomerPricingExportComponent implements OnInit {
  item_code: any = []
  public extractedData:any;
  @ViewChild('file') fileInput!: ElementRef<HTMLInputElement>;
  pipe = new DatePipe('en-US');
    private router: Router;
  public exportForm: FormGroup;
    public fieldList: any = [];
  public fileInfo: string;
  public filesList: File[] = [];
  public removable = true;
  public selected: string;
  public export: any = {};
  private datePipe: DatePipe
  public data: any = [];
  constructor(datePipe: DatePipe,
    private fb: FormBuilder,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private commonToasterService: CommonToasterService,) {
    Object.assign(this, { apiService });
  }

  ngOnInit(): void {
    // this.onRadioChange();

    this.exportForm = this.fb.group({
    type: [this.export.type, Validators.required],
    spci_price: [this.export?.spci_price || '2'],
    customer_file: [null, Validators.required]
  });

  // Watch for form value changes and sync to export object
  this.exportForm.get('type')?.valueChanges.subscribe(value => {
    this.export.type = value;
  });

  this.exportForm.get('spci_price')?.valueChanges.subscribe(value => {
    this.export.spci_price = value;
  });
    // this.exportForm = new FormGroup({
      
    //   type: new FormControl(''),
    //   fileType: new FormControl(''),
    //   spci_price: new FormControl(''),
    //   // startDate: new FormControl(''),
    //   // endDate: new FormControl('')
    // })

  }

  exportPricing(type) {
    const file_type = 'csv';
   const scopeMap  = { '0': 'all_pricing', '1': 'specific_pricing' } as const;
  const statusMap = { '2': 'active', '3': 'inactive', '4': 'both' } as const;

  // Fix: Convert values to strings before lookup
  const scopeLabel  = scopeMap[String(this.export.type)] ?? 'all_pricing';
  const statusLabel = statusMap[String(this.export.spci_price)] ?? 'both';

    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    const criteria =  'all'; 
    // if (type === 'csv') {
    //   type = 'csv';
    // } else {
    //   type = 'xls';
    // }
    
   // Helper function to handle null/undefined/empty values
 this.extractedData = (this.data || [])
  .filter(row => row.length >= 1) // keep at least one column
  .map(row => ({
    customer_code: row[0] || "",   // first column
    item_code: row[1] || ""        // second column (if missing, set to "")
  }));
  //   this.item_code: this.export.value.item_code?.length
  // ? this.export.value.item_code.map((item: any) => item.id)
  // : [],
    this.apiService
      .exportCustomers({
        module: 'customer-based-price-active',
        criteria: criteria,
        // criteria:           scopeLabel,   // "all_pricing" | "specific_pricing"
      pricing_status:     statusLabel,  
        start_date: '',
        end_date: '',
        file_type: file_type,
        is_password_protected: 'no',
        customer_id: '',
        item_code: '',
        data: this.extractedData  
      })
      .subscribe(
        (result: any) => {
          if (result.status) {
            // console.log(result);
            // const type = this.export.fileType === 'csv';
            this.apiService.downloadFile(result.data.file_url, type);
          }
        }
      );
  }

 onSelectFile(event) {
  // const file = event.target.files[0];

  // if (!file) return;
  // const fileName = file.name.toLowerCase();
  // if (!fileName.endsWith('.xls')) {
  //   alert('Only .xls files are allowed.');
  //   return;
  // }
    if (event.target.files.length > 0) {
      this.fileInfo = event.target.files[0];
      this.filesList.push(event.target.files[0] as File);
    }

    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 1 });
      //console.log(this.data);
      this.selected = this.data[0][0];
      //console.log(this.selected);
    };
   this.cd.detectChanges();
    reader.readAsBinaryString(target.files[0]);
  }
// remove(filesList): void {
//   const index = this.filesList.indexOf(filesList);
//   if (index >= 0) {
//     this.filesList.splice(index, 1);
//   }
// }
remove(file: File): void {
  const idx = this.filesList.indexOf(file);
  if (idx > -1) {
    this.filesList.splice(idx, 1);
  }

  // If no chips left, wipe preview + reset input
  if (this.filesList.length === 0) {
    this.data = [];           // hides the preview table ( *ngIf checks this )
    this.fileInfo = null;

    // reset <input type="file"> so the same file can be re‑selected later
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // If you keep a form control named 'customer_file', reset it too:
    this.exportForm.get('customer_file')?.reset();
  }
}

 backToMain() {
    this.router.navigate(['pricing-plan/pricing']).then();
  }

   importData() {

    let importdata = {
      'file': this.fileInfo,
      'skipduplicate': 1,
      mappedFields: this.fieldList
    };
    const formData = new FormData();
    formData.append('item_import', this.fileInfo);

    this.apiService.importItem(formData).subscribe((res: any) => {
      if (res.status) {
        this.backToMain();
        this.commonToasterService.showSuccess(
          'Success',
          res.message
        );
      }
    });
    // console.log(importdata);
  }


  
onRadioChange() {
  // Manually mark for check to force Angular to update the view
  // this.exportForm.patchValue({
  //   type: this.export.type,
  //   spci_price: this.export.spci_price
  // })
  this.cd.detectChanges();
}

}