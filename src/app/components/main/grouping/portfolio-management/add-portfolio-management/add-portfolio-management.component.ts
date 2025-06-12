import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { MasterService } from '../../../master/master.service';
@Component({
  selector: 'app-add-portfolio-management',
  templateUrl: './add-portfolio-management.component.html',
  styleUrls: ['./add-portfolio-management.component.scss'],
})
export class AddPortfolioManagementComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public portfolioFormGroup: FormGroup;
  public itemFormGroup: FormGroup;
  public CodeFormControl: FormControl;
  public NameFormControl: FormControl;
  public startFormControl: FormControl;
  public endFormControl: FormControl;
  public CustomerFormControl: FormControl;
  public ItemFormControl: FormControl;
  nextCommingNumberofrouteitemgroupCode: string = '';
  public ItemCodeFormControl: FormControl;
  public ItemListingFeesFormControl: FormControl;
  public ItemStorePriceFormControl: FormControl;
  public ItemCustomerFormControl: FormControl;
  public ItemUOMFormControl: FormControl;

  selectedChannels: FormControl;
  public routeItemdata: any;
  public customerID: any;
  public itemData: any[] = [];
  public filteredItems: any[] = [];
  public formType: string;
  private isEdit: boolean;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['itemCode', 'itemName', 'store_price', 'vendorItemCode', 'actions'];
  public itemSource: any;
  uomList: any = [];
  isPortfolioEdit: boolean = false;
  private itemCodeList: {
    item_id: number;
    item_name: string;
  }[] = [];
  private updateItemCode: {
    index: number;
    isEdit: boolean;
  };
  nextCommingNumberofrouteitemgroupCodePrefix: any;
  flatChannelData: any[] = [];
  channels: any[] = [];
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private ms: MasterService
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
    this.itemSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      if (this.formType != 'Edit') {
        this.getrouteitemgroupCode();
      }
    });
    // this.CodeFormControl = new FormControl('', [ Validators.required, Validators.pattern('^[0-9]*$') ]);
    this.CodeFormControl = new FormControl('', [Validators.required]);
    this.NameFormControl = new FormControl('', [Validators.required]);
    this.startFormControl = new FormControl('', [Validators.required]);
    this.endFormControl = new FormControl('', [Validators.required]);
    this.CustomerFormControl = new FormControl('', [Validators.required]);
    this.ItemCodeFormControl = new FormControl([], [Validators.required]);
    this.ItemListingFeesFormControl = new FormControl('');
    this.ItemStorePriceFormControl = new FormControl('');
    this.ItemCustomerFormControl = new FormControl('');
    this.ItemUOMFormControl = new FormControl('');

    // this.selectedChannels = new FormControl([]);
    this.ItemFormControl = new FormControl([]);

    this.portfolioFormGroup = new FormGroup({
      code: this.CodeFormControl,
      name: this.NameFormControl,
      start_date: this.startFormControl,
      end_date: this.endFormControl,
      customer: this.CustomerFormControl,
      items: this.ItemFormControl,
    });
    this.CodeFormControl.disable();
    this.itemFormGroup = new FormGroup({
      item_id: this.ItemCodeFormControl,
      listing_fees: this.ItemListingFeesFormControl,
      store_price: this.ItemStorePriceFormControl,
      vendor_item_code: this.ItemCustomerFormControl,
      vendor_item_uom_id: this.ItemUOMFormControl

    });
    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customerID = result.data.customers.map(item => {
          return {
            ...item,
            lastname: item.lastname + ' - ' + item.customer_info.customer_code
          }
        })

        // this.itemData = result.data.items;
        // console.log(this.itemData);
        // this.filteredItems = result.data.items;
      })
    );
    this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
      })
    );
    // this.subscriptions.push(
    //   this.apiService.getAllChannels().subscribe((result: any) => {
    //     this.channels = result.data;
    //     this.flatChannelData = [];
    //     this.channels.forEach((data) => {
    //       this.flatChannelArray(data);
    //     });
    //   })
    // );
    this.subscriptions.push(
      this.ItemCodeFormControl.valueChanges
        .pipe(
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        )
        .pipe(
          startWith<string | any>(''),
          map((value) => (typeof value === 'string' ? value : value?.item_name)),
          map((value: string) => {
            return value ? this.filterItems(value) : this.itemData;
          })
        ).subscribe((res) => {
          this.filteredItems = res;
          // this.itemfilterValue = res || "";
          // this.itempage = 1;
          // this.items = [];
          // this.filteredItems = [];
          // this.isLoading = true;
          // this.itemlookup$.next(this.itempage)
        })
    );
    // this.subscriptions.push(
    //   this.apiService.getCustomers().subscribe((result: any) => {
    //     this.customerID = result.data;
    //   })
    // );
    // this.subscriptions.push(
    //   this.apiService.getAllItems().subscribe((result: any) => {
    //     this.itemData = result.data;
    //   })
    // );
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        let customers = [];
        data?.portfolio_management_customer?.forEach(element => {
          customers.push({ id: element.user_id, itemName: `${element.user?.firstname} ${element.user?.lastname}` });
        });
        //console.log('data : ', data);
        if (data && data.uuid) {
          this.CodeFormControl.setValue(data.code);
          this.CodeFormControl.disable();
          this.NameFormControl.setValue(data.name);
          this.startFormControl.setValue(data.start_date);
          this.endFormControl.setValue(data.end_date);
          this.CustomerFormControl.setValue(customers);
          this.routeItemdata = data;
          this.isEdit = true;
          let tblData = [];
          data.portfolio_management_item.forEach((element) => {
            tblData.push({
              item_id: element.item_id,
              item_code: element.item.item_code,
              store_price: element.store_price,
              listing_fees: element.listing_fees,
              item_name: element.item.item_name,
              vendor_item_uom_id: element.vendor_item_uom_id,
              vendor_item_code: element.vendor_item_code,
            });

          });

          this.ItemFormControl.setValue(tblData);
          this.updateItemSource();
          // const customersValue = data.portfolio_management_customer.map(
          //   (item) => item.user_id
          // );
          // this.CustomerFormControl.setValue(customersValue);
        }
        return;
      })
    );
  }
  public flatChannelArray(item) {
    this.flatChannelData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatChannelArray(child);
      }
    } else {
      return;
    }
  }
  private filterItems(itemName: string): any[] {
    const filterValue = itemName.toLowerCase();
    return this.itemData.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue) ||
      item.item_code.toLowerCase().includes(filterValue)
    );
  }

  public itemsControlDisplayValue(item) {
    return item ? item.item_code + " " + item.item_name : undefined;
  }

  getrouteitemgroupCode() {
    let nextNumber = {
      function_for: 'portfolio',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofrouteitemgroupCode = res.data.number_is;
        this.nextCommingNumberofrouteitemgroupCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofrouteitemgroupCode) {
          this.CodeFormControl.setValue(
            this.nextCommingNumberofrouteitemgroupCode
          );
          this.CodeFormControl.disable();
        } else if (this.nextCommingNumberofrouteitemgroupCode == null) {
          this.nextCommingNumberofrouteitemgroupCode = '';
          this.CodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofrouteitemgroupCode = '';
        this.CodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }
  public close() {
    this.fds.close();
    this.portfolioFormGroup.reset();
    this.itemFormGroup.reset();
    this.resetItemSource();
    this.isEdit = false;
  }

  public editItemCode(num: number, itemCodeData: any): void {
    // this.ItemCodeFormControl.setValue(itemCodeData.item_id);
    this.isPortfolioEdit = true;
    this.onChange({
      id: itemCodeData.item_id,
      item_code: itemCodeData.item_code, item_name: itemCodeData.item_name,
    })
    setTimeout(() => {
      this.ItemCodeFormControl.setValue([{
        id: itemCodeData.item_id,
        itemName: itemCodeData.item_code + " - " + itemCodeData.item_name,
        code: itemCodeData.item_code,
        item_name: itemCodeData.item_name,

      }]);
      this.ItemListingFeesFormControl.setValue(itemCodeData.listing_fees);
      this.ItemStorePriceFormControl.setValue(itemCodeData.store_price);
      this.ItemUOMFormControl.setValue(itemCodeData.vendor_item_uom_id);
      this.ItemCustomerFormControl.setValue(itemCodeData.vendor_item_code);
    }, 100);

    this.updateItemCode = {
      index: num,
      isEdit: true,
    };
  }

  public deleteItemCode(index: number): void {
    this.ItemFormControl.value.splice(index, 1);
    this.updateItemSource();
  }

  public addItemCode(): void {
    this.isPortfolioEdit = false;
    if (this.itemFormGroup.invalid) {
      return;
    }
    if (this.updateItemCode && this.updateItemCode.isEdit) {
      this.updateExistingItemCode(
        this.updateItemCode && this.updateItemCode.index
      );
    } else {

      this.ItemCodeFormControl.value.forEach(itemObjct => {
        const itemCode = {
          item_id: itemObjct.id,
          item_name: itemObjct.item_name,
          item_code: itemObjct.code,
          listing_fees: this.ItemListingFeesFormControl.value,
          store_price: this.ItemStorePriceFormControl.value,
          vendor_item_uom_id: this.ItemUOMFormControl.value,
          vendor_item_code: this.ItemCustomerFormControl.value
        };
        this.itemCodeList.push(itemCode);
        const itemValue = this.ItemFormControl.value
          ? this.ItemFormControl.value
          : [];
        this.ItemFormControl.setValue([...itemValue, itemCode]);
        this.updateItemSource();
      });
    }
    this.itemFormGroup.reset();
  }

  public updateExistingItemCode(index: number): void {
    var itemObject = this.ItemCodeFormControl.value[0];
    let itemName = '';
    let itemcode = '';

    this.ItemFormControl.value.splice(index, 1, {
      item_id: itemObject.id,//|| this.ItemCodeFormControl.value?.item_id,
      item_name: itemObject.item_name,
      item_code: itemObject.code,
      listing_fees: this.ItemListingFeesFormControl.value,
      store_price: this.ItemStorePriceFormControl.value,
    });
    this.updateItemCode = undefined;
    this.updateItemSource();
  }

  private updateItemSource(): void {
    this.itemSource = new MatTableDataSource<any>(this.ItemFormControl.value);
    this.itemSource.paginator = this.paginator;
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  private resetItemSource(): void {
    this.itemSource = new MatTableDataSource();
  }

  public savePortfolioItemGroupData() {
    if (this.portfolioFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editPortfolioItemGroupData();
      return;
    } else {
      this.addPortfolioItemGroupData();
    }
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private addPortfolioItemGroupData(): void {
    let itemsIds = [];
    this.ItemFormControl.value.map((id) => {
      //console.log(id);
      itemsIds.push({
        item_id: id.item_id,
        listing_fees: id.listing_fees,
        store_price: id.store_price,
        vendor_item_uom_id: id.vendor_item_uom_id,
        vendor_item_code: id.vendor_item_code
      });
    });

    let customerIds = [];
    this.CustomerFormControl.value.map((id) => {
      customerIds.push({
        customer_id: id.id,
      });
    });

    this.apiService
      .addPortfolioData({
        customers: customerIds,
        name: this.NameFormControl.value,
        code: this.CodeFormControl.value,
        start_date: this.startFormControl.value,
        end_date: this.endFormControl.value,
        items: itemsIds,
        // channel: this.selectedChannels.value.map(x => x.id)
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editPortfolioItemGroupData(): void {
    let itemsIds = [];
    this.ItemFormControl.value.map((id) => {
      itemsIds.push({
        item_id: id.item_id,
        listing_fees: id.listing_fees,
        store_price: id.store_price,
      });
    });
    let customerIds = [];
    this.CustomerFormControl.value.map((id) => {
      customerIds.push({
        customer_id: id.id,
      });
    });
    this.apiService
      .editPortfolio(this.routeItemdata.uuid, {
        customers: customerIds,
        name: this.NameFormControl.value,
        code: this.CodeFormControl.value,
        start_date: this.startFormControl.value,
        end_date: this.endFormControl.value,
        items: itemsIds,
        // channel: this.selectedChannels.value.map(x => x.id)
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }
  open() {
    let response: any;
    let data = {
      title: 'Portfolio Management',
      functionFor: 'portfolio',
      code: this.nextCommingNumberofrouteitemgroupCode,
      prefix: this.nextCommingNumberofrouteitemgroupCodePrefix,
      key: this.nextCommingNumberofrouteitemgroupCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: 'auto',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.CodeFormControl.setValue('');
          this.nextCommingNumberofrouteitemgroupCode = '';
          this.CodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.CodeFormControl.setValue(res.data.next_coming_number_portfolio);
          this.nextCommingNumberofrouteitemgroupCode =
            res.data.next_coming_number_portfolio;
          this.nextCommingNumberofrouteitemgroupCodePrefix = res.reqData.prefix_code;
          this.CodeFormControl.disable();
        }
      });
  }
  onChange(event) {
    let uomLists = this.filteredItems.find(i => i.id === event.id);
    // this.uomList.push(uomLists.item_uom_lower_unit);
    this.getItemDetailByName(event.item_name).subscribe(res => {
      var _items = res.data || [];

      const selectedItem: any = _items.find((res: any) => res.id === event.id);
      this.setItemRelatedUOM(selectedItem);
    });
  }
  getItemDetailByName(name) {
    return this.ms
      .itemDetailListTable({ item_name: name.toLowerCase(), })

  }
  setItemRelatedUOM(selectedItem: any) {
    // const uomControl = formGroup.controls.item_uom_id;
    let lowerUnitUOM = [selectedItem.item_uom_lower_unit];
    let baseUnitUOM = [];
    let itemUOMArray = [];
    if (selectedItem.item_main_price.length > 0) {
      selectedItem.item_main_price.forEach(element => {
        baseUnitUOM.push(element.item_uom);
      });
      itemUOMArray = [...baseUnitUOM, ...lowerUnitUOM];
    } else {
      itemUOMArray = lowerUnitUOM;
    }
    this.uomList = itemUOMArray
    // formGroup.controls.item_uom_list.setValue(itemUOMArray);
    // if (isEdit) {

    //   uomControl.setValue(selectedItem?.uom_info?.id);
    // } else {

    //   uomControl.setValue(selectedItem?.lower_unit_uom_id);
    // }

  }
}
