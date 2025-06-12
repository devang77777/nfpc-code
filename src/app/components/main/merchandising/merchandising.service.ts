import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { NetworkService } from 'src/app/services/network.service';
import { endpoints } from 'src/app/api-list/api-end-points';
import { ApiService } from 'src/app/services/api.service';
@Injectable({
  providedIn: 'root',
})
export class MerchandisingService {
  constructor(private apiService: ApiService, private network: NetworkService) {
    Object.assign(this, { apiService });
  }

  public getStockinStore(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.assignInventory.list, model
    );
  }

  public deleteStockinstore(uuid: string): Observable<any> {
    return this.network.onDelete(
      endpoints.apiendpoint.assignInventory.delete(uuid)
    );
  }

  public editStockinstore(uuid: string, body: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.assignInventory.edit(uuid),
      body
    );
  }

  public addStockinstore(body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.assignInventory.add, body);
  }

  public getStockLists(): Observable<any> {
    const items = this.apiService.getAllItems().pipe(map((result) => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map((result) => result));
    const customers = this.apiService
      .getCustomers()
      .pipe(map((result) => result));
    return forkJoin({ items, uoms, customers });
  }

  public getmodelStockLists(): Observable<any> {
    const items = this.apiService.getAllItems().pipe(map((result) => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map((result) => result));
    return forkJoin({ items, uoms });
  }

  public getComplaintFeedbackListData(): Observable<any> {
    const items = this.apiService.getAllItems().pipe(map((result) => result));
    const merchandiser = this.apiService
      .getAllMerchandisers()
      .pipe(map((result) => result));
    return forkJoin({ items, merchandiser });
  }

  public getInventoryPostList(stockid, filter, value): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.assignInventory.inventoryPostlist +
      `/${stockid}?${filter}=${value}`
    );
  }

  public getInventoryPostListNew(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.assignInventory.inventoryPostlist, model
    );
  }

  public getcomplaintsList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.complaintFeedback.list, model
    );
  }

  public deleteComplaintFeedback(uuid: string): Observable<any> {
    return this.network.onDelete(
      endpoints.apiendpoint.complaintFeedback.delete(uuid)
    );
  }

  public editComplaintFeedback(uuid: string, body: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.complaintFeedback.edit(uuid),
      body
    );
  }

  public addComplaintFeedback(body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.complaintFeedback.add, body);
  }
  getComplaintMappingfield() {
    return this.network.getAll(
      endpoints.apiendpoint.complaintFeedback.mappingFields
    );
  }
  getPlanogramMappingfield() {
    return this.network.getAll(endpoints.apiendpoint.planogram.mappingFields);
  }
  getCompetitorInfoappingfield() {
    return this.network.getAll(
      endpoints.apiendpoint.competitor.getmappingfield
    );
  }

  public getcompetitorsList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.competitor.list, model
    );
  }

  public addcompetitor(body): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.competitor.add, body
    );
  }

  public editcompetitor(id, body): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.competitor.edit(id), body
    );
  }

  public getComptetitorFormLists(): Observable<any> {
    let obj = {
      "list_data": ["merchandiser", "brand"],
      "function_for": "customer"
    }
    return this.network.post(
      endpoints.apiendpoint.masterDataCollection.list, obj
    );
  }

  public importCompetitor(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.competitor.importcompetitor('import'),
      payload
    );
  }

  public ExportCompetitor(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.competitor.exportcompetitor(),
      payload
    );
  }

  public getCampaignList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.campaign.list, model
    );
  }

  public importCampaign(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.campaign.import('import'),
      payload
    );
  }
  public importComplaintsFeedback(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.complaintFeedback.importcomplaintFeedback('import'),
      payload
    );
  }

  public ExportCampaign(payload): Observable<any> {
    return this.network.post(endpoints.apiendpoint.campaign.export(), payload);
  }

  public importComplaints(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.complaintFeedback.importcomplaintFeedback('import'),
      payload
    );
  }
  submitImportComplaint(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.complaintFeedback.finalimport(),
      payload
    );
  }
  submitImportCompetitor(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.competitor.finalimport,
      payload
    );
  }
  submitImportAssetTracking(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.AssetTrack.finalimport,
      payload
    );
  }
  submitImportPlanogram(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.planogram.finalimport,
      payload
    );
  }
  submitFinalImportShelfDisplay(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.finalimport,
      payload
    );
  }
  submitFinalImportStockInStore(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.assignInventory.finalimport(),
      payload
    );
  }
  public exportComplaints(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.complaintFeedback.exportcomplaintFeedback(),
      payload
    );
  }

  public getShelfDisplaysList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.list, model
    );
  }
  getShelfMappingfield() {
    return this.network.getAll(
      endpoints.apiendpoint.shelfDisplay.getmappingfield
    );
  }
  getAssetTrackingMappingfield() {
    return this.network.getAll(
      endpoints.apiendpoint.shelfDisplay.getmappingfield
    );
  }
  getStockInStoreMappingfield() {
    return this.network.getAll(
      endpoints.apiendpoint.assignInventory.mapingField()
    );
  }
  public deleteShelfDisplay(uuid: string): Observable<any> {
    return this.network.onDelete(
      endpoints.apiendpoint.shelfDisplay.delete(uuid)
    );
  }

  public editshelfDisplay(uuid: string, body: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.edit(uuid),
      body
    );
  }

  public addshelfDisplay(body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.shelfDisplay.add, body);
  }

  public getModelStockList(customer_id, distribution_id): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.shelfDisplay.modelStock.customer +
      `/${customer_id}/${distribution_id}`
    );
  }

  public addModelStock(body: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.modelStock.add,
      body
    );
  }

  public editModelStockItem(uuid, body: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.modelStock.update + uuid,
      body
    );
  }

  public delModelStockItem(uuid): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.shelfDisplay.modelStock.delete + uuid,
    );
  }

  public getStockItemList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.stockItemList.list, model
    );
  }

  public getDistributionImageList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.distributionImageList.list, model
    );
  }

  public getDamageItemList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.damageItemList.list, model
    );
  }

  public getStockDamageItemList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.assignInventory.damageItemList, model
    );
  }

  public getExpiryItemList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.expiryItemList.list, model
    );
  }

  public getSosList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.sosList.list, model
    );
  }

  public getPlanogramList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.planogram.list, model
    );
  }

  public editPlanogram(uuid: string, body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.planogram.edit(uuid), body);
  }

  public deletePlanogram(uuid: string): Observable<any> {
    return this.network.onDelete(endpoints.apiendpoint.planogram.delete(uuid));
  }

  public getDistributionsList(customer_ids): Observable<any> {
    return this.apiService
      .getDistributionsBycustomers({ customer_ids: customer_ids })
      .pipe(map((result) => result));
  }

  public addPlanogram(body) {
    return this.network.post(endpoints.apiendpoint.planogram.add, body);
  }

  public getPlanogramPostList(model) {
    return this.network.post(
      endpoints.apiendpoint.planogram.postListNew, model
    );
  }

  public exportPlanogram(payload) {
    return this.network.post(endpoints.apiendpoint.planogram.export(), payload);
  }

  public importPlanogram(payload) {
    return this.network.post(
      endpoints.apiendpoint.planogram.import('import'),
      payload
    );
  }

  public importShelfDisplay(payload) {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.import('import'),
      payload
    );
  }
  public importAssetTracking(payload) {
    return this.network.post(
      endpoints.apiendpoint.AssetTrack.import('import'),
      payload
    );
  }

  public importStockInStore(payload) {
    return this.network.post(
      endpoints.apiendpoint.assignInventory.import('import'),
      payload
    );
  }
  public getAssetTrackList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.AssetTrack.list, model
    );
  }

  public addAssetTrack(body) {
    return this.network.post(endpoints.apiendpoint.AssetTrack.add, body);
  }

  public editAssetTrack(uuid: string, body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.AssetTrack.edit(uuid), body);
  }

  public deleteAssetTrack(uuid: string): Observable<any> {
    return this.network.onDelete(endpoints.apiendpoint.AssetTrack.delete(uuid));
  }

  public getAssetTrackPostList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.AssetTrack.postList.list, model
    );
  }

  public exportAsset(payload) {
    return this.network.post(
      endpoints.apiendpoint.AssetTrack.export(),
      payload
    );
  }

  public importAsset(payload) {
    return this.network.post(
      endpoints.apiendpoint.AssetTrack.import('import'),
      payload
    );
  }

  public getShelfDisplaySurveyList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.survey.list, model
    );
  }

  public exportShelf(payload) {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.export(),
      payload
    );
  }

  public importShelf(payload) {
    return this.network.post(
      endpoints.apiendpoint.shelfDisplay.import('import'),
      payload
    );
  }

  public getConsumerSurveyList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.ConsumerSurvey.list, model
    );
  }

  public deleteConsumerSurvey(uuid: string): Observable<any> {
    return this.network.onDelete(
      endpoints.apiendpoint.ConsumerSurvey.delete(uuid)
    );
  }

  public getSensorySurveyList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.SensorySurvey.list, model
    );
  }

  public deleteSensorySurvey(uuid: string): Observable<any> {
    return this.network.onDelete(
      endpoints.apiendpoint.SensorySurvey.delete(uuid)
    );
  }

  public getAssetTrackSurveyList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.AssetTrack.survey.list, model
    );
  }

  public addSurvey(body): Observable<any> {
    return this.network.post(endpoints.apiendpoint.survey.add, body);
  }

  public addSurveyQA(body): Observable<any> {
    return this.network.post(endpoints.apiendpoint.survey.sQAPost, body);
  }

  public editSurvey(body: any, uuid: string): Observable<any> {
    return this.network.post(endpoints.apiendpoint.survey.edit(uuid), body);
  }

  public getSurveyQuestionList(id) {
    return this.network.getAll(endpoints.apiendpoint.survey.sQAList + `/${id}`);
  }

  public getSurveyQuestionAnswerList(id) {
    return this.network.getAll(
      endpoints.apiendpoint.survey.sPostQAList + `/${id}`
    );
  }

  public deleteSurveyQuestion(uuid: string): Observable<any> {
    return this.network.onDelete(endpoints.apiendpoint.survey.delete(uuid));
  }

  public getSurveyPostList(id, filter, value): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.survey.surveyPostList + `/${id}?${filter}=${value}`
    );
  }

  public getPromotionalList(page = 1, pageSize = 10): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.Promotional.list +
      `?page=${page}&page_size=${pageSize}`
    );
  }

  public addPromotion(body) {
    return this.network.post(endpoints.apiendpoint.Promotional.add, body);
  }

  public editPromotion(uuid: string, body: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.Promotional.edit(uuid),
      body
    );
  }

  public deletePromotional(uuid: string): Observable<any> {
    return this.network.onDelete(
      endpoints.apiendpoint.Promotional.delete(uuid)
    );
  }

  public getPromotionalItems(): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.Promotional.itemsList);
  }

  public getPromotionalPostList(id, filter, value) {
    return this.network.getAll(
      endpoints.apiendpoint.Promotional.postList(id) +
      `/${id}?${filter}=${value}`
    );
  }

  public downloadFile(fileurl) {
    let filename = fileurl.split('/')[fileurl.split('/').length - 1];
    let ext = filename.split('.')[filename.split('.').length - 1];
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', fileurl);
    link.setAttribute('download', filename);
    ////console.log(link);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  public getReportData(body): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.merchandisingReports.ReportData,
      body
    );
  }

  public getSoaMainList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.SOS.soaList, model
    );
  }

  public getSodMainList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.SOS.sodList, model
    );
  }

  public getSosMainList(model): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.SOS.sosList, model
    );
  }

  public getFiltersDataSOS(): Observable<any> {
    const obj = {
      "list_data": ["merchandiser", "customer", "brand", "item_major_category", "item"],
      "function_for": "customer"
    }
    return this.network.post(endpoints.apiendpoint.masterDataCollection.list, obj);
  }

  public getPriceCheckList(body): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.priceCheck.list, body
    );
  }

  public getMarketPromotionList(model): Observable<any> {
    return this.network.post(endpoints.apiendpoint.MarketPromotion.list, model);
  }
  public getStockInStoreList(): Observable<any> {
    const customers = this.apiService.getCustomers();
    const items = this.apiService.getAllItems();
    const itemsUoms = this.apiService.getAllItemUoms();
    return forkJoin({ customers, items, itemsUoms });

  }


}
