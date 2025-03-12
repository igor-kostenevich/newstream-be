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

    console.log(email, subject, typeof html);

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
