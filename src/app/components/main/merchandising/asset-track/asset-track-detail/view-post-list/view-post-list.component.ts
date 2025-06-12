import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AssetTrack } from '../../asset-track-interface';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Lightbox } from 'ngx-lightbox';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-view-post-list',
  templateUrl: './view-post-list.component.html',
  styleUrls: ['./view-post-list.component.scss'],
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
export class ViewPostListComponent implements OnInit {
  @Input() public postList;
  @Input() public AssetTrack_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  expandedElement: AssetTrack | null;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'salesman', 'feedback'];
  dateFilterControl: FormControl;
  constructor(public fb: FormBuilder, private merService: MerchandisingService, private _lightbox: Lightbox) {
    this.itemSource = new MatTableDataSource<any>();
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
    let newdate = today.getFullYear() + '-' + month + '-' + date;
    this.dateFilterControl = new FormControl(newdate);
    this.filterForm = this.fb.group({
      asset_tracking_id: [this.AssetTrack_id],
      date: [''],
      salesman_name: [''],
      today: [newdate],
      all: false
    })
  }

  expandList(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.postList) {
        let currentValue = changes.postList.currentValue;
        this.postList = currentValue;
        this.itemSource = new MatTableDataSource<any>(this.postList);
        this.itemSource.paginator = this.paginator;
      }
    }
  }

  getAssetTrackPostList(filter, value) {
    if (filter == "date") {
      value = this.dateFilterControl.value;
      this.filterForm.get('all').setValue(false);
    }
    if (value == "") return false;
    this.filterForm.get(filter).setValue(value);
    this.filterForm.get('asset_tracking_id').setValue(this.AssetTrack_id);
    this.filterData();
  }

  filterData() {
    this.subscriptions.push(
      this.merService.getAssetTrackPostList(this.filterForm.value).subscribe((res) => {
        this.postList = res.data;
        ////console.log(this.postList);
        this.itemSource = new MatTableDataSource<any>(this.postList);
        this.itemSource.paginator = this.paginator;
      })
    )
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.filterData();
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  open(images, index: number): void {
    let imagesArr = [];
    if (images !== undefined && images.length > 0) {
      images.forEach(element => {
        imagesArr.push({
          src: element?.image_string,
          caption: '',
          thumb: element?.image_string
        });
      });
    }
    this._lightbox.open(imagesArr, index);
  }

  close(): void {
    this._lightbox.close();
  }

  public downloadFile(file) {
    ////console.log(file);
    this.merService.downloadFile(file);
  }

}
