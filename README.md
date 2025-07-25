﻿# UniTasks - Organizador de Tarefas Acadêmicas

## 📚 Descrição do Problema

Estudantes frequentemente enfrentam dificuldades para organizar e acompanhar suas tarefas acadêmicas, trabalhos, projetos e prazos de entrega. A falta de uma ferramenta simples e eficaz pode levar ao esquecimento de atividades importantes e ao acúmulo de responsabilidades.

## 💡 Solução Proposta

O UniTasks é uma aplicação web simples e intuitiva que permite aos estudantes:

- ✅ Cadastrar tarefas com título, descrição e data de entrega
- 📋 Visualizar todas as tarefas em uma lista organizada
- ✔️ Marcar tarefas como concluídas
- 🗑️ Excluir tarefas desnecessárias
- 📅 Visualizar tarefas em um calendário mensal
- 🚨 Identificar tarefas próximas do prazo (destacadas em vermelho)
- 💾 Persistir dados no navegador (localStorage)
- 📊 Acompanhar contagem de tarefas pendentes
- 📤 Exportar tarefas em formato JSON e Excel
- 🍅 Utilizar a Técnica Pomodoro para melhorar a produtividade
- 📧 Receber lembretes automáticos por e-mail (backend Node.js)

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilização e layout responsivo
- **JavaScript ES6+**: Lógica da aplicação e manipulação do DOM
- **LocalStorage**: Persistência de dados no navegador
- **Node.js**: Backend para envio de e-mails
- **Nodemailer**: Biblioteca para envio de e-mails

## 📁 Estrutura do Projeto

```
UniTask/
├── index.html          # Página principal
├── style.css           # Estilos da aplicação
├── script.js           # Lógica da aplicação
├── assets/             # Recursos adicionais
├── server/             # Backend Node.js
│   ├── mailer.js       # Script principal de envio
│   ├── tasks.json      # Base de dados de tarefas
│   ├── package.json    # Dependências do Node.js
│   ├── .env           # Variáveis de ambiente
│   └── services/       # Serviços de e-mail
│       ├── emailService.js     # Serviço real
│       └── mockEmailService.js # Serviço de teste
└── README.md           # Documentação
```

## 🚀 Instruções de Uso

1. **Abrir a aplicação**: Abra o arquivo `index.html` em qualquer navegador moderno
2. **Adicionar tarefa**: Clique no botão "+" ou "Nova Tarefa" e preencha os campos
3. **Visualizar tarefas**: As tarefas aparecem na lista principal e no calendário
4. **Marcar como concluída**: Clique no checkbox ao lado da tarefa
5. **Excluir tarefa**: Clique no ícone de lixeira
6. **Visualizar calendário**: Use as abas para alternar entre lista e calendário
7. **Usar Pomodoro**: Acesse a aba Pomodoro para sessões de foco de 25 minutos
8. **Exportar dados**: Use o botão "Exportar" para baixar suas tarefas em JSON ou Excel

## 🎨 Funcionalidades

### Principais
- Interface limpa e responsiva
- Adicionar, editar e excluir tarefas
- Marcar tarefas como concluídas
- Visualização em lista e calendário
- Persistência de dados
- Temporizador Pomodoro integrado

### Visuais
- Tarefas próximas do prazo (≤2 dias) destacadas em vermelho
- Tarefas concluídas com texto riscado e acinzentado
- Contador de tarefas pendentes
- Layout responsivo para mobile e desktop

### Extras
- Exportar tarefas em JSON e Excel
- Navegação por mês no calendário
- Filtros por status (todas, pendentes, concluídas)
- Técnica Pomodoro com ciclos de 25min de foco e pausas
- Notificações do navegador para alertas do Pomodoro
- Histórico de ciclos Pomodoro concluídos

## 🍅 Funcionalidades do Pomodoro

### Temporizador
- **Sessões de foco**: 25 minutos de trabalho concentrado
- **Pausas curtas**: 5 minutos de descanso após cada sessão
- **Pausas longas**: 15 minutos a cada 4 ciclos completados
- **Controles**: Iniciar, pausar e resetar o temporizador

### Interface Visual
- **Cores dinâmicas**: Vermelho para foco, verde para pausa curta, azul para pausa longa
- **Barra de progresso**: Mostra visualmente o tempo restante
- **Contador de ciclos**: Exibe quantos ciclos foram concluídos
- **Indicadores visuais**: Círculos que mostram o progresso dos 4 ciclos

### Produtividade
- **Notificações**: Alertas do navegador quando sessões terminam
- **Persistência**: Ciclos salvos no localStorage
- **Estatísticas**: Acompanhamento de produtividade
- **Transições automáticas**: Mudança automática entre foco e pausas

## 🎯 Como Usar o Pomodoro

1. **Acesse a aba Pomodoro**: Clique em "🍅 Pomodoro" na navegação
2. **Inicie uma sessão**: Clique em "▶️ Iniciar" para começar 25 minutos de foco
3. **Trabalhe com concentração**: Foque em suas tarefas durante o tempo de trabalho
4. **Faça a pausa**: Quando o timer tocar, faça a pausa sugerida (5 ou 15 minutos)
5. **Repita o ciclo**: Continue alternando entre foco e pausas para máxima produtividade
6. **Acompanhe o progresso**: Veja seus ciclos concluídos e estatísticas

### Dicas para Melhor Aproveitamento
- 🎯 **Defina objetivos claros** antes de iniciar cada sessão
- 🔇 **Elimine distrações** durante os períodos de foco
- ☕ **Use as pausas** para descansar verdadeiramente
- 📊 **Acompanhe suas estatísticas** para melhorar sua produtividade

## 📧 Sistema de Lembretes por E-mail (Backend)

O UniTasks inclui um backend Node.js que envia lembretes automáticos por e-mail para tarefas que vencem no dia atual.

### 🚀 Configuração do Backend

1. **Navegue para a pasta do servidor**:
   ```bash
   cd server
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   - Renomeie o arquivo `.env` e configure suas credenciais do Gmail
   - Para usar Gmail, você precisa:
     - Habilitar verificação em duas etapas
     - Gerar uma "Senha de app" nas configurações do Google
     - Usar a senha de app no arquivo `.env`

4. **Configure o arquivo `.env`**:
   ```env
   EMAIL_USER=seuemail@gmail.com
   EMAIL_PASS=sua_app_password_aqui
   USE_MOCK=true  # true para testes, false para envios reais
   ```

### 🛠️ Como Usar o Sistema de E-mails

#### Modo de Teste (Recomendado para desenvolvimento):
```bash
npm run test
```

#### Teste com data específica:
```bash
npm run test-today
```

#### Envio real de e-mails:
```bash
# Primeiro, configure USE_MOCK=false no .env
npm run real
```

### 📋 Estrutura do Backend

#### **Services (Arquitetura de Serviços)**:
- **`emailService.js`**: Serviço real usando Nodemailer
- **`mockEmailService.js`**: Serviço de teste que simula envios

#### **Funcionalidades**:
- ✅ Verifica tarefas com vencimento no dia atual
- ✅ Envia e-mails formatados com HTML
- ✅ Suporte a mock para testes sem envio real
- ✅ Logs detalhados de todos os processos
- ✅ Tratamento de erros robusto
- ✅ Suporte a envio em lote

#### **Exemplo de E-mail Enviado**:
- **Assunto**: `🔴 Lembrete: "Trabalho de TCC" vence hoje!`
- **Corpo**: E-mail HTML formatado com informações da tarefa
- **Conteúdo**: Título, descrição, prioridade e dicas de produtividade

### 🔧 Scripts Disponíveis

```bash
npm run start       # Executa o sistema (usa configuração do .env)
npm run test        # Executa em modo de teste (mock)
npm run test-today  # Testa com tarefas de hoje
npm run real        # Executa com envios reais
npm run dev         # Modo desenvolvimento com nodemon
npm run schedule    # Agenda execução diária às 9:00 AM
npm run setup       # Configuração automática do backend
```

### 📊 Logs e Monitoramento

O sistema fornece logs detalhados:
- 📂 Carregamento de tarefas
- 📅 Verificação de datas
- 📧 Status de envio de cada e-mail
- 📊 Relatório final com estatísticas
- ❌ Tratamento de erros

## ⌨️ Atalhos de Teclado

- **Ctrl/Cmd + K**: Abrir modal de nova tarefa (funciona em qualquer aba)
- **Escape**: Fechar modal ou dropdown aberto
- **Enter**: Confirmar ações em formulários

## 🔔 Notificações

O UniTasks solicita permissão para enviar notificações do navegador para:
- Alertar quando sessões Pomodoro terminam
- Lembrar sobre transições entre foco e pausas
- Manter você informado mesmo com a aba em segundo plano

## 🌐 Compatibilidade

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🔗 Acesse o Projeto

👉 [uni-task-two.vercel.app](https://uni-task-two.vercel.app)
