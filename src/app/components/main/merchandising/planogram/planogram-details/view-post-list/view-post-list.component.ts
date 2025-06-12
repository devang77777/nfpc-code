import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Planogram } from '../../planogram-interface';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Lightbox } from 'ngx-lightbox';
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
  @Input() public planogram_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  expandedElement: Planogram | null;
  private subscriptions: Subscription[] = [];
  selectedColumnFilter: string;
  filterForm: FormGroup;
  public displayedColumns = ['created_at', 'salesman', 'customerCode', 'customer', 'distribution_name'];
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
      planogram_id: [this.planogram_id],
      date: [''],
      salesman_name: [''],
      customer_name: [''],
      customer_code: [''],
      distribution_name: [''],
      today: [newdate],
      all: false
    })
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

  getPlanogramPostList(filter, value) {
    if (filter == "date") {
      value = this.dateFilterControl.value;
      this.filterForm.get('all').setValue(false);
    }
    if (value == "") return false;
    this.filterForm.get(filter).setValue(value);
    this.filterForm.get('planogram_id').setValue(this.planogram_id);
    this.filterData();
  }
  filterData() {
    this.subscriptions.push(
      this.merService.getPlanogramPostList(this.filterForm.value).subscribe((res) => {
        this.itemSource = new MatTableDataSource<any>(res.data);
        this.itemSource.paginator = this.paginator;
        this.postList = res.data;
      })
    )
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
    //console.log(file);
    this.merService.downloadFile(file);
  }

}
