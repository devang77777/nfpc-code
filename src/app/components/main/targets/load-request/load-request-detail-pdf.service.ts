// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Injectable } from '@angular/core';
import { LoadRequest } from './load-request-interface';
import * as moment from 'moment';
import { Content, ContentTable, Table, TDocumentDefinitions } from 'pdfmake/interfaces';



(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


@Injectable()
export class LoadRequestPdfMakerService {
    loadRequest: LoadRequest;
    generatePDF(action = 'open') {
        var table: Table = {

            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
                ['SI No', 'Item Code', 'Item Name', 'Uom', 'Requested Qty', 'Approved Qty'],
                ...this.loadRequest.load_request_detail.map((p, k) => ([k + 1, p.item.item_code, p.item.item_name, p.item_uom.name, p.requested_qty, p.qty])),

            ]
        };
        var content: Content = [
            {
                text: 'Load Request',
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
                        { text: `Load Type : ${this.loadRequest.load_type}` },
                        { text: `Saleman Code : ${this.loadRequest.salesman.salesman_info.salesman_code}` },
                        { text: `Route Code : ${this.loadRequest.route.route_code}` },
                        { text: `Date : ${this.loadRequest.load_date}` }
                    ],
                    [
                        { text: `Load No : ${this.loadRequest.load_number}` },
                        { text: `Saleman Name : ${this.loadRequest.salesman.firstname}  ${this.loadRequest.salesman.lastname}` },
                        { text: `Route Name : ${this.loadRequest.route.route_name}` },
                        { text: `Time : ${moment(this.loadRequest.created_at).format('HH:mm a')}` }
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