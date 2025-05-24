import {Component} from "@angular/core";
import {GregorianDateAdapter, JalaliDateAdapter, PersianDateTimePickerModule} from 'persian-date-time-picker';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'custom-render',
  template: `
    Gregorian:
    <persian-date-picker
      [(ngModel)]="selectedDate">
      <ng-template dtp-template="day" let-date>
        <span class="meeting"
              *ngIf="date.getDate() == 14 || date.getDate() == 16 || date.getDate() == 18">
          {{ date.getDate() }}
        </span>
        <span
          *ngIf="date.getDate() != 14 && date.getDate() != 16 && date.getDate() != 18">
          {{ date.getDate() }}
        </span>
      </ng-template>
    </persian-date-picker>
    <br>
    Jalali:
    <persian-date-picker
      dir="rtl"
      [rtl]="true"
      [calendarType]="'jalali'"
      [(ngModel)]="selectedDate">
      <ng-template dtp-template="day" let-date>
        <span class="meeting"
              *ngIf="getJalaliDay(date) == 14 || getJalaliDay(date) == 16 || getJalaliDay(date) == 18">
          {{ getJalaliDay(date) }}
        </span>
        <span
          *ngIf="getJalaliDay(date) != 14 && getJalaliDay(date) != 16 && getJalaliDay(date) != 18">
          {{ getJalaliDay(date) }}
        </span>
      </ng-template>
    </persian-date-picker>
    <br>
    Month:
    <persian-date-picker
      [(ngModel)]="selectedDate"
      [mode]="'month'">
      <ng-template dtp-template="month" let-month>
        <div class="border-red">
          {{ getMonthName(month) }}
        </div>
      </ng-template>
    </persian-date-picker>
    <br>
    Year:
    <persian-date-picker
      [(ngModel)]="selectedDate"
      [mode]="'year'">
      <ng-template dtp-template="year" let-year>
        <div *ngIf="year % 2 == 0" class="border-red">
          {{ year }}
        </div>
        <div *ngIf="year % 2 != 0" class="meeting">
          {{ year }}
        </div>
      </ng-template>
    </persian-date-picker>
    <br>
    <button class="toggle-btn" (click)="toggleCode(code)">show code</button>
    <div id="code" class="code" #code>
      <code>
        {{ demoCode }}
      </code>
    </div>
  `,
  styles: [`
    .border-red {
      border-bottom: 1px dashed red;
    }

    .border-green:after {
      position: absolute;
      top: 4px;
      left: 38%;
      width: 12px;
      height: 1px;
      margin-left: -1.5px;
      content: "";
      background-color: green;
    }

    .meeting {
      position: relative;
      color: #00a1e8;
    }

    .meeting:after {
      position: absolute;
      bottom: -2px;
      left: 48%;
      width: 3px;
      height: 3px;
      margin-left: -1.5px;
      content: "";
      border-radius: 50%;
      background-color: #ff81a8;
    }
  `],
  imports: [PersianDateTimePickerModule, FormsModule, NgIf]
})
export class CustomRender {

  selectedDate?: Date | string;
  demoCode = `
        @Component({
        selector: 'custom-render',
        template: \`
            Gregorian:
        <persian-date-picker
            [(ngModel)]="selectedDate">
            <ng-template dtp-template="day" let-date>
                <span class="meeting"
                    *ngIf="date.getDate() == 14 || date.getDate() == 16 || date.getDate() == 18">
                    {{ date.getDate() }}
                </span>
                <span
                    *ngIf="date.getDate() != 14 && date.getDate() != 16 && date.getDate() != 18">
                    {{ date.getDate() }}
                </span>
            </ng-template>
        </persian-date-picker>
        <br>
        Jalali:
        <persian-date-picker
            dir="rtl"
            [rtl]="true"
            [calendarType]="'jalali'"
            [(ngModel)]="selectedDate">
            <ng-template dtp-template="day" let-date>
            <span class="meeting"
                    *ngIf="getJalaliDay(date) == 14 || getJalaliDay(date) == 16 || getJalaliDay(date) == 18">
                    {{ getJalaliDay(date) }}
                </span>
                <span
                    *ngIf="getJalaliDay(date) != 14 && getJalaliDay(date) != 16 && getJalaliDay(date) != 18">
                    {{ getJalaliDay(date) }}
                </span>
            </ng-template>
        </persian-date-picker>
        <br>
        Month:
        <persian-date-picker
            [(ngModel)]="selectedDate"
            [mode]="'month'">
            <ng-template dtp-template="month" let-month>
                <div class="border-red">
                    {{ getMonthName(month) }}
                </div>
            </ng-template>
        </persian-date-picker>
        <br>
        Year:
        <persian-date-picker
            [(ngModel)]="selectedDate"
            [mode]="'year'">
            <ng-template dtp-template="year" let-year>
                <div *ngIf="year % 2 == 0" class="border-red">
                    {{ year }}
                </div>
                <div *ngIf="year % 2 != 0" class="meeting">
                    {{ year }}
                </div>
            </ng-template>
        </persian-date-picker>
        \`,
        styles: [\`
        .border-red {
            border-bottom: 1px dashed red;
        }
        .border-green:after{
            position: absolute;
            top: 4px;
            left: 38%;
            width: 12px;
            height: 1px;
            margin-left: -1.5px;
            content: "";
            background-color: green;
        }
        .meeting {
            position: relative;
            color: #00a1e8;
        }
        .meeting:after {
            position: absolute;
            bottom: -2px;
            left: 48%;
            width: 3px;
            height: 3px;
            margin-left: -1.5px;
            content: "";
            border-radius: 50%;
            background-color: #ff81a8;
        }
    \`]
    })
    export class CustomRender {
        selectedDate: Date | string;

        constructor(
            private jalaliDateAdapter: JalaliDateAdapter,
            private gregorianDateAdapter: GregorianDateAdapter
        ) {}

        getJalaliDay(date: Date) {
            return this.jalaliDateAdapter.getDate(date)
        }

        getMonthName(monthNumber: number) {
            let months = this.gregorianDateAdapter.getMonthNames('short');
            let month = months[monthNumber-1]
            return month;
        }
    }
    `;

  constructor(private jalaliDateAdapter: JalaliDateAdapter, private gregorianDateAdapter: GregorianDateAdapter) {
  }

  getJalaliDay(date: Date) {
    return this.jalaliDateAdapter.getDate(date);
  }

  getMonthName(monthNumber: number) {
    let months = this.gregorianDateAdapter.getMonthNames('short');
    let month = months[monthNumber - 1];
    return month;
  }

  toggleCode(htmlDivElement: HTMLDivElement) {
    let display = htmlDivElement.style.display;
    if (display != 'block') {
      htmlDivElement.style.display = 'block';
    } else {
      htmlDivElement.style.display = 'none';
    }
  }
}
