export enum Events {
  SEARCH_CUSTOMER = 'customer',
  SEARCH_INVOICE = 'invoice',
  SEARCH_SALEMAN = 'saleman',
  SEARCH_JOURNEYPLAN = 'journey_plan',
  SEARCH_ITEM = 'item',
  SEARCH_DELIVERY = 'delivery',
  SEARCH_ORDER = 'order',
  SEARCH_CREDIT_NOTE = 'credit_note',
  SEARCH_DEBITE_NOTE = 'debit_note',
  SEARCH_COLLECTIONS = 'collection',
  SEARCH_VENDOR = 'vendor',
  SEARCH_PURCHASE_ORDER = 'purchase_order',
  SEARCH_EXPENSE = 'expense',
  SEARCH_ESTIMATE = 'estimate',
  SEARCH_COMPLAINT = 'complaint',
  SEARCH_COMPETITOR = 'competitor',
  SEARCH_CAMPAIGN = 'campaign',
  SEARCH_STOCKINSTORE = 'stock_in_store',
  SEARCH_SHELFDISPLAY = 'shelf-display',
  SEARCH_PLANOGRAM = 'planogram',
  SEARCH_ASSETTRACK = 'asset-tracking',
  SEARCH_CONSUMER = 'consumer-survey',
  SEARCH_SENSORY = 'sensory-survey',
  SEARCH_PROMOTIONAL = 'promotional',
  CHANGE_CRITERIA = 'CHANGE_CRITERIA',
  SOA = 'soa',
  SOD = 'sod',
  SOS = 'sos',

}
export class EmitEvent {
  constructor(public name: string, public value: any) { }
}
