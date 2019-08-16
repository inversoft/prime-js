/*
 * Copyright (c) 2019, Inversoft Inc., All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */
'use strict';

import {Utils} from "./Utils"

const PrimeDate = {
  DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

  /**
   * Return the hour in a 12-hour format. AM and PM are not communicated by the returned hour.
   *
   * @param date {Date} The date object to retrieve the hour from.
   * @returns {number} The hour of the day between 1 and 12.
   */
  getHourOfDay: function (date: Date) {
    return (date.getHours() + 24) % 12 || 12;
  },

  /**
   * @param year The year.
   * @returns {boolean} True if this is a leap year, otherwise false.
   */
  isLeapYear: function (year: number) {
    return !((year % 4) || (!(year % 100) && (year % 400)));
  },

  /**
   * Return the number of days in the month.
   * @param year The year, the days in the month may change during a leap year.
   * @param month The month.
   * @returns {number} The number of days in the month.
   */
  numberOfDaysInMonth: function (year: number, month: number) {
    if (month === 1 && this.isLeapYear(year)) {
      return 29;
    } else {
      return PrimeDate.DAYS_IN_MONTH[month];
    }
  },

  /**
   * Adds the given number of days to the given Date.
   *
   * @param date {Date} The date to add the days to.
   * @param number {number} The number of days to add.
   */
  plusDays: function (date: Date, number: number) {
    if (number === 0) {
      return;
    }

    let newDate = date.getDate() + number;
    let numberOfDaysInMonth = PrimeDate.numberOfDaysInMonth(date.getFullYear(), date.getMonth());

    if (newDate > 0) {
      while (newDate > numberOfDaysInMonth) {
        PrimeDate.plusMonths(date, 1);
        newDate = newDate - numberOfDaysInMonth;
        numberOfDaysInMonth = PrimeDate.numberOfDaysInMonth(date.getFullYear(), date.getMonth());
      }

      date.setDate(newDate);
    } else {
      while (newDate <= 0) {
        PrimeDate.plusMonths(date, -1);
        numberOfDaysInMonth = PrimeDate.numberOfDaysInMonth(date.getFullYear(), date.getMonth());
        newDate = newDate + numberOfDaysInMonth;
      }

      date.setDate(newDate);
    }
  },

  /**
   * Adds the given number of hours to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {number} The number of hours to add.
   */
  plusHours: function (date: Date, number: number) {
    if (number === 0) {
      return;
    }

    const deltaDays = number / 24;
    PrimeDate.plusDays(date, deltaDays);

    const deltaHours = number % 24;
    const newHour = date.getHours() + deltaHours;
    if (newHour > 23) {
      PrimeDate.plusDays(date, 1);
      date.setHours(newHour - 24);
    } else if (newHour < 0) {
      PrimeDate.plusDays(date, -1);
      date.setHours(24 + newHour);
    } else {
      date.setHours(newHour);
    }
  },

  /**
   * Adds the given number of minutes to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {number} The number of minutes to add.
   */
  plusMinutes: function (date: Date, number: number) {
    if (number === 0) {
      return;
    }

    const deltaHours = number / 60;
    PrimeDate.plusHours(date, deltaHours);

    const deltaMinutes = number % 60;
    const newMinute = date.getMinutes() + deltaMinutes;
    if (newMinute > 60) {
      PrimeDate.plusHours(date, 1);
      date.setMinutes(newMinute - 60);
    } else if (newMinute < 0) {
      PrimeDate.plusHours(date, -1);
      date.setMinutes(60 + newMinute);
    } else {
      date.setMinutes(newMinute);
    }
  },

  /**
   * Adds the given number of months to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {number} The number of months to add.
   */
  plusMonths: function (date: Date, number: number) {
    if (number === 0) {
      return;
    }

    let deltaYears = number / 12;
    let deltaMonths = number % 12;
    let currentMonth = date.getMonth();
    const newMonth = currentMonth + deltaMonths;
    if (newMonth < 0) {
      deltaYears--;
      deltaMonths = newMonth;
      currentMonth = 12;
    } else if (newMonth >= 12) {
      deltaYears++;
      deltaMonths = newMonth - 12;
      currentMonth = 0;
    }

    date.setFullYear(date.getFullYear() + deltaYears);
    // If the day is 31 and you set month to 1 (February) it will adjust to March 3 (Feb 28 + 3)
    const adjustedMonth = currentMonth + deltaMonths;
    if (date.getDate() > this.DAYS_IN_MONTH[adjustedMonth]) {
      date.setDate(this.DAYS_IN_MONTH[adjustedMonth]);
    }
    date.setMonth(adjustedMonth);
  },

  /**
   * Adds the given number of seconds to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {number} The number of seconds to add.
   */
  plusSeconds: function (date: Date, number: number) {
    if (number === 0) {
      return;
    }

    const deltaMinutes = number / 60;
    PrimeDate.plusMinutes(date, deltaMinutes);

    const deltaSeconds = number % 60;
    const newSecond = date.getSeconds() + deltaSeconds;
    if (newSecond > 60) {
      PrimeDate.plusMinutes(date, 1);
      date.setSeconds(newSecond - 60);
    } else if (newSecond < 0) {
      PrimeDate.plusMinutes(date, -1);
      date.setSeconds(60 + newSecond);
    } else {
      date.setSeconds(newSecond);
    }
  },

  /**
   * Adds the given number of years to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {number} The number of years to add.
   */
  plusYears: function (date: Date, number: number) {
    if (number === 0) {
      return;
    }

    date.setFullYear(date.getFullYear() + number);
  },

  /**
   * Return a string in simplified extended ISO format (ISO 8601) truncated to only return YYYY-MM-DD.
   *
   * For example: new Date(2015, 6, 4) --> 2015-07-04
   *
   * @param date {Date} The date.
   * @returns {String} A date string in the format YYYY-MM-DD.
   */
  toDateOnlyISOString: function (date: Date) {
    if (date instanceof Date) {
      return date.getFullYear()
          + '-' + Utils.leftPadNumber(date.getMonth() + 1, 2)
          + '-' + Utils.leftPadNumber(date.getDate(), 2);
    }
    throw TypeError('date parameter must be a Date object.');
  }
};

export {PrimeDate}
