import {Component} from "@angular/core";
import {PersianDateTimePickerModule} from 'persian-date-time-picker';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'disabled-times',
  template: `
    Disabled Times:
    <persian-time-picker
      [(ngModel)]="selectedDate"
      [disabledTimesFilter]="disabledTimesFilter"
      [displayFormat]="'HH:mm:ss'">
    </persian-time-picker>
    <br>

    <button class="toggle-btn" (click)="toggleCode(code)">show code</button>
    <div id="code" class="code" #code>
      <code>
        {{ demoCode }}
      </code>
    </div>
  `,
  imports: [PersianDateTimePickerModule, FormsModule]
})
export class DisabledTimes {

  selectedDate?: Date | string;
  demoCode = `
        @Component({
            selector: 'disabled-times',
            template: \`
                Disabled Times:
                <persian-time-picker
                    [(ngModel)]="selectedDate"
                    [disabledTimesFilter]="disabledTimesFilter"
                    [displayFormat]="'HH:mm:ss'">
                </persian-time-picker>
            \`,
        })
        export class DisabledTimes {
            selectedDate: Date | string;

            // Basic
            disabledTimesFilter = (date: Date) => {
                const hour = date.getHours();
                const minute = date.getMinutes();

                // Regular hours
                if (hour < 9 || hour >= 17) return true;

                // Break time
                if (hour === 12 && minute >= 30) return true;
                if (hour === 13 && minute < 30) return true;

                return false;
            };
        }
    `;

  // Basic
  disabledTimesFilter = (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Regular hours
    if (hour < 9 || hour >= 17) return true;

    // Break time
    if (hour === 12 && minute >= 30) return true;
    if (hour === 13 && minute < 30) return true;

    return false;
  };

  toggleCode(htmlDivElement: HTMLDivElement) {
    let display = htmlDivElement.style.display;
    if (display != 'block') {
      htmlDivElement.style.display = 'block';
    } else {
      htmlDivElement.style.display = 'none';
    }
  }
}
