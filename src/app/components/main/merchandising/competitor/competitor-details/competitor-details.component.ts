import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Competitor } from '../competitor-interface';
import { Lightbox } from 'ngx-lightbox';
import { MerchandisingService } from '../../merchandising.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';

@Component({
  selector: 'app-competitor-details',
  templateUrl: './competitor-details.component.html',
  styleUrls: ['./competitor-details.component.scss']
})
export class CompetitorDetailsComponent extends BaseComponent implements OnInit {

  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public competitor: Competitor | any;
  @Input() public isDetailVisible: boolean;
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  images: any[];
  constructor(formDrawer: FormDrawerService, dataService: DataEditor, private _lightbox: Lightbox, public merService: MerchandisingService) {
    super('Competitor Info');
    Object.assign(this, { formDrawer, dataService });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.competitor) {
        let currentValue = changes.competitor.currentValue;
        this.competitor = currentValue;
        let images = [];
        if (this.competitor !== undefined && this.competitor.competitor_info_image.length > 0) {
          this.competitor.competitor_info_image.forEach(element => {
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

  openEditCompetitor() {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.competitor });
    this.formDrawer.setFormName('add-Competitor');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  open(index: number): void {
    this._lightbox.open(this.images, index);
  }

  close(): void {
    this._lightbox.close();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public downloadFile(file) {
    //console.log(file);
    this.merService.downloadFile(file);
  }

}