export const locationConvert = (rawLocation: string) => {
  const locationArr = rawLocation.split(",").map(Number);
  const lng = Math.abs(locationArr[0]) + "°" + (locationArr[0] > 0 ? "E" : "W");
  const lat = Math.abs(locationArr[1]) + "°" + (locationArr[1] > 0 ? "N" : "S");
  return lng + " " + lat;
};
