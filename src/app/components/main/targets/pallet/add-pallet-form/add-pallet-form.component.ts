import { customerInfo } from './../../../transaction/delivery/delivery-model';
import { MasterService } from 'src/app/components/main/master/master.service';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  NgZone,
  Input,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {
  PaymentTerms,
  PayementtermsDialogComponent,
} from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ChannelComponent } from 'src/app/components/dialog-forms/add-channel/channel.component';
import { SalesOrganisationFormComponent } from 'src/app/components/dialog-forms/sales-organisation-form/sales-organisation-form.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { APP } from 'src/app/app.constant';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { MapsAPILoader } from '@agm/core';
import { ReturnStatement } from '@angular/compiler';
import { CustomerCategoryFormComponent } from '../../../master/customer/customer-category-form/customer-category-form.component';
import { TargetService } from '../../target.service';
import { CompDataServiceType } from 'src/app/services/constants';

interface Customertype {
  id: number;
  value: string;
}
@Component({
  selector: 'app-add-pallet-form',
  templateUrl: './add-pallet-form.component.html',
  styleUrls: ['./add-pallet-form.component.scss']
})
export class AddPalletFormComponent extends BaseComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  // domain = window.location.host.split('.')[0];
  domain = 'presales-prodmobiato.nfpc.net';
  public palletFormGroup: FormGroup;
  public formType: string;
  public isEdit: boolean = false;
  private fds: FormDrawerService;
  private subscriptions: Subscription[] = [];
  formSubmit: boolean;
  settings = {};
  salesSetiings = {};
  items: any = [];
  divisionList = [];
  warehouseList: any = [];
  public filterItem = [];
  itemfilterValue = '';
  salesmans: any = [];
  public filterSalesman = [];
  salesmanfilterValue = '';
  constructor(
    fds: FormDrawerService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dataEditor: DataEditor,
    private commonToasterService: CommonToasterService,
    public dialog: MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public masterService: MasterService,
    public fb: FormBuilder,
    private detChange: ChangeDetectorRef,
    private targetService: TargetService
  ) {
    super('Customer');
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    // this.initOfficeSearch();
    // this.initHomeSearch();
    this.settings = {
      classes: "myclass custom-class",
      enableSearchFilter: true,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
      searchBy: ['item_code', 'item_name'],
      singleSelection: true
    };
    this.salesSetiings = {
      classes: "myclass custom-class",
      enableSearchFilter: true,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
      searchBy: ['firstname', 'lastname'],
      singleSelection: true
    };
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.filterItem = [...result.data.items];
      this.items = result.data.items.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      })
      this.filterSalesman = [...result.data.salesmans];
      this.salesmans = result.data.salesmans.map(i => {
        return { id: i.id, itemName: i.salesman_info.salesman_code + ' - ' + i.firstname + ' ' + i.lastname }
      })
    });
    this.buildForm();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      if (this.formType == 'Add') {
        this.palletFormGroup.reset();
        this.buildForm();
        this.isEdit = false;
      } else if (this.formType == 'Edit') {
        // this.palletFormGroup.reset();
        // this.dataEditor.newData.subscribe((result) => {
        //   const data: any = result.data;
        //   if (data && data.uuid) {
        //     this.editData = result.data.custom_field_value_save;
        //     this.buildForm(data);
        //     this.isEdit = true;
        //   }
        // })

      }
    });

    this.apiService.getLobs().subscribe(lobs => {
      this.divisionList = lobs.data;
    });

     this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.filterItem = [...result.data.items];
          this.items = result.data.items.map(i => {
            return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
          })
          this.warehouseList = result?.data?.storage_location;
        });
  }

  buildForm(data?) {

    this.palletFormGroup = new FormGroup({
      item_id: new FormControl(),
      qty: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      division: new FormControl('', [Validators.required]),
      warehouse: new FormControl('', [Validators.required]),
      salesman_id: new FormControl(),
      type: new FormControl('0')
    });
  }


  public close() {
    this.fds.close();
    this.palletFormGroup.reset();
  }

  public savePalletData(): void {
    this.formSubmit = false;
    if (this.palletFormGroup.invalid) {
      // {
      //   "salesman_id": "64203",
      //     "item_id": "1126",
      //       "date": "2022-10-18",
      //         "qty": "10",
      //           "type": "return"
      // }
      this.formSubmit = true
      return;
    }
    else {
      this.fds.close();
    }
    if (this.isEdit) {
      // this.editPallet();
    } else {

      this.postPalletData();
    }
  }
  private postPalletData(): void {

    const model = this.palletFormGroup.value;
    this.targetService.addPallet({
      salesman_id: +model.salesman_id.find(i => i.id).id,
      item_id: +model.item_id.find(i => i.id).id,
      date: model.date,
      // warehouse_id: model.warehouse.length > 0  ? model.warehouse.find(i => i.id).id : [],
      warehouse_id: Array.isArray(model.warehouse) ? model.warehouse.map(i => i.id) : [],

      divison_id: model.division.find(i => i.id).id,
      qty: model.qty,
      type: model.type === '0' ? 'add' : 'return'
    })
      .subscribe((result: any) => {
        this.commonToasterService.showSuccess('Success', result.message);
        this.updateTableData.emit(result.data);
        this.dataEditor.sendData({
          type: CompDataServiceType.GET_NEW_DATA,
          data: { id: result.data.id }
        });
        this.fds.close();
      },
        (error) => {
          console.error(error.errors)
        });
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onSearch(evt: any) {
    const value = evt.target.value;
    if (value !== '') {
      this.itemfilterValue = value.toLowerCase().trim() || "";
      this.items = this.filterItem.filter(x => x.item_code.toLowerCase().trim().includes(this.itemfilterValue) || x.item_name.toLowerCase().trim().includes(this.itemfilterValue));
      this.items = this.items.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name };
      });
    } else {
      this.items = this.filterItem.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name };
      });
    }
    this.detChange.detectChanges();
  }

  onSalesmanSearch(evt: any) {
    const value = evt.target.value;
    if (value !== '') {
      this.salesmanfilterValue = value.toLowerCase().trim() || "";
      this.salesmans = this.filterSalesman.filter(x => x.salesman_info?.salesman_code.toLowerCase().includes(this.salesmanfilterValue) || x.firstname.toLowerCase().trim().includes(this.salesmanfilterValue) || x.lastname.toLowerCase().trim().includes(this.salesmanfilterValue));
      this.salesmans = this.salesmans.map(i => {
        return { id: i.id, itemName: i.salesman_info.salesman_code + ' - ' + i.firstname + ' ' + i.lastname };
      });
    } else {
      this.salesmans = this.filterSalesman.map(i => {
        return { id: i.id, itemName: i.salesman_info.salesman_code + ' - ' + i.firstname + ' ' + i.lastname };
      });
    }
    this.detChange.detectChanges();
  }

  
}
