import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable()

export class GroupingService {
    constructor(private http: HttpClient) { }

    getRouteItemGroupList() {
        return this.http.get<any>(endpoints.apiendpoint.routeItemGroup.list);
    }

    addRouteItemGroupList(dataBody: any) {
        return this.http.post<any>(endpoints.apiendpoint.routeItemGroup.add, dataBody);
    }

    editRouteItemGroupList(uuid: string, dataBody: any) {
        return this.http.post<any>(endpoints.apiendpoint.routeItemGroup.edit(uuid), dataBody);
    }

    deleteRouteItemGroupList(uuid: string) {
        return this.http.delete<any>(endpoints.apiendpoint.routeItemGroup.delete(uuid));
    }
}