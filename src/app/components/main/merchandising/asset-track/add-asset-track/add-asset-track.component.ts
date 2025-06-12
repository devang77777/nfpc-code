import {
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MerchandisingService } from '../../merchandising.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MapsAPILoader } from '@agm/core';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';

@Component({
  selector: 'app-add-asset-track',
  templateUrl: './add-asset-track.component.html',
  styleUrls: ['./add-asset-track.component.scss'],
})
export class AddAssetTrackComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public AssetTrackFormGroup;
  public AssetTrackdata;
  private isEdit: boolean;
  public formType: string;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  public customer: any[] = [];
  private subscriptions: Subscription[] = [];
  public selectedFiles = [];
  public filechoosed = false;
  @ViewChild('locationSrch') public locationSrch: ElementRef;
  @ViewChild('file') public fileinput: ElementRef;
  assetCode: string = '';
  assetCodePrefix: any;
  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    apiService: ApiService,
    private fb: FormBuilder,
    fds: FormDrawerService,
    public merService: MerchandisingService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private router: Router
  ) {
    Object.assign(this, { fds, apiService, merService, dataEditor });
  }
  public ngOnInit(): void {
    this.initLocationSearch();
    this.fds.formType.subscribe((s) => (this.formType = s));
    this.AssetTrackFormGroup = this.fb.group({
      assetCode: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      modelName: ['', [Validators.required]],
      barcode: ['', [Validators.required]],
      category: ['', [Validators.required]],
      location: ['', [Validators.required]],
      lat: [''],
      lng: [''],
      area: ['', [Validators.required]],
      parentId: [''],
      wroker: [''],
      additionalWroker: [''],
      team: [''],
      vendors: [''],
      purchaseDate: [''],
      placedInService: [''],
      purchasePrice: [''],
      warrantyExpiration: [''],
      residualPrice: [''],
      additionalInformation: [''],
      usefulLife: [''],
      customer: ['', [Validators.required]],
      image: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
    // this.subscriptions.push(
    //   this.apiService.getCustomers().subscribe((res: any) => {
    //     this.customer = res.data;
    //   })
    // );
    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customer = result.data.customers.map(item => {
          return {
            ...item,
            lastname: item.lastname + ' - ' + item.customer_info.customer_code
          }
        })
      })
    );
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.AssetTrackFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
        this.getrouteitemgroupCode();
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;

          if (data && data.uuid && this.isEdit) {
            let customer = [{ id: data.customer_id, itemName: `${data.customer?.firstname} ${data.customer?.lastname}` }]
            this.AssetTrackFormGroup.patchValue({
              assetCode: data.code,
              title: data.title,
              description: data.description,
              startDate: data.start_date,
              endDate: data.end_date,
              modelName: data.model_name,
              barcode: data.barcode,
              category: data.category,
              location: data.location,
              lat: data.lat,
              lng: data.lng,
              area: data.area,
              parentId: data.parent_id,
              wroker: data.wroker,
              additionalWroker: data.additional_wroker,
              team: data.team,
              vendors: data.vendors,
              customer: customer,
              purchaseDate: data.purchase_date,
              placedInService: data.placed_in_service,
              purchasePrice: data.purchase_price,
              warrantyExpiration: data.warranty_expiration,
              residualPrice: data.residual_price,
              additionalInformation: data.additional_information,
              usefulLife: data.useful_life,
              image: data.image,
            });
            this.selectedFiles.push(data.image);
            this.assetCode = data.code;
            this.AssetTrackdata = data;
            this.isEdit = true;
          }

          return;
        })
      );
    });
  }

  getrouteitemgroupCode() {
    let nextNumber = {
      function_for: 'asset_tracking',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.assetCode = res.data.number_is;
        this.assetCodePrefix = res.data.prefix_is;
        if (this.assetCode) {
          this.AssetTrackFormGroup.controls['assetCode'].setValue(
            this.assetCode
          );
          this.AssetTrackFormGroup.controls['assetCode'].disable();
        } else if (this.assetCode == null) {
          this.assetCode = '';
          this.AssetTrackFormGroup.controls['assetCode'].enable();
        }
      } else {
        this.assetCode = '';
        this.AssetTrackFormGroup.controls['assetCode'].enable();
      }
    });
  }

  openSetting() {
    let response: any;
    let data = {
      title: 'Asset Tracking',
      functionFor: 'asset_tracking',
      code: this.assetCode,
      prefix: this.assetCodePrefix,
      key: this.assetCode.length ? 'autogenerate' : 'manual',
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
          this.AssetTrackFormGroup.controls['assetCode'].setValue('');
          this.assetCode = '';
          this.AssetTrackFormGroup.controls['assetCode'].enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.AssetTrackFormGroup.controls['assetCode'].setValue(
            res.data.next_coming_number_asset_tracking
          );
          this.assetCode = res.data.next_coming_number_asset_tracking;
          this.assetCodePrefix = res.reqData.prefix_code;
          this.AssetTrackFormGroup.controls['assetCode'].disable();
        }
      });
  }

  initLocationSearch() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.locationSrch.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.AssetTrackFormGroup.patchValue({
            location: this.locationSrch.nativeElement.value,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        });
      });
    });
  }

  fileChosen(event) {
    let files = [];
    if (event.target.files && event.target.files[0]) {
      let filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          files.push(event.target.result);
        };

        reader.readAsDataURL(event.target.files[i]);
      }
      this.selectedFiles = files;
      this.filechoosed = true;
    }
  }

  public close() {
    this.fds.close();
    this.fileinput.nativeElement.value = '';
    this.AssetTrackFormGroup.reset();
    this.isEdit = false;
    this.filechoosed = false;
    this.selectedFiles = [];
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  public saveAssetTrackData(): void {
    if (this.AssetTrackFormGroup.invalid) {
      return;
    }

    if (this.isEdit && this.selectedFiles.length == 0) {
      this.AssetTrackFormGroup.controls['image'].markAsTouched();
      return;
    } else {
      this.AssetTrackFormGroup.controls['image'].setErrors(null);
    }

    // if (this.AssetTrackFormGroup.value.lat == null) {
    //   this.AssetTrackFormGroup.controls['location'].setValue('');
    //   return;
    // }
    let form = this.AssetTrackFormGroup.value;
    let custmer = null;
    if (form.customer && form.customer.length > 0) {
      custmer = form.customer[0].id
    }
    form.status = 1;
    let sForm = {
      code: form.assetCode,
      title: form.title,
      description: form.description,
      start_date: form.startDate,
      end_date: form.endDate,
      model_name: form.modelName,
      barcode: form.barcode,
      category: form.category,
      location: form.location,
      lat: form.lat,
      lng: form.lng,
      area: form.area,
      parent_id: form.parentId,
      wroker: form.wroker,
      additional_wroker: form.additionalWroker,
      team: form.team,
      vendors: form.vendors,
      customer_id: custmer,
      purchase_date: form.purchaseDate,
      placed_in_service: form.placedInService,
      purchase_price: form.purchasePrice,
      warranty_expiration: form.warrantyExpiration,
      residual_price: form.residualPrice,
      additional_information: form.additionalInformation,
      useful_life: form.usefulLife,
      image: this.filechoosed == true ? this.selectedFiles[0] : undefined,
    };

    if (this.isEdit) {
      this.editAssetTrackData(sForm);

      return;
    }

    this.postAssetTrackData(sForm);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postAssetTrackData(sForm) {
    this.merService.addAssetTrack(sForm).subscribe((result: any) => {
      let data = result.data;
      data.edit = false;
      this.updateTableData.emit(data);
      this.close();
    });
  }

  private editAssetTrackData(sForm): void {
    this.merService
      .editAssetTrack(this.AssetTrackdata.uuid, sForm)
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.close();
      });
  }
}
