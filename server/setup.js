#!/usr/bin/env node

/**
 * Setup.js - Script de configuração automática do backend
 * Instala dependências e configura o ambiente
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

class BackendSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Pergunta ao usuário
     * @param {string} question 
     * @returns {Promise<string>}
     */
    async ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Executa comando shell
     * @param {string} command 
     * @returns {Promise<void>}
     */
    async runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        });
    }

    /**
     * Verifica se o arquivo existe
     * @param {string} filePath 
     * @returns {Promise<boolean>}
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Instala dependências do Node.js
     */
    async installDependencies() {
        console.log('📦 Instalando dependências...');
        
        try {
            const output = await this.runCommand('npm install');
            console.log('✅ Dependências instaladas com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao instalar dependências:', error.message);
            throw error;
        }
    }

    /**
     * Configura o arquivo .env
     */
    async setupEnvironment() {
        console.log('\n🔧 Configurando ambiente...');
        
        const envPath = path.join(__dirname, '.env');
        const envExists = await this.fileExists(envPath);
        
        if (envExists) {
            const overwrite = await this.ask('📄 Arquivo .env já existe. Deseja reconfigurar? (s/n): ');
            if (overwrite.toLowerCase() !== 's') {
                console.log('⏭️ Mantendo configuração existente');
                return;
            }
        }
        
        console.log('\n📧 Configuração do E-mail (Gmail):');
        console.log('💡 Você precisa de uma "Senha de App" do Gmail');
        console.log('   1. Habilite verificação em duas etapas');
        console.log('   2. Gere uma senha de app em: Configurações > Segurança > Senhas de app');
        console.log('   3. Use a senha gerada (não sua senha normal)\n');
        
        const emailUser = await this.ask('📧 Seu e-mail do Gmail: ');
        const emailPass = await this.ask('🔑 Senha de app do Gmail: ');
        const useMock = await this.ask('🧪 Usar modo de teste por padrão? (s/n): ');
        
        const envContent = `# Configurações de E-mail
# Para usar o Gmail, você precisa:
# 1. Habilitar a verificação em duas etapas
# 2. Gerar uma "Senha de app" nas configurações do Google
# 3. Usar a senha de app aqui (não sua senha normal)

EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}

# Configurações do Sistema
NODE_ENV=development
USE_MOCK=${useMock.toLowerCase() === 's' ? 'true' : 'false'}

# Configurações de Agendamento (opcional)
SCHEDULE_HOUR=9
SCHEDULE_MINUTE=0`;
        
        await fs.writeFile(envPath, envContent, 'utf8');
        console.log('✅ Arquivo .env configurado com sucesso!');
    }

    /**
     * Configura o arquivo tasks.json
     */
    async setupTasks() {
        console.log('\n📋 Configurando tarefas de exemplo...');
        
        const tasksPath = path.join(__dirname, 'tasks.json');
        const tasksExists = await this.fileExists(tasksPath);
        
        if (tasksExists) {
            const overwrite = await this.ask('📄 Arquivo tasks.json já existe. Deseja recriar? (s/n): ');
            if (overwrite.toLowerCase() !== 's') {
                console.log('⏭️ Mantendo tarefas existentes');
                return;
            }
        }
        
        const userEmail = await this.ask('📧 Seu e-mail para testes: ');
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const sampleTasks = [
            {
                id: "1",
                title: "Trabalho de TCC",
                description: "Finalizar o desenvolvimento do projeto de conclusão de curso",
                dueDate: today,
                email: userEmail,
                priority: "alta"
            },
            {
                id: "2",
                title: "Prova de Matemática",
                description: "Estudar para a prova de cálculo diferencial",
                dueDate: tomorrow,
                email: userEmail,
                priority: "media"
            },
            {
                id: "3",
                title: "Entrega do Relatório",
                description: "Relatório final do estágio supervisionado",
                dueDate: today,
                email: userEmail,
                priority: "alta"
            }
        ];
        
        await fs.writeFile(tasksPath, JSON.stringify(sampleTasks, null, 2), 'utf8');
        console.log('✅ Tarefas de exemplo configuradas!');
    }

    /**
     * Testa a configuração
     */
    async testConfiguration() {
        console.log('\n🧪 Testando configuração...');
        
        try {
            const output = await this.runCommand('npm run test');
            console.log('✅ Teste executado com sucesso!');
        } catch (error) {
            console.error('❌ Erro no teste:', error.message);
            console.log('💡 Você pode testar manualmente com: npm run test');
        }
    }

    /**
     * Executa o setup completo
     */
    async run() {
        console.log('🚀 Iniciando configuração do backend UniTasks...\n');
        
        try {
            await this.installDependencies();
            await this.setupEnvironment();
            await this.setupTasks();
            
            const runTest = await this.ask('\n🧪 Deseja executar um teste? (s/n): ');
            if (runTest.toLowerCase() === 's') {
                await this.testConfiguration();
            }
            
            console.log('\n🎉 Configuração concluída com sucesso!');
            console.log('\n📝 Próximos passos:');
            console.log('   1. Execute: npm run test (para testar)');
            console.log('   2. Execute: npm run real (para envios reais)');
            console.log('   3. Execute: npm run schedule (para agendar)');
            console.log('\n📚 Consulte o README.md para mais informações');
            
        } catch (error) {
            console.error('\n❌ Erro durante a configuração:', error.message);
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const setup = new BackendSetup();
    setup.run();
}

module.exports = BackendSetup;
