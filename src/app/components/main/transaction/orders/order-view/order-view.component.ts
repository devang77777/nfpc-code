import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ReportService } from '../../../merchandising/reports/report.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MasterService } from '../../../master/master.service';

@Component({
  selector: 'app-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent implements OnInit {
  order_number: number;
  delivery_date: any;
  itemDetails: any = [];
  sideFiltersForm;
  divisionList: any = [];
  warehouseList: any = [];
  channelList: any = [] ;
  dateRange = '';
  customerList: any = [];
  itemList: any = [];
  createdUserList: any = [];
  public filterItem = [];
  itemfilterValue = '';
  public dataSource: MatTableDataSource<any>;
  selectedItems = [];
  settings = {};

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public columns: any[] = [
    { field: 'Order No', value: 'order_number' },
    { field: 'Order Co', value: 'order_code' },
    { field: 'Line No', value: 'line_number' },
    { field: 'Sold To', value: 'sold_to' },
    { field: 'Sold To Name', value: 'sold_to_name' },
    { field: 'Item Code', value: '2nd_item_number' },
    { field: 'Description 1', value: 'description1' },
    { field: 'Qty', value: 'quantity' },
    { field: 'UOM', value: 'uom' },
    { field: 'Revision No', value: 'revision_number' },
    { field: 'Revision Reason', value: 'revision_reason' },
    { field: 'Secondary Qty', value: 'secondary_quantity' },
    { field: 'Secondary UOM', value: 'secondary_uom' },
    { field: 'Requested Date', value: 'requested_date' },
    { field: 'Customer PO', value: 'customer_po' },
    { field: 'Ship To', value: 'ship_to' },
    { field: 'Ship To Description', value: 'ship_to_description' },
    { field: 'Original Order Type', value: 'original_order_type ' },
    { field: 'Original Line No', value: 'original_line_number' },
    { field: '3rd Item No', value: '3rd_item_number' },
    { field: 'Parent No', value: 'parent_number' },
    { field: 'Pick No ', value: 'pick_number' },
    { field: 'Unit Price', value: 'unit_price' },
    { field: 'Extended Amount', value: 'extended_amount' },
    { field: 'Pricing UOM', value: 'pricing_uom' },
    { field: 'Order Date', value: 'order_date' },
    { field: 'Document No', value: 'document_number' },
    { field: 'Doument Type', value: 'doument_type' },
    { field: 'Document Company', value: 'document_company' },
    { field: 'Scheduled Pick Date', value: 'scheduled_pick_date' },
    { field: 'Actual Ship Date', value: 'actual_ship_date' },
    { field: 'Invoice Date', value: 'invoice_date' },
    { field: 'Cancel Date', value: 'cancel_date' },
    { field: 'G/L Date', value: 'gl_date' },
    { field: 'Promised Delivery Date', value: 'promised_delivery_date' },
    { field: 'Business Unit', value: 'business_unit' },
    { field: 'Qty Ordered', value: 'quantity_ordered' },
    { field: 'Qty Shipped', value: 'quantity_shipped' },
    { field: 'Qty Backordered', value: 'quantity_backordered' },
    { field: 'Qty Canceled', value: 'quantity_canceled' },
    { field: 'Qty Invoice', value: 'quantity_invoice' },
    { field: 'Qty Invoice VS Shipped', value: 'quantity_invoice_vs_shipped' },
    { field: 'Price Effective Date', value: 'price_effective_date' },
    { field: 'Unit Cost', value: 'unit_cost' },
    { field: 'Reason Code', value: 'reason_code' },
    { field: 'Total Cancel AED', value: 'total_cancel_aed' },
  ];

  displayedColumns: string[] = [];
  constructor(private router: Router,
    private api: ApiService,
    private fb: FormBuilder,
    private ReportService: ReportService,
    private dataEdit: DataEditor,
    private detChange: ChangeDetectorRef,
    private masterService: MasterService
  ) {
    this.dataSource = new MatTableDataSource<OrderViewComponent>();
    // this.channelList = Channel;
  }

  ngOnInit(): void {
    this.getChannelList();
    this.settings = {
      classes: "myclass custom-class",
      enableSearchFilter: true,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
      searchBy: ['item_code', 'item_name'],
      lazyLoading: true
    };
    this.sideFiltersForm = this.fb.group({
      warehouse_id: [[]],
      channel_id: [[]],
      order_number: '',
      dateRange: '',
      customer_lpo: '',
      start_date: '',
      end_date: '',
      del_start_date: '',
      del_end_date: '',
      customer_id: [[]],
      division: [[]],
      item_ids: [[]]
    })
    this.api.getLobs().subscribe(lobs => {
      this.divisionList = lobs.data;
    })

    console.log(this.customerList);
    this.api.getMasterDataLists().subscribe((result: any) => {
      // this.customerList = result.data.customers;
      // for (let customer of this.customerList) {
      //   customer['customer_name'] = `${customer.customer_info.customer_code} - ${customer.firstname} ${customer.lastname}`;
      //   customer['id'] = customer?.customer_info.user_id;
      // }
      this.filterItem = [...result.data.items];
      this.itemList = result.data.items.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
        
      })
      
      this.createdUserList = result.data.order_created_user;
      // let d1=[{id: 195,itemName: "101159 - Al Dhafra Co-operative Society Main"}]
      // this.sideFiltersForm.get('customer_id').setValue(d1);
      this.dataEdit.newData.subscribe(res => {
        if (res.data) {
          this.dateRange = res?.data?.dateRange;
          this.sideFiltersForm.get('dateRange').setValue(res?.data?.dateRange);
          this.sideFiltersForm.get('warehouse_id').setValue(res?.data?.warehouse_id);
          this.sideFiltersForm.get('channel_id').setValue(res?.data?.channel_id);
          this.sideFiltersForm.get('order_number').setValue(res?.data?.order_number)
          this.sideFiltersForm.get('customer_lpo').setValue(res?.data?.customer_lpo)
          this.sideFiltersForm.get('start_date').setValue(res?.data?.start_date)
          this.sideFiltersForm.get('end_date').setValue(res?.data?.end_date)
          this.sideFiltersForm.get('del_start_date').setValue(res?.data?.del_start_date)
          this.sideFiltersForm.get('del_end_date').setValue(res?.data?.del_end_date)
          this.sideFiltersForm.get('customer_id').setValue(res?.data?.customer_id)
          this.sideFiltersForm.get('division').setValue(res?.data?.division)
          this.sideFiltersForm.get('item_ids').setValue(res?.data?.item_ids)
          this.showOrder(0, '');
        }
      });
    });
    this.masterService.customerDetailDDlListTable({}).subscribe((result) => {
      this.customerList = result.data;
      for (let customer of this.customerList) {
        customer['customer_name'] = `${customer.customer_code} - ${customer.name}`;
        customer['id'] = customer?.id;
      }
    });
    this.setDisplayedColumns();
    
  }
  setDisplayedColumns() {
    this.columns.forEach((column, index) => {
      column.index = index;
      this.displayedColumns[index] = column.field;
    });
  }

  filterWarehouse() {
    if (this.sideFiltersForm.controls.division.value.length > 0) {
      const divisions = this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [];
      this.api.getWarehouse(divisions).subscribe(x => {
        this.warehouseList = x.data;
        this.warehouseList.forEach(element => {
          element.name = element.code + '-' + element.name;
        });
      });
    }
  }
  public goBackToOrdersList(): void {
    this.router.navigate(['transaction/order']);
  }


  showOrder(exp, type) {
    console.log(this.sideFiltersForm.value);
    let sfv = this.sideFiltersForm.value;
    let model = {
      warehouse_id: sfv.warehouse_id.length > 0 ? sfv.warehouse_id.map(i => i.id) : [],
      // channel_id: sfv.channel_id.length > 0 ? sfv.channel_id[0].id : null,
      channel_id: sfv.channel_id.length > 0 ? sfv.channel_id.map(i => i.id) : [], 
      order_number: sfv.order_number,
      customer_id: sfv.customer_id.length > 0 ? sfv.customer_id[0].id : null,
      customer_lpo: sfv.customer_lpo,
      item_ids: sfv.item_ids.length > 0 ? sfv.item_ids.map(i => i.id) : null,
      start_date: sfv.start_date,
      end_date: sfv.end_date,
      del_start_date: sfv.del_start_date,
      del_end_date: sfv.del_end_date,
      export: exp,
      export_type: type,
      module: 'orderDetailsReport',
    }
    this.ReportService.getReportData(model).subscribe((res) => {
      if (res?.status == true) {
        if (exp == 1) {
          this.api.downloadFile(res.data.file_url, type);
        } else {
          this.dataSource = new MatTableDataSource<any>(res.data);
          this.dataSource.paginator = this.paginator;
        }
      }
      console.log(this.dataSource);
    });
  }
  selectDateRange(value) {
    this.dateRange = value;
  }
  onItemSelect(item: any) {
    console.log(item, this.sideFiltersForm.value);
  }
  OnItemDeSelect(item: any) {
    // console.log(item);
    // console.log(this.selectedItems);
  }
  onSelectAll(items: any) {

  }
  onDeSelectAll(items: any) {

  }
  getChannelList(){
    this.api.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }
  navigatePage(item) {
    console.log(item);
    this.sideFiltersForm.value.dateRange = this.dateRange;
    this.dataEdit.sendData({ type: 'view', data: this.sideFiltersForm.value });
    this.router.navigate(['/transaction/order/edit', item.uuid])
  }
  onSearch(evt: any) {
    let value = evt.target.value
    if (value !== '') {
      this.itemfilterValue = value.toLowerCase().trim() || "";
      this.itemList = this.filterItem.filter(x => x.item_code.toLowerCase().trim() === this.itemfilterValue || x.item_name.toLowerCase().trim() === this.itemfilterValue);
      this.itemList = this.itemList.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      });
    } else {
      this.itemList = this.filterItem.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      })
    }
    this.detChange.detectChanges();
  }
}


