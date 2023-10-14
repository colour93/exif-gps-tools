import { Button, Col, Form, Row, Toast, Typography } from "@douyinfe/semi-ui";
import React, { useState } from "react";
import { GeocodeResponse, Geocodes } from "types/Geocode";

const API = {
  geocode: "https://restapi.amap.com/v3/geocode/geo",
	detail: "https://restapi.amap.com/v3/place/detail"
};

function locationConvert(rawLocation: string) {
  const locationArr = rawLocation.split(",").map(Number);
  const lng = Math.abs(locationArr[0]) + "°" + (locationArr[0] > 0 ? "E" : "W");
  const lat = Math.abs(locationArr[1]) + "°" + (locationArr[1] > 0 ? "N" : "S");
  return lng + " " + lat;
}

//=> Main Component
export default () => {
  const localStorageKey = localStorage.getItem("key");

  const [results, setResults] = useState<Geocodes[]>();
  const [details, setDetails] =
    useState<{ value: number; label: string; otherKey: number }[]>();

  const updateResults = (results: Geocodes[]) => {
    setResults(results);
    setDetails(
      results.map(({ formatted_address }, index) => {
        return { value: index, label: formatted_address, otherKey: index };
      })
    );
  };

  return (
    <div style={{ padding: "10px" }}>
      <Form>
        {({ formState, values, formApi }) => (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Input
                field="key"
                label="高德地图 Web服务 Key"
                mode="password"
                initValue={localStorageKey}
                extraText={
                  <Typography.Text
                    link={{ href: "https://console.amap.com/dev/key/app" }}
                  >
                    没有 Key？点此获取
                  </Typography.Text>
                }
                onChange={(key) => {
                  localStorage.setItem("key", key);
                }}
              ></Form.Input>

              <Form.Input
                field="placeString"
                label="地理位置名称"
                extraText="如：清华大学 或 北京市海淀区双清路30号"
                showClear
              ></Form.Input>
              <Typography.Text>或</Typography.Text>
              <Form.Input
                field="placeUrl"
                label={{
									text: "地理位置 URL 或 ID",
									extra: "（即将支持）"
								}}
                extraText="如：https://surl.amap.com/f0nreX51o667 或 https://amap.com/place/B000A7BD6C 或 B000A7BD6C"
                showClear
								disabled
              ></Form.Input>

              <Button
                theme="solid"
                block
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `${API.geocode}?address=${formState.values.placeString}&Key=${formState.values.key}`
                    );
                    const resJson: GeocodeResponse = await res.json();

                    if (resJson.status === "0") {
                      Toast.error("错误：" + resJson.info);
                      return;
                    }

                    if (resJson.count === "0") {
                      Toast.error("错误：未找到该地点");
                      return;
                    }

                    updateResults(resJson.geocodes);
                    formApi.setValue("resultDetail", 0);
                    formApi.setValue(
                      "resultLocation",
                      locationConvert(resJson.geocodes[0].location)
                    );

                    Toast.success("成功");
                  } catch (error) {
                    Toast.error("遇到未知错误，详情查看控制台");
                    console.error(error);
                  }
                }}
              >
                请求
              </Button>
            </Col>

            <Col span={12}>
              <Form.Select
                field="resultDetail"
                label="结果条目"
                optionList={details}
                onChange={(value: number) => {
                  formApi.setValue(
                    "resultLocation",
                    locationConvert(results[value].location)
                  );
                }}
              ></Form.Select>
              <Form.Input
                field="resultLocation"
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
