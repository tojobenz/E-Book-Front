import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { GuestUserService } from '../services/guest-user.service';

export const CLIENT_ID_HEADER = 'X-Client-Id';

/** Attaches the localStorage guest id so favorites are scoped per browser. */
export const clientIdInterceptor: HttpInterceptorFn = (req, next) => {
  const clientId = inject(GuestUserService).getClientId();
  return next(req.clone({
    setHeaders: { [CLIENT_ID_HEADER]: clientId }
  }));
};
