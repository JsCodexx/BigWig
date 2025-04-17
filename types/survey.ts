export interface Survey {
  id: string;
  description?: string;
  client_name?: string;
  phone_number?: string;
  shop_name?: string;
  shop_address?: string;
  survey_status: string;
  created_at: string;
  client_id?: string;
  form_image: string;
}
export type ImageType = { file?: File; preview: string };
export interface SurveyBillboard {
  id?: string;
  billboard_name_id: string;
  width: string;
  height: string;
  billboard_type_id: string;
  quantity: string | number;
  board_images: ImageType[];
}
export interface Shopboard {
  id: string;
  name: string;
}

export interface BillboardType {
  id: string;
  type_name: string;
}
