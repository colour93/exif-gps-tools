import { useEffect, useState } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import React from "react";
import {
  AutoComplete,
  Space,
  Spin,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import { Detail } from "types/Detail";
import { locationConvert } from "utils";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import Label from "@douyinfe/semi-ui/lib/es/form/label";
import { AutoCompleteItem, AutoCompleteResponse } from "types/AutoComplete";
import { ReGeocodeResponse } from "types/Geocoder";

const amapPlugins = [
  "AMap.Scale",
  "AMap.ElasticMarker",
  "AMap.ToolBar",
  "AMap.PlaceSearch",
  "AMap.AutoComplete",
  "AMap.Geocoder",
];

let resultMap = null;
let queryMap = null;
let amap = null;

let searchAutoComplete = null;
let geocoder = null;

const setMarker = ({
  map,
  lng,
  lat,
}: {
  map: any;
  lng: number;
  lat: number;
}) => {
  map.clearMap();

  const position = new amap.LngLat(lng, lat);

  const marker = new amap.Marker({
    position,
  });

  map.add(marker);
};

const genMap = (type: "query" | "result") => {
  let mapContainerId = "";
  let zoom = 16;

  switch (type) {
    case "query":
      mapContainerId = "queryMapContainer";
      zoom = 14;
      break;

    case "result":
      mapContainerId = "resultMapContainer";
      zoom = 16;
      break;

    default:
      return;
  }

  const map = new amap.Map(mapContainerId, {
    viewMode: "2D",
    zoom,
  });
  const scale = new amap.Scale();
  map.addControl(scale);
  const elasticMarker = new amap.ElasticMarker();
  map.addControl(elasticMarker);
  const toolBar = new amap.ToolBar();
  map.addControl(toolBar);

  return map;
};

const getAddressFromGeocode = ({
  map,
  location,
  setDetail,
}: {
  map: any;
  location: {
    lng: number;
    lat: number;
  };
  setDetail: React.Dispatch<Detail>;
}) => {
  const { lat, lng } = location;

  geocoder.getAddress(location, (status, result: ReGeocodeResponse) => {
    const { formattedAddress } = result.regeocode;
    setDetail({
      address: formattedAddress,
      location: locationConvert(`${lng},${lat}`),
      lat,
      lng,
    });
  });
  map.clearMap();
  setMarker({ map, lat, lng });
};

const handleMapClick = (
  {
    target,
    lnglat,
  }: {
    target: any;
    lnglat: {
      lng: number;
      lat: number;
    };
  },
  setDetail: React.Dispatch<Detail>
) => {
  getAddressFromGeocode({ map: target, location: lnglat, setDetail });
};

export function ResultMapContainer({
  jsKey,
  lng,
  lat,
}: {
  jsKey: string;
  lng: number;
  lat: number;
}) {
  useEffect(() => {
    if (!jsKey || resultMap) return;

    if (!amap) {
      AMapLoader.load({
        key: jsKey,
        version: "2.0",
        plugins: amapPlugins,
      })
        .then((AMap) => {
          amap = AMap;
          resultMap = genMap("result");
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      resultMap = genMap("result");
    }
  }, [jsKey]);

  useEffect(() => {
    if (!resultMap) return;

    setMarker({ map: resultMap, lat, lng });

    resultMap.setCenter([lng, lat], true);
  }, [lat, lng]);

  return (
    <div id="resultMapContainer" style={{ height: "300px" }}>
      <Spin></Spin>
      <Typography.Text>加载地图组件中...</Typography.Text>
      <br />
      <Typography.Text>
        如果长时间显示该信息，请检查 Web端 Key 是否正确填写
      </Typography.Text>
    </div>
  );
}

const searchPlace = ({
  v,
  setSearching,
  setSearchItems,
}: {
  v: string;
  setSearching: React.Dispatch<boolean>;
  setSearchItems: React.Dispatch<AutoCompleteItem[]>;
}) => {
  if (!searchAutoComplete || !v) return;

  searchAutoComplete.search(
    v,
    (status: any, result: AutoCompleteResponse | string) => {
      if (status != "ok") {
        Toast.error(result as string);
        return;
      }

      setSearching(false);
      setSearchItems(
        (result as AutoCompleteResponse).tips.map((v) => {
          return {
            value: v.name,
            itemKey: v.id,
            data: v,
          };
        })
      );
    }
  );
};

export function QueryMapContainer({
  jsKey,
  setDetail,
  formApi,
}: {
  jsKey: string;
  setDetail: React.Dispatch<Detail>;
  formApi: FormApi;
}) {
  const [searchItems, setSearchItems] = useState<AutoCompleteItem[]>();
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!jsKey || queryMap) return;

    if (!amap) {
      AMapLoader.load({
        key: jsKey,
        version: "2.0",
        plugins: amapPlugins,
      })
        .then((AMap) => {
          amap = AMap;
          queryMap = genMap("query");
          queryMap.on("click", (ev) => {
            handleMapClick(ev, setDetail);
          });
          searchAutoComplete = new amap.AutoComplete();
          geocoder = new amap.Geocoder();
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      queryMap = genMap("query");
      queryMap.on("click", (ev) => {
        handleMapClick(ev, setDetail);
      });
      searchAutoComplete = new amap.AutoComplete();
      geocoder = new amap.Geocoder();
    }
  }, [jsKey]);
  return (
    <>
      <Label text="关键词" />
      <AutoComplete
        data={searchItems}
        onSearch={(v: string) => {
          if (!v || v == "") {
            setSearching(false);
            return;
          }
          if (searching == true) return;
          setSearching(true);
          // 消抖，防止 QPS 过高
          setTimeout(() => {
            searchPlace({ v, setSearching, setSearchItems });
          }, 500);
        }}
        onSelect={({ data }: AutoCompleteItem) => {
          const { address, location } = data;
          const { lat, lng } = location;
          queryMap.setCenter(location);
          setMarker({ map: queryMap, lat, lng });
          setDetail({
            address,
            location: locationConvert(`${lng},${lat}`),
            lat,
            lng,
          });
        }}
        onSelectWithObject={true}
        loading={searching}
        renderItem={({ data }: AutoCompleteItem) => {
          const { name, district } = data;
          return (
            <>
              <Typography.Text>{name}</Typography.Text>
              <Space />
              <Typography.Text type="secondary">{district}</Typography.Text>
            </>
          );
        }}
        style={{ width: "100%" }}
        showClear
      />
      <div id="queryMapContainer" style={{ height: "60vh" }}>
        <Spin></Spin>
        <Typography.Text>加载地图组件中...</Typography.Text>
        <br />
        <Typography.Text>
          如果长时间显示该信息，请检查 Web端 Key 是否正确填写
        </Typography.Text>
      </div>
    </>
  );
}
