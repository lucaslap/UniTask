/**
 * Scheduler.js - Script para agendar execuções automáticas do mailer
 * Execute este script para agendar verificações diárias de tarefas
 */

const cron = require('node-cron');
const TaskMailer = require('./mailer');

class TaskScheduler {
    constructor() {
        this.mailer = new TaskMailer();
        this.isRunning = false;
        
        console.log('⏰ Task Scheduler inicializado');
    }

    /**
     * Agenda execução diária às 9:00 AM
     */
    scheduleDaily() {
        // Executa todo dia às 9:00 AM
        const schedule = '0 9 * * *';
        
        console.log('📅 Agendando verificação diária às 9:00 AM...');
        
        cron.schedule(schedule, async () => {
            if (this.isRunning) {
                console.log('⚠️ Execução anterior ainda em andamento, pulando...');
                return;
            }
            
            this.isRunning = true;
            
            try {
                console.log('\n🔔 Execução agendada iniciada:', new Date().toLocaleString('pt-BR'));
                await this.mailer.run();
                console.log('✅ Execução agendada concluída com sucesso\n');
            } catch (error) {
                console.error('❌ Erro na execução agendada:', error.message);
            } finally {
                this.isRunning = false;
            }
        });
        
        console.log('✅ Agendamento configurado com sucesso!');
        console.log('📝 Para parar o agendamento, pressione Ctrl+C');
    }

    /**
     * Agenda execução personalizada
     * @param {string} cronExpression - Expressão cron
     */
    scheduleCustom(cronExpression) {
        console.log(`📅 Agendando execução personalizada: ${cronExpression}`);
        
        cron.schedule(cronExpression, async () => {
            if (this.isRunning) {
                console.log('⚠️ Execução anterior ainda em andamento, pulando...');
                return;
            }
            
            this.isRunning = true;
            
            try {
                console.log('\n🔔 Execução personalizada iniciada:', new Date().toLocaleString('pt-BR'));
                await this.mailer.run();
                console.log('✅ Execução personalizada concluída\n');
            } catch (error) {
                console.error('❌ Erro na execução personalizada:', error.message);
            } finally {
                this.isRunning = false;
            }
        });
        
        console.log('✅ Agendamento personalizado configurado!');
    }

    /**
     * Executa teste imediato
     */
    async runTest() {
        console.log('🧪 Executando teste imediato...');
        
        if (this.isRunning) {
            console.log('⚠️ Outra execução em andamento');
            return;
        }
        
        this.isRunning = true;
        
        try {
            await this.mailer.run();
        } finally {
            this.isRunning = false;
        }
    }
}

// Função principal
function main() {
    const scheduler = new TaskScheduler();
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        // Execução de teste
        scheduler.runTest();
    } else if (args.includes('--custom')) {
        // Agendamento personalizado
        const cronArg = args.find(arg => arg.startsWith('--cron='));
        if (cronArg) {
            const cronExpression = cronArg.split('=')[1];
            scheduler.scheduleCustom(cronExpression);
        } else {
            console.error('❌ Especifique a expressão cron com --cron="0 9 * * *"');
            process.exit(1);
        }
    } else {
        // Agendamento padrão (9:00 AM diário)
        scheduler.scheduleDaily();
    }
    
    // Manter o processo ativo
    if (!args.includes('--test')) {
        process.on('SIGINT', () => {
            console.log('\n👋 Encerrando agendador...');
            process.exit(0);
        });
    }
}

if (require.main === module) {
    main();
}

module.exports = TaskScheduler;
