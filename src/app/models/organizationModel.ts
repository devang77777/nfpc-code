export interface OrganizationModel {
  "id": number;
  "uuid": string;
  "org_name": string;
  "org_company_id": string;
  "org_tax_id": string;
  "org_street1": string;
  "org_street2": string;
  "org_city": string;
  "org_state": string;
  "org_country_id": number;
  "org_country_name": string;
  "org_postal": string;
  "org_phone": string;
  "org_contact_person": string;
  "org_contact_person_number": string;
  "org_currency": string;
  "org_fasical_year": string;
  "is_batch_enabled": number;
  "is_credit_limit_enabled": number;
  "org_logo": string;
  "gstin_number": string;
  "gst_reg_date": string;
  "is_auto_approval_set": number;
  "org_status": number;
  "created_at": string;
  "updated_at": string;
  "deleted_at": string;
}

export const ORGANIZATION_DATA: OrganizationModel = {
  "id": 19023,
  "uuid": "859200e0-afd3-11ea-ba31-9d1913463e42",
  "org_name": "Mobiato Consulting, LLC.",
  "org_company_id": "19023",
  "org_tax_id": "5",
  "org_street1": "123 S.G. Highway",
  "org_street2": "",
  "org_city": "Ahmedabad",
  "org_state": "Gujarat",
  "org_country_id": 98,
  "org_country_name": "India",
  "org_postal": "382412",
  "org_phone": "9876543210",
  "org_contact_person": "Sugnesh Limbasiya",
  "org_contact_person_number": "9876543210",
  "org_currency": "INR",
  "org_fasical_year": "2020",
  "is_batch_enabled": 0,
  "is_credit_limit_enabled": 0,
  "org_logo": "assets/organisation/no-image.png",
  "gstin_number": "123456",
  "gst_reg_date": "2020-06-16",
  "is_auto_approval_set": 0,
  "org_status": 1,
  "created_at": "2020-06-16T01: 46: 00.000000Z",
  "updated_at": "2020-06-16T01: 46: 00.000000Z",
  "deleted_at": null
};
