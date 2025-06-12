import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceServices } from '../invoice.service';

@Component({
  selector: 'app-invoice-import',
  templateUrl: './invoice-import.component.html',
  styleUrls: ['./invoice-import.component.scss']
})
export class InvoiceImportComponent implements OnInit {

  public data: any = [];
  public preview: any = [];

  constructor(private router: Router,
    private invoiceServices: InvoiceServices) { }

  ngOnInit(): void {
  }

  backToInvoice() {
    this.router.navigate(['transaction/invoice']).then();
  }

  selectedFiles(data) {
    this.data = data;
    //console.log(this.data);
  }

  importInvoice() {

    const formData = new FormData();
    formData.append('invoice_file', this.data.file);
    formData.append('skipduplicate', this.data.skipduplicate);

    this.invoiceServices.importInvoice(formData).subscribe((res: any) => {
      if (res.status) {
        //console.log(res);
        // this.preview = 
      }
    });

  }

}
