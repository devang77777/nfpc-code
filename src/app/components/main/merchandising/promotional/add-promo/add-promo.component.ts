import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MerchandisingService } from '../../merchandising.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-add-promo',
  templateUrl: './add-promo.component.html',
  styleUrls: ['./add-promo.component.scss']
})
export class AddPromoComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public promotionFormGroup;

  private isEdit: boolean;
  public formType: string;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  public items: any[] = [];
  private subscriptions: Subscription[] = [];
  dataSource = new MatTableDataSource();
  columnsToDisplay = ['name', 'action'];
  destributionData = [];
  promotionData: any;

  constructor(
    private fb: FormBuilder,
    fds: FormDrawerService,
    public merService: MerchandisingService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private router: Router
  ) {
    Object.assign(this, { fds, merService, dataEditor });
    this.dataSource = new MatTableDataSource<any>();
  }
  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => (this.formType = s));
    this.promotionFormGroup = this.fb.group({
      amount: ['', [Validators.required]],
      item_id: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
    });

    this.subscriptions.push(
      this.merService.getPromotionalItems().subscribe((res: any) => {
        this.items = res.data;
      })
    );

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.promotionFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
        const data: any = result.data;

        if (data && data.uuid && this.isEdit) {
          this.promotionFormGroup.patchValue({
            amount: data.amount,
            item_id: data.item_id,
            start_date: data.start_date,
            end_date: data.end_date,
          })
          this.promotionData = data;
          this.isEdit = true;
        }
        return;
      }));
    });
  }
  public savePromotionData() {
    if (this.promotionFormGroup.invalid) {
      return false;
    }
    let form = this.promotionFormGroup.value;
    let sForm = {
      item_id: form.item_id,
      start_date: form.start_date,
      amount: form.amount,
      end_date: form.end_date,
      status: 1,
    };

    if (this.isEdit) {
      this.editPlanogramData(sForm);
      return;
    }

    this.postPlanogramData(sForm);

  }

  postPlanogramData(sForm) {
    this.subscriptions.push(
      this.merService.addPromotion(sForm).subscribe((res) => {
        let data = res.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      })
    );
  }

  editPlanogramData(sForm) {
    this.subscriptions.push(
      this.merService.editPromotion(this.promotionData.uuid, sForm).subscribe((res) => {
        let data = res.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      })
    );
  }

  public close() {
    this.fds.close();
    this.promotionFormGroup.reset();
    this.isEdit = false;
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
