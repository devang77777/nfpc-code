import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JdePushStatusService {
private modalData: any;

  
  setModal(data: any) {
    this.modalData = data;
  }

  getModal() {
    return this.modalData;
  }
}
