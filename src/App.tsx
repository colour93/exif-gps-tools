import { IconCode } from "@douyinfe/semi-icons";
import {
  Banner,
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
import { ResultMapContainer, QueryMapContainer } from "Map";
import React, { useEffect, useState } from "react";
import { QueryType } from "types/Common";
import { Detail } from "types/Detail";
import { GeocodeResponse } from "types/Geocode";
import { SurlResultResponse } from "types/SurlResult";
import { locationConvert } from "utils";

const API = {
  surl: "https://amap-surl-parse.vercel.fur93.icu/",
  geocode: "https://restapi.amap.com/v3/geocode/geo",
  detail: "https://restapi.amap.com/v3/place/detail",
};

let globalFormApi: FormApi | null = null;

const getDetail = async ({
  formState,
  formApi,
  queryType,
  setDetail,
  setLoading,
}: {
  formState: FormState;
  formApi: FormApi;
  queryType: QueryType;
  setDetail: React.Dispatch<Detail>;
  setLoading: React.Dispatch<boolean>;
}) => {
  setLoading(true);

  try {
    let address = "";
    let location = "";
    let lat = 0;
    let lng = 0;

    switch (queryType) {
      // share url
      case "shareUrl":
        const shareUrlRes = await fetch(
          `${API.surl}?url=${formState.values.shareUrl}`
        );

        const shareUrlResJson: SurlResultResponse = await shareUrlRes.json();

        if (shareUrlResJson.code != 0) {
          setLoading(false);
          console.error(shareUrlResJson);
          Toast.error(shareUrlResJson.msg);
          return;
        }

        address = shareUrlResJson.data.formattedAddress;
        location = shareUrlResJson.data.locationStringGeneral;
        lat = shareUrlResJson.data.lat;
        lng = shareUrlResJson.data.lng;

        break;

      // place string
      case "placeName":
        const placeNameRes = await fetch(
          `${API.geocode}?address=${formState.values.placeName}&Key=${formState.values.apiKey}`
        );
        const placeNameResJson: GeocodeResponse = await placeNameRes.json();

        if (placeNameResJson.status === "0") {
          setLoading(false);
          Toast.error("错误：" + placeNameResJson.info);
          return;
        }

        if (placeNameResJson.count === "0") {
          setLoading(false);
          Toast.error("错误：未找到该地点");
          return;
        }
        address = placeNameResJson.geocodes[0].formatted_address;
        location = locationConvert(placeNameResJson.geocodes[0].location);
        [lng, lat] = placeNameResJson.geocodes[0].location
          .split(",")
          .map((v) => Number(v));
        break;

      default:
        Toast.error(`未知的请求类型：${queryType}`);
        return;
    }

    setDetail({
      address,
      location,
      lat,
      lng,
    });

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

  const localStorageQueryType = localStorage.getItem("queryType") as QueryType;

  window["_AMapSecurityConfig"] = {
    securityJsCode: localStorageJsSecurity,
  };

  const [loading, setLoading] = useState(false);

  const [detail, setDetail] = useState<Detail>({});
  const [queryType, setQueryType] = useState<QueryType>(
    localStorageQueryType || "placeName"
  );

  useEffect(() => {
    localStorage.setItem("queryType", queryType);
  }, [queryType]);

  useEffect(() => {
    globalFormApi.setValue("address", detail.address);
    globalFormApi.setValue("location", detail.location);
  }, [detail]);

  return (
    <div style={{ padding: "10px" }}>
      <Form>
        {({ formState, values, formApi }) => {
          globalFormApi = formApi;
          return (
            <Row gutter={16}>
              <Col xs={24} md={12} lg={8}>
                <Form.Section text="配置">
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

                  <Form.Input
                    field="jsSecurity"
                    label={{
                      text: "高德地图 Web端 安全密钥",
                      extra: (
                        <Typography.Text type="quaternary">
                          使用 自动补全 时需要填写该 安全密钥
                        </Typography.Text>
                      ),
                    }}
                    mode="password"
                    initValue={localStorageJsSecurity}
                    onChange={(key) => {
                      localStorage.setItem("jsSecurity", key);
                    }}
                  ></Form.Input>

                  <Typography.Text
                    link={{ href: "https://console.amap.com/dev/key/app" }}
                    icon={<IconCode />}
                    underline
                  >
                    高德地图开放平台 控制台
                  </Typography.Text>

                  <Banner
                    fullMode={false}
                    closeIcon={null}
                    description="修改后建议刷新页面，以确保生效"
                  />

                  <Button
                    block
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    刷新
                  </Button>
                </Form.Section>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Form.Section text="查询">
                  <Tabs
                    type="line"
                    activeKey={queryType}
                    onChange={(v) => {
                      setQueryType(v as QueryType);
                    }}
                  >
                    <TabPane tab="位置名称" itemKey="placeName">
                      <Form.Input
                        field="placeName"
                        label="地理位置名称"
                        extraText="如：清华大学 或 北京市海淀区双清路30号"
                        onEnterPress={() =>
                          getDetail({
                            formState,
                            formApi,
                            queryType,
                            setDetail,
                            setLoading,
                          })
                        }
                        showClear
                      ></Form.Input>
                    </TabPane>

                    <TabPane tab="分享URL" itemKey="shareUrl">
                      <Form.Input
                        field="shareUrl"
                        label={{
                          text: "地理位置分享 URL",
                        }}
                        extraText="如：https://surl.amap.com/f0nreX51o667"
                        onEnterPress={() =>
                          getDetail({
                            formState,
                            formApi,
                            queryType,
                            setDetail,
                            setLoading,
                          })
                        }
                        showClear
                      ></Form.Input>
                    </TabPane>
                    <TabPane tab="位置ID" itemKey="placeUrlOrId" disabled>
                      <Form.Input
                        field="placeUrlOrId"
                        label={{
                          text: "地理位置 URL 或 ID （即将上线）",
                        }}
                        extraText="如：https://amap.com/place/B000A7BD6C 或 B000A7BD6C"
                        onEnterPress={() =>
                          getDetail({
                            formState,
                            formApi,
                            queryType,
                            setDetail,
                            setLoading,
                          })
                        }
                        showClear
                        disabled
                      ></Form.Input>
                    </TabPane>

                    <TabPane tab="地图选点" itemKey="mapMarker">
                      <QueryMapContainer
                        jsKey={formState.values.jsKey}
                        setDetail={setDetail}
                        formApi={formApi}
                      />
                    </TabPane>
                  </Tabs>

                  {queryType != "mapMarker" && (
                    <Button
                      theme="solid"
                      block
                      onClick={() =>
                        getDetail({
                          formState,
                          formApi,
                          queryType,
                          setDetail,
                          setLoading,
                        })
                      }
                      loading={loading}
                    >
                      请求
                    </Button>
                  )}
                </Form.Section>
              </Col>

              <Col xs={24} md={24} lg={8}>
                <Form.Section text="结果">
                  <Form.Label text="结果地图" />
                  <ResultMapContainer
                    jsKey={formState.values.jsKey}
                    lng={detail.lng}
                    lat={detail.lat}
                  />

                  <Form.Input
                    field="address"
                    label="结果地址"
                    readOnly
                  ></Form.Input>
                  <Form.Input
                    field="location"
                    label="结果坐标"
                    readOnly
                  ></Form.Input>
                  <Button
                    block
                    onClick={async () => {
                      try {
                        if (!formState.values.location) {
                          Toast.error("请先获取地理位置信息");
                          return;
                        }
                        if (!navigator.clipboard) {
                          Toast.error("您的浏览器不支持复制");
                          return;
                        }
                        await navigator.clipboard.writeText(
                          formState.values.location
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
                </Form.Section>
              </Col>
            </Row>
          );
        }}
      </Form>
    </div>
  );
};
