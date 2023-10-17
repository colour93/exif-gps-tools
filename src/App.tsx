import { IconCode } from "@douyinfe/semi-icons";
import {
  Button,
  Col,
  Form,
  Row,
  TabPane,
  Tabs,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import { FormApi, FormState } from "@douyinfe/semi-ui/lib/es/form";
import ResultMapContainer from "Map";
import React, { useState } from "react";
import { Detail } from "types/Detail";
import { GeocodeResponse } from "types/Geocode";
import { SurlResultResponse } from "types/SurlResult";

const API = {
  surl: "https://amap-surl-parse.vercel.fur93.icu/",
  geocode: "https://restapi.amap.com/v3/geocode/geo",
  detail: "https://restapi.amap.com/v3/place/detail",
};

const locationConvert = (rawLocation: string) => {
  const locationArr = rawLocation.split(",").map(Number);
  const lng = Math.abs(locationArr[0]) + "°" + (locationArr[0] > 0 ? "E" : "W");
  const lat = Math.abs(locationArr[1]) + "°" + (locationArr[1] > 0 ? "N" : "S");
  return lng + " " + lat;
};

const getDetail = async ({
  formState,
  formApi,
  setDetail,
  setLoading,
}: {
  formState: FormState;
  formApi: FormApi;
  setDetail: React.Dispatch<Detail>;
  setLoading: React.Dispatch<boolean>;
}) => {
  setLoading(true);

  try {
    let type = "placeString";
    if (formState.values.shareUrl) type = "shareUrl";
    if (formState.values.placeUrl) type = "placeUrl";

    let address = "";
    let location = "";
    let lat = 0;
    let lng = 0;

    // share url
    if (type == "shareUrl") {
      const res = await fetch(`${API.surl}?url=${formState.values.shareUrl}`);

      const resJson: SurlResultResponse = await res.json();

      if (resJson.code != 0) {
        setLoading(false);
        console.error(resJson);
        Toast.error(resJson.msg);
        return;
      }

      address = resJson.data.formattedAddress;
      location = resJson.data.locationStringGeneral;
      lat = resJson.data.lat;
      lng = resJson.data.lng;
    }

    // place string
    if (type == "placeString") {
      const res = await fetch(
        `${API.geocode}?address=${formState.values.placeString}&Key=${formState.values.apiKey}`
      );
      const resJson: GeocodeResponse = await res.json();

      if (resJson.status === "0") {
        setLoading(false);
        Toast.error("错误：" + resJson.info);
        return;
      }

      if (resJson.count === "0") {
        setLoading(false);
        Toast.error("错误：未找到该地点");
        return;
      }
      address = resJson.geocodes[0].formatted_address;
      location = locationConvert(resJson.geocodes[0].location);
      [lng, lat] = resJson.geocodes[0].location
        .split(",")
        .map((v) => Number(v));
    }

    setDetail({
      address,
      location,
      lat,
      lng,
    });

    formApi.setValue("detailAddress", address);
    formApi.setValue("detailLocation", location);
    setLoading(false);
    Toast.success("成功");
  } catch (error) {
    setLoading(false);
    Toast.error("遇到未知错误，详情查看控制台");
    console.error(error);
  }
};

//=> Main Component
export default () => {
  const localStorageApiKey = localStorage.getItem("apiKey");
  const localStorageJsKey = localStorage.getItem("jsKey");
  const localStorageJsSecurity = localStorage.getItem("jsSecurity");

  const [loading, setLoading] = useState(false);

  const [detail, setDetail] = useState<Detail>({});

  return (
    <div style={{ padding: "10px" }}>
      <Form>
        {({ formState, values, formApi }) => (
          <Row gutter={16}>
            <Col xs={24} md={12} lg={8}>
              <Form.Input
                field="apiKey"
                label={{
                  text: "高德地图 Web服务 Key",
                  extra: (
                    <Typography.Text type="quaternary">
                      使用 位置名称、位置ID 时需要填写该 Key
                    </Typography.Text>
                  ),
                }}
                mode="password"
                initValue={localStorageApiKey}
                onChange={(key) => {
                  localStorage.setItem("apiKey", key);
                }}
              ></Form.Input>

              <Form.Input
                field="jsKey"
                label={{
                  text: "高德地图 Web端 Key",
                  extra: (
                    <Typography.Text type="quaternary">
                      使用 地图选点、结果地图 时需要填写该 Key
                    </Typography.Text>
                  ),
                }}
                mode="password"
                initValue={localStorageJsKey}
                onChange={(key) => {
                  localStorage.setItem("jsKey", key);
                }}
              ></Form.Input>

              <Typography.Text
                link={{ href: "https://console.amap.com/dev/key/app" }}
                icon={<IconCode />}
                underline
              >
                高德地图开放平台 控制台
              </Typography.Text>

              <Button
                block
                onClick={() => {
                  window.location.reload();
                }}
              >刷新页面</Button>
            </Col>

            <Col xs={24} md={12} lg={8}>
              <Tabs type="line">
                <TabPane tab="位置名称" itemKey="placeString">
                  <Form.Input
                    field="placeString"
                    label="地理位置名称"
                    extraText="如：清华大学 或 北京市海淀区双清路30号"
                    onEnterPress={() =>
                      getDetail({ formState, formApi, setDetail, setLoading })
                    }
                    showClear
                  ></Form.Input>
                </TabPane>

                <TabPane tab="分享URL" itemKey="shaerUrl">
                  <Form.Input
                    field="shareUrl"
                    label={{
                      text: "地理位置分享 URL",
                    }}
                    extraText="如：https://surl.amap.com/f0nreX51o667"
                    onEnterPress={() =>
                      getDetail({ formState, formApi, setDetail, setLoading })
                    }
                    showClear
                  ></Form.Input>
                </TabPane>
                <TabPane tab="位置ID" itemKey="placeUrl" disabled>
                  <Form.Input
                    field="placeUrl"
                    label={{
                      text: "地理位置 URL 或 ID （即将上线）",
                    }}
                    extraText="如：https://amap.com/place/B000A7BD6C 或 B000A7BD6C"
                    onEnterPress={() =>
                      getDetail({ formState, formApi, setDetail, setLoading })
                    }
                    showClear
                    disabled
                  ></Form.Input>
                </TabPane>

                <TabPane tab="地图选点" itemKey="mapMarker" disabled></TabPane>
              </Tabs>

              <Button
                theme="solid"
                block
                onClick={() =>
                  getDetail({ formState, formApi, setDetail, setLoading })
                }
                loading={loading}
              >
                请求
              </Button>
            </Col>

            <Col xs={24} md={24} lg={8}>
              <ResultMapContainer
                jsKey={formState.values.jsKey}
                lng={detail.lng}
                lat={detail.lat}
              />

              <Form.Input
                field="detailAddress"
                label="结果地址"
                readOnly
              ></Form.Input>
              <Form.Input
                field="detailLocation"
                label="结果坐标"
                readOnly
              ></Form.Input>
              <Button
                block
                onClick={async () => {
                  try {
                    if (!formState.values.resultLocation) {
                      Toast.error("请先获取地理位置信息");
                      return;
                    }
                    if (!navigator.clipboard) {
                      Toast.error("您的浏览器不支持复制");
                      return;
                    }
                    await navigator.clipboard.writeText(
                      formState.values.resultLocation
                    );
                    Toast.success("复制成功");
                  } catch (error) {
                    console.error(error);
                    Toast.error("复制失败");
                  }
                }}
              >
                复制
              </Button>
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
};
