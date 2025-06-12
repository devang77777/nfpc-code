import { PreferenceService } from './../../preference.service';
import { Component, OnInit } from '@angular/core';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Lightbox } from 'ngx-lightbox';
import { TEMPLATE_MODULE } from 'src/app/app.constant';
@Component({
  selector: 'app-invoice-template',
  templateUrl: './invoice-template.component.html',
  styleUrls: ['./invoice-template.component.scss'],
})
export class InvoiceTemplateComponent implements OnInit {
  templates: Array<any> = [];
  selected: any;
  selectedModule: string;
  modules = TEMPLATE_MODULE;
  constructor(
    private service: PreferenceService,
    private commonToasterService: CommonToasterService,
    private _lightbox: Lightbox
  ) {}

  ngOnInit() {
    this.selectedModule = this.modules[0].name;
    this.onSelectModule(this.modules[0].name);
  }
  onSelectModule(module) {
    this.selectedModule = module;
    this.templates = [];
    this.service.getTemplate(module).subscribe(
      (response) => {
        response.data.forEach((element) => {
          const src = element.template_image;
          const caption = 'Invoice Template';
          const thumb = element.template_image;
          const album = {
            src: src,
            caption: caption,
            thumb: thumb,
            id: element.id,
          };
          this.templates.push(album);
        });
        this.selected = response.data.find((x) => x.is_assign === 1);
      },
      (error) => {}
    );
  }
  onSelect(item) {
    this.selected = item;
    this.service
      .saveTemplate({ template_id: this.selected.id })
      .subscribe((response) => {
        this.commonToasterService.showSuccess(
          'Success',
          'Template updated sucessfully'
        );
      });
  }
  open(index) {
    this._lightbox.open(this.templates, index);
  }

  close(): void {
    this._lightbox.close();
  }
}
