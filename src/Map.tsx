import { useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import React from "react";
import { Spin, Typography } from "@douyinfe/semi-ui";

let map = null;
let amap = null;

export default function ResultMapContainer({
  jsKey,
  lng,
  lat,
}: {
  jsKey: string;
  lng: number;
  lat: number;
}) {
  useEffect(() => {

    console.log(1)

    if (!jsKey || map) return;

    AMapLoader.load({
      key: jsKey,
      version: "2.0",
      plugins: ["AMap.Scale", "AMap.ElasticMarker", "AMap.ToolBar"],
    })
      .then((AMap) => {
        amap = AMap;
        map = new AMap.Map("resultContainer", {
          viewMode: "2D",
          zoom: 16,
        });
        const scale = new AMap.Scale();
        map.addControl(scale);
        const elasticMarker = new AMap.ElasticMarker();
        map.addControl(elasticMarker);
        const toolBar = new AMap.ToolBar();
        map.addControl(toolBar);
      })
      .catch((e) => {
        console.error(e);
      });

  }, [jsKey]);

  useEffect(() => {
    if (!map) return;
    map.clearMap();

    const position = new amap.LngLat(lng, lat);

    const marker = new amap.Marker({
      position,
    });

    map.setCenter([lng, lat], true);

    map.add(marker);
  }, [lat, lng]);

  return (
    <div id="resultContainer" style={{ height: "300px" }}>
      <Spin></Spin>
      <Typography.Text>加载地图组件中...</Typography.Text>
      <br />
      <Typography.Text>
        如果长时间显示该信息，请检查 Web端 Key 是否正确填写
      </Typography.Text>
    </div>
  );

}