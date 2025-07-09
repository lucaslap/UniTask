/**
 * MockEmailService - Serviço simulado para testes
 * Simula o envio de e-mails sem realmente enviar
 */

class MockEmailService {
    constructor() {
        this.sentEmails = [];
        this.shouldFail = false;
        this.failureRate = 0; // 0 = nunca falha, 1 = sempre falha
        
        console.log('🧪 Mock Email Service inicializado');
        console.log('📧 Nenhum e-mail real será enviado (modo de teste)');
    }

    /**
     * Simula a verificação de conexão
     * @returns {Promise<boolean>}
     */
    async verifyConnection() {
        console.log('🔍 Verificando conexão (mock)...');
        
        // Simula um pequeno delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Conexão verificada com sucesso (mock)');
        return true;
    }

    /**
     * Simula o envio de e-mail de lembrete
     * @param {string} email - E-mail do destinatário
     * @param {string} subject - Assunto do e-mail
     * @param {string} text - Corpo do e-mail
     * @returns {Promise<Object>}
     */
    async sendReminderEmail(email, subject, text) {
        try {
            // Validar parâmetros
            if (!email || !subject || !text) {
                throw new Error('Parâmetros obrigatórios: email, subject, text');
            }

            // Simular delay de envio
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

            // Simular falha ocasional se configurado
            if (this.shouldFail || Math.random() < this.failureRate) {
                throw new Error('Falha simulada no envio de e-mail');
            }

            // Gerar ID simulado
            const messageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Armazenar e-mail "enviado"
            const emailData = {
                messageId,
                email,
                subject,
                text,
                timestamp: new Date().toISOString(),
                status: 'sent'
            };
            
            this.sentEmails.push(emailData);

            // Log detalhado
            console.log(`📧 [MOCK] E-mail simulado enviado:`);
            console.log(`   Para: ${email}`);
            console.log(`   Assunto: ${subject}`);
            console.log(`   Mensagem: ${text}`);
            console.log(`   ID: ${messageId}`);
            console.log(`   ✅ Status: Enviado com sucesso (simulado)`);

            return {
                success: true,
                messageId: messageId,
                email: email,
                timestamp: new Date().toISOString(),
                mock: true
            };

        } catch (error) {
            console.error(`❌ [MOCK] Erro simulado ao enviar e-mail para ${email}:`, error.message);
            
            return {
                success: false,
                error: error.message,
                email: email,
                timestamp: new Date().toISOString(),
                mock: true
            };
        }
    }

    /**
     * Simula o envio de múltiplos e-mails
     * @param {Array} emailList - Lista de objetos {email, subject, text}
     * @returns {Promise<Array>}
     */
    async sendBulkReminders(emailList) {
        console.log(`📨 [MOCK] Iniciando envio em lote simulado de ${emailList.length} e-mails...`);
        
        const results = [];
        
        for (const emailData of emailList) {
            const result = await this.sendReminderEmail(
                emailData.email,
                emailData.subject,
                emailData.text
            );
            results.push(result);
            
            // Pequeno delay entre "envios"
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`📊 [MOCK] Resultado do envio em lote simulado:`);
        console.log(`✅ Sucessos: ${successful}`);
        console.log(`❌ Falhas: ${failed}`);
        
        return results;
    }

    /**
     * Configura o serviço para simular falhas
     * @param {boolean} shouldFail - Se deve sempre falhar
     * @param {number} failureRate - Taxa de falha (0-1)
     */
    setFailureMode(shouldFail = false, failureRate = 0) {
        this.shouldFail = shouldFail;
        this.failureRate = failureRate;
        
        console.log(`🔧 [MOCK] Modo de falha configurado:`);
        console.log(`   Sempre falhar: ${shouldFail}`);
        console.log(`   Taxa de falha: ${failureRate * 100}%`);
    }

    /**
     * Retorna todos os e-mails "enviados"
     * @returns {Array}
     */
    getSentEmails() {
        return [...this.sentEmails];
    }

    /**
     * Limpa o histórico de e-mails enviados
     */
    clearHistory() {
        this.sentEmails = [];
        console.log('🗑️ [MOCK] Histórico de e-mails limpo');
    }

    /**
     * Exibe estatísticas do serviço mock
     */
    getStats() {
        const stats = {
            totalSent: this.sentEmails.length,
            uniqueRecipients: [...new Set(this.sentEmails.map(e => e.email))].length,
            lastSent: this.sentEmails.length > 0 ? this.sentEmails[this.sentEmails.length - 1].timestamp : null
        };
        
        console.log(`📊 [MOCK] Estatísticas:`);
        console.log(`   Total enviados: ${stats.totalSent}`);
        console.log(`   Destinatários únicos: ${stats.uniqueRecipients}`);
        console.log(`   Último envio: ${stats.lastSent || 'Nenhum'}`);
        
        return stats;
    }
}

module.exports = MockEmailService;
