export interface SurlResultResponse {
  code: number;
  msg: string;
  data: SurlResult;
}

export interface SurlResult {
  id: string;
  lng: number;
  lat: number;
  locationString: string;
  locationStringGeneral: string;
  name: string;
  formattedAddress: string;
  regionalismCode: string;
}
