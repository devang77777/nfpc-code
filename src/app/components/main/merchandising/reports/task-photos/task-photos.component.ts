import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';

@Component({
  selector: 'app-task-photos',
  templateUrl: './task-photos.component.html',
  styleUrls: ['./task-photos.component.scss'],
})
export class TaskPhotosComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = [
    'created_at',
    'photo_text',
    'photo_date',
    'photo',
    'photo_size',
  ];

  data = [];
  dateFilterControl: FormControl;
  constructor(
    private merService: MerchandisingService,
    public dataEditor: DataEditor
  ) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          //console.log(value);
          this.data = value.data;
          this.updateTableData(value.data);
        }
      })
    );
  }

  updateTableData(data = []) {
    let newData = data.length > 0 ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
}
