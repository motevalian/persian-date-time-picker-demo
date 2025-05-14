import {Injectable, OnDestroy} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";
import {lang_En, lang_Fa, Lang_Locale} from "./utils/models";

export interface ValidTimeResult {
  isValid: boolean;
  normalizedTime: string;
}

@Injectable()
export class PersianDateTimePickerService {
  activeInput$: BehaviorSubject<string> = new BehaviorSubject('');
  locale?: Lang_Locale;

  /**
   *
   */
  constructor(public locale_fa: lang_Fa, public locale_en: lang_En) {
  }

  getActiveInputValue() {
    return this.activeInput$.getValue();
  }
}

@Injectable()
export class DestroyService extends Subject<void> implements OnDestroy {
  ngOnDestroy(): void {
    this.next();
    this.complete();
  }
}
