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
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-add-route-group-form',
  templateUrl: './add-route-group-form.component.html',
  styleUrls: ['./add-route-group-form.component.scss'],
})
export class AddRouteGroupFormComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public routeItemFormGroup: FormGroup;
  public itemFormGroup: FormGroup;
  public CodeFormControl: FormControl;
  public NameFormControl: FormControl;
  public RouteFormControl: FormControl;
  public merchandiserFormControl: FormControl;
  public ItemFormControl: FormControl;
  nextCommingNumberofrouteitemgroupCode: string = '';
  public ItemCodeFormControl: FormControl;
  public routeItemdata: any;
  public routeID: any;
  public itemData: any[] = [];
  public formType: string;
  private isEdit: boolean;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['itemCode', 'itemName', 'actions'];
  public itemSource: any;
  public merchandisers = [];
  domain = window.location.host;
  private itemCodeList: {
    item_id: number;
    item_name: string;
  }[] = [];
  private updateItemCode: {
    index: number;
    isEdit: boolean;
  };
  nextCommingNumberofrouteitemgroupCodePrefix: any;
  constructor(
    private commonToasterService: CommonToasterService,
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
    this.itemSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.routeItemFormGroup?.reset();
      this.itemFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getrouteitemgroupCode();
      }
    });
    this.CodeFormControl = new FormControl('', [Validators.required]);
    this.NameFormControl = new FormControl('', [Validators.required]);
    if (this.domain == "merchandising" || this.domain == 'presales-prodmobiato.nfpc.net') {
      this.merchandiserFormControl = new FormControl('', [Validators.required]);
      this.RouteFormControl = new FormControl('');
    } else {
      this.merchandiserFormControl = new FormControl('');
      this.RouteFormControl = new FormControl('', [Validators.required]);
    }
    this.ItemCodeFormControl = new FormControl('', [Validators.required]);
    this.ItemFormControl = new FormControl([]);

    this.routeItemFormGroup = new FormGroup({
      code: this.CodeFormControl,
      name: this.NameFormControl,
      route: this.RouteFormControl,
      merchandiser: this.merchandiserFormControl,
      items: this.ItemFormControl,
    });

    this.itemFormGroup = new FormGroup({
      item_id: this.ItemCodeFormControl,
    });

    // this.subscriptions.push(
    //   this.apiService.getAllRouteItemGroupDataList().subscribe((result: any) => {
    //     this.routeID = result.routeID.data;
    //     this.itemData = result.itemData.data;
    //     this.merchandisers = result.merchandisers.data;
    //   })
    // );

    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.itemData = result.data.items;
        this.merchandisers = result.data.merchandiser.map(item => {
          if (item.user !== null) {
            item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
            return item;
          }
          return item;
        });
      })
    );

    // this.subscriptions.push(
    //   this.apiService.getAllRoute().subscribe((result: any) => {
    //     this.routeID = result.data;
    //   })
    // );
    // this.subscriptions.push(
    //   this.apiService.getAllItems().subscribe((result: any) => {
    //     this.itemData = result.data;
    //   })
    // );
    // this.subscriptions.push(this.apiService.getAllMerchandisers().subscribe(result => {
    //   this.merchandisers = result.data;
    // }));
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        if (data && data.uuid) {
          //console.log(data);
          this.CodeFormControl.setValue(data.code);
          this.CodeFormControl.disable();
          this.NameFormControl.setValue(data.name);
          if (this.domain == 'merchandising' || this.domain == 'presales-prodmobiato.nfpc.net') {
            let salesman = [{ id: data.merchandiser_id, itemName: `${data.salesman?.firstname} ${data.salesman?.lastname}` }]
            this.merchandiserFormControl.setValue(salesman);
          } else {
            this.RouteFormControl.setValue(data.route?.id);
          }
          let tblData = [];
          data.route_item_grouping_details.forEach((element) => {
            tblData.push({
              item_id: element.item_id,
              item_name: element.item.item_name,
            });
          });
          this.ItemFormControl.setValue(tblData);
          this.updateItemSource();
          this.routeItemdata = data;
          this.isEdit = true;
        }
        return;
      })
    );
  }


  getrouteitemgroupCode() {
    let nextNumber = {
      function_for: 'route_item_grouping',
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
    this.routeItemFormGroup.reset();
    this.itemFormGroup.reset();
    this.resetItemSource();
    this.isEdit = false;
  }

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  
  public editItemCode(num: number, itemCodeData: any): void {
    this.ItemCodeFormControl.setValue(itemCodeData.item_id);
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
    if (this.updateItemCode && this.updateItemCode.isEdit) {
      this.updateExistingItemCode(
        this.updateItemCode && this.updateItemCode.index
      );
    }
    if (this.itemFormGroup.invalid) {
      return;
    }
    let itemName = '';
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value) {
        itemName = item.item_name;
      }
    });
    const itemCode = {
      item_id: this.ItemCodeFormControl.value,
      item_name: itemName,
    };
    this.itemCodeList.push(itemCode);
    const itemValue = this.ItemFormControl.value
      ? this.ItemFormControl.value
      : [];
    this.ItemFormControl.setValue([...itemValue, itemCode]);
    this.updateItemSource();
  }

  public updateExistingItemCode(index: number): void {
    let itemName = '';
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value) {
        itemName = item.item_name;
      }
    });
    this.ItemFormControl.value.splice(index, 1, {
      item_id: this.ItemCodeFormControl.value,
      item_name: itemName,
    });
    this.updateItemCode = undefined;
    this.updateItemSource();
  }

  private updateItemSource(): void {
    this.itemSource = new MatTableDataSource<any>(this.ItemFormControl.value);
    this.itemSource.paginator = this.paginator;
    this.itemFormGroup.reset();
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  private resetItemSource(): void {
    this.itemSource = new MatTableDataSource();
  }

  public saveRouteItemGroupData(): void {
    if (this.routeItemFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editRouteItemGroupData();
      return;
    } else {
      this.addRouteItemGroupData();
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private addRouteItemGroupData(): void {
    let itemsIds = [];
    this.ItemFormControl.value.map((id) => {
      itemsIds.push({
        item_id: id.item_id,
      });
    });
    let merch = null;
    if (this.merchandiserFormControl.value && this.merchandiserFormControl.value.length > 0) {
      merch = this.merchandiserFormControl.value[0].id
    }
    this.apiService
      .addRouteItemGroup({
        route_id: this.RouteFormControl.value || null,
        merchandiser_id: merch || null,
        name: this.NameFormControl.value,
        code: this.CodeFormControl.value,
        items: itemsIds,
      })
      .subscribe((result: any) => {
        this.commonToasterService.showSuccess(
          'Added',
          'Route Item Group Added Successfully'
        );
        this.resetItemSource();
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editRouteItemGroupData(): void {
    let itemsIds = [];
    this.ItemFormControl.value.map((id) => {
      itemsIds.push({
        item_id: id.item_id,
      });
    });
    this.apiService
      .editRouteItemGroup(this.routeItemdata.uuid, {
        name: this.NameFormControl.value,
        route_id: this.RouteFormControl.value || null,
        merchandiser_id: this.merchandiserFormControl.value || null,
        code: this.CodeFormControl.value,
        items: itemsIds,
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        this.commonToasterService.showSuccess(
          'Updated',
          'Route Item Group Updated Successfully'
        );
        this.resetItemSource();
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  open() {
    let response: any;
    let data = {
      title: 'Route Group Code',
      functionFor: 'route_item_grouping',
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
          this.CodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.CodeFormControl.setValue(
            res.data.next_coming_number_route_item_grouping
          );
          this.nextCommingNumberofrouteitemgroupCodePrefix = res.reqData.prefix_code;
          this.CodeFormControl.disable();
        }
      });
  }
}
