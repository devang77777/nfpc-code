import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Lightbox } from 'ngx-lightbox';
@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss'],
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
export class ImageListComponent implements OnInit {
  @Input() public imageData;
  @Input() public distribution_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'salesman', 'customerCode', 'customer'];
  public dateFilterControl;
  expandedElement: any | null;
  selectedColumnFilter: string;
  filterForm: FormGroup;
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
    this.itemSource = new MatTableDataSource<any>(this.imageData);
    this.itemSource.paginator = this.paginator;
    this.filterForm = this.fb.group({
      distribution_id: [this.distribution_id],
      date: [''],
      salesman_name: [''],
      customer_name: [''],
      customer_code: [''],
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
      if (changes.imageData) {
        let currentValue = changes.imageData.currentValue;
        this.imageData = currentValue;
        this.itemSource = new MatTableDataSource<any>(this.imageData);
        this.itemSource.paginator = this.paginator;
      }
    }
  }

  getDistributionImageList(filter, value) {
    if (filter == "date") {
      value = this.dateFilterControl.value;
      this.filterForm.get('all').setValue(false);
    }
    if (value == "") return false;
    this.filterForm.get(filter).setValue(value);
    this.filterForm.get('distribution_id').setValue(this.distribution_id);
    this.filterData();
  }
  filterData() {
    this.subscriptions.push(
      this.merService.getDistributionImageList(this.filterForm.value).subscribe((res) => {
        this.itemSource = new MatTableDataSource<any>(res.data);
        this.itemSource.paginator = this.paginator;
      })
    )
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
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

  public downloadFile(file) {
    //console.log(file);
    this.merService.downloadFile(file);
  }

}
