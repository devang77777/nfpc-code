// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Injectable } from '@angular/core';
import { Cashier } from './cashier-receipt-interface';
import * as moment from 'moment';
import { Content, ContentTable, Table, TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Injectable({
  providedIn: 'root'
})
export class CashierReceiptPdfMakerService {
  cashier: Cashier | any;
  generatePDF(action = 'open') {
    console.log(this.cashier);
    var table: Table = {

      headerRows: 1,
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: [
        ['#', 'Receipt No', 'Receipt Date', 'Type', 'Invoice No', 'Inv. Amt', 'Paid', 'Balance'],
        ...this.cashier.collectionDetails.map((p: { collection_number: any; created_at: moment.MomentInput; type_name: any; invoice_number: any; grand_total: any; amount: any; pending_amount: any; }, k: number) => ([k + 1, p?.collection_number, moment(p?.created_at).format('DD MMM YYYY, h:mm a'), p?.type_name, p?.invoice_number, p?.grand_total, p?.amount, p?.pending_amount])),

      ]
    };
    var content: Content = [
      {
        text: 'Cashier Receipt',
        fontSize: 16,
        alignment: 'right',
      },
      {
        text: '',
        style: 'sectionHeader'
      },
      {
        columns: [
          [
            { text: `Cashier Receipt Number : ${this.cashier?.cashier_reciept_number}` },
            { text: `Saleman: ${this.cashier?.salesman?.firstname} ${this.cashier?.salesman?.lastname}` },
            { text: `Route Name : ${this.cashier?.route?.route_name}` },
            { text: `Date : ${this.cashier?.date}` }
          ]
        ]
      },
      {
        text: '',
        style: 'sectionHeader'
      },
      {
        table: table
      },
      {
        text: '',
        style: 'sectionHeader'
      },
      {
        columns: [
          [
            { text: `Total Amount : ${this.cashier?.total_amount}` },
            { text: `Received Amount: ${this.cashier?.actual_amount}` },
            { text: `Variance : ${this.cashier?.variance}` },
            { text: `Slip No : ${this.cashier?.slip_number}` },
            { text: `Bank : ${this.cashier?.bank}` },
            { text: `Date : ${this.cashier?.slip_date}` }
          ]
        ]
      }
    ]
    let docDefinition: TDocumentDefinitions = {
      content,
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 15]
        }
      }
    };

    if (action === 'download') {
      pdfMake.createPdf(docDefinition).download();
    } else if (action === 'print') {
      pdfMake.createPdf(docDefinition).print();
    } else {
      pdfMake.createPdf(docDefinition).open();
    }
  }
}
