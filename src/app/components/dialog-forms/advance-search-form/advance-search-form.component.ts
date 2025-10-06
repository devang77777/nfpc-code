import { filter } from 'rxjs/operators';
import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AdvanceSearchService } from './services/advance-serach.service';
import { AdvanceSearchStateService } from './services/advance-search-state.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { DataEditor } from 'src/app/services/data-editor.service';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-advance-search-form',
  templateUrl: './advance-search-form.component.html',
  styleUrls: ['./advance-search-form.component.scss'],
})
export class AdvanceSearchFormComponent implements OnInit, AfterViewInit {
  channelList : any[] = [];
  oldModule = '';
  intervals: any[] = [];
  selectedModule: string = '';
  selectedModulePath: string = '';
  dataPath: string = '';
  @ViewChild('activeComponent') childComponent: any;
  masterData: any;
  currentModule: string = '';
  // data: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: AdvanceSearchService,
    private stateService: AdvanceSearchStateService,
    public dialogRef: MatDialogRef<AdvanceSearchFormComponent>,
    private apiService: ApiService,
    private eventService: EventBusService,
    private router: Router,
    private dataEditor: DataEditor
  ) { }

  ngOnInit(): void {
    this.getData();
    // Extract module name from the data path
    this.currentModule = this.extractModuleName(this.data.route);
    
    // Check if we have current search criteria passed from "Change Criteria" button
    if (this.data.currentSearchCriteria && this.data.requestOriginal) {
      console.log('Change Criteria data received:', this.data.currentSearchCriteria, this.data.requestOriginal);
      // We'll restore from this data instead of saved state
    }
     this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
      console.log('Channel data loaded:', this.channelList?.length, 'channels');
    }, (error) => {
      console.error('Error loading channel data:', error);
    });
  }

  ngAfterViewInit(): void {
    // ViewChild is now available, try to restore state
    setTimeout(() => {
      if (this.childComponent) {
        console.log('ngAfterViewInit: Child component available');
        this.handleFormRestoration();
      }
    }, 100);
  }

  extractModuleName(dataPath: string): string {
    // Extract module name from paths like '/transaction/order', '/transaction/delivery', etc.
    if (dataPath && typeof dataPath === 'string') {
      if (dataPath.includes('/transaction/order')) return 'order';
      if (dataPath.includes('/transaction/delivery')) return 'delivery';  
      if (dataPath.includes('/transaction/invoice')) return 'invoice';
      if (dataPath.includes('/transaction/credit-note')) return 'credit_note';
    }
    return '';
  }
  getData() {
    this.service.getCustomerMasterData().subscribe(
      (response) => {
        this.masterData = response.data;
        console.log('Master data loaded:', this.masterData);
        
        // After data is loaded, restore saved state if exists
        // Use setTimeout to ensure DOM is updated and ViewChild is available
        setTimeout(() => {
          this.handleFormRestoration();
        }, 500);
      },
      (response) => { }
    );
  }

  handleFormRestoration() {
    // Priority 1: Use data from "Change Criteria" if available
    if (this.data.currentSearchCriteria && this.data.requestOriginal) {
      console.log('Restoring from Change Criteria data');
      this.restoreFromChangeCriteria();
    }
    // Priority 2: Use saved state if no Change Criteria data
    else if (this.currentModule && this.stateService.hasSavedState(this.currentModule)) {
      console.log('Restoring from saved state');
      // For delivery, use restoreFromRequestOriginal if available for full dropdown restoration
      const savedState = this.stateService.getSavedSearchState(this.currentModule);
      if (
        this.currentModule === 'delivery' &&
        this.childComponent &&
        typeof this.childComponent.restoreFromRequestOriginal === 'function' &&
        savedState && savedState.formValues
      ) {
        // Compose a requestOriginal-like object from savedState.formValues
        const requestOriginal = { ...savedState.formValues };
        // Also add controlValues if needed (for multi-selects)
        if (savedState.controlValues) {
          if (savedState.controlValues.customers) requestOriginal.customer_id = savedState.controlValues.customers;
          if (savedState.controlValues.items) requestOriginal.item_id = savedState.controlValues.items;
          if (savedState.controlValues.storage) requestOriginal.storage_location_id = savedState.controlValues.storage;
          if (savedState.controlValues.salesman) requestOriginal.salesman = savedState.controlValues.salesman;
        }
        // Use multiple attempts to ensure async data is loaded
        setTimeout(() => this.childComponent.restoreFromRequestOriginal(requestOriginal), 100);
        setTimeout(() => this.childComponent.restoreFromRequestOriginal(requestOriginal), 1000);
        setTimeout(() => this.childComponent.restoreFromRequestOriginal(requestOriginal), 2000);
      } else {
        this.restoreSavedState();
      }
    }
  }

  restoreFromChangeCriteria() {
    if (!this.childComponent || !this.data.requestOriginal) {
      console.log('Child component or requestOriginal not ready, retrying...', {
        childComponent: !!this.childComponent,
        requestOriginal: !!this.data.requestOriginal
      });
      setTimeout(() => this.restoreFromChangeCriteria(), 500);
      return;
    }

    try {
      console.log('Converting requestOriginal to form values:', this.data.requestOriginal);
      
      // Convert the requestOriginal data to form values
      const formValues = { ...this.data.requestOriginal };
      
      // Remove pagination and module fields
      delete formValues.page;
      delete formValues.page_size;
      delete formValues.module;
      delete formValues.export;
      delete formValues.allData;
      
      // Restore the form with multiple attempts
      this.childComponent.form.patchValue(formValues);
      this.childComponent.form.markAsDirty();
      
      // For order component, also try to restore dropdown selections
      if (this.currentModule === 'order' && this.childComponent.restoreFromRequestOriginal) {
        // Use multiple attempts to ensure data is loaded
        setTimeout(() => {
          if (this.childComponent.restoreFromRequestOriginal) {
            this.childComponent.restoreFromRequestOriginal(this.data.requestOriginal);
          }
        }, 100);
        
        setTimeout(() => {
          if (this.childComponent.restoreFromRequestOriginal) {
            this.childComponent.restoreFromRequestOriginal(this.data.requestOriginal);
          }
        }, 1000);
        
        setTimeout(() => {
          if (this.childComponent.restoreFromRequestOriginal) {
            this.childComponent.restoreFromRequestOriginal(this.data.requestOriginal);
          }
        }, 2000);
      }
      
      console.log('Form restored from Change Criteria data');
    } catch (error) {
      console.error('Error restoring from Change Criteria data:', error);
      // Fallback to saved state
      this.restoreSavedState();
    }
  }

  restoreSavedState() {
    if (this.currentModule && this.stateService.hasSavedState(this.currentModule)) {
      // Use multiple timing strategies to ensure restoration works
      const attemptRestore = () => {
        const savedState = this.stateService.getSavedSearchState(this.currentModule);
        if (savedState && this.childComponent && this.childComponent.restoreFormValues) {
          console.log('Attempting to restore saved state:', savedState);
          this.childComponent.restoreFormValues(savedState);
        }
      };

      // Try immediately if component is ready
      if (this.childComponent) {
        attemptRestore();
      }

      // Also try with progressive delays to catch async loading
      setTimeout(attemptRestore, 500);
      setTimeout(attemptRestore, 1000);
      setTimeout(attemptRestore, 2000);
      setTimeout(attemptRestore, 3000);
    }
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
    model['allData'] = isReset;
    if (isReset) {
      Object.keys(model).forEach(function (key) {
        if (model[key] !== '') {
          model[key] = null;
        }
      });
      // Clear saved state when reset is clicked
      if (this.currentModule) {
        this.stateService.clearSavedState(this.currentModule);
      }
    } else {
      // Save current form state before searching (only if not reset)
      if (this.currentModule && this.childComponent) {
        const formValues = this.childComponent.form.value;
        const controlValues = this.childComponent.getControlValues ? this.childComponent.getControlValues() : {};
        this.stateService.saveSearchState(this.currentModule, formValues, controlValues);
      }
    }

    let correctRequest = this.clean({ ...model });
    let request = this.clean({ ...model });
    // For display summary, use filterObjectValues to get user-friendly values
    const displaySummary = this.filterObjectValues({ ...model });
    request = this.filterObjectValues(request);
    request = this.snakeToCamelObject(request);
    model.module = this.childComponent.form.value.module;
    model.page = 1;
    model.page_size = 10;
    model.export = 0;
    this.apiService.onSearch(model).subscribe((response) => {
      this.eventService.emit(new EmitEvent(model.module, {
        request: request,
        correctRequest: correctRequest,
        requestOriginal: model,
        response: response,
        displaySummary: displaySummary // Add display summary to event payload
      }));
      this.dialogRef.close();
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
            if (filterdata && filterdata.customer_code && filterdata.name) {
              model[propName] = filterdata.customer_code + ' - ' + filterdata.name;
            } else {
              model[propName] = 'Unknown Customer';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.customers.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].customer_code && filterdata[0].name) {
                names += filterdata[0].customer_code + ' - ' + filterdata[0].name + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break;
        case "customer_id":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.customers.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.customer_code && filterdata.name) {
              model[propName] = filterdata.customer_code + ' - ' + filterdata.name;
            } else {
              model[propName] = 'Unknown Customer';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.customers.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].customer_code && filterdata[0].name) {
                names += filterdata[0].customer_code + ' - ' + filterdata[0].name + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break;
        case "salesman":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.salesmans.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.salesman_info && filterdata.salesman_info.salesman_code && filterdata.firstname && filterdata.lastname) {
              model[propName] = filterdata.salesman_info.salesman_code + ' - ' + filterdata.firstname + ' ' + filterdata.lastname;
            } else {
              model[propName] = 'Unknown Salesman';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.salesmans.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].salesman_info && filterdata[0].salesman_info.salesman_code && filterdata[0].firstname && filterdata[0].lastname) {
                names += filterdata[0].salesman_info.salesman_code + ' - ' + filterdata[0].firstname + ' ' + filterdata[0].lastname + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          // model[propName] = `${filterdata.salesman_code} - ${filterdata.firstname} ${filterdata.lastname}`
          break;
        case "channel":
          filterdata = this.masterData.channel.filter((x) => x.id == model[propName]);
          if (filterdata.length > 0) {
            model[propName] = filterdata[0].name;
          } else {
            let subfilterdata = this.masterData.channel.filter((x) => x.children.some((y) => y.id == model[propName]));
            if (subfilterdata.length > 0) {
              model[propName] = subfilterdata[0].children[0].name;
            }
          }
          break;
        case "channel_name":
          if (typeof model[propName] == 'number') {
            filterdata = this.channelList.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.name) {
              model[propName] = filterdata.name;
            } else {
              model[propName] = 'Unknown Channel';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.channelList.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].name) {
                names += filterdata[0].name + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break;
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
          if (filterdata && filterdata.region_name) {
            model[propName] = filterdata.region_name;
          } else {
            model[propName] = 'Unknown Region';
          }
          break;
        case "route":
          filterdata = this.masterData.route.filter((x) => x.id == model[propName])[0];
          if (filterdata && filterdata.route_name) {
            model[propName] = filterdata.route_name;
          } else {
            model[propName] = 'Unknown Route';
          }
          break;
        case "merchandiser":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.merchandiser.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.user && filterdata.user.firstname && filterdata.user.lastname) {
              model[propName] = filterdata.user.firstname + ' ' + filterdata.user.lastname;
            } else {
              model[propName] = 'Unknown Merchandiser';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.merchandiser.filter((x) => x.user.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].user && filterdata[0].user.firstname && filterdata[0].user.lastname) {
                names += filterdata[0].user.firstname + ' ' + filterdata[0].user.lastname + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break;
        case "category":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.item_major_category_list.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.name) {
              model[propName] = filterdata.name;
            } else {
              model[propName] = 'Unknown Category';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.item_major_category_list.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].name) {
                names += filterdata[0].name + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break;
        case "item_major_category_id":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.item_major_category_list.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.name) {
              model[propName] = filterdata.name;
            } else {
              model[propName] = 'Unknown Major Category';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.item_major_category_list.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].name) {
                names += filterdata[0].name + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break;
        case "brand":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.brand_list.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.brand_name) {
              model[propName] = filterdata.brand_name;
            } else {
              model[propName] = 'Unknown Brand';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.brand_list.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].brand_name) {
                names += filterdata[0].brand_name + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break;
        case "brand_id":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.brand_list.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.brand_name) {
              model[propName] = filterdata.brand_name;
            } else {
              model[propName] = 'Unknown Brand';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.brand_list.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].brand_name) {
                names += filterdata[0].brand_name + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break;
        case 'item_id':
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.items.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.item_code && filterdata.item_name) {
              model[propName] = filterdata.item_code + ' - ' + filterdata.item_name;
            } else {
              model[propName] = 'Unknown Item';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.items.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].item_code && filterdata[0].item_name) {
                names += filterdata[0].item_code + ' - ' + filterdata[0].item_name + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break
        case 'user_created':
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.order_created_user.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.firstname && filterdata.lastname) {
              model[propName] = filterdata.firstname + ' - ' + filterdata.lastname;
            } else {
              model[propName] = 'Unknown User';
            }
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.order_created_user.filter((x) => x.id == element);
              if (filterdata && filterdata.length > 0 && filterdata[0].firstname && filterdata[0].lastname) {
                names += filterdata[0].firstname + ' - ' + filterdata[0].lastname + ', ';
              }
            });
            model[propName] = names.replace(/, $/, '');
          }
          break
        case 'storage_location_id':
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.storage_location.filter((x) => x.id == model[propName])[0];
            if (filterdata && filterdata.code && filterdata.name) {
              model[propName] = filterdata.code + ' - ' + filterdata.name;
            } else {
              model[propName] = 'Unknown Storage Location';
            }
          } else if (typeof model[propName] == 'object') {
            filterdata = this.masterData.storage_location.filter((x) => model[propName].some(o => x.id == o));
            let mapArray = filterdata.map(i => {
              if (i && i.code && i.name) {
                return i.code + '-' + i.name;
              } else {
                return 'Unknown Storage Location';
              }
            });
            model[propName] = mapArray.toString();
          }
          break
        case 'current_stage':
        case 'erp_status':
        case 'approval_status':
          // Status fields are already in readable format, no transformation needed
          break
        default:
          break;
      }
    }
    return model;
  }

  onActiveComponent(component) {
    this.childComponent = component;
    console.log('Child component set:', this.childComponent);
    
    // Try to restore state immediately when component is ready
    setTimeout(() => {
      this.handleFormRestoration();
    }, 100);
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