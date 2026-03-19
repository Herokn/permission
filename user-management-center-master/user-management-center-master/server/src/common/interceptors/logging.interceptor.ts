import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<any>()
    const { method, url } = req
    const start = Date.now()
    return next.handle().pipe(
      tap(() => {
        const cost = Date.now() - start
        console.log(`[HTTP] ${method} ${url} - ${cost}ms`)
      })
    )
  }
}
