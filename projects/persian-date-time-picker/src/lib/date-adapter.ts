import {
  addDays as addDaysJalali,
  addHours as addHoursJalali,
  addMonths as addMonthsJalali,
  addYears as addYearsJalali,
  endOfMonth as endOfMonthJalali,
  format as formatJalali,
  getDaysInMonth as getDaysInMonthJalali,
  isAfter as isAfterJalali,
  isBefore as isBeforeJalali,
  isSameDay as isSameDayJalali,
  isSameMonth as isSameMonthJalali,
  isSameYear as isSameYearJalali,
  isValid as isValidJalali,
  max as maxJalali,
  parse as parseJalali,
  setYear as setYearJalali,
  startOfMonth as startOfMonthJalali,
  startOfWeek as startOfWeekJalali
} from 'date-fns-jalali';

import {
  addDays as addDaysGregorian,
  addHours as addHoursGregorian,
  addMinutes,
  addMonths as addMonthsGregorian,
  addYears as addYearsGregorian,
  endOfMonth as endOfMonthGregorian,
  format as formatGregorian,
  getDaysInMonth as getDaysInMonthGregorian,
  isAfter as isAfterGregorian,
  isBefore as isBeforeGregorian,
  isEqual,
  isSameDay as isSameDayGregorian,
  isSameMonth as isSameMonthGregorian,
  isSameYear as isSameYearGregorian,
  isValid as isValidGregorian,
  max as maxGregorian,
  parse as parseGregorian,
  parseISO,
  setYear as setYearGregorian,
  startOfDay,
  startOfMonth as startOfMonthGregorian,
  startOfWeek as startOfWeekGregorian
} from 'date-fns';
import {Injectable} from '@angular/core';

export interface DateAdapter<T> {
  today(): T;

  parse(value: any, formatString: string): T | null;

  format(date: T, formatString: string): string;

  addDays(date: T, amount: number): T;

  addMonths(date: T, amount: number): T;

  addYears(date: T, amount: number): T;

  addHours(date: T, amount: number): T;

  getYear(date: T): number | null;

  getMonth(date: T): number | null;

  getDate(date: T): number | null;

  getDayOfWeek(date: T): number;

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[];

  getDateNames(): string[];

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];

  getFirstDayOfWeek(): number;

  getNumDaysInMonth(date: T): number;

  clone(date: T): T;

  createDate(year: number, month: number, date: number): T;

  isSameDay(date1: T, date2: T): boolean;

  isSameMonth(date1: T, date2: T): boolean;

  isSameYear(date1: T, date2: T): boolean;

  isAfter(date1: T, date2: T): boolean;

  isBefore(date1: T, date2: T): boolean;

  isEqual(date1: T, date2: T): boolean;

  startOfMonth(date: T): T;

  endOfMonth(date: T): T;

  startOfWeek(date: T): T;

  isValidFormat(dateString: string, formatString: string): boolean;

  max(dates: T[]): T;

  setYear(date: T, year: number): T;

  startOfDay(date: T): T;

  getHours(date: T): number | null;

  getMinutes(date: T): number | null;

  getSeconds(date: T): number | null;

  setHours(date: T, hours: number): T;

  setMinutes(date: T, minutes: number): T;

  setSeconds(date: T, seconds: number): T;

  getDaysInMonth(date: T): number;

  addMinutes(date: T, amount: number): T;
}

@Injectable({
  providedIn: 'root'
})
export class JalaliDateAdapter implements DateAdapter<Date> {

  today(): Date {
    return new Date();
  }

  parse(value: any, formatString: string): Date | null {
    if (typeof value === 'string') {
      // Check if it's in ISO 8601 format
      if (value.includes('T')) {
        const parsedDate = parseISO(value);
        return isValidJalali(parsedDate) ? parsedDate : null;
      }

      try {
        const parsedDate = parseJalali(value, formatString, new Date());
        return isValidJalali(parsedDate) ? parsedDate : null;
      } catch (error) {
        console.error('Error parsing date:', error);
        return null;
      }
    } else if (value instanceof Date) {
      return isValidJalali(value) ? value : null;
    }
    return null;
  }

  format(date: Date, formatString: string): string {
    return formatJalali(date, formatString);
  }

  addDays(date: Date, amount: number): Date {
    return addDaysJalali(date, amount);
  }

  addMonths(date: Date, amount: number): Date {
    return addMonthsJalali(date, amount);
  }

  addYears(date: Date, amount: number): Date {
    return addYearsJalali(date, amount);
  }

  addHours(date: Date, amount: number): Date {
    return addHoursJalali(date, amount);
  }

  getYear(date: Date): number | null {
    return date ? parseInt(formatJalali(date, 'yyyy')) : null;
  }

  getMonth(date: Date): number | null {
    // Jalali months are 1-indexed in date-fns-jalali
    return date ? parseInt(formatJalali(date, 'M')) - 1 : null;
  }

  getDate(date: Date): number | null {
    return date ? parseInt(formatJalali(date, 'dd')) : null;
  }

  getDayOfWeek(date: Date): number {
    return parseInt(formatJalali(date, 'i')) - 1;
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const jalaliMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];

    switch (style) {
      case 'long':
        return jalaliMonths;
      case 'short':
        return jalaliMonths.map(month => month.substring(0, 3));
      case 'narrow':
        return jalaliMonths.map(month => month.substring(0, 1));
      default:
        return jalaliMonths;
    }
  }

  getDateNames(): string[] {
    return Array.from({length: 31}, (_, i) => (i + 1).toString());
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formats = {
      long: 'EEEE',
      short: 'EEEEE',
      narrow: 'EEEEEE'
    };
    return Array.from({length: 7}, (_, i) =>
      formatJalali(addDaysJalali(startOfWeekJalali(new Date()), i), formats[style])
    );
  }

  getFirstDayOfWeek(): number {
    return 6; // Saturday is the first day of the week in the Jalali calendar
  }

  getNumDaysInMonth(date: Date): number {
    return parseInt(formatJalali(endOfMonthJalali(date), 'd'));
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  createDate(year: number, month: number, date: number): Date {
    // Adjust for 0-indexed months in the interface vs 1-indexed months in date-fns-jalali
    return parseJalali(`${year}/${month + 1}/${date}`, 'yyyy/M/d', new Date());
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDayJalali(date1, date2);
  }

  isSameMonth(date1: Date, date2: Date): boolean {
    return isSameMonthJalali(date1, date2);
  }

  isSameYear(date1: Date, date2: Date): boolean {
    return isSameYearJalali(date1, date2);
  }

  isAfter(date1: Date, date2: Date): boolean {
    return isAfterJalali(date1, date2);
  }

  isBefore(date1: Date, date2: Date): boolean {
    return isBeforeJalali(date1, date2);
  }

  isEqual(date1: Date, date2: Date): boolean {
    return isEqual(date1, date2);
  }

  startOfMonth(date: Date): Date {
    return startOfMonthJalali(date);
  }

  endOfMonth(date: Date): Date {
    return endOfMonthJalali(date);
  }

  startOfWeek(date: Date): Date {
    return startOfWeekJalali(date, {weekStartsOn: this.getFirstDayOfWeek() as 0 | 1 | 2 | 3 | 4 | 5 | 6});
  }

  isValidFormat(dateString: string, formatString: string): boolean {
    try {
      const parsedDate = parseJalali(dateString, formatString, new Date());
      if (!isValidJalali(parsedDate)) {
        return false;
      }
      // Check if the formatted parsed date matches the original date string
      const formattedDate = formatJalali(parsedDate, formatString);
      return formattedDate === dateString;
    } catch (error) {
      return false;
    }
  }

  max(dates: Date[]): Date {
    return maxJalali(dates);
  }

  setYear(date: Date, year: number): Date {
    return setYearJalali(date, year);
  }

  startOfDay(date: Date): Date {
    return startOfDay(date);
  }

  getHours(date: Date): number | null {
    return date ? parseInt(formatJalali(date, 'HH')) : null;
  }

  getMinutes(date: Date): number | null {
    return date ? parseInt(formatJalali(date, 'mm')) : null;
  }

  getSeconds(date: Date): number | null {
    return date ? parseInt(formatJalali(date, 'ss')) : null;
  }

  setHours(date: Date, hours: number): Date {
    const newDate = this.clone(date);
    newDate.setHours(hours);
    return newDate;
  }

  setMinutes(date: Date, minutes: number): Date {
    const newDate = this.clone(date);
    newDate.setMinutes(minutes);
    return newDate;
  }

  setSeconds(date: Date, seconds: number): Date {
    const newDate = this.clone(date);
    newDate.setSeconds(seconds);
    return newDate;
  }

  getDaysInMonth(date: Date) {
    return getDaysInMonthJalali(date);
  }

  addMinutes(date: Date, amount: number) {
    return addMinutes(date, amount);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GregorianDateAdapter implements DateAdapter<Date> {

  today(): Date {
    return new Date();
  }

  parse(value: any, formatString: string): Date | null {
    if (typeof value === 'string') {
      // Check if it's in ISO 8601 format
      if (value.includes('T')) {
        const parsedDate = parseISO(value);
        return isValidGregorian(parsedDate) ? parsedDate : null;
      }

      try {
        let parsedDate: Date;
        if (formatString === "ISO") {
          parsedDate = parseISO(value);
        } else {
          parsedDate = parseGregorian(value, formatString, new Date());
        }
        return isValidGregorian(parsedDate) ? parsedDate : null;
      } catch (error) {
        console.error('Error parsing date:', error);
        return null;
      }
    } else if (value instanceof Date) {
      return isValidGregorian(value) ? value : null;
    }
    return null;
  }

  format(date: Date, formatString: string): string {
    return formatGregorian(date, formatString);
  }

  addDays(date: Date, amount: number): Date {
    return addDaysGregorian(date, amount);
  }

  addMonths(date: Date, amount: number): Date {
    return addMonthsGregorian(date, amount);
  }

  addYears(date: Date, amount: number): Date {
    return addYearsGregorian(date, amount);
  }

  addHours(date: Date, amount: number): Date {
    return addHoursGregorian(date, amount);
  }

  getYear(date: Date): number {
    return date.getFullYear();
  }

  getMonth(date: Date): number {
    return date.getMonth();
  }

  getDate(date: Date): number {
    return date.getDate();
  }

  getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formats = {
      long: 'MMMM',
      short: 'MMM',
      narrow: 'MMMMM'
    };
    return Array.from({length: 12}, (_, i) =>
      formatGregorian(new Date(2000, i, 1), formats[style])
    );
  }

  getDateNames(): string[] {
    return Array.from({length: 31}, (_, i) => (i + 1).toString());
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formats = {
      long: 'EEEE',
      short: 'EEE',
      narrow: 'EEEEE'
    };
    return Array.from({length: 7}, (_, i) =>
      formatGregorian(addDaysGregorian(startOfWeekGregorian(new Date()), i), formats[style])
    );
  }

  getFirstDayOfWeek(): number {
    return 0; // Sunday is the first day of the week in the Gregorian calendar
  }

  getNumDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  createDate(year: number, month: number, date: number): Date {
    return new Date(year, month, date);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDayGregorian(date1, date2);
  }

  isSameMonth(date1: Date, date2: Date): boolean {
    return isSameMonthGregorian(date1, date2);
  }

  isSameYear(date1: Date, date2: Date): boolean {
    return isSameYearGregorian(date1, date2);
  }

  isAfter(date1: Date, date2: Date): boolean {
    return isAfterGregorian(date1, date2);
  }

  isBefore(date1: Date, date2: Date): boolean {
    return isBeforeGregorian(date1, date2);
  }

  isEqual(date1: Date, date2: Date): boolean {
    return isEqual(date1, date2);
  }

  startOfMonth(date: Date): Date {
    return startOfMonthGregorian(date);
  }

  endOfMonth(date: Date): Date {
    return endOfMonthGregorian(date);
  }

  startOfWeek(date: Date): Date {
    return startOfWeekGregorian(date, {weekStartsOn: this.getFirstDayOfWeek() as 0 | 1 | 2 | 3 | 4 | 5 | 6});
  }

  isValidFormat(dateString: string, formatString: string): boolean {
    try {
      const parsedDate = parseGregorian(dateString, formatString, new Date());
      if (!isValidGregorian(parsedDate)) {
        return false;
      }
      // Check if the formatted parsed date matches the original date string
      const formattedDate = formatGregorian(parsedDate, formatString);
      return formattedDate === dateString;
    } catch (error) {
      return false;
    }
  }

  max(dates: Date[]): Date {
    return maxGregorian(dates);
  }

  setYear(date: Date, year: number): Date {
    return setYearGregorian(date, year);
  }

  startOfDay(date: Date): Date {
    return startOfDay(date);
  }

  getHours(date: Date): number | null {
    return date ? date.getHours() : null;
  }

  getMinutes(date: Date): number | null {
    return date ? date.getMinutes() : null;
  }

  getSeconds(date: Date): number | null {
    return date ? date.getSeconds() : null;
  }

  setHours(date: Date, hours: number): Date {
    const newDate = this.clone(date);
    newDate.setHours(hours);
    return newDate;
  }

  setMinutes(date: Date, minutes: number): Date {
    const newDate = this.clone(date);
    newDate.setMinutes(minutes);
    return newDate;
  }

  setSeconds(date: Date, seconds: number): Date {
    const newDate = this.clone(date);
    newDate.setSeconds(seconds);
    return newDate;
  }

  getDaysInMonth(date: Date) {
    return getDaysInMonthGregorian(date);
  }

  addMinutes(date: Date, amount: number) {
    return addMinutes(date, amount);
  }
}
