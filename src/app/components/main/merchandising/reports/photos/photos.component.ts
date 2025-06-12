import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { object } from '@amcharts/amcharts4/core';
import { Lightbox } from 'ngx-lightbox';
@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss'],
})
export class PhotosComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  distributionPosts: MatTableDataSource<any>;
  planogramPosts: MatTableDataSource<any>;
  assetTrackingList: MatTableDataSource<any>;
  campaignPictures: MatTableDataSource<any>;
  complaintFeedback: MatTableDataSource<any>;
  competitorInfo: MatTableDataSource<any>;
  private subscriptions: Subscription[] = [];
  public distributionColumns = [
    'customerCode',
    'customerName',
    'distributionName',
    'merchandiserName',
    'image1',
    'image2',
    'image3',
    'image4',
    'createdAt',
  ];
  public planogramColumns = [
    'customerCode',
    'distributionName',
    'merchandiserName',
    'distributionName',
    'distributionName',
    'before_images',
    'after_images',
  ];
  public assetTrackingColumns = ['assetName', 'feedback', 'image_0', 'image_1'];
  public campaignColumns = [
    'customerCode',
    'customerName',
    'merchandiserName',
    'campaign_code',
    'image_0',
  ];
  public competitorInfoColumns = [
    'item',
    'merchandiserName',
    'note',
    'price',
    'image_0',
  ];

  data = [];
  dateFilterControl: FormControl;
  constructor(
    private merService: MerchandisingService,
    public dataEditor: DataEditor,
    private _lightbox: Lightbox
  ) {
    this.distributionPosts = new MatTableDataSource<any>();
    this.planogramPosts = new MatTableDataSource<any>();
    this.assetTrackingList = new MatTableDataSource<any>();
    this.campaignPictures = new MatTableDataSource<any>();
    this.complaintFeedback = new MatTableDataSource<any>();
    this.competitorInfo = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          //console.log(value);
          this.distributionPosts = new MatTableDataSource<any>(
            value.data.distribution_post_image
          );
          this.planogramPosts = new MatTableDataSource<any>(
            value.data.planogram_post
          );
          this.assetTrackingList = new MatTableDataSource<any>(
            value.data.asset_tracking
          );
          this.campaignPictures = new MatTableDataSource<any>(
            value.data.campaign_picture
          );
          this.complaintFeedback = new MatTableDataSource<any>(
            value.data.complaint_feedback
          );
          this.competitorInfo = new MatTableDataSource<any>(
            value.data.competitor_info
          );
          const mapped = [];
          Object.keys(value.data).forEach((item, index) => {
            const camleCase = this.snakeToCamel(item);
            const converted = this.camelToSentenceCase(camleCase);

            mapped.push({ key: converted, data: value.data[item] });

            const itemSource = new MatTableDataSource<any>(value.data[item]);
          });
          this.data = mapped;

          this.updateTableData(value.data);
        }
      })
    );
  }
  camelToSentenceCase = (text) => {
    text = text.replace('Id', '');
    text = text.replace('_id', '');
    const result = text.replace(/([A-Z])/g, ' $1');
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  };
  snakeToCamel(key) {
    const converted = key.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
    return converted;
  }
  updateTableData(data = []) { }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
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
