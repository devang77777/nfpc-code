import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { Campaign } from '../campaign-interface';
import { DataEditor } from '../../../../../services/data-editor.service';
import { CompDataServiceType } from '../../../../../services/constants';
import { MerchandisingService } from '../../merchandising.service';
import { Lightbox } from 'ngx-lightbox';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.scss'],
})
export class CampaignDetailsComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public campaign: Campaign | any;
  @Input() public isDetailVisible: boolean;
  private dataService: DataEditor;
  images: any[];
  constructor(dataService: DataEditor, public merService: MerchandisingService, private _lightbox: Lightbox) {
    super('Campaign');
    Object.assign(this, { dataService });
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.campaign) {
        let currentValue = changes.campaign.currentValue;
        this.campaign = currentValue;
        let images = [];
        if (this.campaign !== undefined && this.campaign.campaign_picture_image.length > 0) {
          this.campaign.campaign_picture_image.forEach(element => {
            images.push({
              src: element?.image_string,
              caption: '',
              thumb: element?.image_string
            });
          });
          this.images = images;
        }
      }
    }
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  openDeleteBox() { }

  openEditCustomer() { }

  open(index: number): void {
    this._lightbox.open(this.images, index);
  }

  close(): void {
    this._lightbox.close();
  }

  public downloadFile(file) {
    //console.log(file);
    this.merService.downloadFile(file);
  }
}
