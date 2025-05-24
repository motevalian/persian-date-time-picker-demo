import {Injectable, OnDestroy} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";
import {EnglishLocale, LanguageLocale, PersianLocale} from "./utils/models";

export interface ValidTimeResult {
  isValid: boolean;
  normalizedTime: string;
}

@Injectable()
export class PersianDateTimePickerService {

  activeInput: BehaviorSubject<string> = new BehaviorSubject('');
  languageLocale?: LanguageLocale;

  constructor(public persianLocale: PersianLocale, public englishLocale: EnglishLocale) {
  }

  getActiveInputValue() {
    return this.activeInput.getValue();
  }
}

@Injectable()
export class DestroyService extends Subject<void> implements OnDestroy {

  ngOnDestroy(): void {
    this.next();
    this.complete();
  }
}
