export enum CompDataServiceType {
  DATA_EDIT_FORM = 'DATA_EDIT_FORM',
  CLOSE_DETAIL_PAGE = 'CLOSE_DETAIL_PAGE',
  GET_NEW_DATA = 'GET_NEW_DATA',
  UPDATE_JOURNEY_CUSTOMER_DATA = 'UPDATE_JOURNEY_CUSTOMER_DATA',
  DETAILS_JOURNEY_PLAN_DATA = 'DETAILS_JOURNEY_PLAN_DATA',
  SETUP_JOURNEY_PLAN_EDIT_FORM = 'SETUP_JOURNEY_PLAN_EDIT_FORM',
  SETUP_JOURNEY_INITIAL_USERS_TABLE = 'SETUP_JOURNEY_INITIAL_USERS_TABLE',
  REPORT_DATA = "REPORT_DATA",
  CUSTOMER_DATA = "CUSTOMER_DATA",
}

export let APP_CURRENCY_CODE = 'INR';
export let APP_CURRENCY_DECIMAL_FORMAT = '.2';
export let APP_CURRENCY_DECIMAL_FORMAT_NEW = 2;
export let APP_CURRENCY_FORMAT = '1,234,567.89';

export const setCurrency = (currency) => {
  APP_CURRENCY_CODE = currency;
};
export const getCurrency = () => {
  return APP_CURRENCY_CODE;
};

export const setCurrencyDecimalFormat = (decimal) => {
  APP_CURRENCY_DECIMAL_FORMAT = decimal;
};
export const getCurrencyDecimalFormat = () => {
  return APP_CURRENCY_DECIMAL_FORMAT;
};

export const setCurrencyDecimalFormatNew = (decimal) => {
  APP_CURRENCY_DECIMAL_FORMAT_NEW = decimal;
};
export const getCurrencyDecimalFormatNew = () => {
  return APP_CURRENCY_DECIMAL_FORMAT_NEW;
};

export const setCurrencyFormat = (format) => {
  APP_CURRENCY_FORMAT = format;
};
export const getCurrencyFormat = () => {
  return APP_CURRENCY_FORMAT;
};
