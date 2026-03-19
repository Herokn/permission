import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp()
    const req = http.getRequest<any>()
    const res = http.getResponse<any>()
    const id = (req.headers && (req.headers['x-trace-id'] as string)) || Math.random().toString(36).slice(2)
    try { res.header('x-trace-id', id) } catch {}
    return next.handle()
  }
}
