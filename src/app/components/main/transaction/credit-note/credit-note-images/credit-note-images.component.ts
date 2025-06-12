import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { te } from 'date-fns/locale';
import { Lightbox } from 'ngx-lightbox';
import { MerchandisingService } from '../../../merchandising/merchandising.service';

@Component({
  selector: 'app-credit-note-images',
  templateUrl: './credit-note-images.component.html',
  styleUrls: ['./credit-note-images.component.scss']
})
export class CreditNoteImagesComponent implements OnInit {
  images: any = [];
  selectedValue = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { data: any },
    public dialogRef: MatDialogRef<CreditNoteImagesComponent>,
    private lightbox: Lightbox,
    private merService: MerchandisingService,
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.selectImage('m');
  }
  close() {
    this.dialogRef.close();
  }
  selectImage(value) {
    let tempImages = [];
    this.images = [];
    this.selectedValue = value;
    if (value === 'm') {
      tempImages.push(
        this.data.data.merchandiser_image_1,
        this.data.data.merchandiser_image_2,
        this.data.data.merchandiser_image_3,
        this.data.data.merchandiser_image_4 ,
      )
      tempImages.forEach(element => {
        if (element) {
          const src = element;
          const caption = 'Merchandiser Images';
          const thumb = element;
          const album = {
            src: src,
            caption: caption,
            thumb: thumb,
          };
          this.images.push(album);
        }
      });
    } else {
      tempImages.push(
        this.data.data.delivery_driver_image_1,
        this.data.data.delivery_driver_image_2,
        this.data.data.delivery_driver_image_3,
        this.data.data.delivery_driver_image_4
      )
      tempImages.forEach(element => {
        if (element) {
          const src = element;
          const caption = 'Delivery Driver Images';
          const thumb = element;
          const album = {
            src: src,
            caption: caption,
            thumb: thumb,
          };
          this.images.push(album);
        }
      });
    }
  }
  openSelectedImage(i: number) {
    console.log(i, this.images);
    this.lightbox.open(this.images, i);
  }
  public downloadFile(file) {
    ////console.log(file);
    this.merService.downloadFile(file);
  }
}
