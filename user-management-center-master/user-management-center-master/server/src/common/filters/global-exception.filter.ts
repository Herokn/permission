import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<any>()
    let msg = 'error'
    if (exception instanceof HttpException) {
      msg = String((exception as any).message || 'error')
    } else if (exception && typeof exception === 'object') {
      msg = String((exception as any).message || exception)
    } else {
      msg = String(exception)
    }
    res.status(200).send({ code: 1, msg })
  }
}
