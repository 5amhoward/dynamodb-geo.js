import { TimeWindow } from '../types';
import * as Long from 'long';

function getWeekNumber(dateTime: Date): Number {
  const yr = dateTime.getFullYear();
  const firstDayOfYear = new Date(yr, 0, 1);
  const pastDaysOfYear =
    (dateTime.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default function getGeoDateHash(
  geoHashKey: Long,
  timeWindow: TimeWindow
): string {
  const week = getWeekNumber(timeWindow.start);
  const weekString = `0${week}`.slice(-2);
  const year = timeWindow.start.getFullYear();
  return `${year.toString()}${weekString}${geoHashKey.toString()}`;
}
