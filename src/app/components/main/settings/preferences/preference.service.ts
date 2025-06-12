import { NetworkService } from './../../../../services/network.service';
import { Injectable } from '@angular/core';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable({
  providedIn: 'root',
})
export class PreferenceService {
  constructor(private network: NetworkService) {}

  getTemplate(module) {
    return this.network.getAll(endpoints.apiendpoint.template.list(module));
  }
  saveTemplate(model) {
    return this.network.post(endpoints.apiendpoint.template.add, model);
  }
  getTheme() {
    return this.network.getAll(endpoints.apiendpoint.theme.list);
  }
  saveTheme(model) {
    return this.network.post(endpoints.apiendpoint.theme.add, model);
  }
}
