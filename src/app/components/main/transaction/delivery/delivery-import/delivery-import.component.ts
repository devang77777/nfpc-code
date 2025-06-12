import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeliveryService } from '../delivery.service';


@Component({
  selector: 'app-delivery-import',
  templateUrl: './delivery-import.component.html',
  styleUrls: ['./delivery-import.component.scss']
})
export class DeliveryImportComponent implements OnInit {

  public data: any = [];

  constructor(private router: Router,
    private deliveryService: DeliveryService) { }

  ngOnInit(): void {
  }

  selectedFile(data) {
    this.data = data;
    //console.log(this.data)
  }


  backToDelivery() {
    this.router.navigate(['transaction/delivery']).then();
  }

  importDelivery() {
    const formData = new FormData();
    formData.append('delivery_file', this.data.file);
    formData.append('skipduplicate', this.data.skipduplicate);

    this.deliveryService.importDelivery(formData).subscribe((res: any) => {
      if (res.status) {
        //console.log(res);
      }
    });
  }

}
