import {
  Component,
  ElementRef,
  EventEmitter,
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

@Component({
  selector: 'app-add-competitor',
  templateUrl: './add-competitor.component.html',
  styleUrls: ['./add-competitor.component.scss']
})
export class AddCompetitorComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('file') public fileinput: ElementRef;
  public competitorFormGroup;
  public competitordata;
  private isEdit: boolean;
  public formType: string;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  public customer: any[] = [];
  private subscriptions: Subscription[] = [];
  public selectedFiles = [];
  public filechoosed = false;
  public brands = [];
  public merchandisers = [];
  constructor(
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
    this.merService.getComptetitorFormLists().subscribe((res) => {
      this.brands = res.data.brand;
      this.merchandisers = res.data.merchandiser.map(item => {
        if (item.user !== null) {
          item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
          return item;
        }
        return item;
      });
    })
    this.fds.formType.subscribe((s) => (this.formType = s));
    this.competitorFormGroup = this.fb.group({
      companyName: ['', [Validators.required]],
      brandName: ['', [Validators.required]],
      compareBrands: ['', [Validators.required]],
      merchandiser: ['', [Validators.required]],
      itemName: ['', [Validators.required]],
      price: ['', [Validators.required]],
      promotion: ['', [Validators.required]],
      notes: ['', [Validators.required]],
      image: [''],
    });
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.competitorFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;

          if (data && data.uuid && this.isEdit) {
            let images = [];
            data.competitor_info_image.forEach(element => {
              images.push(element.image_string);
            });
            let brands = [], salesman = [];
            data.competitor_info_our_brand.forEach(element => {
              brands.push({ id: element.brand_id, itemName: `${element.brand?.brand_name}` });
            });
            salesman = [{ id: data.salesman_id, itemName: `${data.salesman.firstname} ${data.salesman.lastname}` }]
            this.competitorFormGroup.patchValue({
              companyName: data.company,
              brandName: data.brand,
              compareBrands: brands,
              merchandiser: salesman,
              itemName: data.item,
              price: data.price,
              promotion: data.promotion,
              notes: data.note,
              image: data.competitor_info_image,
            });

            this.selectedFiles = images;
            this.competitordata = data;
            this.isEdit = true;
          }

          return;
        })
      );
    });
  }

  fileChosen(event) {
    let files = [];
    if (event.target.files && event.target.files.length > 0) {
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
    this.competitorFormGroup.reset();
    this.isEdit = false;
    this.filechoosed = false;
    this.selectedFiles = [];
  }

  public savecompetitorData(): void {
    if (this.competitorFormGroup.invalid) {
      return;
    }

    if (this.isEdit && this.selectedFiles.length == 0) {
      this.competitorFormGroup.controls['image'].markAsTouched();
      return;
    } else {
      this.competitorFormGroup.controls['image'].setErrors(null);
    }

    // if (this.competitorFormGroup.value.lat == null) {
    //   this.competitorFormGroup.controls['location'].setValue('');
    //   return;
    // }
    let form = this.competitorFormGroup.value;
    let compareBrands = [];
    if (form.compareBrands && form.compareBrands.length > 0) {
      compareBrands = form.compareBrands.map(x => x.id);
    }
    let merch = null
    if (form.merchandiser && form.merchandiser.length > 0) {
      merch = form.merchandiser[0].id
    }
    form.status = 1;
    let sForm = {
      company: form.companyName,
      brand: form.brandName,
      compare_brands: compareBrands,
      salesman_id: merch,
      item: form.itemName,
      price: form.price,
      promotion: form.promotion,
      note: form.notes,
      competitor_info_images: this.filechoosed == true ? this.selectedFiles : undefined,
    };

    if (this.isEdit) {
      this.editcompetitorData(sForm);

      return;
    }

    this.postcompetitorData(sForm);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postcompetitorData(sForm) {
    this.merService.addcompetitor(sForm).subscribe((result: any) => {
      let data = result.data;
      data.edit = false;
      this.updateTableData.emit(data);
      this.close();
    });
  }

  private editcompetitorData(sForm): void {
    this.merService
      .editcompetitor(this.competitordata.uuid, sForm)
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.close();
      });
  }

}
