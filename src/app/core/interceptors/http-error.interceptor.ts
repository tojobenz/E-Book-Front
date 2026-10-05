import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Invalid data provided';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in';
          break;
        case 404:
          errorMessage = 'Not Found: Resource not found';
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later';
          break;
        default:
          errorMessage = error.error?.message || 'An unexpected error occurred';
      }

      console.error(`HTTP Error: ${error.status} - ${errorMessage}`, error);
      return throwError(() => errorMessage);
    })
  );
};
