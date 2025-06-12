import { environment } from '../../environments/environment';
let domain = window.location.host;
export const endpoints = {
  items: {
    get list() {
      return `${endpoints.site.apiurl}/item/list`;
    },
  },
  site: {
    get url() {
      return 'https://devmobiato.nfpc.net';
    },
    get apiurl() {
      return domain == 'devmobiato.nfpc.net' ? environment.nfpcApiUrl : environment.baseApiUrl;
    },
  },
  apiendpoint: {
    Software: {
      get sideBarBySoftware() {
        return `${endpoints.site.apiurl}/get-menu-by-software`;
      },
    },
    dashboard: {
      get dashboardData() {
        return `${endpoints.site.apiurl}/dashboard`;
      },
      get dashboard2Data() {
        return `${endpoints.site.apiurl}/dashboard2`;
      },

      get dashboard3Data() {
        return `${endpoints.site.apiurl}/dashboard3`;
      },
      get dashboard4Data() {
        return `${endpoints.site.apiurl}/dashboard4`;
      },
    },
    masterDataCollection: {
      get list() {
        return `${endpoints.site.apiurl}/data-collection`;
      },
      get brands() {
        return `${endpoints.site.apiurl}/brand/list`;
      }
    },
    bulkAction: {
      action(module) {
        return `${endpoints.site.apiurl}/${module}/bulk-action`;
      },
    },
    lob: {
      get list() {
        return `${endpoints.site.apiurl}/lob/list`;
      },
    },
    customer: {
      get list() {
        return `${endpoints.site.apiurl}/customer/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/customer/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/customer/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/customer/delete/${uuid}`;
      },
      get typelist() {
        return `${endpoints.site.apiurl}/customer-type/list`;
      },
      detail(uuid, pageNumber, pageSize, module) {
        return `${endpoints.site.apiurl}/customer/customer-details/${uuid}?page_size=${pageSize}&page=${pageNumber}&search=${module}`;
      },
      chart() {
        return `${endpoints.site.apiurl}/customer/invoice-chart`;
      },
      balance(customerId: number) {
        return `${endpoints.site.apiurl}/customer/customer-balances/${customerId}`;
      },
      statement() {
        return `${endpoints.site.apiurl}/customer/balance-statement`;
      },
      importCustomer(param) {
        return `${endpoints.site.apiurl}/customer/${param}`;
      },
      mapingField() {
        return `${endpoints.site.apiurl}/customer/getmappingfield`;
      },
      finalimport() {
        return `${endpoints.site.apiurl}/customer/finalimport`;
      },
      get branchPlantlist() {
        return `${endpoints.site.apiurl}/customer-warehouse-mapping/list`;
      },
      get supervisorlist() {
        return `${endpoints.site.apiurl}/customer-supervisor-mapping/list`;
      },
      get zonelist() {
        return `${endpoints.site.apiurl}/customer-region-mapping/list`;
      },
      get ksmList() {
        return `${endpoints.site.apiurl}/customer-ksm-kam-mapping/list`;
      },
      get exportSupervisor(){
        return `${endpoints.site.apiurl}/customer-supervisor-mapping/list`;
      },
      get dropdownList() {
        return `${endpoints.site.apiurl}/customer/dropdown-list`;
      },
      comments: {
        list(id: number) {
          return `${endpoints.site.apiurl}/customer-comment/list/${id}`;
        },
        add() {
          return `${endpoints.site.apiurl}/customer-comment/add`;
        },
        delete(uuid: string) {
          return `${endpoints.site.apiurl}/customer-comment/delete/${uuid}`;
        },

      },
    },

    item: {
      get list() {
        return `${endpoints.site.apiurl}/item/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/item/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/item/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/item/delete/${uuid}`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/item/${param}`;
      },
      mapingField() {
        return `${endpoints.site.apiurl}/item/getmappingfield`;
      },
      finalimport() {
        return `${endpoints.site.apiurl}/item/finalimport`;
      },
      get DDllist() {
        return `${endpoints.site.apiurl}/item/dropdown-list`;
      },
      get itemBranchList() {
        return `${endpoints.site.apiurl}/item-branch-plant/list`;
      },
      get itemList() {
        return `${endpoints.site.apiurl}/v1/item-base-price/list`;
      },
    },
    region: {
      get list() {
        return `${endpoints.site.apiurl}/region/list`;
      },
    },
    depot: {
      get list() {
        return `${endpoints.site.apiurl}/depot/list`;
      },
    },
    salesman: {
      get list() {
        return `${endpoints.site.apiurl}/salesman/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/salesman/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/salesman/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/salesman/delete/${uuid}`;
      },
      get typelist() {
        return `${endpoints.site.apiurl}/salesman-type/list`;
      },
      get roles() {
        return `${endpoints.site.apiurl}/salesman-role/list`;
      },
      get login() {
        return `${endpoints.site.apiurl}/auth/salesman-login`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/salesman/${param}`;
      },
      mapingField() {
        return `${endpoints.site.apiurl}/salesman/getmappingfield`;
      },
      finalimport() {
        return `${endpoints.site.apiurl}/salesman/finalimport`;
      },
    },
    journeyplan: {
      get list() {
        return `${endpoints.site.apiurl}/journey-plan/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/journey-plan/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/journey-plan/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/journey-plan/delete/${uuid}`;
      },
      show(uuid: string) {
        return `${endpoints.site.apiurl}/journey-plan/show/${uuid}`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/journey-plan/${param}`;
      },
      get customerVisitList() {
        return `${endpoints.site.apiurl}/customer-visit/list`;
      },
      get downloadCustomerVisitList() {
        return `${endpoints.site.apiurl}/journey-plan/customer-visit`;
      },
      customerActivityList(id) {
        return `${endpoints.site.apiurl}/customer-activity/list/${id}`;
      },
      mapingField() {
        return `${endpoints.site.apiurl}/journey-plan/getmappingfield`;
      },
      finalimport() {
        return `${endpoints.site.apiurl}/journey-plan/finalimport`;
      },
    },
    warehouse: {
      get list() {
        return `${endpoints.site.apiurl}/warehouse/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/warehouse/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/warehouse/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/warehouse/delete/${uuid}`;
      },
    },
    vendor: {
      get list() {
        return `${endpoints.site.apiurl}/vendor/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/vendor/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/vendor/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/vendor/delete/${uuid}`;
      },
    },
    salesmanload: {
      get list() {
        return `${endpoints.site.apiurl}/salesman-load/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/salesman-load/add`;
      },
      update(uuid) {
        return `${endpoints.site.apiurl}/salesman-load/edit/${uuid}`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/salesman-load/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/salesman-load/delete/${uuid}`;
      },
    },
    salesmanunload: {
      get list() {
        return `${endpoints.site.apiurl}/salesman-unload/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/salesman-unload/add`;
      },
      update(uuid) {
        return `${endpoints.site.apiurl}/salesman-unload/edit/${uuid}`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/salesman-unload/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/salesman-unload/delete/${uuid}`;
      },
    },
    pallet: {
      get listPalletBySaleman() {
        return `${endpoints.site.apiurl}/palette-by-salesman`;
      },
      get list() {
        return `${endpoints.site.apiurl}/palettes`;
      },
      get add() {
        return `${endpoints.site.apiurl}/palette/add`;
      },
      update(uuid) {
        return `${endpoints.site.apiurl}/palette/edit/${uuid}`;
      },
      details(salesman_id: string) {
        return `${endpoints.site.apiurl}/palette/detail/${salesman_id}`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/palette/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/palette/delete/${uuid}`;
      },
      palletReturn(salesman_id: string) {
        return `${endpoints.site.apiurl}/pallet-return/${salesman_id}`;
      },
      updatePalletReturn() {
        return `${endpoints.site.apiurl}/update-pallet-return`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
    },
    goodsReceiptNote: {
      get list() {
        return `${endpoints.site.apiurl}/salesman-unload/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/salesman-unload/add`;
      },
      update(uuid) {
        return `${endpoints.site.apiurl}/salesman-unload/edit/${uuid}`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/goodreceiptnote/edit/${uuid}`;
      },
      get download() {
        return `${endpoints.site.apiurl}/grn/download`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/salesman-unload/delete/${uuid}`;
      },
    },
    loadrequest: {
      get list() {
        return `${endpoints.site.apiurl}/loadrequest/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/loadrequest/add`;
      },
      approve(uuid) {
        return `${endpoints.site.apiurl}/loadrequest/approve/${uuid}`;
      },
      reject(uuid) {
        return `${endpoints.site.apiurl}/loadrequest/reject/${uuid}`;
      },
      update(uuid) {
        return `${endpoints.site.apiurl}/loadrequest/edit/${uuid}`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/loadrequest/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/loadrequest/delete/${uuid}`;
      },
      generateToLoad(uuid: any) {
        return `${endpoints.site.apiurl}/loadrequest/generate/${uuid}`;
      },
    },
    routeItemGroup: {
      get list() {
        return `${endpoints.site.apiurl}/route-item-grouping/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/route-item-grouping/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/route-item-grouping/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/route-item-grouping/delete/${uuid}`;
      },
    },
    purchaseOrder: {
      get list() {
        return `${endpoints.site.apiurl}/purchaseorder/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/purchaseorder/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/purchaseorder/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/purchaseorder/delete/${uuid}`;
      },
    },
    order: {
      get list() {
        return `${endpoints.site.apiurl}/order/list`;
      },
      get download() {
        return `${endpoints.site.apiurl}/order/download`;
      },
      get add() {
        return `${endpoints.site.apiurl}/order/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/order/edit/${uuid}`;
      },
      // delete(uuid: string) {
      //   return `${endpoints.site.apiurl}/order/delete/${uuid}`;
      // },
      get delete() {
        return `${endpoints.site.apiurl}/order/delete`;
      },
      get cancel() {
        return `${endpoints.site.apiurl}/order/cancel`;
      },
      get bulkAction() {
        return `${endpoints.site.apiurl}/order/bulk-action`;
      },
      get orderToPicking() {
        return `${endpoints.site.apiurl}/order-to-picking`;
      },
      get approvedRejected() {
        return `${endpoints.site.apiurl}/bulk-request-for-approval/action`;
      },
      get priceDetail() {
        return `${endpoints.site.apiurl}/order/item-apply-price`;
      },
      get normalPriceDetail() {
        return `${endpoints.site.apiurl}/order/normal-item-apply-price`;
      },
      get promotionsItems() {
        return `${endpoints.site.apiurl}/order/item-apply-promotion`;
      },
      get onhandQty() {
        return `${endpoints.site.apiurl}/storagedetail/routeItemQty`;
      },

      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/order/${param}`;
      },
      get OCROrder() {
        return `${endpoints.site.apiurl}/ocr-order/add`;
      },
    },
    delivery: {
      get list() {
        return `${endpoints.site.apiurl}/delivery/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/delivery/add`;
      },
      get download() {
        return `${endpoints.site.apiurl}/delivery/download`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/delivery/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/delivery/delete/${uuid}`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/delivery/${param}`;
      },
    },
    expense: {
      get download() {
        return `${endpoints.site.apiurl}/expense/download`;
      },
    },

    estimate: {
      get download() {
        return `${endpoints.site.apiurl}/estimate/download`;
      },
    },
    global: {
      get email() {
        return `${endpoints.site.apiurl}/send-mail`;
      },
    },
    invoices: {
      get list() {
        return `${endpoints.site.apiurl}/invoice/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/invoice/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/invoice/edit/${uuid}`;
      },
      get email() {
        return `${endpoints.site.apiurl}/invoice/sendinvoice`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/invoice/delete/${uuid}`;
      },
      get sendReminder() {
        return `${endpoints.site.apiurl}/invoice-reminder/add`;
      },
      stopReminder(uuid) {
        return `${endpoints.site.apiurl}/invoice-reminder/delete/${uuid}`;
      },
      get download() {
        return `${endpoints.site.apiurl}/invoice/download`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/invoice/${param}`;
      },
    },
    template: {
      list(module) {
        return `${endpoints.site.apiurl}/template/list/${module}`;
      },
      get add() {
        return `${endpoints.site.apiurl}/template/updatetemplate`;
      },
    },
    theme: {
      get list() {
        return `${endpoints.site.apiurl}/themes`;
      },
      get add() {
        return `${endpoints.site.apiurl}/change/theme`;
      },
    },
    nextUpCommingCode: {
      get code() {
        return `${endpoints.site.apiurl}/get-next-comming-code`;
      },
    },
    orderType: {
      get addType() {
        return `${endpoints.site.apiurl}/order-type/add`;
      },
      get list() {
        return `${endpoints.site.apiurl}/order-type/list`;
      },
    },
    paymentTerms: {
      get term() {
        return `${endpoints.site.apiurl}/payment-term/list`;
      },
    },
    debitNote: {
      get list() {
        return `${endpoints.site.apiurl}/debit-notes/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/debit-notes/add`;
      },
      get download() {
        return `${endpoints.site.apiurl}/debit-note/download`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/debit-notes/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/debit-notes/delete/${uuid}`;
      },
      get bulkAction() {
        return `${endpoints.site.apiurl}/debit-notes/bulk-action`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/debit-notes/${param}`;
      },
    },
    reason: {
      get list() {
        return `${endpoints.site.apiurl}/reason/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/reason/add`;
      },
    },
    reasonType: {
      get list() {
        return `${endpoints.site.apiurl}/reason-type/list`;
      },
      get allList() {
        return `${endpoints.site.apiurl}/reason-type-all`;
      },
      get add() {
        return `${endpoints.site.apiurl}/reason-type/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/reason-type/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/reason-type/delete/${uuid}`;
      },
    },
    replace: {
      get list() {
        return `${endpoints.site.apiurl}/merchandiser-replacement/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/merchandiser-replacement/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/merchandiser-replacement/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/merchandiser-replacement/delete/${uuid}`;
      },
    },
    swap: {
      get list() {
        return `${endpoints.site.apiurl}/merchandiser-swap/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/merchandiser-swap/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/merchandiser-swap/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/merchandiser-swap/delete/${uuid}`;
      },
    },
    driverReplace: {
      get list() {
        return `${endpoints.site.apiurl}/driver-van-swaping/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/driver-van-swaping/add`;
      }
    },
    creditNote: {
      get list() {
        return `${endpoints.site.apiurl}/creditnotes/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/creditnotes/add`;
      },
      get updateImport() {
        return `${endpoints.site.apiurl}/creditnotes/update-import`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/creditnotes/edit/${uuid}`;
      },
      get download() {
        return `${endpoints.site.apiurl}/credit-note/download`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/creditnotes/delete/${uuid}`;
      },
      get bulkAction() {
        return `${endpoints.site.apiurl}/creditnotes/bulk-action`;
      },
      get applyCredit() {
        return `${endpoints.site.apiurl}/apply-credit-save`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/creditnotes/${param}`;
      },
    },
    cashierReceipt: {
      get list() {
        return `${endpoints.site.apiurl}/cashierreciept/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/cashierreciept/add`;
      },

      getcollection(id: number) {
        return `${endpoints.site.apiurl}/cashierreciept/getcollection/${id}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/cashierreciept/delete/${uuid}`;
      },
      get bulkAction() {
        return `${endpoints.site.apiurl}/cashierreciept/bulk-action`;
      },
    },
    uom: {
      get list() {
        return `${endpoints.site.apiurl}/item-uom/list`;
      },
    },
    salesTarget: {
      get list() {
        return `${endpoints.site.apiurl}/salestarget/list`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/salestarget/edit/${uuid}`;
      },
      get add() {
        return `${endpoints.site.apiurl}/salestarget/add`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/salestarget/delete/${uuid}`;
      },
    },
    route: {
      get list() {
        return `${endpoints.site.apiurl}/route/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/route/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/route/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/route/delete/${uuid}`;
      },
      getSalemanByRoute(id: number) {
        return `${endpoints.site.apiurl}/route-salesman/${id}`;
      },
    },
    bankInfo: {
      get list() {
        return `${endpoints.site.apiurl}/bank-information/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/bank-information/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/bank-information/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/bank-information/delete/${uuid}`;
      },
      get bulkAction() {
        return `${endpoints.site.apiurl}/bank-information/bulk-action`;
      },
    },
    approvalRequest: {
      requestForApproval(uuid: any) {
        return `${endpoints.site.apiurl}/request-for-approval/action/${uuid}`;
      },
    },
    collection: {
      get list() {
        return `${endpoints.site.apiurl}/collection/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/collection/add`;
      },
      get download() {
        return `${endpoints.site.apiurl}/collection/download`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/collection/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/collection/delete/${uuid}`;
      },
      pending(id: number) {
        return `${endpoints.site.apiurl}/collection/pendinginvoice/${id}`;
      },
      pendingFilter() {
        return `${endpoints.site.apiurl}/collection/pendinginvoice`;
      },
      pendingGroupFilterByDate() {
        return `${endpoints.site.apiurl}/collection/grouppendinginvoice`;
      },
      getcustomerinvoice() {
        return `${endpoints.site.apiurl}/getcustomerinvoice`;
      },
      getinvoiceitem(id) {
        return `${endpoints.site.apiurl}/getinvoiceitem/${id}`;
      },
      pendingGroupFilter(id: number) {
        return `${endpoints.site.apiurl}/collection/grouppendinginvoice/${id}`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/collection/${param}`;
      },
      get addRelease() {
        return `${endpoints.site.apiurl}/collection/cheque-action`;
      }
    },
    assignInventory: {
      get list() {
        return `${endpoints.site.apiurl}/assign-inventory/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/assign-inventory/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/assign-inventory/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/assign-inventory/delete/${uuid}`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/assign-inventory/${param}`;
      },
      get inventoryPostlist() {
        return `${endpoints.site.apiurl}/assign-inventory/show-post`;
      },
      get damageItemList() {
        return `${endpoints.site.apiurl}/assign-inventory-damage/list`;
      },
      mapingField() {
        return `${endpoints.site.apiurl}/assign-inventory/getmappingfield`;
      },
      finalimport() {
        return `${endpoints.site.apiurl}/assign-inventory/finalimport`;
      },
    },
    complaintFeedback: {
      get list() {
        return `${endpoints.site.apiurl}/complaint-feedback/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/complaint-feedback/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/complaint-feedback/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/complaint-feedback/delete/${uuid}`;
      },
      exportcomplaintFeedback() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      importcomplaintFeedback(param) {
        return `${endpoints.site.apiurl}/complaintfeedback/${param}`;
      },
      finalimport() {
        return `${endpoints.site.apiurl}/complaintfeedback/finalimport`;
      },
      get mappingFields() {
        return `${endpoints.site.apiurl}/complaintfeedback/getmappingfield`;
      },
    },
    competitor: {
      get list() {
        return `${endpoints.site.apiurl}/competitor-info/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/competitor-info/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/competitor-info/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/competitor-info/delete/${uuid}`;
      },
      exportcompetitor() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      importcompetitor(param) {
        return `${endpoints.site.apiurl}/competitor-info/${param}`;
      },

      get finalimport() {
        return `${endpoints.site.apiurl}/competitor-info/finalimport`;
      },
      get getmappingfield() {
        return `${endpoints.site.apiurl}/competitor-info/getmappingfield`;
      },
    },
    campaign: {
      get list() {
        return `${endpoints.site.apiurl}/campaign-picture/list`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/campaign-picture/${param}`;
      },
    },
    planogram: {
      get list() {
        return `${endpoints.site.apiurl}/planogram/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/planogram/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/planogram/edit/${uuid}`;
      },
      delete(uuid) {
        return `${endpoints.site.apiurl}/planogram/delete/${uuid}`;
      },
      postList(planogram_id) {
        return `${endpoints.site.apiurl}/planogram-post/${planogram_id}/list`;
      },
      get postListNew() {
        return `${endpoints.site.apiurl}/planogram-post/list`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/planogram/${param}`;
      },
      get finalimport() {
        return `${endpoints.site.apiurl}/planogram/finalimport`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      get mappingFields() {
        return `${endpoints.site.apiurl}/planogram/getmappingfield`;
      },
    },
    priceCheck: {
      get list() {
        return `${endpoints.site.apiurl}/pricing-check/list`;
      }
    },
    shelfDisplay: {
      get list() {
        return `${endpoints.site.apiurl}/distribution/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/distribution/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/distribution/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/distribution/delete/${uuid}`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/distribution/${param}`;
      },
      get finalimport() {
        return `${endpoints.site.apiurl}/distribution/finalimport`;
      },
      get getmappingfield() {
        return `${endpoints.site.apiurl}/distribution/getmappingfield`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      modelStock: {
        get list() {
          return `${endpoints.site.apiurl}/distribution-model-stock/list`;
        },
        get customer() {
          return `${endpoints.site.apiurl}/distribution-model-stock/customer`;
        },
        get add() {
          return `${endpoints.site.apiurl}/distribution-model-stock/add`;
        },
        get update() {
          return `${endpoints.site.apiurl}/model-stock-detail/edit/`;
        },
        get delete() {
          return `${endpoints.site.apiurl}/model-stock-detail/delete/`;
        },
      },
      stockItemList: {
        get list() {
          return `${endpoints.site.apiurl}/distribution-stock-item/list`;
        },
      },
      damageItemList: {
        get list() {
          return `${endpoints.site.apiurl}/distribution-damage-item/list`;
        },
      },
      distributionImageList: {
        get list() {
          return `${endpoints.site.apiurl}/distribution-post-image/list`;
        },
      },
      expiryItemList: {
        get list() {
          return `${endpoints.site.apiurl}/distribution-expire-item/list`;
        },
      },
      sosList: {
        get list() {
          return `${endpoints.site.apiurl}/share-of-shelf/list`;
        },
      },
      survey: {
        get list() {
          return `${endpoints.site.apiurl}/distribution/survey`;
        },
      },
    },
    SOS: {
      get soaList() {
        return `${endpoints.site.apiurl}/share-assortment/list`;
      },
      get sodList() {
        return `${endpoints.site.apiurl}/share-display/list`;
      },
      get sosList() {
        return `${endpoints.site.apiurl}/sos/list`;
      }
    },
    AssetTrack: {
      get list() {
        return `${endpoints.site.apiurl}/asset-tracking/list`;
      },
      get add() {
        return `${endpoints.site.apiurl}/asset-tracking/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/asset-tracking/edit/${uuid}`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/asset-tracking/delete/${uuid}`;
      },
      postList: {
        get list() {
          return `${endpoints.site.apiurl}/asset-tracking-post`;
        },
      },
      survey: {
        get list() {
          return `${endpoints.site.apiurl}/asset-tracking/survey`;
        },
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/assettracking/${param}`;
      },
      get finalimport() {
        return `${endpoints.site.apiurl}/asset-tracking/finalimport`;
      },
      get getmappingfield() {
        return `${endpoints.site.apiurl}/asset-tracking/getmappingfield`;
      },
    },
    ConsumerSurvey: {
      get list() {
        return `${endpoints.site.apiurl}/survey/list-by-type`;
      },
      surveyPost: {
        get list() {
          return `${endpoints.site.apiurl}/survey-question-answer`;
        },
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/survey/delete/${uuid}`;
      },
    },
    SensorySurvey: {
      get list() {
        return `${endpoints.site.apiurl}/survey/list-by-type`;
      },
      surveyPost: {
        get list() {
          return `${endpoints.site.apiurl}/survey-question-answer`;
        },
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/survey/delete/${uuid}`;
      },
    },
    survey: {
      get add() {
        return `${endpoints.site.apiurl}/survey/add`;
      },
      edit(uuid: string) {
        return `${endpoints.site.apiurl}/survey/edit/${uuid}`;
      },
      get surveyPostList() {
        return `${endpoints.site.apiurl}/survey-question-answer`;
      },
      get sQAPost() {
        return `${endpoints.site.apiurl}/survey-question/add`;
      },
      get sQAList() {
        return `${endpoints.site.apiurl}/survey-question/list`;
      },
      get sPostQAList() {
        return `${endpoints.site.apiurl}/survey-question-answer-details`;
      },
      delete(uuid: string) {
        return `${endpoints.site.apiurl}/survey-question/delete/${uuid}`;
      },
    },
    Promotional: {
      get list() {
        return `${endpoints.site.apiurl}/promotional/list`;
      },

      get add() {
        return `${endpoints.site.apiurl}/promotional/add`;
      },

      edit(uuid: string) {
        return `${endpoints.site.apiurl}/promotional/edit/${uuid}`;
      },

      delete(uuid: string) {
        return `${endpoints.site.apiurl}/promotional/delete/${uuid}`;
      },

      get itemsList() {
        return `${endpoints.site.apiurl}/promotional-items`;
      },

      postList(id) {
        return `${endpoints.site.apiurl}/promotional-post/list/${id}`;
      },
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/promotional/${param}`;
      },
    },
    MarketPromotion: {
      get list() {
        return `${endpoints.site.apiurl}/market-promotion/list`;
      }
    },
    merchandisingReports: {
      get ReportData() {
        return `${endpoints.site.apiurl}/report/merchandiser`;
      },
      get ExportReportData() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
    },
    reports: {
      ReportData(report) {
        return `${endpoints.site.apiurl}/report/${report}`;
      },
      ReportGeoData(report) {
        return `${endpoints.site.apiurl}/report/${report}`;
      },
      ReportdeliveryData(report) {
        return `${endpoints.site.apiurl}/${report}`;
      },
      ReportDataApi(report) {
        return `${endpoints.site.apiurl}/${report}`;
      },
      routeSupervisorSalesman(id) {
        return `${endpoints.site.apiurl}/route-supervisor-salesman/${id}`;
      },
      regionSupervisorSalesman(id) {
        return `${endpoints.site.apiurl}/route-supervisor-salesman/${id}`;
      },
      supervisorList() {
        return `${endpoints.site.apiurl}/report/get_superviser_list`;
      },
      customersList() {
        return `${endpoints.site.apiurl}/report/get_customer_by_devision`;
      },
      filterSalesman() {
        return `${endpoints.site.apiurl}/report/get_filter_salesman`;
      },
      getFilterData() {
        return `${endpoints.site.apiurl}/report/get_filter`;
      },
      getHelperData() {
        return `${endpoints.site.apiurl}/helper/list`;
      }
    },
    pricing: {
      export() {
        return `${endpoints.site.apiurl}/Export/module`;
      },
      import(param) {
        return `${endpoints.site.apiurl}/pricing/${param}`;
      },
      customerBasePriceImport() {
        return `${endpoints.site.apiurl}/customer-based-price-mapping/import`;
      },
      customerBasePriceSubmit() {
        return `${endpoints.site.apiurl}/customer-based-price-mapping/create`;
      },
    },
    Settings: {
      Region: {
        export() {
          return `${endpoints.site.apiurl}/Export/module`;
        },
        import(param) {
          return `${endpoints.site.apiurl}/region/${param}`;
        },
      },
      Route: {
        export() {
          return `${endpoints.site.apiurl}/Export/module`;
        },
        import(param) {
          return `${endpoints.site.apiurl}/route/${param}`;
        },
      },
      plan: {
        get plansList() {
          return `${endpoints.site.apiurl}/plan-by-software/`;
        },
      },
    },

  }
};
