export interface AutoCompleteItem {
  value: string;
  itemKey: string;
  data: AutoCompleteData;
}

export interface AutoCompleteResponse {
  info: string;
  count: number;
  tips: AutoCompleteData[];
}

export interface AutoCompleteData {
  id: string;
  name: string;
  district: string;
  adcode: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  typecode: string;
  city: any[];
}
