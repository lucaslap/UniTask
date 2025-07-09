# 📧 UniTasks - Backend de Lembretes por E-mail

Sistema Node.js para envio automático de lembretes de tarefas acadêmicas.

## 🚀 Início Rápido

### 1. Instalação
```bash
cd server
npm install
```

### 2. Configuração
Edite o arquivo `.env` com suas credenciais do Gmail:
```env
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=sua_app_password_aqui
USE_MOCK=true
```

### 3. Teste
```bash
npm run test
```

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run test` | Executa em modo teste (mock) |
| `npm run test-today` | Testa com tarefas de hoje |
| `npm run real` | Executa com envios reais |
| `npm run dev` | Modo desenvolvimento |
| `npm run schedule` | Agenda execução diária |
| `npm run schedule-test` | Teste do agendador |

## 🏗️ Arquitetura

### Services
- **`emailService.js`**: Serviço real com Nodemailer
- **`mockEmailService.js`**: Serviço de teste/simulação

### Scripts
- **`mailer.js`**: Script principal de envio
- **`scheduler.js`**: Agendador de tarefas
- **`tasks.json`**: Base de dados de tarefas

## 🔧 Configuração do Gmail

1. **Habilite a verificação em duas etapas** na sua conta Google
2. **Gere uma senha de app**:
   - Vá para: Configurações > Segurança > Verificação em duas etapas
   - Clique em "Senhas de app"
   - Selecione "E-mail" e "Outro" como dispositivo
   - Use a senha gerada no arquivo `.env`

## 📊 Estrutura do E-mail

### Assunto
```
🔴 Lembrete: "Nome da Tarefa" vence hoje!
```

### Corpo (HTML)
- Cabeçalho com logo do UniTasks
- Detalhes da tarefa (título, descrição, prioridade)
- Dicas de produtividade
- Design responsivo

## 🧪 Testes

### Modo Mock
```bash
npm run test
```
- Simula envios sem e-mails reais
- Logs detalhados no console
- Ideal para desenvolvimento

### Teste com Data Específica
```bash
node mailer.js --mock --test-date=2025-07-08
```

### Configurar Falhas para Teste
```javascript
// No mockEmailService.js
service.setFailureMode(false, 0.2); // 20% de falhas
```

## ⏰ Agendamento Automático

### Execução Diária (9:00 AM)
```bash
npm run schedule
```

### Agendamento Personalizado
```bash
node scheduler.js --custom --cron="0 9 * * *"
```

### Expressões Cron Úteis
- `0 9 * * *` - Todo dia às 9:00
- `0 9 * * 1-5` - Dias úteis às 9:00
- `0 */2 * * *` - A cada 2 horas
- `0 9,15 * * *` - 9:00 e 15:00

## 📁 Estrutura de Arquivos

```
server/
├── mailer.js              # Script principal
├── scheduler.js           # Agendador
├── tasks.json            # Base de dados
├── package.json          # Dependências
├── .env                  # Configurações
└── services/
    ├── emailService.js    # Serviço real
    └── mockEmailService.js # Serviço mock
```

## 🐛 Resolução de Problemas

### Erro de Autenticação Gmail
- Verifique se a verificação em duas etapas está habilitada
- Use senha de app, não sua senha normal
- Verifique se EMAIL_USER e EMAIL_PASS estão corretos

### Tarefas Não Encontradas
- Verifique se `tasks.json` existe
- Confirme o formato da data (YYYY-MM-DD)
- Verifique se há tarefas para hoje

### Problemas de Conexão
- Teste a conexão com: `await emailService.verifyConnection()`
- Verifique sua conexão com a internet
- Confirme as configurações do Gmail

## 📝 Logs

O sistema fornece logs detalhados:
```
🚀 TaskMailer inicializado
📧 Modo de e-mail: MOCK (teste)
📂 Carregando tarefas...
✅ 5 tarefas carregadas com sucesso
📅 Verificando tarefas para a data: 2025-07-08
🎯 3 tarefas encontradas com vencimento hoje
📧 Iniciando envio de 3 lembretes...
✅ E-mail enviado com sucesso para estudante@exemplo.com
📊 RELATÓRIO FINAL:
✅ E-mails enviados com sucesso: 3
❌ E-mails com falha: 0
```

## 🔒 Segurança

- ✅ Arquivo `.env` não versionado
- ✅ Validação de parâmetros
- ✅ Tratamento de erros
- ✅ Timeout de conexão
- ✅ Rate limiting entre envios

## 🚀 Próximos Passos

1. **Integração com Frontend**: Sincronizar com localStorage
2. **Base de Dados**: Migrar para MongoDB/PostgreSQL
3. **API REST**: Criar endpoints para gerenciar tarefas
4. **Autenticação**: Sistema de usuários
5. **Dashboard**: Interface para configurar lembretes

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs de erro
2. Consulte esta documentação
3. Teste em modo mock primeiro
4. Verifique as configurações do Gmail
