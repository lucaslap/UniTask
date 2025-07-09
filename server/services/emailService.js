/**
 * EmailService - Serviço real para envio de e-mails
 * Utiliza nodemailer com Gmail para enviar lembretes de tarefas
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Inicializa o transportador do nodemailer
     */
    initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            console.log('✅ Transportador de e-mail inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar transportador de e-mail:', error.message);
            throw error;
        }
    }

    /**
     * Verifica se o transportador está configurado corretamente
     * @returns {Promise<boolean>}
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Conexão com servidor de e-mail verificada');
            return true;
        } catch (error) {
            console.error('❌ Erro na verificação da conexão:', error.message);
            return false;
        }
    }

    /**
     * Envia um e-mail de lembrete para o usuário
     * @param {string} email - E-mail do destinatário
     * @param {string} subject - Assunto do e-mail
     * @param {string} text - Corpo do e-mail (texto)
     * @param {string} html - Corpo do e-mail (HTML opcional)
     * @returns {Promise<Object>}
     */
    async sendReminderEmail(email, subject, text, html = null) {
        try {
            // Validar parâmetros
            if (!email || !subject || !text) {
                throw new Error('Parâmetros obrigatórios: email, subject, text');
            }

            // Configurar opções do e-mail
            const mailOptions = {
                from: {
                    name: 'UniTasks - Organizador Acadêmico',
                    address: process.env.EMAIL_USER
                },
                to: email,
                subject: subject,
                text: text,
                html: html || this.generateHTML(subject, text)
            };

            // Enviar e-mail
            console.log(`📧 Enviando e-mail para: ${email}`);
            const result = await this.transporter.sendMail(mailOptions);

            console.log(`✅ E-mail enviado com sucesso para ${email}`);
            console.log(`📬 Message ID: ${result.messageId}`);

            return {
                success: true,
                messageId: result.messageId,
                email: email,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Erro ao enviar e-mail para ${email}:`, error.message);
            
            return {
                success: false,
                error: error.message,
                email: email,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Gera HTML formatado para o e-mail
     * @param {string} subject - Assunto do e-mail
     * @param {string} text - Texto do e-mail
     * @returns {string}
     */
    generateHTML(subject, text) {
        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px; }
                    .task-reminder { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #ff6b6b; margin: 20px 0; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                    .btn { display: inline-block; padding: 12px 24px; background: #4caf50; color: white; text-decoration: none; border-radius: 8px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📚 UniTasks</h1>
                        <p>Lembrete de Tarefa Acadêmica</p>
                    </div>
                    <div class="content">
                        <div class="task-reminder">
                            <h2 style="color: #333; margin-top: 0;">📌 ${subject}</h2>
                            <p style="color: #555; line-height: 1.6; margin-bottom: 0;">${text}</p>
                        </div>
                        <p style="color: #777;">Acesse o UniTasks para gerenciar suas tarefas e manter-se organizado!</p>
                    </div>
                    <div class="footer">
                        <p>Este é um lembrete automático do sistema UniTasks.</p>
                        <p>Mantenha-se produtivo! 🎯</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Envia múltiplos e-mails de lembrete
     * @param {Array} emailList - Lista de objetos {email, subject, text}
     * @returns {Promise<Array>}
     */
    async sendBulkReminders(emailList) {
        console.log(`📨 Iniciando envio em lote de ${emailList.length} e-mails...`);
        
        const results = [];
        
        for (const emailData of emailList) {
            const result = await this.sendReminderEmail(
                emailData.email,
                emailData.subject,
                emailData.text
            );
            results.push(result);
            
            // Pequeno delay entre envios para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`📊 Resultado do envio em lote:`);
        console.log(`✅ Sucessos: ${successful}`);
        console.log(`❌ Falhas: ${failed}`);
        
        return results;
    }
}

module.exports = EmailService;
