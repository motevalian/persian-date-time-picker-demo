import {Component} from "@angular/core";
import {JalaliDateAdapter, PersianDateTimePickerModule} from 'persian-date-time-picker';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'disabled-dates',
  template: `
    Gregorian:
    <persian-date-picker
      [(ngModel)]="selectedDate"
      [disabledDates]="disabledDates"
      [disabledDatesFilter]="disabledDatesFilter">
    </persian-date-picker>
    <br>
    Jalali:
    <persian-date-picker
      dir="rtl"
      [rtl]="true"
      [calendarType]="'jalali'"
      [disabledDates]="disabledDatesJalali"
      [disabledDatesFilter]="disabledDatesFilterJalali"
      [(ngModel)]="selectedDate">
    </persian-date-picker>
    <br>
    Month:
    <persian-date-picker
      [(ngModel)]="selectedDate"
      [mode]="'month'"
      [disabledDatesFilter]="disabledDatesFilterMonth">
    </persian-date-picker>
    <br>
    Year:
    <persian-date-picker
      [(ngModel)]="selectedDate"
      [mode]="'year'"
      [disabledDatesFilter]="disabledDatesFilterYear">
    </persian-date-picker>
    <br>
    Combining with Time:
    <persian-date-picker
      [format]="'yyyy/MM/dd HH:mm'"
      [disabledDatesFilter]="disabledDatesFilterCombined"
      [disabledTimesFilter]="disabledTimesFilter"
      [(ngModel)]="selectedDate">
    </persian-date-picker>
    <button class="toggle-btn" (click)="toggleCode(code)">show code</button>
    <div id="code" class="code" #code>
      <code>
        {{ demoCode }}
      </code>
    </div>
  `,
  imports: [PersianDateTimePickerModule, FormsModule]
})
export class DisabledDates {

  selectedDate?: Date | string;

  // Basic
  disabledDates = [
    new Date(), // Disables current date
    '2024/12/05',
    '2024/12/07'
  ];
  // Jalali
  disabledDatesJalali = [
    '1403/09/01',
    '1403/09/15',
    '1403/10/01',
    new Date(2024, 8, 15), // September 15, 2024
    new Date(2024, 11, 25), // December 25, 2024
    new Date() //today
  ];
  demoCode = `
        @Component({
        selector: 'disabled-dates',
        template: \`
            Gregorian:
            <persian-date-picker
                [(ngModel)]="selectedDate"
                [disabledDates]="disabledDates"
                [disabledDatesFilter]="disabledDatesFilter">
            </persian-date-picker>
            <br>
            Jalali:
            <persian-date-picker
                dir="rtl"
                [rtl]="true"
                [calendarType]="'jalali'"
                [disabledDates]="disabledDatesJalali"
                [disabledDatesFilter]="disabledDatesFilterJalali"
                [(ngModel)]="selectedDate">
            </persian-date-picker>
            <br>
            Month:
            <persian-date-picker
                [(ngModel)]="selectedDate"
                [mode]="'month'"
                [disabledDatesFilter]="disabledDatesFilterMonth">
            </persian-date-picker>
            <br>
            Year:
            <persian-date-picker
                [(ngModel)]="selectedDate"
                [mode]="'year'"
                [disabledDatesFilter]="disabledDatesFilterYear">
            </persian-date-picker>
            <br>
            Combining with Time:
            <persian-date-picker
                [format]="'yyyy/MM/dd HH:mm'"
                [disabledDatesFilter]="disabledDatesFilterCombined"
                [disabledTimesFilter]="disabledTimesFilter"
                [(ngModel)]="selectedDate">
            </persian-date-picker>
        \`,
    })
    export class DisabledDates {
        selectedDate: Date | string;

        // Basic
        disabledDates = [
            new Date(), // Disables current date
            '2024/12/05',
            '2024/12/07'
        ];
        disabledDatesFilter = (date: Date) => {
            const day = date.getDay();
            // weekends: Saturday (6) and Sunday (0)
            return day === 0 || day === 6;
        };

        // Jalali
        disabledDatesJalali = [
            '1403/09/01',
            '1403/09/15',
            '1403/10/01',
            new Date(2024, 8, 15), // September 15, 2024
            new Date(2024, 11, 25), // December 25, 2024
            new Date() //today
        ];
        disabledDatesFilterJalali = (date: Date) => {
            const year = this.jalaliDateAdapter.getYear(date)
            const month = this.jalaliDateAdapter.getMonth(date);
            // Disable 1407 year and every Farvardin(0) and Ordibehesht(1)
            return year == 1407 || month === 0 || month === 1;
        };

        // Disabled month
        disabledDatesFilterMonth = (date: Date) => {
            const month = date.getMonth();
            // Disables even months
            return month % 2 === 0;
        };

        // Disabled Year
        disabledDatesFilterYear = (date: Date) => {
            const year = date.getFullYear();
            let yearRange = []
            for (let i = 1; i <= 20; i++) {
                let startYear = 1996;
                yearRange.push(startYear+i)
            }
            let entryYear = year == 2019 || year == 2021 || year == 2026 || year == 2027 || year == 2030;
            return yearRange.includes(year) || entryYear;
        };

        // Combining Time Restrictions
        disabledDatesFilterCombined = (date: Date) => {
            const weekDay = date.getDay();
            return weekDay === 5; // Disable Fridays
        };
        disabledTimesFilter = (date: Date) => {
            const hour = date.getHours();
            const weekDay = date.getDay();

            // Disable:
            // - Before 9 AM and after 5 PM on weekdays
            // - All hours on weekends
            if (weekDay === 0 || weekDay === 6) return true;
            return hour < 9 || hour >= 17;
        };

        constructor(private jalaliDateAdapter: JalaliDateAdapter) {}
    }
    `;

  constructor(private jalaliDateAdapter: JalaliDateAdapter) {
  }

  disabledDatesFilter = (date: Date) => {
    const day = date.getDay();
    // weekends: Saturday (6) and Sunday (0)
    return day === 0 || day === 6;
  };

  disabledDatesFilterJalali = (date: Date) => {
    const year = this.jalaliDateAdapter.getYear(date);
    const month = this.jalaliDateAdapter.getMonth(date);
    // Disable 1407 year and every Farvardin (0) and Ordibehesht (1) months
    return year == 1407 || month === 0 || month === 1;
  };

  // Disabled month
  disabledDatesFilterMonth = (date: Date) => {
    const month = date.getMonth();
    // Disables even months
    return month % 2 === 0;
  };

  // Disabled Year
  disabledDatesFilterYear = (date: Date) => {
    const year = date.getFullYear();
    let yearRange = [];
    for (let i = 1; i <= 20; i++) {
      let startYear = 1996;
      yearRange.push(startYear + i);
    }
    let entryYear = year == 2019 || year == 2021 || year == 2026 || year == 2027 || year == 2030;
    return yearRange.includes(year) || entryYear;
  };

  // Combining Time Restrictions
  disabledDatesFilterCombined = (date: Date) => {
    const weekDay = date.getDay();
    return weekDay === 5; // Disable Fridays
  };

  disabledTimesFilter = (date: Date) => {
    const hour = date.getHours();
    const weekDay = date.getDay();

    // Disable:
    // - Before 9 AM and after 5 PM on weekdays
    // - All hours on weekends
    if (weekDay === 0 || weekDay === 6) return true;
    return hour < 9 || hour >= 17;
  };

  toggleCode(elm: HTMLDivElement) {
    let display = elm.style.display;
    if (display != 'block') {
      elm.style.display = 'block';
    } else {
      elm.style.display = 'none';
    }
  }
}
