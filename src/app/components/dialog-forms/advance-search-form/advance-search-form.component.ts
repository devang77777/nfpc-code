import { filter } from 'rxjs/operators';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AdvanceSearchService } from './services/advance-serach.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { DataEditor } from 'src/app/services/data-editor.service';
import { RouterOutlet } from '@angular/router';
import { MasterService } from '../../main/master/master.service';
@Component({
  selector: 'app-advance-search-form',
  templateUrl: './advance-search-form.component.html',
  styleUrls: ['./advance-search-form.component.scss'],
})
export class AdvanceSearchFormComponent implements OnInit {
  customerID: any = [];
  itemData: any = [];
  filteredItems: any = [];
  createdByList : any[] = [];
  salesmanList : any[] = [];
  warehouseList: any[] = [];
  channelList: any=[];
  customers: any=[];
  oldModule = '';
  intervals: any[] = [];
  selectedModule: string = '';
  selectedModulePath: string = '';
  dataPath: string = '';
  @ViewChild('activeComponent') childComponent: any;
  masterData: any;
  // data: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: AdvanceSearchService,
    public dialogRef: MatDialogRef<AdvanceSearchFormComponent>,
    private apiService: ApiService,
    private eventService: EventBusService,
    private router: Router,
    private dataEditor: DataEditor,
    public ms: MasterService
  ) { }

  ngOnInit(): void {
    this.ms.customerDetailDDlListTable({}).subscribe((result) => {
      this.customerID = result.data;
      // this.filterCustomer = result.data.slice(0, 30);
    })
     this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
      })
    this.getCreatedByList();
     this.apiService.getLocationStorageListById().subscribe(res => {
      this.warehouseList = [...res.data];
    });
    this.getData();
    // this.ms.customerDetailDDlListTable({}).subscribe((result) => {
    //   this.customers = result.data;
    //   // this.filterCustomer = result.data.slice(0, 30);
    // })
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
    this.apiService.getSalesmanDataByType().subscribe((res:any)=>{
      this.salesmanList = res.data
      .map((item: any) => {
      return {
        id: item.id,
        salesman_code: item.salesman_code,
        name: `${item.user.firstname} ${item.user.lastname}`
      };
    });
    console.log("the new salesman data is here",this.salesmanList)
    });
  }
  getData() {
    this.service.getCustomerMasterData().subscribe(
      (response) => {
        this.masterData = response.data;
      },
      (response) => { }
    );
  }
  clean(model) {
    for (var propName in model) {
      if (model[propName] === null || model[propName] === undefined || propName === 'module' || propName === "page" || propName === "page_size" || propName === 'export') {
        delete model[propName];
      }
    }
    return model
  }
  search(isReset) {
    const model = { ...this.childComponent.form.value };
    module['allData'] = isReset;
    if (isReset) {
      Object.keys(model).forEach(function (key) {
        if (model[key] !== '') {
          model[key] = null;
        }
      })
      // Reset the form controls in the child component
      if (this.childComponent && this.childComponent.resetForm) {
        this.childComponent.resetForm();
      }
    }
    let correctRequest = this.clean({ ...model });
    let request = this.clean({ ...model });
    request = this.filterObjectValues(request);
    request = this.snakeToCamelObject(request);
    model.module = this.childComponent.form.value.module;
    model.page = 1;
    model.page_size = 10;
    model.export = 0;
     this.dialogRef.close();
    this.apiService.onSearch(model).subscribe((response) => {
      this.eventService.emit(new EmitEvent(model.module, {
        request: request,
        correctRequest: correctRequest,
        requestOriginal: model,
        response: response
      }));
     
    });
  }
  snakeToCamelObject = (data) => {
    let mapped = {};
    Object.keys(data).forEach((key, index) => {
      let converted = key.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      converted = this.camelToSentenceCase(converted);
      mapped[converted] = data[key];
    });
    return mapped;
  };
  camelToSentenceCase = (text) => {
    const result = text.replace(/([A-Z])/g, ' $1');
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  };
  filterObjectValues(model) {
    for (var propName in model) {
      let filterdata;
      switch (propName) {
        case "customer":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.customers.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.firstname + ' ' + filterdata.lastname;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.customers.filter((x) => x.id == element);
              names += filterdata[0].firstname + ' ' + filterdata[0].lastname + ', ';
            });
            model[propName] = names;
          }
          break;
        // case "salesman":
        //   filterdata = this.masterData.salesmans.filter((x) => x.id == model[propName])[0];
        //   model[propName] = filterdata.firstname + ' ' + filterdata.lastname;
        //   // model[propName] = `${filterdata.salesman_code} - ${filterdata.firstname} ${filterdata.lastname}`
        //   break;
        // case "salesman":
        //     const salesman = this.salesmanList.find(x => x.id == model[propName]);
        //     if (salesman) {
        //       model[propName] = `${salesman.user.firstname} ${salesman.user.lastname ?? ''}`;
        //     } else {
        //       model[propName] = '';
        //     }
        //   break;
        case "salesman":
  if (Array.isArray(model[propName])) {
    // If it's an array of salesman IDs
    const selectedSalesmen = this.salesmanList.filter(s =>
      model[propName].includes(s.id)
    );
    if (selectedSalesmen.length > 0) {
      // Join multiple salesman names
      model[propName] = selectedSalesmen
        .map(s => `${s.salesman_code} - ${s.name}`)
        .join(", ");
    } else {
      model[propName] = "";
    }
  } else if (typeof model[propName] === "number") {
    // If it's a single salesman ID
    const salesman = this.salesmanList.find(s => s.id === model[propName]);
    if (salesman) {
      model[propName] = `${salesman.salesman_code} - ${salesman.name}`;
    } else {
      model[propName] = "";
    }
  }
  break;

      //  case 'salesman':
      //     if (Array.isArray(model[propName])) {
      //       // If it's an array of IDs
      //       const filterdata = this.masterData.order_created_user.filter(user =>
      //         model[propName].includes(user.id)
      //       );

      //       if (filterdata.length > 0) {
      //         const mapArray = filterdata.map(
      //           i => `${i.code} - ${i.firstname}${i.lastname ? ' ' + i.lastname : ''}`
      //         );
      //         model[propName] = mapArray.join(', ');
      //       } else {
      //         model[propName] = '';
      //       }
      //     } else if (typeof model[propName] === 'number') {
      //       // If it's a single ID
      //       const user = this.masterData.order_created_user.find(
      //         x => x.id === model[propName]
      //       );
      //       if (user) {
      //         model[propName] = `${user.firstname}${user.lastname ? ' ' + user.lastname : ''}`;
      //       } else {
      //         model[propName] = '';
      //       }
      //     }
      //     break;

        // case "channel":
        //   filterdata = this.masterData.channel.filter((x) => x.id == model[propName]);
        //   if (filterdata.length > 0) {
        //     model[propName] = filterdata[0].name;
        //   } else {
        //     let subfilterdata = this.masterData.channel.filter((x) => x.children.some((y) => y.id == model[propName]));
        //     if (subfilterdata.length > 0) {
        //       model[propName] = subfilterdata[0].children[0].name;
        //     }
        //   }
        //   break;
        // case "channel_name":
        //   filterdata = this.masterData.channel.filter((x) => x.id == model[propName]);
          
        //     model[propName] = filterdata[0].name;
         
          
        //   break;
        case "sales_organisation":
          filterdata = this.masterData.sales_organisation.filter((x) => x.id == model[propName]);
          if (filterdata.length > 0) {
            model[propName] = filterdata[0].name;
          } else {
            let subfilterdata = this.masterData.sales_organisation.filter((x) => x.children.some((y) => y.id == model[propName]));
            if (subfilterdata.length > 0) {
              model[propName] = subfilterdata[0].children[0].name;
            }
          }
          break;
        // case "order":
        //   filterdata = this.masterData.region.filter((x) => x.id == model[propName])[0];
        //   model[propName] = filterdata.region_name;
        //   break;
        case "region":
          filterdata = this.masterData.region.filter((x) => x.id == model[propName])[0];
          model[propName] = filterdata.region_name;
          break;
        case "route":
          filterdata = this.masterData.route.filter((x) => x.id == model[propName])[0];
          model[propName] = filterdata.route_name;
          break;
        case "merchandiser":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.merchandiser.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.user.firstname + ' ' + filterdata.user.lastname;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.merchandiser.filter((x) => x.user.id == element);
              names += filterdata[0].user.firstname + ' ' + filterdata[0].user.lastname + ', ';
            });
            model[propName] = names;
          }
          break;
        case "category":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.item_major_category_list.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.name;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.item_major_category_list.filter((x) => x.id == element);
              names += filterdata[0].name + ', ';
            });
            model[propName] = names;
          }
          break;
        case "item_major_category_id":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.item_major_category_list.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.name;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.item_major_category_list.filter((x) => x.id == element);
              names += filterdata[0].name + ', ';
            });
            model[propName] = names;
          }
          break;
        case "brand":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.brand_list.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.brand_name;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.brand_list.filter((x) => x.id == element);
              names += filterdata[0].brand_name + ', ';
            });
            model[propName] = names;
          }
          break;
        case "brand_id":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.brand_list.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.brand_name;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.brand_list.filter((x) => x.id == element);
              names += filterdata[0].brand_name + ', ';
            });
            model[propName] = names;
          }
          break;
        case 'item_id':
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.items.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.item_code + ' - ' + filterdata.item_name;
          }
          break
        case 'user_created':
          if (typeof model[propName] == 'number') {
            filterdata = this.createdByList.find((x) => x.id == model[propName])[0];
            model[propName] = filterdata.firstname + ' - ' + filterdata.lastname;
          }
          break
  //         case 'user_created':
  // if (typeof model[propName] === 'number') {
  //   // Single user id
  //   const filterdata = this.createdByList.find(
  //     (x) => x.id === model[propName]
  //   );
  //   if (filterdata) {
  //     model[propName] = `${filterdata.firstname} ${filterdata.lastname || ''}`;
  //   }
  // } else if (Array.isArray(model[propName])) {
  //   // Multiple user ids
  //   const filterdata = this.createdByList.filter((x) =>
  //     model[propName].includes(x.id)
  //   );
  //   if (filterdata.length > 0) {
  //     model[propName] = filterdata
  //       .map((i) => `${i.firstname} ${i.lastname || ''}`)
  //       .join(', ');
  //   } else {
  //     model[propName] = '';
  //   }
  // }
  // break;

          // if (typeof model[propName] == 'number') {
          //   filterdata = this.masterData.order_created_user.filter((x) => x.id == model[propName])[0];
          //   model[propName] = filterdata.firstname + ' - ' + filterdata.lastname;
          // } else if (typeof model[propName] == 'object') {
          //   filterdata = this.masterData.order_created_user.filter((x) => model[propName].some(o => x.id == o));
          //   let mapArray= filterdata.map(i => i.firstname + i.lastname);
          //   model[propName]=mapArray.toString();
          // }
          // break
        case 'storage_location_id':
          if (typeof model[propName] == 'number') {
            filterdata = this.warehouseList.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.code + ' - ' + filterdata.name;
          } else if (typeof model[propName] == 'object') {
            filterdata = this.warehouseList.filter((x) => model[propName].some(o => x.id == o));
            let mapArray= filterdata.map(i => i.code + '-' + i.name);
            model[propName]=mapArray.toString();
          }
          break
        // case 'customer_id':
        //   if (typeof model[propName] == 'number') {
        //     filterdata = this.customers.filter((x) => x.id == model[propName])[0];
        //     model[propName] = filterdata.customer_code + ' - ' + filterdata.name;
        //   } else if (typeof model[propName] == 'object') {
        //     filterdata = this.customers.filter((x) => model[propName].some(o => x.id == o));
        //     let mapArray= filterdata.map(i => i.customer_code + '-' + i.name);
        //     model[propName]=mapArray.toString();
        //   }
        //   break
        case 'customer_id':
          if (typeof model[propName] == 'number') {
            filterdata = this.customerID.find((x) => x.id == model[propName]);
            if (filterdata) {
              model[propName] = `${filterdata.customer_code} - ${filterdata.name}`;
            }
          } else if (Array.isArray(model[propName])) {
            const filterdata = this.customerID.filter((x) =>
              model[propName].includes(x.id)
            );
            if (filterdata.length > 0) {
              model[propName] = filterdata
                .map((i) => `${i.customer_code} - ${i.name}`)
                .join(', ');
            } else {
              model[propName] = '';
            }
          }
          break;
        case 'channel_name':
          if (typeof model[propName] == 'number') {
            filterdata = this.channelList.filter((x) => x.id == model[propName])[0];
            model[propName] =  filterdata.name;
          } else if (typeof model[propName] == 'object') {
            filterdata = this.channelList.filter((x) => model[propName].some(o => x.id == o));
            let mapArray= filterdata.map(i =>  i.name);
            model[propName]=mapArray.toString();
          }
          break
        default:
          break;
      }
    }
    return model;
  }

getCreatedByList(name: string = '') {
    
    this.apiService.getAllCreatedByUserList(name).subscribe((res: any) => {
      this.createdByList = res.data;
    });
  }
}


export const ORDER_STATUS_ADVANCE_SEARCH = [
  {
    id: 'Created',
    name: 'Created',
  },
  {
    id: 'Updated',
    name: 'Updated',
  },
  {
    id: 'In-Process',
    name: 'In-Process',
  },
  {
    id: 'Delivered',
    name: 'Delivered',
  },
  {
    id: 'Shipment',
    name: 'Shipment',
  },
  {
    id: 'Cancelled',
    name: 'Cancelled',
  },
  {
    id: 'Deleted',
    name: 'Deleted',
  },
  {
    id: 'Completed',
    name: 'Completed',
  },
  {
    id: 'Picking Confirmed',
    name: 'Picking Confirmed',
  },
  {
    id: 'Picked',
    name: 'Picked',
  },
  {
    id: 'Truck Allocated',
    name: 'Truck Allocated',
  },

];