import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { Promotional } from '../../promotional-interface';
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
  @Input() public promotion_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  expandedElement: Promotional | null;
  selectedColumnFilter: string;

  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'free_item', 'invoice', 'salesman', 'customer', 'phone', 'amount_spend'];
  dateFilterControl: FormControl;
  constructor(private merService: MerchandisingService, private _lightbox: Lightbox) {
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

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }
  getPromotionalPostList(filter, value) {
    if (filter == "date") {
      value = this.dateFilterControl.value;
    }
    if (value == "") return false;
    this.subscriptions.push(
      this.merService.getPromotionalPostList(this.promotion_id, filter, value).subscribe((res) => {
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
