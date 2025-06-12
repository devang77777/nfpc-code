// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Injectable } from '@angular/core';
// import { LoadRequest } from './load-request-interface';
import * as moment from 'moment';
import { Content, ContentTable, Table, TDocumentDefinitions } from 'pdfmake/interfaces';



(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


@Injectable()
export class SalesmanLoadPdfMakerService {
    salesmanLoad: any;
    generatePDF(action = 'open') {
        var table: Table = {

            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
                ['SI No', 'Item Code', 'Item Name', 'Uom', 'Requested Qty', 'Approved Qty'],
                ...this.salesmanLoad?.salesman_load_details?.map((p, k) => ([k + 1, p?.item?.item_code, p?.item?.item_name, p?.item_u_o_m?.name, p?.requested_qty, p?.load_qty])),

            ]
        };
        var content: Content = [
            {
                text: 'Salesman Load',
                fontSize: 16,
                alignment: 'right',
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
                        { text: `Load Type : ${this.salesmanLoad?.load_type == 1 ? 'Delivery Load' : 'Van Load'}` },
                        { text: `Saleman Code : ${this.salesmanLoad?.salesman_infos?.salesman_code}` },
                        { text: `Route Code : ${this.salesmanLoad?.route?.route_code}` },
                        { text: `Date : ${this.salesmanLoad?.load_date}` }
                    ],
                    [
                        { text: `Load No : ${this.salesmanLoad?.load_number}` },
                        { text: `Saleman Name : ${this.salesmanLoad?.salesman_infos?.user?.firstname}  ${this.salesmanLoad?.salesman_infos?.user?.lastname}` },
                        { text: `Route Name : ${this.salesmanLoad?.route?.route_name}` },
                        { text: `Time : ${moment(this.salesmanLoad?.created_at).format('HH:mm a')}` }
                    ]
                ]
            },
            {
                text: '',
                style: 'sectionHeader'
            },
            {
                table: table
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