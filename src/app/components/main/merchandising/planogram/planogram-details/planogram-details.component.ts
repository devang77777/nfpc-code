import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  OnDestroy, SimpleChanges, ViewChild
} from '@angular/core';
import { Planogram } from '../planogram-interface';
import { DataEditor } from '../../../../../services/data-editor.service';
import { CompDataServiceType } from '../../../../../services/constants';
import { Subscription } from 'rxjs';
import { Utils } from '../../../../../services/utils';
import { MerchandisingService } from '../../merchandising.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Lightbox } from 'ngx-lightbox';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-planogram-details',
  templateUrl: './planogram-details.component.html',
  styleUrls: ['./planogram-details.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PlanogramDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public planogram: Planogram | any;
  @Input() public isDetailVisible: boolean;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public displayedColumns1 = ['customer_code', 'name',];
  public displayedColumns2 = ['name'];
  expandedElement1: any | null;
  expandedElement2: any | null;
  itemSource1 = new MatTableDataSource();
  itemSource2 = new MatTableDataSource();
  planogramId;
  selectedColumnFilter: string;

  private subscriptions: Subscription[] = [];
  private dataService: DataEditor;
  private deleteDialog: MatDialog;
  private formDrawer: FormDrawerService;
  postList = [];
  selectedTab = 0;
  currentDate: string;
  constructor(
    dataService: DataEditor,
    public merService: MerchandisingService,
    private cts: CommonToasterService,
    deleteDialog: MatDialog,
    formDrawer: FormDrawerService,
    private _lightbox: Lightbox
  ) {
    super('Planogram');
    this.itemSource1 = new MatTableDataSource<any>();
    this.itemSource2 = new MatTableDataSource<any>();
    Object.assign(this, { deleteDialog, dataService, merService, formDrawer });
  }

  ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate()) < 10) {
      date = '0' + (today.getDate());
    }
    this.currentDate = today.getFullYear() + '-' + month + '-' + date;
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }
  expandList(data) {
    this.expandedElement1 = this.expandedElement1 === data ? null : data;
    //console.log(data);
    this.itemSource2 = new MatTableDataSource<any>(data.planogram_distribution);
  }

  expandListDist(data) {
    this.expandedElement2 = this.expandedElement2 === data ? null : data;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.planogram) {
        let currentvalue = changes.planogram.currentValue;
        this.itemSource1 = new MatTableDataSource<any>(currentvalue?.planogram_customer);
      }
      this.selectedTabChange(this.selectedTab);
    }
  }

  public closeDetailView(): void {
    this.selectedTab = 0;
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Planogram Info ${this.planogram.name}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBank();
      }
    });
  }

  public deleteBank(): void {
    let delObj = { uuid: this.planogram.uuid, delete: true };
    this.merService.deletePlanogram(this.planogram.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");

    });
  }

  openEditPlanogram() {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.planogram });
    this.formDrawer.setFormName('add-planogram');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  selectedTabChange(index) {
    switch (index) {
      case 1:
        this.getPlanogramPostList();
        break;
    }
  }

  getPlanogramPostList() {
    let model = {
      planogram_id: this.planogram.id,
      date: '',
      salesman_name: '',
      customer_name: '',
      customer_code: '',
      distribution_name: '',
      today: this.currentDate,
      all: false
    }
    this.subscriptions.push(
      this.merService.getPlanogramPostList(model).subscribe((res) => {
        this.postList = res.data;
      })
    )
  }

  public downloadFile(file) {
    //console.log(file);
    this.merService.downloadFile(file);
  }

  open(image, index: number): void {
    let imagesArr = [];
    if (image !== undefined && image.length > 0) {
      imagesArr.push({
        src: image,
        caption: '',
        thumb: image
      });
    }
    this._lightbox.open(imagesArr, index);
  }

  close(): void {
    this._lightbox.close();
  }
}
