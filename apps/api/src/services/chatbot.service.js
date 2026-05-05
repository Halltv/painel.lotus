import logger from '../utils/logger.js';

/**
 * State machine chatbot for WhatsApp support
 * States: initial → identify → menu → support | billing | info → resolved
 */

const STATES = {
  INITIAL: 'initial',
  MENU: 'menu',
  SUPPORT: 'support',
  BILLING: 'billing',
  INFO: 'info',
  WAITING_HUMAN: 'waiting_human',
  RESOLVED: 'resolved',
};

const MESSAGES = {
  WELCOME: `Olá! Bem-vindo ao suporte da *Lotus TEF* 🌸\n\nComo podemos ajudar você hoje?\n\n*1* - Suporte técnico\n*2* - Cobrança e financeiro\n*3* - Informações sobre produtos\n*4* - Falar com um atendente\n\nDigite o número da opção desejada.`,
  
  MENU_INVALID: `Opção inválida. Por favor, escolha uma das opções:\n\n*1* - Suporte técnico\n*2* - Cobrança e financeiro\n*3* - Informações sobre produtos\n*4* - Falar com um atendente`,

  SUPPORT: `Entendido! Vou ajudar com suporte técnico. 🔧\n\nQual o problema que está enfrentando?\n\n*1* - TEF não está processando\n*2* - Problema com impressora\n*3* - Sistema lento ou travando\n*4* - Outro problema\n*0* - Voltar ao menu principal`,

  BILLING: `Setor financeiro aqui! 💰\n\nComo posso ajudar?\n\n*1* - Dúvida sobre cobrança\n*2* - Solicitar boleto\n*3* - Status de pagamento\n*0* - Voltar ao menu principal`,

  INFO: `Informações sobre a Lotus TEF 📋\n\nNossas soluções:\n\n• *TEF Integrado* - Integração completa com PDV\n• *TEF Maquininha* - Solução wireless\n• *Automação PDV* - PDV completo\n\nPara mais detalhes, acesse nosso site ou *0* para voltar ao menu.`,

  TRANSFER: `Vou transferir você para um de nossos atendentes. ⏳\n\nPor favor, aguarde alguns instantes. Um operador estará disponível em breve.\n\n_Horário de atendimento: Seg-Sex, 8h-18h_`,

  SUPPORT_TEF: `Para problemas com TEF:\n\n1️⃣ Verifique a conexão com a internet\n2️⃣ Reinicie o pinpad (desconecte e reconecte o cabo)\n3️⃣ Aguarde 30 segundos e tente novamente\n\nO problema foi resolvido? Responda *SIM* ou *NÃO*`,

  SUPPORT_PRINTER: `Para problemas com impressora:\n\n1️⃣ Verifique se há papel\n2️⃣ Verifique se o cabo USB está conectado\n3️⃣ Reinicie a impressora (desligue e ligue)\n4️⃣ Se a luz estiver vermelha, pode ser jammed - abra e feche a tampa\n\nO problema foi resolvido? Responda *SIM* ou *NÃO*`,

  SUPPORT_SLOW: `Para sistema lento ou travando:\n\n1️⃣ Feche outros programas abertos\n2️⃣ Reinicie o computador\n3️⃣ Verifique se há atualizações pendentes\n\nO problema foi resolvido? Responda *SIM* ou *NÃO*`,

  RESOLVED_YES: `Ótimo! Fico feliz em ter ajudado! 🎉\n\nSe precisar de mais alguma coisa, é só chamar.\n\nAvalie nosso atendimento:\n⭐⭐⭐⭐⭐`,

  RESOLVED_NO: `Lamento que o problema não foi resolvido. Vou transferir você para um atendente especializado.\n\n${this?.TRANSFER}`,

  FALLBACK: `Não entendi sua mensagem. Por favor, escolha uma das opções disponíveis ou digite *0* para voltar ao menu principal.`,

  BILLING_BOLETO: `Para solicitar um boleto, precisamos de algumas informações.\n\nPor favor, informe seu *CNPJ* para localizar seu cadastro.`,

  BILLING_STATUS: `Para verificar o status do pagamento, acesse o portal do cliente em:\n👉 *portal.lotus-tef.com.br*\n\nOu informe seu CNPJ que consultamos aqui para você.`,
};

export function processChatbotMessage(currentState, messageText) {
  const msg = messageText.trim().toLowerCase();
  let nextState = currentState;
  let response = '';
  let transferToHuman = false;

  switch (currentState) {
    case STATES.INITIAL:
      response = MESSAGES.WELCOME;
      nextState = STATES.MENU;
      break;

    case STATES.MENU:
      if (msg === '1') {
        response = MESSAGES.SUPPORT;
        nextState = STATES.SUPPORT;
      } else if (msg === '2') {
        response = MESSAGES.BILLING;
        nextState = STATES.BILLING;
      } else if (msg === '3') {
        response = MESSAGES.INFO;
        nextState = STATES.INFO;
      } else if (msg === '4') {
        response = MESSAGES.TRANSFER;
        nextState = STATES.WAITING_HUMAN;
        transferToHuman = true;
      } else {
        response = MESSAGES.MENU_INVALID;
      }
      break;

    case STATES.SUPPORT:
      if (msg === '0') {
        response = MESSAGES.WELCOME;
        nextState = STATES.MENU;
      } else if (msg === '1') {
        response = MESSAGES.SUPPORT_TEF;
        nextState = 'support_tef';
      } else if (msg === '2') {
        response = MESSAGES.SUPPORT_PRINTER;
        nextState = 'support_printer';
      } else if (msg === '3') {
        response = MESSAGES.SUPPORT_SLOW;
        nextState = 'support_slow';
      } else if (msg === '4') {
        response = MESSAGES.TRANSFER;
        nextState = STATES.WAITING_HUMAN;
        transferToHuman = true;
      } else {
        response = MESSAGES.SUPPORT;
      }
      break;

    case 'support_tef':
    case 'support_printer':
    case 'support_slow':
      if (msg === 'sim' || msg === 's' || msg === 'yes') {
        response = MESSAGES.RESOLVED_YES;
        nextState = STATES.RESOLVED;
      } else if (msg === 'não' || msg === 'nao' || msg === 'n' || msg === 'no') {
        response = MESSAGES.TRANSFER;
        nextState = STATES.WAITING_HUMAN;
        transferToHuman = true;
      } else {
        response = `Por favor, responda *SIM* se o problema foi resolvido ou *NÃO* para ser transferido a um atendente.`;
      }
      break;

    case STATES.BILLING:
      if (msg === '0') {
        response = MESSAGES.WELCOME;
        nextState = STATES.MENU;
      } else if (msg === '1') {
        response = MESSAGES.TRANSFER;
        nextState = STATES.WAITING_HUMAN;
        transferToHuman = true;
      } else if (msg === '2') {
        response = MESSAGES.BILLING_BOLETO;
        nextState = 'billing_boleto';
      } else if (msg === '3') {
        response = MESSAGES.BILLING_STATUS;
        nextState = STATES.BILLING;
      } else {
        response = MESSAGES.BILLING;
      }
      break;

    case STATES.INFO:
      if (msg === '0') {
        response = MESSAGES.WELCOME;
        nextState = STATES.MENU;
      } else {
        response = MESSAGES.INFO;
      }
      break;

    case STATES.WAITING_HUMAN:
      response = `Sua mensagem foi registrada. Um atendente responderá em breve.\n\nSe desejar reiniciar o atendimento automático, digite *MENU*.`;
      if (msg === 'menu') {
        response = MESSAGES.WELCOME;
        nextState = STATES.MENU;
        transferToHuman = false;
      }
      break;

    case STATES.RESOLVED:
      if (msg === 'menu' || msg === '0') {
        response = MESSAGES.WELCOME;
        nextState = STATES.MENU;
      } else {
        response = `Atendimento encerrado. Digite *MENU* para iniciar um novo atendimento.`;
      }
      break;

    default:
      response = MESSAGES.WELCOME;
      nextState = STATES.MENU;
  }

  logger.info(`Chatbot: ${currentState} -> ${nextState} (transfer: ${transferToHuman})`);

  return { response, nextState, transferToHuman };
}

export { STATES };
