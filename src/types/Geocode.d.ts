export interface GeocodeResponse {
  /**
   * 返回结果数目  返回结果的个数。
   */
  count?: string;
  /**
   * 地理编码信息列表  结果对象列表，包括下述字段：
   */
  geocodes?: Geocodes[];
  /**
   * 返回状态说明,当 status 为 0 时，info
   * 会返回具体错误原因，否则返回“OK”。详情可以参阅[info状态表](https://lbs.amap.com/api/webservice/guide/tools/info)
   */
  info?: string;
  /**
   * 返回结果状态值  返回值为 0 或 1，0 表示请求失败；1 表示请求成功。
   */
  status?: string;
  [property: string]: any;
}

/**
 * 地理编码信息列表  结果对象列表，包括下述字段：
 */
export interface Geocodes {
  /**
   * 区域编码  例如：110101
   */
  adcode?: string;
  /**
   * 地址所在的城市名  例如：北京市
   */
  city?: string;
  /**
   * 城市编码  例如：010
   */
  citycode?: string;
  /**
   * 国家  国内地址默认返回中国
   */
  country?: string;
  /**
   * 地址所在的区  例如：朝阳区
   */
  district?: string;
  /**
   * 结构化地址信息  省份＋城市＋区县＋城镇＋乡村＋街道＋门牌号码
   */
  formatted_address?: string;
  /**
   * 匹配级别  参见下方的地理编码匹配级别列表
   */
  level?: string;
  /**
   * 坐标点  经度，纬度
   */
  location?: string;
  /**
   * 门牌  例如：6号
   */
  number?: string;
  /**
   * 地址所在的省份名  例如：北京市。此处需要注意的是，中国的四大直辖市也算作省级单位。
   */
  province?: string;
  /**
   * 街道  例如：阜通东大街
   */
  street?: string;
  [property: string]: any;
}
