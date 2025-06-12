import { Injectable } from '@angular/core';
// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content, ContentTable, Table, TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
@Injectable({
  providedIn: 'root'
})
export class PalletPdfReturnService {
  palletData: any;
  generatePDF(action = 'download') {
    const content: Content = this.grtMultipleData();
    const docDefinition: TDocumentDefinitions = {
      content,
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 16,
          margin: [0, 15, 0, 15],
          font: 'TimesNewRoman',
        },
        contentStyle: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 0, 0, 15],
          font: 'TimesNewRoman',
        }
      },
      // defaultStyle:{
      //   font:'Times'
      // }
    };

    if (action === 'download') {
      pdfMake.createPdf(docDefinition).download('Pallet Request Return.pdf');
    } else if (action === 'print') {
      pdfMake.createPdf(docDefinition).print();
    } else {
      pdfMake.createPdf(docDefinition).open();
    }
  }
  grtMultipleData(): any {
    const arrays = [];
    const tableData = [];
    this.palletData.forEach((element, index) => {
      tableData.push({
        'item_code': element.item?.item_code,
        'item_name': element.item?.item_name,
        'qty': element?.qty,
        'original_qty': element?.original_qty,
        'variance_qty': (+element?.qty - +element?.original_qty)
      });
      const model = [

        {
          text: 'Salesman Pallet Return',
          fontSize: 16,
          alignment: 'center',
        },
        {
          text: '',
          style: 'contentStyle'
        },
        {
          columns:
            [
              [
                {
                  text: `Request No : ${element?.request_number ?? '-'} `,
                  fontSize: 12,
                  margin: [0, 5, 15, 10]
                },
                {
                  text: `Salesman : ${element?.salesman?.firstname}  ${element?.salesman?.lastname} - ${element?.salesman_info?.salesman_code ?? '-'} `,
                  fontSize: 12,
                  margin: [0, 5, 15, 10]
                },
                {
                  text: `Date : ${element?.date ? element?.date : '-'}`, margin: [0, 5, 15, 0], fontSize: 12
                },
              ],

            ]
        },
        {
          text: '',
          style: 'sectionHeader'
        },
        {
          table: {
            widths: ['20%', '30%', '10%', '20%', '20%'],
            headerRows: 1,
            body: this.BuildBodyMedication(tableData),
          },
          // layout: 'noBorders',
        },
        {
          text: '',
          style: 'sectionHeader'
        },
        {
          columns:
            [{
              text: 'Salesman Signature',
              fontSize: 14,
              alignment: 'left',
            },

            {
              text: 'Store Signature',
              fontSize: 14,
              alignment: 'right',
            }]
        },

        this.palletData.length - 1 !== index ? {
          text: '',
          pageBreak: 'after'
        } : {
          text: ''
        }
      ];
      arrays.push(model);
    });
    return arrays;
  }
  BuildBodyMedication(data) {
    const bodyData = [];
    bodyData.push([
      { text: 'Item Code', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 },
      { text: 'Item Name', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 },
      { text: 'Return Qty', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 },
      { text: 'Variance Qty', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 },
      { text: 'Approve Qty', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 },
      // { text: 'Expiration Date', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 }

    ]);
    if (data.length > 0) {
      data.forEach((elem, index) => {
        const d = Object.assign([], []);
        d.push({ text: elem['item_code'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 });
        d.push({ text: elem['item_name'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 });
        d.push({ text: elem['original_qty'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 });
        d.push({ text: Math.abs(elem['variance_qty']), border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 });
        d.push({ text: elem['qty'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 });
        // d.push({ text: '-', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 });
        // d.push({ text: '-', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 12 });
        bodyData.push(d);
      });
    } else {
      const d = Object.assign([], []);
      d.push({ text: '-', alignment: 'center' });
      d.push({ text: '-', alignment: 'center' });
      d.push({ text: '-', alignment: 'center' });
      d.push({ text: '-', alignment: 'center' });
      d.push({ text: '-', alignment: 'center' });
      // d.push({ text: '-', alignment: 'center' });
      // d.push({ text: '-', alignment: 'center' });
      bodyData.push(d);
    }
    return bodyData;
  }
}
