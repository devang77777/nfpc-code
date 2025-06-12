import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MasterService } from '../../master/master.service';
import { Subscription, Subject, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-bulk-item-modal',
    templateUrl: './bulk-item-modal.component.html',
    styleUrls: ['./bulk-item-modal.component.scss'],
})
export class BulkItemModalComponent implements OnInit {
    title: any;
    hasConfirmed: any;
    displayedColumns: string[];
    dataSource: MatTableDataSource<any>;
    clickedRows: Set<PeriodicElement>;
    itempage: any = 1;
    page_size: any = 10;
    isLoading: boolean = false;
    itemfilterValue: string;
    items: any[] = [];
    item_total_pages: any = 0;
    selectedItem: any[] = [];
    quantityArr = {};
    itemRequestModel: pageRequest;
    searchItemValue: any;
    keyUpItem = new Subject<string>();
    uoms: any[] = [];
    filterItems: any[] = [];
    isItemLoaded: boolean = false;
    defaultUOM = '';
    searchItem = '';
    constructor(private matDialogRef: MatDialogRef<BulkItemModalComponent>, private masterService: MasterService, private apiService: ApiService) {
    }

    public ngOnInit(): void {
        this.displayedColumns = ['item_code', 'item_name', 'item_uom', 'Quantity', 'Action'];
        this.itemRequestModel = { page: this.itempage, page_size: this.page_size }
        this.getItemList();
        this.keyUpItem.pipe(
            map((event: any) => {
                this.searchItem = event.target.value;
                return event.target.value;
            }
            ),
            debounceTime(1000),
            distinctUntilChanged(),
            mergeMap(search => of(search).pipe(
                delay(100),
            )),
        ).subscribe(res => {
            console.log("res", res)
            if (res !== '') {
                this.itemfilterValue = res.toLowerCase().trim() || "";
                this.items = this.filterItems
                    .filter(x => x.item.item_code.toLowerCase().trim() == this.itemfilterValue || x.item.item_name.toLowerCase().trim() == this.itemfilterValue)

            } else {
                this.items = this.filterItems;
            }
        });
        this.apiService.getAllItemUoms().subscribe((result) => { this.uoms = result.data; });
    }

    getItemList() {
        this.isLoading = true;
        this.masterService.itemList().subscribe((res) => {
            this.isLoading = false;
            this.items = res.data;
            this.filterItems = res.data;
        });
    }

    changeQuantity(item, value) {
        let index = this.selectedItem.findIndex(x => x.item_code == item.item_code);
        this.selectedItem[index]["quantity"] = value;
    }

    changeUom(item, value) {
        let index = this.selectedItem.findIndex(x => x.item_code == item.item_code);
        this.selectedItem[index]["selected_item_uom"] = value;
    }

    onSelectItem(itemModel, index) {
        this.searchItem = '';
        if (this.items[index]?.selected) {
            let findIndex = this.selectedItem.findIndex(x => x.id == itemModel.id);
            this.selectedItem.splice(findIndex, 1);
            this.items[index]["selected"] = false;
            this.dataSource = new MatTableDataSource(this.selectedItem);
        } else {
            this.isItemLoaded = true;
            this.getItemDetailByName(itemModel.item_id).subscribe(res => {
                this.isItemLoaded = false;
                var _items = res.data;
                if (_items.length > 0) {
                    const item: any = _items.find((res: any) => res.id === itemModel.item_id);
                    if (!item) {
                        return;
                    }

                    this.selectedItem.push(item);
                    this.items[index]["selected"] = true;
                    let itemArray = [];
                    const baseUomFilter = this.uoms.filter(
                        (x) => x.id == parseInt(item?.lower_unit_uom_id)
                    );
                    let secondaryUomFilterIds = [];
                    let secondaryUomFilter = [];
                    if (item?.item_main_price && item?.item_main_price?.length) {
                        item?.item_main_price.forEach((item) => {
                            secondaryUomFilterIds.push(item.item_uom_id);
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
                    this.items[index]["item_uom_list"] = itemArray;
                    if (itemArray.length > 0) {
                        this.selectedItem[this.selectedItem.length - 1]["item_uom_list"] = itemArray;
                        this.selectedItem[this.selectedItem.length - 1]["selected_item_uom"] = itemArray[0].id;
                    }
                    let checkUOM: any;
                    let checkMainUOM: any;
                    let checkSecUOM: any;
                    if (item.is_secondary === 1) {
                        checkUOM = item.item_uom_lower_unit;
                        console.log('checkUOM', checkUOM)
                        this.selectedItem[this.selectedItem.length - 1]['defaultUOM'] = checkUOM.id;
                    } else {
                        checkMainUOM = item.item_main_price.find(i => +i.is_secondary === 1);
                        if (checkMainUOM) {
                            this.selectedItem[this.selectedItem.length - 1]['defaultUOM'] = checkMainUOM.item_uom_id;
                            console.log('checkMainUOM', checkMainUOM)
                        } else {
                            checkSecUOM = item.item_main_price.find(i => +i.is_secondary === 1);
                            if (checkSecUOM) {
                                console.log('checkSecUOM', checkSecUOM.item_uom_id)
                            } else {
                                console.log('checkSecUOM', item.lower_unit_uom_id)
                            }
                        }
                    }
                    this.dataSource = new MatTableDataSource(this.selectedItem);
                }
            });
        }
    }

    deleteItemRow(itemControl) {
        let findIndex = this.selectedItem.findIndex(x => x.id == itemControl.id);
        this.selectedItem.splice(findIndex, 1);
        var index = this.items.findIndex(x => x.id == itemControl.id);
        this.items[index]["selected"] = false;
        this.dataSource = new MatTableDataSource(this.selectedItem);
    }

    loadMoreItem() {
        this.itemRequestModel.page++;
        this.getItemList();
    }

    saveItems() {
        this.matDialogRef.close(this.selectedItem);
    }

    getItemDetailByName(name) {
        return this.masterService
            .itemDetailListTable({ id: name })

    }

}
export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}

export interface pageRequest {
    page: number;
    page_size: number;
    item_name?: string;
}