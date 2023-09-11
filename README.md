# API Telegram - API para envio de mensagem
**Telegram**

<img alt="Static Badge" src="https://img.shields.io/badge/Working-green?label=Status">

Um projeto simples que automatiza o envio de mensagens pelo Telegram. Facilitando o envio de alertas, como por exemplo, se tiver um monitoramento que em dado momento necessita enviar um alerta aos responsáveis, essa API facilita esse envio através de uma requisição.

## Importante

### Criação das variáves de ambiente

1. **Crie um arquivo `.env`**: Siga o exemplo do `.env.example`.

2. **Obter o TOKEN de acesso**:
  - Abra o Telegram.
  - Pesquise por BotFather, o contato estará com o ícone verificado.
  - Digite `/start` e em seguida `/newBot`.
  - Escolha o nome do seu Bot (**Deve terminar com bot**), ex: suaApi_bot, suaApiBot.
  - Após definir o nome, você receberá uma mensagem que vai conter o **TOKEN**.
  - Insira seu **TOKEN** no seu `.env`.

3. **Obter o GROUP_ID**:
  - Abra o [Telegram Web](https://web.telegram.org/).
  - Na página do grupo que deseja pegar o ID, abra as Ferramentas de Desenvolvedor do seu navegador (normalmente pressionando F12 ou clicando com o botão direito e selecionando "Inspecionar").
  - Na aba "**Elements**", aperte **Ctrl + F**, para pesquisar e digite **"profile-name"**. Você encontrará uma `<div>`, dentro dessa `<div>` haverá um `<span data-peer-id="ID_do_seu_grupo"/>`.
  - Insira o **ID** no seu `.env`.

4. **KEY**
  - Crie uma chave de acesso.
  - Essa chave deverá ser usada no cabeçalho da requisição.
    
### Iniciando o ambiente

1. Instale as dependências:
```bash
npm install
```

2. Inicie o bot:
```bash
node server.js
```

## Rota

Enviar mensagem:
<pre><strong>POST </strong><span>/send-message</span></pre>
**Lembre-se** de sempre colocar sua chave no cabeçalho da requisição.

**Referência**:
  - https://core.telegram.org/bots/api

##
Created by **Thiago Sartorel** on **11/09/2023**.
