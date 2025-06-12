import { Injectable } from '@angular/core';
// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content, ContentTable, Table, TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class GrnPdfMakerService {
  grnData: any;
  // destination_warehouse: any;
  generatePDF(action = 'open') {
    var tableData = this.grnData?.goodreceiptnotedetail.map((p, k) => ([k + 1, p?.item?.item_code, p?.item?.item_name, p?.item_uom?.name, p?.original_item_qty]));
    var table: Table = {

      headerRows: 1,
      widths: ['auto', 'auto', '*', 'auto', 'auto'],
      body: [
        ['#', 'ITEM CODE', 'ITEM NAME', 'UOM', 'QTY'],
        ...tableData
      ]
    };
    var content: Content = [

      {
        text: '',
        style: 'sectionHeader'
      },
      {
        columns: [
          [
            { text: `GRN No : ${this.grnData.grn_number}` },
            { text: `Date : ${this.grnData.grn_date}` },
            {text: `Salesman Code: ${this.grnData?.salesman?.salesman_info?.salesman_code}`},
            { text: `Salesman: ${this.grnData?.salesman?.firstname}  ${this.grnData?.salesman?.lastname}` },
            { text : `Customer Code:${this.grnData?.credit_note?.customer?.customerinfo.customer_code}`},
            { text: `Customer: ${this.grnData?.credit_note.customer?.firstname}  ${this.grnData?.credit_note.customer?.lastname} ` },
            { text: `Route: ${this.grnData?.route?.route_name} - ${this.grnData?.route?.route_code}` },
            { text: `Branch Plant: ${this.grnData.destination_warehouse.code}` },
            { text: `Customer GRV No : ${this.grnData.customer_reference_number}` },
            { text: `Merchandiser : ${this.grnData.salesman.firstname} ${this.grnData.salesman.lastname}` },
            { text: `Merchandiser Code : ${this.grnData.salesman.salesman_info.salesman_code}` },
          ]
        ]
      },
      {
        text: 'Goods Return',
        fontSize: 16,
        alignment: 'center',
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
        columns:
          [{
            text: 'Salesman Signature',
            fontSize: 12,
            alignment: 'left',
          },

          {
            text: 'Store Signature',
            fontSize: 12,
            alignment: 'right',
          },]
      },
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
