/**
 * Mailer.js - Script principal para envio de lembretes de tarefas
 * Verifica tarefas com vencimento hoje e envia e-mails de lembrete
 */

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Importar serviços
const EmailService = require('./services/emailService');
const MockEmailService = require('./services/mockEmailService');

class TaskMailer {
    constructor() {
        // Configurar qual serviço usar baseado na variável de ambiente
        this.useMock = process.env.USE_MOCK === 'true' || process.argv.includes('--mock');
        this.emailService = this.useMock ? new MockEmailService() : new EmailService();
        
        this.tasksFilePath = path.join(__dirname, 'tasks.json');
        
        console.log('🚀 TaskMailer inicializado');
        console.log(`📧 Modo de e-mail: ${this.useMock ? 'MOCK (teste)' : 'REAL'}`);
    }

    /**
     * Carrega as tarefas do arquivo JSON
     * @returns {Promise<Array>}
     */
    async loadTasks() {
        try {
            console.log('📂 Carregando tarefas...');
            const data = await fs.readFile(this.tasksFilePath, 'utf8');
            const tasks = JSON.parse(data);
            
            console.log(`✅ ${tasks.length} tarefas carregadas com sucesso`);
            return tasks;
        } catch (error) {
            console.error('❌ Erro ao carregar tarefas:', error.message);
            throw error;
        }
    }

    /**
     * Obtém a data atual no formato YYYY-MM-DD
     * @returns {string}
     */
    getCurrentDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    /**
     * Filtra tarefas que vencem hoje
     * @param {Array} tasks - Lista de tarefas
     * @returns {Array}
     */
    getTasksDueToday(tasks) {
        const today = this.getCurrentDate();
        console.log(`📅 Verificando tarefas para a data: ${today}`);
        
        const tasksDueToday = tasks.filter(task => task.dueDate === today);
        
        console.log(`🎯 ${tasksDueToday.length} tarefas encontradas com vencimento hoje`);
        
        if (tasksDueToday.length > 0) {
            console.log('📋 Tarefas que vencem hoje:');
            tasksDueToday.forEach((task, index) => {
                console.log(`   ${index + 1}. "${task.title}" - ${task.email}`);
            });
        }
        
        return tasksDueToday;
    }

    /**
     * Gera o assunto do e-mail
     * @param {Object} task - Dados da tarefa
     * @returns {string}
     */
    generateEmailSubject(task) {
        const priorityEmoji = {
            'alta': '🔴',
            'media': '🟡',
            'baixa': '🟢'
        };
        
        const emoji = priorityEmoji[task.priority] || '📌';
        return `${emoji} Lembrete: "${task.title}" vence hoje!`;
    }

    /**
     * Gera o corpo do e-mail
     * @param {Object} task - Dados da tarefa
     * @returns {string}
     */
    generateEmailBody(task) {
        const priorityText = {
            'alta': 'ALTA PRIORIDADE',
            'media': 'Média prioridade',
            'baixa': 'Baixa prioridade'
        };
        
        let body = `Olá!\n\n`;
        body += `Esta é uma lembrança de que sua tarefa "${task.title}" deve ser entregue hoje (${task.dueDate}).\n\n`;
        
        if (task.description) {
            body += `Descrição: ${task.description}\n\n`;
        }
        
        body += `Prioridade: ${priorityText[task.priority] || 'Não definida'}\n\n`;
        body += `💡 Dica: Use a técnica Pomodoro no UniTasks para manter o foco!\n\n`;
        body += `Acesse o UniTasks para gerenciar suas tarefas e manter-se organizado.\n\n`;
        body += `Bons estudos! 🎓\n`;
        body += `Equipe UniTasks`;
        
        return body;
    }

    /**
     * Envia e-mails de lembrete para as tarefas
     * @param {Array} tasks - Lista de tarefas
     * @returns {Promise<Array>}
     */
    async sendReminders(tasks) {
        if (tasks.length === 0) {
            console.log('✨ Nenhuma tarefa para enviar lembretes hoje!');
            return [];
        }

        console.log(`📧 Iniciando envio de ${tasks.length} lembretes...`);
        
        // Verificar conexão antes de enviar (apenas para serviço real)
        if (!this.useMock) {
            const isConnected = await this.emailService.verifyConnection();
            if (!isConnected) {
                throw new Error('Falha na verificação da conexão de e-mail');
            }
        }

        const emailList = tasks.map(task => ({
            email: task.email,
            subject: this.generateEmailSubject(task),
            text: this.generateEmailBody(task),
            taskId: task.id,
            taskTitle: task.title
        }));

        // Enviar e-mails
        const results = await this.emailService.sendBulkReminders(emailList);
        
        // Processar resultados
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log('\n📊 RELATÓRIO FINAL:');
        console.log(`✅ E-mails enviados com sucesso: ${successful.length}`);
        console.log(`❌ E-mails com falha: ${failed.length}`);
        
        if (successful.length > 0) {
            console.log('\n✅ Sucessos:');
            successful.forEach(result => {
                console.log(`   📧 ${result.email} - ID: ${result.messageId}`);
            });
        }
        
        if (failed.length > 0) {
            console.log('\n❌ Falhas:');
            failed.forEach(result => {
                console.log(`   📧 ${result.email} - Erro: ${result.error}`);
            });
        }
        
        return results;
    }

    /**
     * Executa o processo completo de verificação e envio
     */
    async run() {
        try {
            console.log('🎯 Iniciando verificação de tarefas...\n');
            
            // Carregar tarefas
            const allTasks = await this.loadTasks();
            
            // Filtrar tarefas que vencem hoje
            const tasksDueToday = this.getTasksDueToday(allTasks);
            
            // Enviar lembretes
            const results = await this.sendReminders(tasksDueToday);
            
            // Estatísticas finais
            if (this.useMock && this.emailService.getStats) {
                console.log('\n📈 Estatísticas do Mock:');
                this.emailService.getStats();
            }
            
            console.log('\n🎉 Processo concluído com sucesso!');
            return results;
            
        } catch (error) {
            console.error('\n❌ Erro durante a execução:', error.message);
            process.exit(1);
        }
    }

    /**
     * Executa em modo de teste com data específica
     * @param {string} testDate - Data para testar (YYYY-MM-DD)
     */
    async runTest(testDate) {
        console.log(`🧪 Executando em modo de teste para a data: ${testDate}`);
        
        // Sobrescrever o método getCurrentDate temporariamente
        const originalGetCurrentDate = this.getCurrentDate;
        this.getCurrentDate = () => testDate;
        
        try {
            await this.run();
        } finally {
            // Restaurar método original
            this.getCurrentDate = originalGetCurrentDate;
        }
    }
}

// Função principal
async function main() {
    const mailer = new TaskMailer();
    
    // Verificar argumentos da linha de comando
    const args = process.argv.slice(2);
    const testDateArg = args.find(arg => arg.startsWith('--test-date='));
    
    if (testDateArg) {
        const testDate = testDateArg.split('=')[1];
        await mailer.runTest(testDate);
    } else {
        await mailer.run();
    }
}

// Executar apenas se este arquivo foi chamado diretamente
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
}

module.exports = TaskMailer;
