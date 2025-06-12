// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Content, ContentTable, Table, TDocumentDefinitions } from 'pdfmake/interfaces';



(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
@Injectable({
    providedIn: 'root'
})
export class SalesmanUnloadPdfMakerService {
    unloadData: any;
    // generatePDF(action = 'open') {
    //   console.log(this.unloadData);
    //   var table: Table = {

    //     headerRows: 1,
    //     widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
    //     body: [
    //       ['#', 'ITEM CODE', 'ITEM NAME', 'UOM', 'END INVENTORY QTY', 'FRESH UNLOAD QTY'],
    //       ...this.unloadData?.inventoryData?.map((p, k) => ([k + 1, p?.item?.item_code, p?.item?.item_name, p?.item_uom?.name, p?.env_qty, p?.freshInv])),

    //     ]
    //   };
    //   var content: Content = [
    //     {
    //       text: 'SalesMan Unload',
    //       fontSize: 16,
    //       alignment: 'right',
    //     },
    //     {
    //       text: '',
    //       style: 'sectionHeader'
    //     },
    //     {
    // columns: [
    //   [
    //     { text: `Load No : ${this.unloadData.code}` },
    //     { text: `Saleman: ${this.unloadData?.salesman?.firstname}  ${this.unloadData?.salesman?.lastname} - ${this.unloadData?.salesman?.salesman_info?.salesman_code}` },
    //     { text: `Route: ${this.unloadData?.route?.route_name} - ${this.unloadData?.route?.route_code}` },
    //     { text: `Date : ${this.unloadData.transaction_date}` }
    //   ]
    // ]
    //     },
    //     {
    //       text: '',
    //       style: 'sectionHeader'
    //     },
    //     {
    //       table: table
    //     }
    //   ]

    //   let docDefinition: TDocumentDefinitions = {
    //     content,
    //     styles: {
    //       sectionHeader: {
    //         bold: true,
    //         decoration: 'underline',
    //         fontSize: 14,
    //         margin: [0, 15, 0, 15]
    //       }
    //     }
    //   };

    //   if (action === 'download') {
    //     pdfMake.createPdf(docDefinition).download();
    //   } else if (action === 'print') {
    //     pdfMake.createPdf(docDefinition).print();
    //   } else {
    //     pdfMake.createPdf(docDefinition).open();
    //   }

    // }


    generatePDF(action = 'open') {
        var tableData = this.unloadData?.inventoryData.map((p, k) => ([k + 1, p?.item?.item_code, p?.item?.item_name, p?.item_uom?.name, p?.original_item_qty, (p?.original_item_qty - p?.unload_qty), p?.unload_qty ?? '']));
        var table: Table = {

            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
                ['#', 'ITEM CODE', 'ITEM NAME', 'UOM', 'FRESH UNLOAD QTY', 'VARIANCE QTY', 'FINAL UNLOAD QTY'],
                ...tableData
            ]
        };
        var content: Content = [
            {
                text: 'Salesman Unload',
                fontSize: 16,
                alignment: 'center',
            },
            // {
            //     text: 'INVOICE',
            //     fontSize: 20,
            //     bold: true,
            //     alignment: 'center',
            //     decoration: 'underline',
            //     color: 'skyblue'
            // },
            {
                text: '',
                style: 'sectionHeader'
            },
            {
                columns: [
                    [
                        { text: `Unload No : ${this.unloadData.code}` },
                        { text: `Saleman: ${this.unloadData?.salesman?.firstname}  ${this.unloadData?.salesman?.lastname} - ${this.unloadData?.salesman?.salesman_info?.salesman_code}` },
                        { text: `Route: ${this.unloadData?.route?.route_name} - ${this.unloadData?.route?.route_code}` },
                        { text: `Date : ${this.unloadData.transaction_date}` }
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
