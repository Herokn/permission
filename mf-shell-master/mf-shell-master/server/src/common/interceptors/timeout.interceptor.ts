import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const ms = Number(process.env.REQ_TIMEOUT_MS || 10000)
    return next.handle().pipe(
      timeout(ms),
      catchError((err) => {
        if (err instanceof TimeoutError) return Promise.resolve({ code: 1, msg: 'Request timeout' })
        throw err
      })
    )
  }
}
