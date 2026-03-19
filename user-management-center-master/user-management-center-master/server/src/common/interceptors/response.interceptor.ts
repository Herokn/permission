import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((body) => {
        if (body && typeof body === 'object' && 'code' in body) return body
        return { code: 0, data: body }
      })
    )
  }
}
