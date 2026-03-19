import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { AppModule } from './app.module.js'
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js'
import { loadEnvFromMeta } from './configs/env.js'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js'
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor.js'
import { TraceInterceptor } from './common/interceptors/trace.interceptor.js'
import { ValidationPipe } from '@nestjs/common'
import path from 'path'
import { fileURLToPath } from 'url'

async function bootstrap() {
  loadEnvFromMeta(import.meta.url, '..')
  const app = await NestFactory.create(AppModule, new (FastifyAdapter as any)())
  const instance: any = app.getHttpAdapter().getInstance()
  const enableCors = process.env.ENABLE_CORS === '1'
  if (enableCors) {
    const fastifyCors = (await import('@fastify/cors')).default as any
    await instance.register(fastifyCors, { origin: true, credentials: true })
  }
  const useProxy = process.env.USE_PROXY === '1'
  const fePort = useProxy && process.env.FE_DEV_PORT ? Number(process.env.FE_DEV_PORT) : 0
  const fePrefix = process.env.FE_BASE_PREFIX || '/app'
  const feRewrite = process.env.FE_REWRITE_PREFIX || fePrefix
  const disableFeStatic = process.env.DISABLE_FE_STATIC === '1'
  if (useProxy && fePort) {
    const httpProxy = (await import('@fastify/http-proxy')).default as any
    await instance.register(httpProxy, {
      upstream: `http://localhost:${fePort}`,
      prefix: fePrefix,
      rewritePrefix: feRewrite,
      websocket: true,
    })
  } else if (!disableFeStatic) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const root = path.join(__dirname, '../../fe/dist')
    const fastifyStatic = (await import('@fastify/static')).default as any
    await instance.register(fastifyStatic, { root, prefix: fePrefix.endsWith('/') ? fePrefix : `${fePrefix}/` })
    instance.get(`${fePrefix}/*`, (_req: any, reply: any) => reply.sendFile('index.html'))
  }
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalInterceptors(new TraceInterceptor())
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalInterceptors(new TimeoutInterceptor())
  app.useGlobalFilters(new GlobalExceptionFilter())
  const port = Number(process.env.PORT || 4120)
  await app.listen(port, '0.0.0.0')
  const base = `http://localhost:${port}`
  if (useProxy && fePort) {
    const from = `${base}${fePrefix.endsWith('/') ? fePrefix : fePrefix + '/'}`
    const to = `http://localhost:${fePort}${feRewrite.endsWith('/') ? feRewrite : feRewrite + '/'}`
    console.log(`[FE] ${from} -> ${to}`)
  } else if (!disableFeStatic) {
    const from = `${base}${fePrefix.endsWith('/') ? fePrefix : fePrefix + '/'}`
    console.log(`[FE] ${from}`)
  }
  console.log(`[API] ${base}/api (health: ${base}/api/health)`)
}

bootstrap()
