import * as nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuração SMTP personalizada - configurar via variáveis de ambiente
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outros portos
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: `"ProfitHub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Código de Recuperação de Senha - ProfitHub',
      html: this.getPasswordResetEmailTemplate(code),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de recuperação enviado para: ${email}`);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email de recuperação');
    }
  }

  private getPasswordResetEmailTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha - ProfitHub</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 20px;
          }
          .code {
            font-size: 36px;
            font-weight: bold;
            color: #1f2937;
            background-color: #e5e7eb;
            padding: 20px;
            border-radius: 8px;
            letter-spacing: 4px;
            margin: 20px 0;
            border: 2px dashed #9ca3af;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🚀 ProfitHub</div>
          
          <h2>Recuperação de Senha</h2>
          
          <p>Você solicitou a recuperação de sua senha. Use o código abaixo para definir uma nova senha:</p>
          
          <div class="code">${code}</div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong><br>
            • Este código é válido por 15 minutos<br>
            • Use apenas uma vez<br>
            • Não compartilhe este código
          </div>
          
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
          
          <div class="footer">
            <p>Sistema de Gestão Multi-Marketplace</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erro na conexão SMTP:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();