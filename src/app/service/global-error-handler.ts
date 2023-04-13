import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggingService } from './logging.service';
import { ErrorService } from './error.service';
import { NotificationService } from './notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private injector: Injector) { }
  
  handleError(error: Error | HttpErrorResponse) {
    const errorService = this.injector.get(ErrorService);
    const logger = this.injector.get(LoggingService);
    const notifier = this.injector.get(NotificationService);

    let message;

    if (error instanceof HttpErrorResponse) {
      // Server error
      message = errorService.getServerErrorMessage(error);
      notifier.showError(message);
    } else {
      // Client Error
      message = errorService.getClientErrorMessage(error);
      notifier.showError(message);
    }
    // Always log errors
    logger.logError(message);
    console.error(error);
  }
}
