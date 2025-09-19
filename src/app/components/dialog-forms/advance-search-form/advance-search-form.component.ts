// import { filter } from 'rxjs/operators';
// import { Component, OnInit, Inject, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { Router } from '@angular/router';
// import { ApiService } from 'src/app/services/api.service';
// import { AdvanceSearchService } from './services/advance-serach.service';
// import { EventBusService } from 'src/app/services/event-bus.service';
// import { EmitEvent, Events } from 'src/app/models/events.model';
// import { DataEditor } from 'src/app/services/data-editor.service';
// import { RouterOutlet } from '@angular/router';
// import { MasterService } from '../../main/master/master.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-advance-search-form',
//   templateUrl: './advance-search-form.component.html',
//   styleUrls: ['./advance-search-form.component.scss'],
// })
// export class AdvanceSearchFormComponent implements OnInit, AfterViewInit, OnDestroy {
//   customerID: any = [];
//   itemData: any = [];
//   filteredItems: any = [];
//   createdByList : any[] = [];
//   salesmanList : any[] = [];
//   warehouseList: any[] = [];
//   channelList: any=[];
//   customers: any=[];
//   oldModule = '';
//   intervals: any[] = [];
//   selectedModule: string = '';
//   selectedModulePath: string = '';
//   dataPath: string = '';
//   @ViewChild('activeComponent') childComponent: any;
//   masterData: any;
//   currentCriteria: any = {};
//   private subscriptions: Subscription[] = [];
//   // data: string = '';

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     private service: AdvanceSearchService,
//     public dialogRef: MatDialogRef<AdvanceSearchFormComponent>,
//     private apiService: ApiService,
//     private eventService: EventBusService,
//     private router: Router,
//     private dataEditor: DataEditor,
//     public ms: MasterService
//   ) {
//     // Extract criteria from data if provided
//     this.currentCriteria = data?.currentSearchCriteria || [];
//   }

//   ngOnInit(): void {
//     // Load customer data
//     this.subscriptions.push(
//       this.ms.customerDetailDDlListTable({}).subscribe((result) => {
//         this.customerID = result.data;
//         console.log('Customer data loaded:', this.customerID);
//       })
//     );

//     // Load item data
//     this.subscriptions.push(
//       this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
//         this.itemData = result.data;
//         this.filteredItems = result.data;
//         console.log('Item data loaded:', this.itemData);
//       })
//     );

//     // Load created by user list
//     this.subscriptions.push(
//       this.apiService.getAllCreatedByUserList('').subscribe((res: any) => {
//         this.createdByList = res.data;
//         console.log('Created by list loaded:', this.createdByList);
//       })
//     );

//     // Load warehouse/storage location data
//     this.subscriptions.push(
//       this.apiService.getLocationStorageListById().subscribe(res => {
//         this.warehouseList = [...res.data];
//         console.log('Warehouse list loaded:', this.warehouseList);
//       })
//     );

//     // Load master data
//     this.subscriptions.push(
//       this.service.getCustomerMasterData().subscribe(
//         (response) => {
//           this.masterData = response.data;
//           console.log('Master data loaded:', this.masterData);
//         },
//         (error) => {
//           console.error('Error loading master data:', error);
//         }
//       )
//     );

//     // Load customer category/channel data
//     this.subscriptions.push(
//       this.apiService.getAllCustomerCategory().subscribe((res: any) => {
//         this.channelList = res.data;
//         console.log('Channel list loaded:', this.channelList);
//       })
//     );

//     // Load salesman data
//     this.subscriptions.push(
//       this.apiService.getSalesmanDataByType().subscribe((res:any)=>{
//         this.salesmanList = res.data
//         .map((item: any) => {
//           return {
//             id: item.id,
//             salesman_code: item.salesman_code,
//             name: `${item.user.firstname} ${item.user.lastname}`
//           };
//         });
//         console.log("Salesman data loaded:", this.salesmanList);
//       })
//     );

//     // Subscribe to CHANGE_CRITERIA event to update active form component criteria dynamically
//     this.subscriptions.push(
//       this.eventService.on(Events.CHANGE_CRITERIA, (event) => {
//         if (this.childComponent && event.value && event.value.criteria) {
//           const criteriaArray = event.value.criteria;
//           const criteriaObject = {};
//           criteriaArray.forEach(criterion => {
//             if (criterion.key && criterion.value !== null && criterion.value !== undefined) {
//               criteriaObject[criterion.key] = criterion.value;
//             }
//           });
//           if (this.childComponent.setFormValues) {
//             this.childComponent.setFormValues(criteriaObject);
//           } else if (this.childComponent.initialCriteria !== undefined) {
//             this.childComponent.initialCriteria = criteriaObject;
//             if (this.childComponent.populateFormWithInitialCriteria) {
//               this.childComponent.populateFormWithInitialCriteria();
//             }
//           }
//         }
//       })
//     );
//   }

//   ngAfterViewInit(): void {
//     // Apply current search criteria to the child component form
//     if (this.childComponent && this.currentCriteria && this.currentCriteria.length > 0) {
//       // Transform criteria array to object format expected by setFormValues
//       const criteriaObject = {};
//       this.currentCriteria.forEach(criterion => {
//         if (criterion.key && criterion.value !== null && criterion.value !== undefined) {
//           criteriaObject[criterion.key] = criterion.value;
//         }
//       });

//       // Set initialCriteria input if the child component supports it
//       if (this.childComponent.initialCriteria !== undefined) {
//         this.childComponent.initialCriteria = criteriaObject;
//         // Wait for data to be loaded before populating form
//         this.waitForDataAndPopulate(criteriaObject);
//       } else {
//         // Fallback to setFormValues method
//         this.childComponent.setFormValues(criteriaObject);
//       }
//     }
//   }

//   private waitForDataAndPopulate(criteriaObject: any): void {
//     // Check if all required data is loaded
//     const checkDataLoaded = () => {
//       const hasCustomerData = this.customerID && this.customerID.length > 0;
//       const hasItemData = this.itemData && this.itemData.length > 0;
//       const hasCreatedByData = this.createdByList && this.createdByList.length > 0;
//       const hasWarehouseData = this.warehouseList && this.warehouseList.length > 0;
//       const hasChannelData = this.channelList && this.channelList.length > 0;
//       const hasMasterData = this.masterData && Object.keys(this.masterData).length > 0;

//       return hasCustomerData && hasItemData && hasCreatedByData && hasWarehouseData && hasChannelData && hasMasterData;
//     };

//     // If data is already loaded, populate immediately
//     if (checkDataLoaded()) {
//       if (this.childComponent.populateFormWithInitialCriteria) {
//         this.childComponent.populateFormWithInitialCriteria();
//       }
//       return;
//     }

//     // Otherwise, wait for data to load using a simple interval check
//     const checkInterval = setInterval(() => {
//       if (checkDataLoaded()) {
//         clearInterval(checkInterval);
//         if (this.childComponent.populateFormWithInitialCriteria) {
//           this.childComponent.populateFormWithInitialCriteria();
//         }
//       }
//     }, 100); // Check every 100ms

//     // Clean up interval after 10 seconds to prevent infinite checking
//     setTimeout(() => {
//       clearInterval(checkInterval);
//     }, 10000);
//   }

//   clean(model) {
//     for (var propName in model) {
//       if (model[propName] === null || model[propName] === undefined || propName === 'module' || propName === "page" || propName === "page_size" || propName === 'export') {
//         delete model[propName];
//       }
//     }
//     return model
//   }
//   search(isReset) {
//     const model = { ...this.childComponent.form.value };
//     if (isReset) {
//       Object.keys(model).forEach(function (key) {
//         if (model[key] !== '') {
//           model[key] = null;
//         }
//       })
//       // Reset the form controls in the child component
//       if (this.childComponent && this.childComponent.resetForm) {
//         this.childComponent.resetForm();
//       }
//     }
//     let correctRequest = this.clean({ ...model });
//     let request = this.clean({ ...model });
//     request = this.filterObjectValues(request);
//     request = this.snakeToCamelObject(request);
//     model.module = this.childComponent.form.value.module;
//     model.page = 1;
//     model.page_size = 10;
//     model.export = 0;
//      this.dialogRef.close();
//     this.apiService.onSearch(model).subscribe((response) => {
//       this.eventService.emit(new EmitEvent(model.module, {
//         request: request,
//         correctRequest: correctRequest,
//         requestOriginal: model,
//         response: response
//       }));
     
//     });
//   }
//   snakeToCamelObject = (data) => {
//     let mapped = {};
//     Object.keys(data).forEach((key, index) => {
//       let converted = key.replace(/([-_][a-z])/g, (group) =>
//         group.toUpperCase().replace('-', '').replace('_', '')
//       );
//       converted = this.camelToSentenceCase(converted);
//       mapped[converted] = data[key];
//     });
//     return mapped;
//   };
//   camelToSentenceCase = (text) => {
//     const result = text.replace(/([A-Z])/g, ' $1');
//     const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
//     return finalResult;
//   };
//   filterObjectValues(model) {
//     for (var propName in model) {
//       let filterdata;
//       switch (propName) {
//         case "customer":
//           if (typeof model[propName] == 'number') {
//             filterdata = this.masterData.customers.filter((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.firstname + ' ' + filterdata.lastname;
//           } else {
//             let names = '';
//             model[propName].forEach(element => {
//               filterdata = this.masterData.customers.filter((x) => x.id == element);
//               names += filterdata[0].firstname + ' ' + filterdata[0].lastname + ', ';
//             });
//             model[propName] = names;
//           }
//           break;
//         case "salesman":
//   if (Array.isArray(model[propName])) {
//     // If it's an array of salesman IDs
//     const selectedSalesmen = this.salesmanList.filter(s =>
//       model[propName].includes(s.id)
//     );
//     if (selectedSalesmen.length > 0) {
//       // Join multiple salesman names
//       model[propName] = selectedSalesmen
//         .map(s => `${s.salesman_code} - ${s.name}`)
//         .join(", ");
//     } else {
//       model[propName] = "";
//     }
//   } else if (typeof model[propName] === "number") {
//     // If it's a single salesman ID
//     const salesman = this.salesmanList.find(s => s.id === model[propName]);
//     if (salesman) {
//       model[propName] = `${salesman.salesman_code} - ${salesman.name}`;
//     } else {
//       model[propName] = "";
//     }
//   }
//   break;
//         case "sales_organisation":
//           filterdata = this.masterData.sales_organisation.filter((x) => x.id == model[propName]);
//           if (filterdata.length > 0) {
//             model[propName] = filterdata[0].name;
//           } else {
//             let subfilterdata = this.masterData.sales_organisation.filter((x) => x.children.some((y) => y.id == model[propName]));
//             if (subfilterdata.length > 0) {
//               model[propName] = subfilterdata[0].children[0].name;
//             }
//           }
//           break;
//         case "region":
//           filterdata = this.masterData.region.filter((x) => x.id == model[propName])[0];
//           model[propName] = filterdata.region_name;
//           break;
//         case "route":
//           filterdata = this.masterData.route.filter((x) => x.id == model[propName])[0];
//           model[propName] = filterdata.route_name;
//           break;
//         case "merchandiser":
//           if (typeof model[propName] == 'number') {
//             filterdata = this.masterData.merchandiser.filter((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.user.firstname + ' ' + filterdata.user.lastname;
//           } else {
//             let names = '';
//             model[propName].forEach(element => {
//               filterdata = this.masterData.merchandiser.filter((x) => x.user.id == element);
//               names += filterdata[0].user.firstname + ' ' + filterdata[0].user.lastname + ', ';
//             });
//             model[propName] = names;
//           }
//           break;
//         case "category":
//           if (typeof model[propName] == 'number') {
//             filterdata = this.masterData.item_major_category_list.filter((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.name;
//           } else {
//             let names = '';
//             model[propName].forEach(element => {
//               filterdata = this.masterData.item_major_category_list.filter((x) => x.id == element);
//               names += filterdata[0].name + ', ';
//             });
//             model[propName] = names;
//           }
//           break;
//         case "item_major_category_id":
//           if (typeof model[propName] == 'number') {
//             filterdata = this.masterData.item_major_category_list.filter((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.name;
//           } else {
//             let names = '';
//             model[propName].forEach(element => {
//               filterdata = this.masterData.item_major_category_list.filter((x) => x.id == element);
//               names += filterdata[0].name + ', ';
//             });
//             model[propName] = names;
//           }
//           break;
//         case "brand":
//           if (typeof model[propName] == 'number') {
//             filterdata = this.masterData.brand_list.filter((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.brand_name;
//           } else {
//             let names = '';
//             model[propName].forEach(element => {
//               filterdata = this.masterData.brand_list.filter((x) => x.id == element);
//               names += filterdata[0].brand_name + ', ';
//             });
//             model[propName] = names;
//           }
//           break;
//         case "brand_id":
//           if (typeof model[propName] == 'number') {
//             filterdata = this.masterData.brand_list.filter((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.brand_name;
//           } else {
//             let names = '';
//             model[propName].forEach(element => {
//               filterdata = this.masterData.brand_list.filter((x) => x.id == element);
//               names += filterdata[0].brand_name + ', ';
//             });
//             model[propName] = names;
//           }
//           break;
//         case 'item_id':
//           if (typeof model[propName] == 'number') {
//             filterdata = this.masterData.items.filter((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.item_code + ' - ' + filterdata.item_name;
//           }
//           break
//         case 'user_created':
//           if (typeof model[propName] == 'number') {
//             filterdata = this.createdByList.find((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.firstname + ' - ' + filterdata.lastname;
//           }
//           break
//         case 'storage_location_id':
//           if (typeof model[propName] == 'number') {
//             filterdata = this.warehouseList.filter((x) => x.id == model[propName])[0];
//             model[propName] = filterdata.code + ' - ' + filterdata.name;
//           } else if (typeof model[propName] == 'object') {
//             filterdata = this.warehouseList.filter((x) => model[propName].some(o => x.id == o));
//             let mapArray= filterdata.map(i => i.code + '-' + i.name);
//             model[propName]=mapArray.toString();
//           }
//           break
//         case 'customer_id':
//           if (typeof model[propName] == 'number') {
//             filterdata = this.customerID.find((x) => x.id == model[propName]);
//             if (filterdata) {
//               model[propName] = `${filterdata.customer_code} - ${filterdata.name}`;
//             }
//           } else if (Array.isArray(model[propName])) {
//             const filterdata = this.customerID.filter((x) =>
//               model[propName].includes(x.id)
//             );
//             if (filterdata.length > 0) {
//               model[propName] = filterdata
//                 .map((i) => `${i.customer_code} - ${i.name}`)
//                 .join(', ');
//             } else {
//               model[propName] = '';
//             }
//           }
//           break;
//         case 'channel_name':
//           if (typeof model[propName] == 'number') {
//             filterdata = this.channelList.filter((x) => x.id == model[propName])[0];
//             model[propName] =  filterdata.name;
//           } else if (typeof model[propName] == 'object') {
//             filterdata = this.channelList.filter((x) => model[propName].some(o => x.id == o));
//             let mapArray= filterdata.map(i =>  i.name);
//             model[propName]=mapArray.toString();
//           }
//           break
//         default:
//           break;
//       }
//     }
//     return model;
//   }



//   ngOnDestroy(): void {
//     this.subscriptions.forEach(sub => sub.unsubscribe());
//   }
// }




import { Component, OnInit, Inject, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AdvanceSearchService } from './services/advance-serach.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { MasterService } from '../../main/master/master.service';

@Component({
  selector: 'app-advance-search-form',
  templateUrl: './advance-search-form.component.html',
  styleUrls: ['./advance-search-form.component.scss'],
})
export class AdvanceSearchFormComponent implements OnInit, AfterViewInit, OnDestroy {
  customerID: any[] = [];
  itemData: any[] = [];
  filteredItems: any[] = [];
  createdByList: any[] = [];
  salesmanList: any[] = [];
  warehouseList: any[] = [];
  channelList: any[] = [];
  masterData: any;
  currentCriteria: any = [];
  private subscriptions: Subscription[] = [];
  private lastUsedCriteria: any[] = [];

  @ViewChild('activeComponent') childComponent: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: AdvanceSearchService,
    public dialogRef: MatDialogRef<AdvanceSearchFormComponent>,
    private apiService: ApiService,
    private eventService: EventBusService,
    public ms: MasterService
  ) {
    this.currentCriteria = data?.currentSearchCriteria || [];
  }

  ngOnInit(): void {
    // Load all necessary data
    this.subscriptions.push(
      this.ms.customerDetailDDlListTable({}).subscribe(res => this.customerID = res.data)
    );
    this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe(res => {
        this.itemData = res.data;
        this.filteredItems = res.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getAllCreatedByUserList('').subscribe(res => this.createdByList = res.data)
    );
    this.subscriptions.push(
      this.apiService.getLocationStorageListById().subscribe(res => this.warehouseList = [...res.data])
    );
    this.subscriptions.push(
      this.service.getCustomerMasterData().subscribe(res => this.masterData = res.data)
    );
    this.subscriptions.push(
      this.apiService.getAllCustomerCategory().subscribe(res => this.channelList = res.data)
    );
    this.subscriptions.push(
      this.apiService.getSalesmanDataByType().subscribe((res: any) => {
        this.salesmanList = res.data.map((item: any) => ({
          id: item.id,
          salesman_code: item.salesman_code,
          name: `${item.user.firstname} ${item.user.lastname}`
        }));
      })
    );

    // Listen to CHANGE_CRITERIA event
    this.subscriptions.push(
      this.eventService.on(Events.CHANGE_CRITERIA, (event) => {
        // If event has criteria, use it; otherwise, use lastUsedCriteria
        const criteriaArray = event.value?.criteria && event.value.criteria.length > 0
          ? event.value.criteria
          : event.value?.currentSearchCriteria && event.value.currentSearchCriteria.length > 0
          ? event.value.currentSearchCriteria
          : this.lastUsedCriteria;
          
        if (this.childComponent && criteriaArray && criteriaArray.length > 0) {
          const criteriaObject = this.criteriaArrayToObject(criteriaArray);
          if (this.childComponent.setFormValues) {
            this.childComponent.setFormValues(criteriaObject);
          }
        }
      })
    );
  }

  ngAfterViewInit(): void {
    if (this.childComponent && this.currentCriteria?.length > 0) {
      const criteriaObject = this.criteriaArrayToObject(this.currentCriteria);
      if (this.childComponent.initialCriteria !== undefined) {
        this.childComponent.initialCriteria = criteriaObject;
        this.waitForDataAndPopulate(criteriaObject);
      } else {
        this.childComponent.setFormValues?.(criteriaObject);
      }
    }
  }

  private criteriaArrayToObject(array: any[]): any {
    const obj: any = {};
    
    // Map display names to field names
    const fieldNameMap: { [key: string]: string } = {
      'Customer Id': 'customer_id',
      'Item Id': 'item_id',
      'Startdate': 'startdate',
      'Enddate': 'enddate',
      'Delivery No': 'delivery_no',
      'Startrange': 'startrange',
      'Endrange': 'endrange',
      'Salesman': 'salesman',
      'Status': 'status',
      'Channel Name': 'channel_name',
      'Storage Location Id': 'storage_location_id',
      'Module': 'module'
    };
    
    array.forEach(item => {
      // Handle both {key, value} and {param, value} formats
      const displayKey = item.key || item.param;
      const fieldKey = fieldNameMap[displayKey] || displayKey.toLowerCase().replace(/\s+/g, '_');
      const value = item.value;
      
      if (fieldKey && value !== null && value !== undefined) {
        // For delivery form, just pass the raw values - the delivery component will handle mapping
        obj[fieldKey] = value;
      }
    });
    return obj;
  }

  private waitForDataAndPopulate(criteriaObject: any) {
    const checkDataLoaded = () => 
      this.customerID.length > 0 &&
      this.itemData.length > 0 &&
      this.createdByList.length > 0 &&
      this.warehouseList.length > 0 &&
      this.channelList.length > 0 &&
      this.masterData && Object.keys(this.masterData).length > 0;

    if (checkDataLoaded()) {
      this.childComponent.populateFormWithInitialCriteria?.();
      return;
    }

    const interval = setInterval(() => {
      if (checkDataLoaded()) {
        clearInterval(interval);
        this.childComponent.populateFormWithInitialCriteria?.();
      }
    }, 100);

    setTimeout(() => clearInterval(interval), 10000);
  }

  search(isReset: boolean) {
    if (!this.childComponent?.form) return;
    const model = { ...this.childComponent.form.value };

    if (isReset) {
      Object.keys(model).forEach(key => model[key] = null);
      this.childComponent.resetForm?.();
    }

    // Save the last used criteria (as array of {key, value})
    this.lastUsedCriteria = Object.keys(model).map(key => ({ key, value: model[key] }));

    const correctRequest = { ...model };
    const request = this.snakeToCamelObject(this.filterObjectValues(model));

    model.module = this.childComponent.form.value.module;
    model.page = 1;
    model.page_size = 10;
    model.export = 0;

    this.dialogRef.close();
    this.apiService.onSearch(model).subscribe(response => {
      this.eventService.emit(new EmitEvent(model.module, {
        request, correctRequest, requestOriginal: model, response
      }));
    });
  }

  snakeToCamelObject(data: any): any {
    const mapped: any = {};
    Object.keys(data).forEach(key => {
      let converted = key.replace(/([-_][a-z])/g, g => g.toUpperCase().replace(/[-_]/g, ''));
      converted = this.camelToSentenceCase(converted);
      mapped[converted] = data[key];
    });
    return mapped;
  }

  camelToSentenceCase(text: string): string {
    const result = text.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  filterObjectValues(model: any): any {
    // Add your existing filterObjectValues logic here (same as your code)
    return model;
  }

  /**
   * Returns a display object with all values mapped to their display names using filterObjectValues.
   * Use this to show a summary of the current form with names instead of IDs.
   */
  getDisplayValues(): any {
    // Clone the current form value
    const model = { ...this.childComponent.form.value };
    // Use the filterObjectValues function to map IDs to display names
    return this.filterObjectValues({ ...model });
  }

  /**
   * Returns the display value for a specific field, using filterObjectValues.
   * Use this in the template to show code/name instead of ID for dropdowns.
   */
  getDisplayValueForField(field: string): string {
    const model = { ...this.childComponent.form.value };
    const display = this.filterObjectValues({ ...model });
    return display[field] || '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

// Example usage in your template:
// {{ getDisplayValueForField('customer_id') }}
// {{ getDisplayValueForField('channel_name') }}
// ...etc...