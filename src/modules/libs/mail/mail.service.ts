import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService, private readonly configService: ConfigService) {}

  public async sendVerificationToken(email: string, token: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const url = `${domain}/verify-email?token=${token}`
    const subject = 'Verify your account'
    
    const templatePath = path.join(process.cwd(), 'src/modules/libs/mail/templates/verification_email.html')
    let html = fs.readFileSync(templatePath, 'utf8')
    html = html.replace('{{ verification_link }}', url)

    return this.sendEmail(email, subject, html)
  }

  public async sendPasswordResetToken(email: string, token: string, metadata: SessionMetadata) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const resetLink = `${domain}/account/recovery?token=${token}`
    const subject = 'Reset your password'
    
    const templatePath = path.join(process.cwd(), 'src/modules/libs/mail/templates/password_recovery.html')
    let html = fs.readFileSync(templatePath, 'utf8')
    const replacements: Record<string, string> = {
      '{reset_link}': resetLink,
      '{metadata.location.country}': metadata.location.country || 'Unknown',
      '{metadata.location.city}': metadata.location.city || 'Unknown',
      '{metadata.device.os}': metadata.device.os || 'Unknown',
      '{metadata.device.browser}': metadata.device.browser || 'Unknown',
      '{metadata.ip}': metadata.ip || 'Unknown'
    }

    html = Object.keys(replacements).reduce((acc, key) => {
      return acc.replace(new RegExp(key, 'g'), replacements[key])
    }, html)
  
    return this.sendEmail(email, subject, html)
  }

  private sendEmail(to: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to,
      subject,
      html,
    })
  }
}
