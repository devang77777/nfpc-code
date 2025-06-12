import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { Lightbox } from 'ngx-lightbox';
@Component({
  selector: 'app-subtable',
  templateUrl: './subtable.component.html',
  styleUrls: ['./subtable.component.scss']
})
export class SubtableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  @Input() public displayedColumns;
  @Input() public displayLabels;
  @Input() public displayData;
  @Input() public reportName;


  dateFilterControl: FormControl;
  constructor(private merService: MerchandisingService, private _lightbox: Lightbox) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.itemSource = new MatTableDataSource<any>(this.displayData);
    this.itemSource.paginator = this.paginator;
  }

  ngOnChanges(): void {
    //console.log(this.displayedColumns, this.displayLabels, this.displayData);
    this.itemSource = new MatTableDataSource(this.displayData);
    this.itemSource.paginator = this.paginator;
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

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
