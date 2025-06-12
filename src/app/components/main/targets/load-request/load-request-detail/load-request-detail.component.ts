import { element } from 'protractor';
import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { LoadRequest } from '../load-request-interface';
import { Lightbox } from 'ngx-lightbox';
import { TargetService } from '../../target.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { FormBuilder, FormArray } from '@angular/forms';
import { Subscription, Observable, Subject } from 'rxjs';
import { map, startWith, exhaustMap, distinctUntilChanged } from 'rxjs/operators';

import { FormGroup } from '@angular/forms';
import { LoadRequestPdfMakerService } from '../load-request-detail-pdf.service';
import { MasterService } from '../../../master/master.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-load-request-detail',
  templateUrl: './load-request-detail.component.html',
  styleUrls: ['./load-request-detail.component.scss']
})
export class LoadRequestDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public loadRequest: LoadRequest;
  @Input() public isDetailVisible: boolean;
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  private dataService: DataEditor;
  itemTableHeaders = ['#', 'Item Code', 'Name', 'UOM', 'Quantity'];
  loadQtys = [];
  public filteredItems: any[] = [];
  public items = [];
  public uoms = [];
  public item_uom = [];
  public onHandQty;
  itemQtyAvlaible = [];
  loadIsApproved = false;
  showOptions = true;
  itemArray = []
  routeItemQtyRecords = [];
  public isEdit: boolean = false;
  addRecord: boolean = false;
  private subscriptions: Subscription[] = [];
  public itemlookup$: Subject<any> = new Subject();
  filterValue = '';
  itemfilterValue = '';
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  public isLoading: boolean;
  constructor(private apiService: ApiService, private formBuilder: FormBuilder, private cts: CommonToasterService, private deleteDialog: MatDialog, dataService: DataEditor, private _lightbox: Lightbox, public tService: TargetService,
    private loadRequestPdfMakerService: LoadRequestPdfMakerService,
    private masterService: MasterService
  ) {
    super('Load Request');
    Object.assign(this, { dataService });
  }

  LoadRequestForm;

  ngOnInit(): void {
    this.checkApproval();
    if (!this.LoadRequestForm)
      this.initForms();

    this.itemlookup$
      .pipe(exhaustMap(() => {
        return this.masterService.itemDetailListTable({ item_name: this.itemfilterValue.toLowerCase(), page: this.itempage, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        if (this.itemfilterValue == "") {
          if (this.itempage > 1) {
            this.items = [...this.items, ...res.data];

            this.filteredItems = [...this.filteredItems, ...res.data];
          } else {
            this.items = res.data;
            this.filteredItems = res.data;
          }
          this.itempage++;
          this.item_total_pages = res?.pagination?.total_pages;
        } else {
          this.itempage = 1;
          this.filteredItems = res.data;
        }
      })

  }

  initForms() {
    this.LoadRequestForm = this.formBuilder.group({
      items: this.formBuilder.array([])
    })
    this.apiService.getAllItems().subscribe(result => this.items = result.data);
    this.apiService.getAllItemUoms().subscribe(result => this.uoms = result.data);
    // this.LoadRequestForm.valueChanges.subscribe((value) => {
    //   console.log(value);
    // })
  }

  onScrollItem() {
    console.log(this.item_total_pages, this.itempage)
    if (this.item_total_pages < this.itempage) return;
    this.isLoading = true;
    this.itemlookup$.next(this.itempage);
  }

  searchItem(value) {
    this.itemfilterValue = value;
    this.itempage = 1;
    this.page_size = 10;
    this.isLoading = true;
    this.itemlookup$.next(this.itempage);
  }

  addItem(element?) {
    let itemsForm = this.itemFormControls;
    itemsForm.push(
      this.createFormArray(element)
    );
    this.addItemFilterToControl(itemsForm.length - 1);
  }

  public createFormArray(element?) {
    let uom_list = [];
    element && uom_list.push(element?.item_uom);
    let item = element && { id: element?.item?.id, name: element?.item.item_name }
    return this.formBuilder.group({
      item: item || '',
      item_code: element?.item?.item_code || '',
      item_uom_id: element?.item_uom_id || '',
      item_qty: element?.qty || 1,
      requested_qty: element?.requested_qty || '',
      onhand_qty: '',
      item_uom_list: [uom_list],
      item_name: element?.item?.item_name || '',
    })


  }

  public isStockCheck(newFormGroup) {
    const model = {
      item_id: parseInt(newFormGroup.controls['item'].value?.id),
      item_uom_id: parseInt(newFormGroup.controls['item_uom_id'].value),
      item_qty: parseInt(newFormGroup.controls['item_qty'].value),
      depot_id: this.loadRequest?.route?.depot_id || 0,
    };
    this.apiService
      .isStockCheck(model)
      .pipe()
      .subscribe((result) => {
        this.itemQtyAvlaible[newFormGroup.id] = result.data;
        console.log(result, this.itemQtyAvlaible);
        if (this.addRecord) {
          this.onHandQtyCheck();
        }
      }, err => {
        if (this.addRecord) {
          this.onHandQtyCheck();
        }
        this.itemQtyAvlaible[newFormGroup.controls['item'].value?.id] = false;
      })
  }

  public isStockCheckList(list, depot_id) {
    var requestModel = {
      "items": list,
      "depot_id": depot_id
    }
    this.apiService
      .isStockCheckList(requestModel)
      .pipe()
      .subscribe((result) => {
        this.itemFormControls.controls.forEach(element => {
          var model = result.data.find(x => x.item_id == parseInt(element.value['item'].id));
          if (model)
            this.itemQtyAvlaible[element.value['item'].id] = model.status;
        });
      }, err => {
        this.itemFormControls.controls.forEach(element => {
          this.itemQtyAvlaible[element.value['item'].id] = false;
        });
      })
  }

  editLoadRequest() {
    this.getEditData();
    this.addRecord = false;
    this.isEdit = true;
    this.onHandQtyCheck();
    let stockList = [];
    this.itemFormControls.controls.forEach(element => {
      this.addRecord = false;
      const model = {
        item_id: parseInt(element.value['item'].id),
        item_uom_id: parseInt(element.value['item_uom_id']),
        item_qty: parseInt(element.value['item_qty']),
      };
      stockList.push(model);
    });
    this.isStockCheckList(stockList, this.loadRequest?.route?.depot_id || 0);
  }

  getEditData() {
    this.item_uom = [];
    this.apiService.getLoadRequestData(this.loadRequest.uuid).subscribe((res) => {
      var data = res.data;
      data.load_request_detail.forEach((element, index) => {
        this.addRecord = false;
        this.itemDidSearched(element.item, index, element.item_uom_id);
      })
    })
  }
  onHandQtyCheck() {
    let items = [];
    this.itemFormControls.value.forEach(element => {
      items.push(element.item.id);
    });
    const model = {
      depot_id: this.loadRequest?.route?.depot_id || 0,
      item_id: items
    };
    this.apiService
      .onHandQtyCheck(model)
      .pipe()
      .subscribe((result) => {
        this.routeItemQtyRecords = result.data;
        this.filterQtyHand();
      })
  }

  filterQtyHand() {
    this.itemFormControls.controls.forEach(element1 => {
      var index = 0;

      this.routeItemQtyRecords?.forEach(element => {

        index++;
        if (element1.value.item.id == element.item_id) {
          element1.get('onhand_qty').setValue(element.qty);
          index--;
        }

        if (index == this.routeItemQtyRecords?.length) {
          element1.get('onhand_qty').setValue(0.00);
        }
      });
    });
  }
  public get itemFormControls() {
    let itemsarray = this.LoadRequestForm?.get('items') as FormArray;
    return itemsarray;
  }

  checkApproval() {
    if (this.loadRequest) {
      if (this.loadRequest.need_to_approve == 'no') {
        this.loadIsApproved = false;
        this.showOptions = true;
      }
      else if (this.loadRequest.need_to_approve == 'yes') {
        this.loadIsApproved = true;
        this.showOptions = false;
      }
      if (this.loadRequest.approval_status == "Load Created") {
        this.itemTableHeaders.splice(5, 1);
        // this.isEdit = false;`
        this.showOptions = false;
        console.log('inside load requets', this.loadRequest.approval_status)
      } else {
        this.itemTableHeaders[5] = "Requested Quantity";
        // this.isEdit = true;
        this.showOptions = true;
        console.log('inside Creadetd', this.loadRequest.approval_status)
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes, "dsf")
    // this.checkApproval();
    if (changes) {
      this.subscriptions.push(
        this.masterService.itemDetailListTable({ page: this.itempage, page_size: 10 }).subscribe((result) => {
          this.itempage++;
          this.items = result.data;
          this.addItemFilterToControl(0);
          this.filteredItems = result.data;
          this.item_total_pages = result.pagination?.total_pages
        })
      );

      if (changes.loadRequest) {
        let currentValue = changes.loadRequest.currentValue;
        this.loadRequest = currentValue;
        if (this.loadRequest) {
          console.log(this.loadRequest);
          let itemIds = [];
          this.loadRequest?.load_request_detail.forEach(element => {
            itemIds.push(element.item_id);
          });
          // let routeItemQtyBody = {
          //   "depot_id": this.loadRequest?.route.depot_id,
          //   "item_id": itemIds
          // }
          // this.apiService.getRouteItemQty(routeItemQtyBody).subscribe((res) => {
          //   console.log(res);
          // })
        }
        if (!this.LoadRequestForm)
          this.initForms();

        if (this.loadRequest?.load_request_detail?.length > 0) {
          this.clearFormArray(this.LoadRequestForm.get('items'));
          this.loadRequest?.load_request_detail?.forEach(element => {
            this.addItem(element);
          })
        } else {
          this.addItem();
        }
        this.checkApproval();
      }
    }
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.LoadRequestForm.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;
    // newFormGroup.controls['item'].valueChanges
    //   .pipe(
    //     startWith<string | any>(''),
    //     map((value) => (typeof value === 'string' ? value : value.item_name)),
    //     map((value: string) => {
    //       return value ? this.filterItems(value) : this.items.slice();
    //     })
    //   )
    //   .subscribe((result: any[]) => {
    //     this.filteredItems = result;
    //   });
    // newFormGroup.controls['item_uom_id'].valueChanges.subscribe(result => {

    //   this.(model);
    // })

    newFormGroup.valueChanges.subscribe(result => {
      const groupIndex = itemControls.controls.indexOf(newFormGroup);
      if (newFormGroup.controls['item'].value && newFormGroup.controls['item_uom_id'].value) {
        this.showError(result);
      }
    })
  }

  showError(data) {
    if (parseInt(data.item_qty) <= parseInt(data.onhand_qty)) {
      this.itemQtyAvlaible[data.item.id] = true;
      console.log(this.itemQtyAvlaible);
    } else {
      this.itemQtyAvlaible[data.item.id] = false;
      console.log(this.itemQtyAvlaible);
    }
  }

  private filterItems(itemName: string): any[] {
    const filterValue = itemName.toLowerCase();
    let res = this.items.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue)
    );
    return res;
  }

  public itemsControlDisplayValue(item) {
    return item ? item.name : undefined;
  }

  public itemControlValue(item: any) {
    return item;
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.LoadRequestForm.get('items') as FormArray;
    itemControls.removeAt(index);
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  public itemDidSearched(data: any, index: number, item_uom_id: any): void {
    this.itemfilterValue = "";
    const selectedItem = data;
    const itemFormGroup = this.itemFormControls.at(index) as FormGroup;
    itemFormGroup.get('item').setValue({ id: selectedItem.id, name: selectedItem.item_name });
    itemFormGroup.get('item_code').setValue(selectedItem?.item_code);
    this.setUpRelatedUom(selectedItem, itemFormGroup, item_uom_id);
  }

  setUpRelatedUom(selectedItem: any, formGroup: FormGroup, item_uom_id: any) {
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem?.lower_unit_uom_id)
    );
    let secondaryUomFilterIds = [];
    let secondaryUomFilter = [];
    if (selectedItem?.item_main_price && selectedItem?.item_main_price.length) {
      selectedItem.item_main_price.forEach((item) => {
        secondaryUomFilterIds.push(parseInt(item.item_uom_id));
      });
      this.uoms.forEach((item) => {
        if (secondaryUomFilterIds.includes(item.id)) {
          secondaryUomFilter.push(item);
        }
      });
    }

    if (baseUomFilter.length && secondaryUomFilter.length) {
      itemArray = [...baseUomFilter, ...secondaryUomFilter];
    } else if (baseUomFilter.length) {
      itemArray = [...baseUomFilter];
    } else if (secondaryUomFilter.length) {
      itemArray = [...secondaryUomFilter];
    }
    formGroup.controls.item_uom_list.setValue(itemArray);
    if (baseUomFilter.length) {
      if (item_uom_id == null) {
        uomControl.setValue(selectedItem.lower_unit_uom_id);
      }
      else
        uomControl.setValue(item_uom_id);

    } else {
      uomControl.setValue(secondaryUomFilter[0].id);
    }

    // 


    if (this.addRecord) {
      formGroup.get('requested_qty').setValue(0);
      this.isStockCheck(formGroup);
    }
  }



  saveLoadReqItems() {
    console.log(this.LoadRequestForm.value.items);
    // let body = this.loadQtys;
    let items = [];
    this.LoadRequestForm.value.items?.forEach(element => {
      items.push({
        item_id: element.item?.id,
        item_code: element.item?.name,
        item_name: element.item?.name,
        item_uom_id: element.item_uom_id,
        qty: element.item_qty,
        requested_qty: element.requested_qty
      })
    });
    let body = {
      "route_id": this.loadRequest.route_id,
      "salesman_id": this.loadRequest.salesman_id,
      "load_number": this.loadRequest.load_number,
      "load_type": this.loadRequest.load_type,
      "load_date": this.loadRequest.load_date,
      "status": this.loadRequest.status,
      "items": items
    };
    this.tService.updateLoadRequest(this.loadRequest.uuid, body).subscribe(result => {
      this.isEdit = false;
      this.loadRequest['edit'] = true;
      this.updateTableData.emit(this.loadRequest);
      this.cts.showSuccess("", "Updated Successfully");
      this.itemQtyAvlaible = [];
    });

  }

  rejectLoad(type): void {
    this.tService.rejectLoadRequest(this.loadRequest.objectid, type).subscribe(result => {
      this.cts.showSuccess("", "Rejected Successfully");
      this.loadIsApproved = false;
    });
  }

  approveLoad(type): void {
    console.log('object id', this.loadRequest.objectid)
    this.tService.approveLoadRequest(this.loadRequest.objectid, type).subscribe(result => {
      this.cts.showSuccess("", "Approved Successfully");
      this.loadIsApproved = false;
    });
  }

  public openConfirmBox(type, req): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to ${req} Load Request ${this.loadRequest.load_number}`, btnText: req }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        if (type == 3) {
          this.generateToLoad();
        }
        else if (type == '2') {
          this.deleteBank();
        } else if (type == '1') {
          this.approveLoad(type);
        } else if (type == '0') {
          this.rejectLoad(type);
        }
      }
    });
  }

  public generateToLoad() {
    this.tService.generateToLoad(this.loadRequest.id).subscribe(result => {
      this.closeDetailView();
      this.cts.showSuccess("", "Generate To Load Successfully");
    })
  }

  public deleteBank(): void {
    let delObj = { uuid: this.loadRequest.uuid, delete: true };
    this.tService.deleteLoadRequest(this.loadRequest.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");

    });
  }

  cancelEdit() {
    this.isEdit = false;
    this.itemQtyAvlaible = [];
    if (this.loadRequest?.load_request_detail?.length > 0) {
      this.clearFormArray(this.LoadRequestForm.get('items'));
      this.loadRequest?.load_request_detail?.forEach(element => {
        this.addItem(element);
      })
    } else {
      this.addItem();
    }
  }

  public closeDetailView(): void {
    this.itemQtyAvlaible = [];
    this.isDetailVisible = false;
    this.isEdit = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }


  getDocument() {
    this.loadRequestPdfMakerService.loadRequest = this.loadRequest;
    this.loadRequestPdfMakerService.generatePDF()
  }



}
