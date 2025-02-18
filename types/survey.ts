export interface Survey {
  id: string;
  title: string;
  description?: string;
  client_name?: string;
  phone_number?: string;
  shop_name?: string;
  shop_address?: string;
  survey_status: string;
  created_at: string;
  client_id?: string;
}

export interface SurveyBillboard {
  id?: string;
  billboard_name_id: string;
  width: string;
  height: string;
  billboard_type_id: string;
  clientId: string;
  quantity: string | number;
}
