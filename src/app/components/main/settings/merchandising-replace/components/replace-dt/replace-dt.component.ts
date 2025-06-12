import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  SimpleChanges,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { ReplaceService } from '../../replace.service';
@Component({
  selector: 'app-replace-dt',
  templateUrl: './replace-dt.component.html',
  styleUrls: ['./replace-dt.component.scss']
})
export class ReplaceDtComponent extends BaseComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Output() public remove: EventEmitter<any> = new EventEmitter<any>();
  @Input() public data: any;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private service: ReplaceService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'new', title: 'New', show: true },
    { def: 'old', title: 'Old', show: true },
    { def: 'date', title: 'Date', show: true },
    // { def: 'action', title: 'Action', show: true },
  ];

  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  constructor(
    service: ReplaceService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog
  ) {
    super('Replace');
    Object.assign(this, { service, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
  }

  getBanklist() {
    this.subscriptions.push(
      this.service
        .getReplace(this.page, this.pageSize)
        .subscribe((res: any) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.updateDataSource(res.data);
        })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getBanklist();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.data && changes.data.currentValue) {
        this.updateDataSource(changes.data.currentValue);
      }
    }
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public onEdit(data: any): void {
    this.dataEditor.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: data,
    });
    this.openAddReason();
  }

  public openDeleteBox(uuid: any): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: { title: `Are you sure want to delete ${uuid}?` },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data && data.hasConfirmed) {
          this.deleteReason(uuid);
        }
      });
  }

  private deleteReason(uuid: any): void {
    this.service.deleteReplace(uuid).subscribe((result) => {
      this.remove.emit(uuid);
    });
  }

  private openAddReason(): void {
    this.fds.setFormName('add-reason');
    this.fds.setFormType('Edit');
    this.fds.open();
  }

}
