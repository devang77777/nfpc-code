import { Subscription } from 'rxjs';

export class Utils {

  public static unsubscribeAll(subscriptions: Subscription[] = []): void {
    subscriptions.forEach((subscription: Subscription) => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    });
  }

  public static setFocusOn(id: string): void {
    const element = window.document.getElementById(id);
    element.focus();
    element.blur();
  }

  public static camelToSentenceCase = (text) => {
    const result = text.replace(/([A-Z])/g, ' $1');
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  };
}
