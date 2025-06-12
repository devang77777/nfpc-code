import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BrandFormComponent } from 'src/app/components/dialog-forms/brand-form/brand-form.component';
import { CategoryFormComponent } from 'src/app/components/dialog-forms/category-form/category-form.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MasterService } from '../../master.service';
import { APP } from 'src/app/app.constant';
import { AddItemUomsComponent } from '../add-item-uoms-form/add-item-uoms-form.component';
import { AddItemGroupComponent } from '../add-item-group-form/add-item-group-form.component';

@Component({
  selector: 'app-add-item-form',
  templateUrl: './add-item-form.component.html',
  styleUrls: ['./add-item-form.component.scss'],
})
export class AddItemFormComponent implements OnInit, OnDestroy, OnChanges {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public itemFormGroup: FormGroup;
  public ItemImageFormControl: FormControl;
  public itemUomFormGroup: FormGroup;
  public productCalalogFormGroup: FormGroup;
  public itemCodeFormControl: FormControl;
  public itemNameFormControl: FormControl;
  public itemDescriptionFormControl: FormControl;
  public baseUOMPurchasePriceFormControl: FormControl;
  public baseUOMVolumFormControl: FormControl;
  public majorCategoryIdFormControl: FormControl;
  public erpCodeFormControl: FormControl;
  public subCategoryIdFormControl: FormControl;
  public brandIdFormControl: FormControl;
  public subBrandIdFormControl: FormControl;
  public itemExciseUomFormControl: FormControl;
  public itemGroupIdFormControl: FormControl;
  public salesmanlobFormControl: FormControl;
  public itemBarcodeFormControl: FormControl;
  public itemWeightFormControl: FormControl;
  public itemShelfLifeFormControl: FormControl;
  public lowerUnitUOMIdFormControl: FormControl;
  public lowerUOMUPCFormControl: FormControl;
  public isTaxApplyFormControl: FormControl;
  public isItemExciseApplyFormControl: FormControl;
  public lowerUOMPriceFormControl: FormControl;
  public baseStockUOMFormControl: FormControl;
  public secondaryStockUOMFormControl: FormControl;
  public bpoFormControl: FormControl;

  radioTitle: string;
  radioItems: Array<string>;
  model = { option: 'option3' };
  selectedIndex = 0;

  nextCommingNumberofItemCode: string = '';
  public itemMainPricesFormControl: FormControl;
  // public itemMainPriceFormArray: FormArray;
  public itemMainPriceFormGroup: FormGroup;
  public itemUPCFormControl: FormControl;
  public itemUOMIdFormControl: FormControl;
  public itemPriceFromControl: FormControl;
  public majorCategories: any[] = [];
  public subCategories;
  public itemGroups = [];
  public brands: any[] = [];
  public subBrands;
  public uoms = [];
  public exciseUoms = [];
  public itemMainPriceSource: any;
  public displayedColumns = [
    'uom',
    'upc',
    'price',
    'Is stock measured UOM?',
    'Basic Purchase Order',
    'actions',
  ];

  public formType: string;
  public isSubmitted: boolean;

  public itemSelectedFiles = [];
  public itemFilechoosed = false;
  public selectedFiles = [];
  public filechoosed = false;

  public isEdit: boolean = false;
  private itemData: any;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemMainPriceList: {
    item_uom_id: string;
    item_upc: string;
    item_price: string;
    isEdit: boolean;
  }[] = [];
  private updateItemMainPrice: {
    index: number;
    isEdit: boolean;
  };
  formPopulateData: any;

  isCustomField = false;
  moduleId = APP.MODULE.ITEMS;
  customFields: Array<any> = [];
  editData = [];
  net_weightFormControl: FormControl;
  flawerFormControl: FormControl;
  shelf_fileFormControl: FormControl;
  ingredientsFormControl: FormControl;
  energyFormControl: FormControl;
  fatFormControl: FormControl;
  proteinFormControl: FormControl;
  carbohydrateFormControl: FormControl;
  calciumFormControl: FormControl;
  sodiumFormControl: FormControl;
  potassiumFormControl: FormControl;
  crude_fibreFormControl: FormControl;
  vitaminFormControl: FormControl;
  imageFormControl: FormControl;
  isProductCatalogFormControl: FormControl;
  isPromotionalFormControl: FormControl;
  isExciseApplyFormControl: FormControl;
  isVatPercentageFormControl: FormControl;
  newLaunchFormControl: FormControl;
  newLaunchStartDateFormControl: FormControl;
  newLaunchEndDateFormControl: FormControl;
  nextCommingNumberofItemCodePrefix: any;

  lobs: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private commonToasterService: CommonToasterService,
    private masterService: MasterService,
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
    this.itemMainPriceSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.buildForm();
    this.radioItems = ['option1', 'option2', 'option3'];
    this.formPopulateData = this.route.snapshot.data[
      'item_resolve'
    ].itemAdd.data;
    this.loadFormData();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.selectedIndex = 0;
      if (this.formType == 'Add') {
        this.itemFormGroup.reset();
        this.itemUomFormGroup.reset();
        this.itemMainPriceFormGroup.reset();
        this.productCalalogFormGroup.reset();
        this.getNextComingCode();
        this.isEdit = false;
      } else if (this.formType == 'Edit') {
        this.itemFormGroup.reset();
        this.isEdit = true;
      }
      this.itemMainPriceSource = new MatTableDataSource<any>([]);
    });

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        if (data && data.uuid && this.isEdit) {
          this.editData = result.data.custom_field_value_save;
          this.itemCodeFormControl.setValue(data.item_code);
          // this.ItemImageFormControl.setValue(
          //   data.item_image ? data.item_image : ''
          // );
          if (data.item_image !== '' && data.item_image !== null) {
            this.itemSelectedFiles.push(data.item_image);
          }
          this.itemCodeFormControl.disable();
          this.itemNameFormControl.setValue(data.item_name);
          this.itemDescriptionFormControl.setValue(data.item_description);
          this.majorCategoryIdFormControl.setValue(data.item_major_category_id);
          this.subCategoryIdFormControl.setValue(data.item_sub_category_id);
          this.brandIdFormControl.setValue(data.brand_id);
          this.subBrandIdFormControl.setValue(data.sub_brand_id);
          this.itemGroupIdFormControl.setValue(data.item_group_id);
          this.itemBarcodeFormControl.setValue(data.item_barcode);
          this.itemWeightFormControl.setValue(data.item_weight);
          this.baseStockUOMFormControl.setValue(
            data.stock_keeping_unit ? data.stock_keeping_unit.toString() : null
          );
          this.itemShelfLifeFormControl.setValue(data.item_shelf_life);
          this.lowerUnitUOMIdFormControl.setValue(data.lower_unit_uom_id);
          this.lowerUOMPriceFormControl.setValue(data.lower_unit_item_price);
          this.lowerUOMUPCFormControl.setValue(data.lower_unit_item_upc);
          this.isTaxApplyFormControl.setValue(data.is_tax_apply.toString());
          this.isItemExciseApplyFormControl.setValue(
            data.item_excise.toString()
          );
          this.itemExciseUomFormControl.setValue(data.item_excise_uom_id)
          this.isExciseApplyFormControl.setValue(data.is_item_excise.toString());
          this.isVatPercentageFormControl.setValue(data.item_vat_percentage);
          this.baseUOMPurchasePriceFormControl.setValue(
            data.lower_unit_purchase_order_price
          );
          this.itemMainPricesFormControl.setValue(
            data.item_main_price.map((item) => {
              return {
                item_upc: item.item_upc,
                item_uom_id: item.item_uom_id,
                item_price: item.item_price,
                status: '1',
                purchase_order_price: item.purchase_order_price,
                stock_keeping_unit: item.stock_keeping_unit,
              };
            })
          );
          this.net_weightFormControl.setValue(
            data.product_catalog[0]?.net_weight
          );
          this.flawerFormControl.setValue(data.product_catalog[0]?.flawer);
          this.shelf_fileFormControl.setValue(
            data.product_catalog[0]?.shelf_file
          );
          this.ingredientsFormControl.setValue(
            data.product_catalog[0]?.ingredients
          );
          this.energyFormControl.setValue(data.product_catalog[0]?.energy);
          this.fatFormControl.setValue(data.product_catalog[0]?.fat);
          this.proteinFormControl.setValue(data.product_catalog[0]?.protein);
          this.carbohydrateFormControl.setValue(
            data.product_catalog[0]?.carbohydrate
          );
          this.calciumFormControl.setValue(data.product_catalog[0]?.calcium);
          this.sodiumFormControl.setValue(data.product_catalog[0]?.sodium);
          this.potassiumFormControl.setValue(
            data.product_catalog[0]?.potassium
          );
          this.crude_fibreFormControl.setValue(
            data.product_catalog[0]?.crude_fibre
          );
          this.vitaminFormControl.setValue(data.product_catalog[0]?.vitamin);
          // this.imageFormControl.setValue(data.product_catalog[0].image_string);
          // if (data.product_catalog.length > 0 && data.product_catalog[0].image_string !== null) {
          //   this.selectedFiles.push(data.product_catalog[0].image_string);
          // }
          this.isProductCatalogFormControl.setValue(
            data.is_product_catalog.toString()
          );
          this.isPromotionalFormControl.setValue(
            data.is_promotional.toString()
          );
          this.newLaunchFormControl.setValue(
            data.new_lunch == 1 ? true : false
          );
          if (data.new_lunch == 1) {
            this.newLaunchStartDateFormControl.setValue(
              data.start_date
            );
            this.newLaunchEndDateFormControl.setValue(
              data.end_date
            );
          }
          this.bpoFormControl.setValue(data.purchase_order_price);
          if (
            data.product_catalog[0] !== undefined &&
            data.product_catalog[0].image_string !== ''
          ) {
            this.selectedFiles.push(data.product_catalog[0]?.image_string);
          }
          this.itemData = data;
          this.isEdit = true;
          if (this.itemMainPricesFormControl.value.length) {
            this.updateItemMainPriceSource();
          }
        }
      })
    );

    // this.getLob();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getCustomFieldStatus();
  }
  getNextComingCode() {
    let nextNumber = {
      function_for: 'item',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.setItemCode(res.data);
      }
    });
  }
  buildForm() {
    this.itemCodeFormControl = new FormControl('', Validators.required);
    this.itemNameFormControl = new FormControl('', Validators.required);
    this.itemDescriptionFormControl = new FormControl('');
    this.majorCategoryIdFormControl = new FormControl('', Validators.required);
    this.subCategoryIdFormControl = new FormControl('');
    this.brandIdFormControl = new FormControl('');
    this.subBrandIdFormControl = new FormControl('');
    this.itemGroupIdFormControl = new FormControl('', Validators.required);
    this.salesmanlobFormControl = new FormControl('');
    this.itemBarcodeFormControl = new FormControl('');
    this.itemWeightFormControl = new FormControl('');
    this.itemShelfLifeFormControl = new FormControl('');
    this.lowerUnitUOMIdFormControl = new FormControl('', Validators.required);
    this.lowerUOMPriceFormControl = new FormControl('', Validators.required);
    this.lowerUOMUPCFormControl = new FormControl('', Validators.required);
    this.isTaxApplyFormControl = new FormControl(0);
    this.isItemExciseApplyFormControl = new FormControl(0, Validators.required);
    this.isExciseApplyFormControl = new FormControl(0, Validators.required),
      this.itemExciseUomFormControl = new FormControl(''),
      this.isVatPercentageFormControl = new FormControl(0)

    this.baseStockUOMFormControl = new FormControl(0);
    this.itemMainPricesFormControl = new FormControl([]);
    this.baseUOMPurchasePriceFormControl = new FormControl(
      '',
      Validators.required
    );
    this.baseUOMVolumFormControl = new FormControl('');
    this.itemUPCFormControl = new FormControl('', Validators.required);
    this.itemUOMIdFormControl = new FormControl('', Validators.required);
    this.itemPriceFromControl = new FormControl('', Validators.required);
    this.secondaryStockUOMFormControl = new FormControl('', Validators.required);
    this.bpoFormControl = new FormControl('');
    this.net_weightFormControl = new FormControl('');
    this.flawerFormControl = new FormControl('');
    this.shelf_fileFormControl = new FormControl('');
    this.ingredientsFormControl = new FormControl('');
    this.erpCodeFormControl = new FormControl('');
    this.energyFormControl = new FormControl('');
    this.fatFormControl = new FormControl('');
    this.proteinFormControl = new FormControl('');
    this.carbohydrateFormControl = new FormControl('');
    this.calciumFormControl = new FormControl('');
    this.sodiumFormControl = new FormControl('');
    this.potassiumFormControl = new FormControl('');
    this.crude_fibreFormControl = new FormControl('');
    this.vitaminFormControl = new FormControl('');
    this.ItemImageFormControl = new FormControl('');
    this.imageFormControl = new FormControl('');
    this.isProductCatalogFormControl = new FormControl('', Validators.required);
    this.isPromotionalFormControl = new FormControl('', Validators.required);
    this.newLaunchFormControl = new FormControl('0');
    this.newLaunchStartDateFormControl = new FormControl('');
    this.newLaunchEndDateFormControl = new FormControl('');
    this.itemUomFormGroup = new FormGroup({
      lowerUOMId: this.lowerUnitUOMIdFormControl,
      lowerUOMPrice: this.lowerUOMPriceFormControl,
      lowerUOMUPC: this.lowerUOMUPCFormControl,
      is_promotional: this.isPromotionalFormControl,
      volume: this.baseUOMVolumFormControl,
      purchase_price: this.baseUOMPurchasePriceFormControl,
      is_stock_keep: this.baseStockUOMFormControl,
    });
    this.itemFormGroup = new FormGroup({
      itemCode: this.itemCodeFormControl,
      itemImage: this.ItemImageFormControl,
      itemName: this.itemNameFormControl,
      itemDescription: this.itemDescriptionFormControl,
      majorCategoryId: this.majorCategoryIdFormControl,
      subCategoryId: this.subCategoryIdFormControl,
      brandId: this.brandIdFormControl,
      subBrandId: this.subBrandIdFormControl,
      itemGroupId: this.itemGroupIdFormControl,
      salesmanLobId: this.salesmanlobFormControl,
      itemBarcode: this.itemBarcodeFormControl,
      itemWeight: this.itemWeightFormControl,
      itemShelfLife: this.itemShelfLifeFormControl,
      itemMainPrices: this.itemMainPricesFormControl,
      is_promotional: this.isPromotionalFormControl,
      is_tax_apply: this.isTaxApplyFormControl,
      is_item_excise: this.isExciseApplyFormControl,
      item_excise_uom_id: this.itemExciseUomFormControl,
      item_vat_percentage: this.isVatPercentageFormControl,
      new_lunch: this.newLaunchFormControl,
      start_date: this.newLaunchStartDateFormControl,
      end_date: this.newLaunchEndDateFormControl,
      volume: this.baseUOMVolumFormControl,
    });
    this.itemMainPriceFormGroup = new FormGroup({
      itemUPC: this.itemUPCFormControl,
      itemUOMId: this.itemUOMIdFormControl,
      itemPrice: this.itemPriceFromControl,
      data: this.secondaryStockUOMFormControl,
      purchase_order_price: this.bpoFormControl,
    });
    this.productCalalogFormGroup = new FormGroup({
      net_weight: this.net_weightFormControl,
      flawer: this.flawerFormControl,
      shelf_file: this.shelf_fileFormControl,
      ingredients: this.ingredientsFormControl,
      energy: this.energyFormControl,
      fat: this.fatFormControl,
      protein: this.proteinFormControl,
      carbohydrate: this.carbohydrateFormControl,
      calcium: this.calciumFormControl,
      sodium: this.sodiumFormControl,
      potassium: this.potassiumFormControl,
      crude_fibre: this.crude_fibreFormControl,
      vitamin: this.vitaminFormControl,
      image: this.imageFormControl,
      is_catalog: this.isProductCatalogFormControl,
    });
    this.itemCodeFormControl.disable();
  }

  uomChanged(value) {
    if (value != undefined && value !== "") {
      if (this.itemUPCFormControl.value == '') {
        this.itemUPCFormControl.setErrors({ required: true });
      }
      if (this.itemPriceFromControl.value == '') {
        this.itemPriceFromControl.setErrors({ required: true });
      }
      if (this.secondaryStockUOMFormControl.value == '') {
        this.secondaryStockUOMFormControl.setErrors({ required: true });
      }
      if (this.bpoFormControl.value == '') {
        this.bpoFormControl.setErrors({ required: true });
      }
    }

  }

  addNewItemUom(type) {
    let dialogRef = this.dialog.open(AddItemUomsComponent, {
      position: {
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.uoms.push(result);
        if (type === 'primary') {
          this.lowerUnitUOMIdFormControl.patchValue(result.id);
        } else if (type === 'secondary') {
          this.uomChanged(result.id);
          this.itemUOMIdFormControl.patchValue(result.id);
        }
      }
    });
  }
  addNewItemGroup() {
    let dialogRef = this.dialog.open(AddItemGroupComponent, {
      position: {
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.itemGroups.push(result);
        this.itemGroupIdFormControl.patchValue(result.id);
      }
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

  itemFileChosen(event) {
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
      this.itemSelectedFiles = files;
      this.itemFilechoosed = true;
    }
  }

  setItemCode(code: any) {
    if (code.number_is !== null) {
      this.nextCommingNumberofItemCode = code.number_is;
      this.nextCommingNumberofItemCodePrefix = code.prefix_is;
      this.itemCodeFormControl.setValue(this.nextCommingNumberofItemCode);
      this.itemCodeFormControl.disable();
    } else {
      this.nextCommingNumberofItemCode = '';
      this.itemCodeFormControl.enable();
    }
  }
  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }
  getCustomFieldStatus() {
    this.apiService
      .checkCustomFieldStatus({
        organisation_id: APP.ORGANIZATION,
        module_id: this.moduleId,
      })
      .subscribe((response) => {
        this.isCustomField =
          response.data.custom_field_status == 0 ? false : true;
      });
  }
  validateCustomFields() {
    let isValid;
    const modules = this.customFields.map((item) => {
      const value =
        item.fieldType == 'multi_select'
          ? item.fieldValue.toString()
          : item.fieldValue;
      return {
        module_id: item.moduleId,
        custom_field_id: item.id,
        custom_field_value: value,
      };
    });
    isValid = modules.find(
      (module) =>
        module.custom_field_value === undefined ||
        module.custom_field_value === ''
    );
    if (isValid) {
      this.commonToasterService.showWarning(
        'Warning',
        'Please fill all custom fields.'
      );
      return false;
    }
    return modules;
  }
  loadFormData() {
    const formData = this.formPopulateData;
    this.majorCategories = formData.item_major_category;
    this.brands = formData.brand;
    this.itemGroups = formData.item_group;
    this.uoms = formData.item_uom;
    this.exciseUoms = formData.item_uom;
  }

  itemPriceLen(len: number) {
    return this.itemMainPriceSource.data.length < 3 ? true : false;
  }

  public categoryProvider(): Observable<any[]> {
    return this.apiService
      .getAllMajorCategorires()
      .pipe(map((result) => result.data));
  }
  public categorySelected(data: any): void {
    this.majorCategoryIdFormControl.setValue(data.id);
  }
  public brandProvider(): Observable<any[]> {
    return this.apiService.getAllBrands().pipe(map((result) => result.data));
  }
  public uomProvider(): Observable<any[]> {
    return this.apiService.getAllItemUoms().pipe(map((result) => result.data))
  }
  public brandSelected(data: any): void {
    this.brandIdFormControl.setValue(data.id);
  }
  public uomSelected(data: any): void {
    this.itemExciseUomFormControl.setValue(data.id);
  }
  get isSecondaryStock() {
    let status: Boolean = false;
    if (this.baseStockUOMFormControl.value == 1) {
      status = true;
    } else {
      status = false;
    }
    return status;
  }
  get isBaseStock() {
    if (this.itemMainPricesFormControl?.value?.length) {
      return this.itemMainPricesFormControl.value.some(function (el) {
        return el.data === 1;
      });
    }
  }

  openBrand() {
    let dialogRef = this.dialog.open(BrandFormComponent, {
      width: '650px',
      position: {
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.subscriptions.push(
        this.apiService
          .getAllBrands()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((brands) => {
            this.brands = brands;
          })
      );

      if (!result) {
        return;
      }
      this.brandIdFormControl.setValue(result.id);
    });
  }

  openExciseUom() {
    let dialogRef = this.dialog.open(BrandFormComponent, {
      width: '650px',
      position: {
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.subscriptions.push(
        this.apiService
          .getAllItemUoms()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((brands) => {
            this.exciseUoms = brands;
          })
      );

      if (!result) {
        return;
      }
      this.itemExciseUomFormControl.setValue(result.id);
    });
  }

  openCategory() {
    let dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '650px',
      position: {
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.subscriptions.push(
        this.apiService
          .getAllMajorCategorires()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((categories) => {
            this.majorCategories = categories;
          })
      );
      if (!result) {
        return;
      }
      this.majorCategoryIdFormControl.setValue(result.id);
    });
  }

  public close() {
    this.fds.close();
    this.itemFormGroup.reset();
    this.itemUomFormGroup.reset();
    this.itemMainPriceFormGroup.reset();
    this.productCalalogFormGroup.reset();
    this.resetItemMainPriceSource();
    this.isEdit = false;
    this.itemFilechoosed = false;
    this.itemSelectedFiles = [];
    this.filechoosed = false;
    this.selectedFiles = [];
  }

  public saveItemData(): void {
    this.isSubmitted = true;
    if (this.itemFormGroup.invalid) {
      Object.keys(this.itemFormGroup.controls).forEach((key) => {
        this.itemFormGroup.controls[key].markAsDirty();
      });
      //console.log(this.itemFormGroup);
      return;
    }
    if (this.isEdit) {
      this.editItemData();
      return;
    }
    this.postItemData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public editItemCode(num: number, itemCodeData: any): void {
    this.itemUPCFormControl.setValue(itemCodeData.item_upc);
    this.itemUOMIdFormControl.setValue(itemCodeData.item_uom_id);
    this.itemPriceFromControl.setValue(itemCodeData.item_price);
    this.secondaryStockUOMFormControl.setValue(
      itemCodeData.stock_keeping_unit
        ? itemCodeData.stock_keeping_unit.toString()
        : null
    );
    this.updateItemMainPrice = {
      index: num,
      isEdit: true,
    };
    this.bpoFormControl.setValue(itemCodeData.purchase_order_price);
  }

  public deleteItemCode(index: number): void {
    this.itemMainPricesFormControl.value.splice(index, 1);
    this.updateItemMainPriceSource();
  }

  public addItemCode(): void {
    if (this.updateItemMainPrice && this.updateItemMainPrice.isEdit) {
      this.updateExistingItemCode(
        this.updateItemMainPrice && this.updateItemMainPrice.index
      );
    }
    if (this.itemMainPriceFormGroup.invalid) {
      return;
    }
    //console.log(this.bpoFormControl.value);
    const itemMainPrice = {
      item_upc: this.itemUPCFormControl.value,
      item_uom_id: this.itemUOMIdFormControl.value,
      item_price: this.itemPriceFromControl.value,
      stock_keeping_unit: this.secondaryStockUOMFormControl.value,
      status: '1',
      purchase_order_price:
        this.bpoFormControl.value == '' || this.bpoFormControl.value == null
          ? 0.0
          : this.bpoFormControl.value,
    };
    const itemPrice = this.itemMainPricesFormControl.value
      ? this.itemMainPricesFormControl.value
      : [];
    this.itemMainPricesFormControl.setValue([...itemPrice, itemMainPrice]);
    this.updateItemMainPriceSource();
  }

  public updateExistingItemCode(index: number): void {
    this.itemMainPricesFormControl.value.splice(index, 1, {
      item_upc: this.itemUPCFormControl.value,
      item_uom_id: this.itemUOMIdFormControl.value,
      item_price: this.itemPriceFromControl.value,
      stock_keeping_unit: this.secondaryStockUOMFormControl.value,
      purchase_order_price: this.bpoFormControl.value,

      status: '1',
    });
    this.updateItemMainPrice = undefined;
    this.updateItemMainPriceSource();
  }

  private updateItemMainPriceSource(): void {
    this.itemMainPriceSource = new MatTableDataSource<any>(
      this.itemMainPricesFormControl.value
    );
    this.itemMainPriceSource.paginator = this.paginator;
    this.itemMainPriceFormGroup.reset();
  }

  private resetItemMainPriceSource(): void {
    this.itemMainPriceSource = new MatTableDataSource();
  }
  public getUOMName(id) {
    const uom = this.uoms?.find((x) => x.id == id);
    return uom ? uom.name : '';
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  private postItemData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.masterService
      .itemAdd({
        item_code: this.itemCodeFormControl.value,
        item_name: this.itemNameFormControl.value,
        item_description: this.itemDescriptionFormControl.value,
        item_major_category_id: this.majorCategoryIdFormControl.value,
        item_sub_category_id: this.subCategoryIdFormControl.value,
        brand_id: this.brandIdFormControl.value,
        sub_brand_id: this.subBrandIdFormControl.value,
        item_group_id: this.itemGroupIdFormControl.value,
        lob_id: this.salesmanlobFormControl.value,
        item_barcode: this.itemBarcodeFormControl.value,
        item_weight: this.itemWeightFormControl.value,
        item_shelf_life: this.itemShelfLifeFormControl.value,
        lower_unit_uom_id: this.lowerUnitUOMIdFormControl.value,
        lower_unit_item_price: this.lowerUOMPriceFormControl.value,
        lower_unit_item_upc: this.lowerUOMUPCFormControl.value,
        is_tax_apply: Number(this.isTaxApplyFormControl.value) || 0,
        item_excise: this.isItemExciseApplyFormControl.value,
        is_item_excise: this.isExciseApplyFormControl.value,
        item_excise_uom_id: this.itemExciseUomFormControl.value,
        item_net: 1,
        erp_code: this.erpCodeFormControl.value,
        current_stage_comment: 1,
        item_vat_percentage: this.isVatPercentageFormControl.value,
        item_main_price: this.itemMainPricesFormControl.value,
        status: '1',
        base_stock_keeping_unit: this.baseStockUOMFormControl.value
          ? this.baseStockUOMFormControl.value.toString()
          : null,
        secondary_stock_keeping_unit: this.secondaryStockUOMFormControl.value
          ? this.secondaryStockUOMFormControl.value.toString()
          : null,
        lower_unit_purchase_order_price: this.baseUOMPurchasePriceFormControl
          .value,
        net_weight: this.net_weightFormControl.value,
        flawer: this.flawerFormControl.value,
        shelf_file: this.shelf_fileFormControl.value,
        ingredients: this.ingredientsFormControl.value,
        energy: this.energyFormControl.value,
        fat: this.fatFormControl.value,
        protein: this.proteinFormControl.value,
        carbohydrate: this.carbohydrateFormControl.value,
        calcium: this.calciumFormControl.value,
        sodium: this.sodiumFormControl.value,
        potassium: this.potassiumFormControl.value,
        crude_fibre: this.crude_fibreFormControl.value,
        vitamin: this.vitaminFormControl.value,
        item_image:
          this.itemFilechoosed == true ? this.itemSelectedFiles[0] : undefined,
        image:
          this.filechoosed == true ? this.selectedFiles[0] : undefined,
        is_product_catalog: this.isProductCatalogFormControl.value || 0,
        is_promotional: this.isPromotionalFormControl.value || 0,
        new_lunch: this.newLaunchFormControl.value == true ? '1' : '0',
        start_date: this.newLaunchStartDateFormControl.value,
        end_date: this.newLaunchEndDateFormControl.value,
        volume: this.baseUOMVolumFormControl.value,
        modules,
      })
      .subscribe(
        (result: any) => {
          if (result.status) {
            this.commonToasterService.showSuccess(
              'Item add',
              'Item Added Successfully.'
            );
          }
          let data = result.data;
          data.edit = false;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (error) => {
          this.commonToasterService.showError('Fail', 'Item Added Falied.');
        }
      );
  }

  private editItemData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.masterService
      .itemEdit(this.itemData.uuid, {
        item_code: this.itemCodeFormControl.value,
        item_name: this.itemNameFormControl.value,
        item_description: this.itemDescriptionFormControl.value,
        item_major_category_id: this.majorCategoryIdFormControl.value,
        item_sub_category_id: this.subCategoryIdFormControl.value,
        brand_id: this.brandIdFormControl.value,
        sub_brand_id: this.subBrandIdFormControl.value,
        item_group_id: this.itemGroupIdFormControl.value,
        lob_id: this.salesmanlobFormControl.value,
        item_barcode: this.itemBarcodeFormControl.value,
        item_weight: this.itemWeightFormControl.value,
        item_shelf_life: this.itemShelfLifeFormControl.value,
        lower_unit_uom_id: this.lowerUnitUOMIdFormControl.value,
        lower_unit_item_price: this.lowerUOMPriceFormControl.value,
        lower_unit_item_upc: this.lowerUOMUPCFormControl.value,
        is_tax_apply: Number(this.isTaxApplyFormControl.value),
        item_excise: this.isItemExciseApplyFormControl.value,
        is_item_excise: this.isExciseApplyFormControl.value,
        item_net: 1,
        item_excise_uom_id: this.itemExciseUomFormControl.value,
        erp_code: this.erpCodeFormControl.value,
        current_stage_comment: 1,
        item_vat_percentage: this.isVatPercentageFormControl.value,
        item_main_price: this.itemMainPricesFormControl.value,
        status: '1',
        base_stock_keeping_unit: this.baseStockUOMFormControl.value
          ? this.baseStockUOMFormControl.value.toString()
          : null,
        secondary_stock_keeping_unit: this.secondaryStockUOMFormControl.value
          ? this.secondaryStockUOMFormControl.value.toString()
          : null,
        lower_unit_purchase_order_price: this.baseUOMPurchasePriceFormControl
          .value,
        net_weight: this.net_weightFormControl.value,
        flawer: this.flawerFormControl.value,
        shelf_file: this.shelf_fileFormControl.value,
        ingredients: this.ingredientsFormControl.value,
        energy: this.energyFormControl.value,
        fat: this.fatFormControl.value,
        protein: this.proteinFormControl.value,
        carbohydrate: this.carbohydrateFormControl.value,
        calcium: this.calciumFormControl.value,
        sodium: this.sodiumFormControl.value,
        potassium: this.potassiumFormControl.value,
        crude_fibre: this.crude_fibreFormControl.value,
        vitamin: this.vitaminFormControl.value,
        // item_image : this.ItemImageFormControl.value,
        // image: this.imageFormControl.value,
        item_image:
          this.itemFilechoosed == true ? this.itemSelectedFiles[0] : undefined,
        image:
          this.filechoosed == true ? this.selectedFiles[0] : undefined,
        is_product_catalog: this.isProductCatalogFormControl.value || 0,
        is_promotional: this.isPromotionalFormControl.value || 0,
        new_lunch: this.newLaunchFormControl.value == true ? '1' : '0',
        start_date: this.newLaunchStartDateFormControl.value,
        end_date: this.newLaunchEndDateFormControl.value,
        modules,
      })
      .subscribe(
        (result: any) => {
          this.isEdit = false;
          if (result.status) {
            this.commonToasterService.showSuccess(
              'Item updated',
              'Item Updated Successfully.'
            );
          }
          let data = result.data;
          data.edit = true;
          this.updateTableData.emit(data);
          this.close();
        },
        (error) => {
          this.commonToasterService.showError('Fail', 'Item Updated Falied.');
        }
      );
  }

  open() {
    let response: any;
    let data = {
      title: 'Item Code',
      functionFor: 'item',
      code: this.nextCommingNumberofItemCode,
      prefix: this.nextCommingNumberofItemCodePrefix,
      key: this.nextCommingNumberofItemCode.length ? 'autogenerate' : 'manual',
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
          this.itemCodeFormControl.setValue('');
          this.nextCommingNumberofItemCode = '';
          this.itemCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.itemCodeFormControl.setValue(res.data.next_coming_number_item);
          this.nextCommingNumberofItemCode = res.data.next_coming_number_item;
          this.nextCommingNumberofItemCodePrefix = res.reqData.prefix_code;
          this.itemCodeFormControl.disable();
        }
      });
  }

  getLob() {
    this.apiService.getLobs().subscribe(lobs => {
      this.lobs = lobs.data;
    })
  }

}
