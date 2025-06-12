import { Injectable } from '@angular/core';
import {CurrencyPipe} from '@angular/common';

// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
import  * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  Content,
  ContentCanvas,
  ContentColumns,
  ContentTable,
  StyleDictionary,
  TDocumentDefinitions
} from 'pdfmake/interfaces';

import { OrderModel } from 'src/app/components/main/transaction/orders/order-models';
import { ITEM_ADD_FORM_TABLE_HEADS } from 'src/app/components/main/transaction/orders/order-form/order-form.component';
import { OrganizationModel, ORGANIZATION_DATA } from 'src/app/models/organizationModel';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';



pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable()
export class InvoicePdfMakerService {

  // public invoiceData: OrderModel;
  public invoiceData: any;

  private orgData: OrganizationModel;
  private currencyPipe: CurrencyPipe;

  constructor(currencyPipe: CurrencyPipe) {
    Object.assign(this, { currencyPipe });

    this.initData();
  }

  public generateAndOpenPDF(): void {
    const documentDefinition: TDocumentDefinitions = this.prepareContent();

    pdfMake.createPdf(documentDefinition).open();
  }

  public generateAndDownloadPDF(): void {
    const documentDefinition: TDocumentDefinitions = this.prepareContent();

    pdfMake.createPdf(documentDefinition).download(`BILL_OF_SUPPLY_${this.invoiceData.order_number}`);
  }

  private initData(): void {
    // if (localStorage.getItem('organization')) {
    //   this.orgData = JSON.parse(localStorage.getItem('organization')) as OrganizationModel;
    // }
    this.orgData = ORGANIZATION_DATA;
  }

  private prepareContent(): TDocumentDefinitions {
    return {
      info: {
        title: `BILL_OF_SUPPLY_${this.invoiceData.order_number}`,
        producer: `${this.orgData.org_name}`,
        creator: `${this.orgData.org_name}`
      },
      pageSize: 'A4',
      content: [
        this.invoiceHeader(),
        { text: '', style: [ 'spacer' ] },
        this.getSpacer(0, 515, 0, 0, 2),
        { text: '', style: [ 'spacer' ] },
        this.customerDetails,
        { text: '', style: [ 'spacer' ] },
        this.getItemsTable(),
        { text: '', style: [ 'spacer' ] },
        this.getTotalStats(),
        { text: '', style: [ 'spacer' ] },
        this.getRemarks(),
        { text: '', style: [ 'spacer' ] },
        this.getAuthSignature()
      ],
      styles: STYLES,
      defaultStyle: {
        fontSize: 10
      }
    };
  }

  private invoiceHeader(): ContentColumns {
    const columns: ContentColumns = {
      columns: [
        {
          alignment: 'left',
          width: '50%',
          stack: this.companyHeader
        },
        {
          alignment: 'right',
          width: '50%',
          stack: this.invoiceTopRight
        }
      ]
    };

    return columns;
  }

  private get invoiceTopRight(): Content[] {
    const content: Content[] = [
      {
        text: 'Bill of Supply',
        style: ['jumbo', 'bold']
      },
      {
        text: `Invoice# ${this.invoiceData.order_number}`,
        style: ['subheader', 'bold']
      },
      {
        text: 'Balance Due',
        style: [ 'italic', 'body' ]
      },
      {
        text: `${this.currencyPipe.transform(this.invoiceData.grand_total, APP_CURRENCY_CODE, 'symbol')}`,
        style: ['subheader', 'italic', 'bold']
      }
    ];

    return content;
  }

  private get companyHeader(): Content[] {
    return [
      {
        text: this.orgData.org_name,
        style: ['subheader', 'bold'],
        color: '#00a086'
      },
      {
        text: `Company# ${this.orgData.org_company_id}`,
        style: 'body'
      },
      {
        text: `${this.orgData.org_street1}`,
        style: 'body'
      },
      {
        text: `${this.orgData.org_city}, ${this.orgData.org_state} - ${this.orgData.org_postal}`,
        style: 'body'
      },
      {
        text: `${this.orgData.org_country_name}`,
        style: 'body'
      },
      {
        text: `GST# ${this.orgData.gstin_number}`,
        style: ['body', 'italic']
      }
    ];
  }

  private get customerDetails(): ContentColumns {
    const content: ContentColumns = {
      columns: [
        {
          alignment: 'left',
          width: '50%',
          stack: [
            { text: 'Bill To', style: [ 'body', 'bold' ] },
            { text: `${this.invoiceData.customer.customer_name}`, style: [ 'body' ], color: '#00a086' }
          ]
        },
        {
          alignment: 'right',
          width: '50%',
          stack: [
            { text: 'Details', style: [ 'body', 'bold' ] },
            {
              columns: [
                { text: 'Invoice Date:', width: '50%' },
                { text: `${this.invoiceData.order_date}`, width: '50%' }
              ],
              style: ['body']
            },
            {
              columns: [
                { text: 'Terms:', width: '50%' },
                { text: `${this.invoiceData.payment_term_info.name}`, width: '50%' }
              ],
              style: ['body']
            },
            {
              columns: [
                { text: 'Due Date:', width: '50%' },
                { text: `${this.invoiceData.due_date}`, width: '50%' }
              ],
              style: ['body']
            }
          ]
        }
      ],
      style: { margin: [ 0, 20, 0, 0 ] }
    };

    return content;
  }

  private getItemsTable(): ContentTable {
    const headsArray: Content[] = [];
    ITEM_ADD_FORM_TABLE_HEADS.forEach((item, index) => {
      const styles = index === 0 ? 'sequenceTableHeader' : 'tableHeader';
      headsArray.push({ text: `${item.label}`, style: styles });
    });

    const itemArray: Content[][] = [];
    this.invoiceData.items.forEach((item, index) => {
      itemArray.push([
        { text: (index + 1).toString(), style: ['tableCell', 'marginLeft4'] },
        { text: item.item.name, style: 'tableCell' },
        { text: item.uom_info.name, style: 'tableCell' },
        { text: item.item_qty, style: 'tableCell' },
        { text: item.item_price.toString(), style: 'tableCell' },
        { text: item.item_discount_amount.toString(), style: 'tableCell' },
        { text: item.item_vat.toString(), style: 'tableCell' },
        { text: item.item_net.toString(), style: 'tableCell' },
        { text: item.item_excise.toString(), style: 'tableCell' },
        { text: item.item_grand_total.toString(), style: 'tableCell' }
      ]);
    });

    const table: ContentTable = {
      layout: 'lightHorizontalLines',
      table: {
        widths: [ 5, 80, 40, '*', '*', 40, 40, 40, 40, '*' ],
        headerRows: 1,
        body: [
          headsArray,
          ...itemArray
        ]
      },
      style: [ 'tableExample' ]
    };

    return table;
  }

  public getTotalStats(): ContentColumns {
    const columns: ContentColumns = {
      columns: [
        {
          alignment: 'left',
          width: '50%',
          text: ''
        },
        {
          alignment: 'right',
          width: '50%',
          stack: [
            {
              columns: [
                { text: 'Total Vat:', width: '50%' },
                { text: `${this.currencyPipe.transform(this.invoiceData.total_vat, APP_CURRENCY_CODE, 'symbol')}`, width: '50%' }
              ],
              style: ['body']
            },
            {
              columns: [
                { text: 'Total Excise:', width: '50%' },
                { text: `${this.currencyPipe.transform(this.invoiceData.total_excise, APP_CURRENCY_CODE, 'symbol')}`, width: '50%' }
              ],
              style: ['body']
            },
            {
              columns: [
                { text: 'Total Net:', width: '50%' },
                { text: `${this.currencyPipe.transform(this.invoiceData.total_net, APP_CURRENCY_CODE, 'symbol')}`, width: '50%' }
              ],
              style: ['body']
            },
            {
              columns: [
                { text: 'Total Discount:', width: '50%' },
                { text: `${this.currencyPipe.transform(this.invoiceData.total_discount_amount, APP_CURRENCY_CODE, 'symbol')}`, width: '50%' }
              ],
              style: ['body']
            },
            {
              columns: [
                { text: 'Total:', width: '50%' },
                { text: `${this.currencyPipe.transform(this.invoiceData.grand_total, APP_CURRENCY_CODE, 'symbol')}`, width: '50%' }
              ],
              style: ['boldItalic', 'subheader']
            }
          ]
        }
      ]
    };

    return columns;
  }

  public getRemarks(): ContentColumns {
    const content: ContentColumns = {
      columns: [
        {
          alignment: 'left',
          width: '60%',
          stack: [
            {
              text: 'Customer Note',
              style: [ 'body', 'italic' ]
            },
            {
              text: '',
              style: 'miniSpacer'
            },
            {
              text: `${this.invoiceData.customer_note || '- - - -'}`,
              style: [ 'small' ]
            }
          ]
        }
      ]
    };

    return content;
  }

  private getAuthSignature(): ContentColumns {
    const column: ContentColumns = {
      columns: [
        {
          alignment: 'left',
          width: '50%',
          stack: [
            {
              text: '',
              style: 'spacer'
            },
            {
              text: 'Authorized Signature',
              style: 'body'
            },
            {
              text: '',
              style: 'spacer'
            },
            {
              text: '',
              style: 'spacer'
            },
              this.getSpacer(0, 150, 0, 0, 1)
          ]
        }
        // {
        //   alignment: 'right',
        //   width: '50%',
        //   qr: `${this.orgData.org_contact_person} ${this.orgData.org_contact_person_number}`,
        //   fit: 50
        // }
      ]
    };

    return column;
  }

  private getSpacer(x1, x2, y1, y2, width): ContentCanvas {
    return {
      canvas: [
        {
          type: 'line',
          x1, y1,
          x2, y2,
          lineWidth: width,
          lineCap: 'round'
        }
      ]
    };
  }
}

const STYLES: StyleDictionary = {
  jumbo: {
    fontSize: 32,
    margin: [ 0, 0, 0, 18 ]
  },
  header: {
    fontSize: 18,
    margin: [ 0, 0, 0, 12 ]
  },
  subheader: {
    fontSize: 14,
    margin: [ 0, 0, 0, 8 ]
  },
  body: {
    fontSize: 10,
    margin: [ 0, 0, 0, 4 ]
  },
  small: {
    fontSize: 8
  },
  italic: {
    italics: true
  },
  bold: {
    bold: true
  },
  boldItalic: {
    bold: true,
    italics: true
  },
  spacer: {
    margin: [ 0, 8, 0, 8 ]
  },
  miniSpacer: {
    margin: [ 0, 0, 0, 8 ]
  },
  tableExample: {
    margin: [0, 5, 0, 15]
  },
  tableHeader: {
    bold: true,
    fontSize: 8,
    fillColor: '#181824',
    color: '#fff',
    lineHeight: 1.5,
    margin: [ 0, 4, 0, 0 ]
  },
  tableCell: {
    fontSize: 8
  },
  marginLeft4: {
    margin: [ 4, 0, 0, 0 ]
  },
  sequenceTableHeader: {
    bold: true,
    fontSize: 8,
    fillColor: '#181824',
    color: '#fff',
    lineHeight: 1.5,
    margin: [ 4, 4, 0, 0 ]
  }
};
