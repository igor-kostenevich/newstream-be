import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config'

export function getMailerConfig(ConfigService: ConfigService): MailerOptions {
  return {
    transport: {
      host: ConfigService.getOrThrow<string>('MAIL_HOST'),
      port: ConfigService.getOrThrow<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: ConfigService.getOrThrow<string>('MAIL_LOGIN'),
        pass: ConfigService.getOrThrow<string>('MAIL_PASSWORD')
      }
    },
    defaults: {
      from: `"NewStream" <${ConfigService.getOrThrow<string>('MAIL_LOGIN')}>`
    }
  }
}