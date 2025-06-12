import * as pdfMake from 'pdfmake/build/pdfmake.js';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Content, ContentTable, Table, TDocumentDefinitions } from 'pdfmake/interfaces';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import JsBarcode from 'jsbarcode/bin/JsBarcode';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
@Injectable({
  providedIn: 'root'
})
export class OrderBulkPdfService {
  orderData: any;
  isSingleData: any;
  singleOrderData: any;
  textToBase64Barcode(text) {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, text, {
      format: "CODE39",
      height: 30,
      displayValue: true,
      fontSize: 10,
      font: 'TimesNewRoman',
      width: 1,
      fontOptions: "bold"
    });
    return canvas.toDataURL("image/png");
  }
  generatePDF(action = 'download') {

    if (!this.isSingleData) {
      let content: Content = this.grtMultipleData();
      let docDefinition: TDocumentDefinitions = {
        content,
        styles: {
          sectionHeader: {
            bold: true,
            decoration: 'underline',
            fontSize: 14,
            margin: [0, 10, 0, 0],
            font: 'TimesNewRoman',
          },
          contentStyle: {
            bold: true,
            decoration: 'underline',
            fontSize: 14,
            margin: [0, 0, 0, 0],
            font: 'TimesNewRoman',
          }
        },
        // defaultStyle:{
        //   font:'Times'
        // }
      };

      if (action === 'download') {
        pdfMake.createPdf(docDefinition).download('Order Bulk.pdf');
      } else if (action === 'print') {
        pdfMake.createPdf(docDefinition).print();
      } else {
        pdfMake.createPdf(docDefinition).open();
      }
    } else {
      if (this.singleOrderData?.order_details) {
        this.singleOrderData.order_details = this.singleOrderData?.order_details?.sort((a, b) => {
          if (a?.item?.item_code > b?.item?.item_code) {
            return 1;
          } else {
            return -1;
          }
        });
      }
      const table: Table = {
        headerRows: 1,
        widths: ['50%', '20%', '10%', '10%', '10%'],
        body: [
          ['Description', 'Item Number', 'UOM', 'Shipped', 'Truck'],
          ...this.singleOrderData?.order_details?.map((p, k) => ([p?.item?.item_name, p?.item?.item_code, p?.item_uom?.name, p?.item_qty, 'NFPC'])),

        ]

      };
      var content: Content = [
        // {
        //   text: 'PICK SLIP',
        //   fontSize: 16,
        //   alignment: 'center',
        // },
        // {
        //     text: 'INVOICE',
        //     fontSize: 20,
        //     bold: true,
        //     alignment: 'center',
        //     decoration: 'underline',
        //     color: 'skyblue'
        // },
        {
          image: this.textToBase64Barcode(this.singleOrderData?.order_number ? this.singleOrderData?.order_number : '')
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
                  text: `Sold To : ${this.singleOrderData?.customer?.customer_info?.customer_code ?? '-'} `,
                  fontSize: 10,
                  margin: [0, 0, 15, 15]
                },
                {
                  text: ` ${this.singleOrderData?.customer?.firstname ?? '-'} ${this.singleOrderData?.customer?.lastname ?? '-'} `,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                }, {
                  text: ` ${this.singleOrderData?.customer?.customer_info?.customer_address_1 ?? '-'}`,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                }, {
                  text: `${this.singleOrderData?.customer?.customer_info?.customer_address_2 ?? '-'} `,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                }, {
                  text: `${this.singleOrderData?.customer?.customer_info?.customer_address_3 ? this.singleOrderData?.customer?.customer_info?.customer_address_3 : '-'} `,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                },
                {
                  text: `${this.singleOrderData?.storageocation?.name ?? '-'}`,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                },
                {
                  text: `${this.singleOrderData?.picking_slip_generator?.user?.firstname ?? '-'}${this.singleOrderData?.picking_slip_generator?.user?.lastname ?? '-'}`,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                },
                {
                  text: `Customer PO : ${this.singleOrderData?.customer_lop ? this.singleOrderData?.customer_lop : ' '}`, margin: [0, 1, 15, 0], fontSize: 10
                },
              ],
              [
                {
                  text: 'PICK SLIP',
                  fontSize: 20,
                  alignment: 'center',
                  bold: true,
                  margin: [0, 0, 0, 0]
                },
                { text: `Date : ${this.singleOrderData?.picking_slip_generator?.date ? this.singleOrderData?.picking_slip_generator?.date : ' '}`, margin: [45, 30, 15, 10], fontSize: 10 },
                { text: `Time : ${this.singleOrderData?.picking_slip_generator?.date_time ? this.singleOrderData?.picking_slip_generator?.date_time : ' '}`, margin: [45, 5, 15, 10], fontSize: 10 },
                { text: `Page : 1`, margin: [45, 5, 15, 10], fontSize: 10 },
              ],
              [
                {
                  text: `Route Code : ${this.singleOrderData?.route?.code ? this.singleOrderData?.route?.code : '0000'}`, margin: [30, 1, 15, 10], fontSize: 10
                },
                { text: `Order Number : ${this.singleOrderData?.order_number ? this.singleOrderData?.order_number : ' '}`, margin: [30, 7, 15, 10], fontSize: 10 },
                { text: `Brn/Plt : ${this.singleOrderData?.storageocation?.code ? this.singleOrderData?.storageocation?.code : ' '}`, margin: [30, 7, 15, 10], fontSize: 10 },
                { text: `Pick Slip #: ${this.singleOrderData?.picking_slip_generator?.picking_slip_generator_id ? this.singleOrderData?.picking_slip_generator?.picking_slip_generator_id : ' '}`, margin: [30, 7, 15, 10], fontSize: 10 },
                { text: `Order Date : ${this.singleOrderData?.delivery_date ? this.singleOrderData?.delivery_date : ' '}`, margin: [30, 7, 15, 10], fontSize: 10 },
                { text: `Channel : ${this.singleOrderData?.customer_category?.customer_category_name}`, margin: [30, 7, 15, 10], fontSize: 10 },
              ]
            ]
        },
        {
          text: '',
          style: 'sectionHeader'
        },
        {
          table: {
            widths: ['50%', '20%', '10%', '10%', '10%'],
            headerRows: 1,
            body: this.BuildBodySingle(this.singleOrderData?.order_details),
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
              text: 'Driver Signature',
              fontSize: 12,
              alignment: 'left',
            },

            {
              text: 'Customer Signature',
              fontSize: 12,
              alignment: 'center',
            },

            {
              text: '**Final**',
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
            margin: [0, 10, 0, 0],
            font: 'TimesNewRoman',
          },
          contentStyle: {
            bold: true,
            decoration: 'underline',
            fontSize: 14,
            margin: [0, 0, 0, 0],
            font: 'TimesNewRoman',
          }
        },
        // defaultStyle:{
        //   font:'Times'
        // }
      };

      if (action === 'download') {
        pdfMake.createPdf(docDefinition).download('Order Bulk.pdf');
      } else if (action === 'print') {
        pdfMake.createPdf(docDefinition).print();
      } else {
        pdfMake.createPdf(docDefinition).open();
      }

    }
  }
  grtMultipleData(): any {
    let arrays = [];
    this.orderData.forEach((element, index) => {

      if (element?.order_details) {
        element.order_details = element?.order_details?.sort((a, b) => {
          if (a?.item?.item_code > b?.item?.item_code) {
            return 1;
          } else {
            return -1;
          }
        });
      }
      let model = [

        // {
        //     text: 'INVOICE',
        //     fontSize: 20,
        //     bold: true,
        //     alignment: 'center',
        //     decoration: 'underline',
        //     color: 'skyblue'
        // },
        {
          image: this.textToBase64Barcode(element?.order_number ? element?.order_number : ' ')
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
                  text: `Sold To : ${element?.customer?.customer_info?.customer_code ?? '-'} `,
                  fontSize: 10,
                  margin: [0, 0, 15, 10]
                },
                {
                  text: ` ${element?.customer?.firstname ?? '-'} ${element?.customer?.lastname ?? '-'} `,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                }, {
                  text: ` ${element?.customer?.customer_info?.customer_address_1 ?? '-'}`,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                }, {
                  text: `${element?.customer?.customer_info?.customer_address_2 ?? '-'} `,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                }, {
                  text: `${element?.customer?.customer_info?.customer_address_3 ? element?.customer?.customer_info?.customer_address_3 : '-'} `,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                },
                {
                  text: `${element?.storageocation?.name ?? '-'}`,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                },
                {
                  text: `${element?.picking_slip_generator?.user?.firstname ?? '-'}${element?.picking_slip_generator?.user?.lastname ?? '-'}`,
                  fontSize: 10,
                  margin: [40, 1, 15, 10]
                },
                {
                  text: `Customer PO : ${element?.customer_lop ? element?.customer_lop : ''}`, margin: [0, 1, 15, 0], fontSize: 10
                },
              ],
              [
                {
                  text: 'PICK SLIP',
                  fontSize: 20,
                  alignment: 'center',
                  bold: true,
                  margin: [0, 0, 0, 0]
                },
                { text: `Date : ${element?.picking_slip_generator?.date ? element?.picking_slip_generator?.date : ' '}`, margin: [45, 30, 15, 10], fontSize: 10 },
                { text: `Time : ${element?.picking_slip_generator?.date_time ? element?.picking_slip_generator?.date_time : ' '}`, margin: [45, 5, 15, 10], fontSize: 10 },
                { text: `Page : 1`, margin: [45, 5, 15, 10], fontSize: 10 },
              ],
              [
                {
                  text: `Route Code : ${element?.route?.code ? element?.route?.code : '0000'}`, margin: [30, 1, 15, 10], fontSize: 10
                },
                { text: `Order Number : ${element?.order_number ? element?.order_number : ' '}`, margin: [30, 7, 15, 10], fontSize: 10 },
                { text: `Brn/Plt : ${element?.storageocation?.code ? element?.storageocation?.code : ' '}`, margin: [30, 7, 15, 10], fontSize: 10 },
                { text: `Pick Slip #: ${element?.picking_slip_generator?.picking_slip_generator_id ? element?.picking_slip_generator?.picking_slip_generator_id : ' '}`, margin: [30, 7, 15, 10], fontSize: 10 },
                { text: `Order Date : ${element?.delivery_date ? element?.delivery_date : ' '}`, margin: [30, 7, 15, 10], fontSize: 10 }
              ]
            ]
        },
        {
          text: '',
          style: 'sectionHeader'
        },
        {
          table: {
            widths: ['50%', '20%', '10%', '10%', '10%'],
            headerRows: 1,
            body: this.BuildBodyMedication(element?.order_details),
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
              text: 'Driver Signature',
              fontSize: 12,
              alignment: 'left',
            },

            {
              text: 'Customer Signature',
              fontSize: 12,
              alignment: 'center',
            },

            {
              text: '**Final**',
              fontSize: 12,
              alignment: 'right',
            },]
        },

        this.orderData.length - 1 != index ? {
          text: '',
          pageBreak: 'after'
        } : {
          text: ''
        }
      ]
      arrays.push(model);
    });
    return arrays;
  }
  BuildBodyMedication(data) {
    var bodyData = [];
    bodyData.push([
      { text: 'Description', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      { text: 'Item Number', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      { text: 'UOM', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      { text: 'Shipped', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      { text: 'Truck', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      // { text: 'Location', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      // { text: 'Expiration Date', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 }

    ]);
    if (data.length > 0) {
      data.forEach((elem, index) => {
        var d = Object.assign([], []);
        d.push({ text: elem['item']['item_name'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        d.push({ text: elem['item']['item_code'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        d.push({ text: elem['item_uom']['name'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        d.push({ text: elem['item_qty'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        d.push({ text: 'NFPC', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        // d.push({ text: '-', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        // d.push({ text: '-', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        bodyData.push(d);
      });
    } else {
      var d = Object.assign([], []);
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
  BuildBodySingle(data) {
    var bodyData = [];
    bodyData.push([
      { text: 'Description', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      { text: 'Item Number', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      { text: 'UOM', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      { text: 'Shipped', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      { text: 'Truck', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      // { text: 'Location', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 },
      // { text: 'Expiration Date', alignment: 'left', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 }

    ]);
    if (data) {
      data.forEach((elem, index) => {
        var d = Object.assign([], []);
        d.push({ text: elem['item']['item_name'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        d.push({ text: elem['item']['item_code'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        d.push({ text: elem['item_uom']['name'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        d.push({ text: elem['item_qty'], border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        d.push({ text: 'NFPC', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        // d.push({ text: '-', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        // d.push({ text: '-', border: [false, false, false, true], margin: [0, 5, 0, 5], fontSize: 10 });
        bodyData.push(d);
      });
    } else {
      var d = Object.assign([], []);
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
