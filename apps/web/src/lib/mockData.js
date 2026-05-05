
export const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@lotus.com', role: 'ADMIN', avatar: 'AU' },
  { id: '2', name: 'Gerente User', email: 'gerente@lotus.com', role: 'GERENTE', avatar: 'GU' },
  { id: '3', name: 'Operador User', email: 'operador@lotus.com', role: 'OPERADOR', avatar: 'OU' },
];

export const mockClients = [
  { id: '1', nome: 'Supermercado Silva', cnpj: '12.345.678/0001-90', email: 'contato@silva.com', whatsapp: '(11) 99999-9999', tipoTef: 'tef_integrado', status: 'ativo', valorTef: 450.00, custo: 150.00 },
  { id: '2', nome: 'Padaria Pão Quente', cnpj: '98.765.432/0001-10', email: 'padaria@paoquente.com', whatsapp: '(11) 98888-8888', tipoTef: 'tef_maquininha_wireless', status: 'implantacao', valorTef: 120.00, custo: 50.00 },
  { id: '3', nome: 'Posto Ipiranga', cnpj: '45.678.901/0001-23', email: 'posto@ipiranga.com', whatsapp: '(11) 97777-7777', tipoTef: 'automacao_pdv', status: 'bloqueado', valorTef: 800.00, custo: 300.00 },
  { id: '4', nome: 'Farmácia Saúde', cnpj: '33.444.555/0001-66', email: 'contato@saude.com', whatsapp: '(11) 96666-6666', tipoTef: 'tef_integrado', status: 'ativo', valorTef: 300.00, custo: 100.00 },
  { id: '5', nome: 'Loja de Roupas Moda', cnpj: '11.222.333/0001-44', email: 'moda@loja.com', whatsapp: '(11) 95555-5555', tipoTef: 'tef_maquininha_wireless', status: 'ativo', valorTef: 150.00, custo: 50.00 },
];

export const generateTicketId = () => `T-${Math.floor(Math.random() * 9000) + 1000}`;

const generateMockTickets = () => {
  const statuses = ['A Fazer', 'Em Andamento', 'Pendente Cliente', 'Concluído'];
  const urgencies = ['Crítica', 'Alta', 'Média', 'Baixa'];
  const clients = mockClients.map(c => c.nome);
  const assignees = ['Admin User', 'Gerente User', 'Operador User', 'Não Atribuído'];
  const categories = ['Suporte', 'Implantação', 'Comercial', 'Cobrança'];
  
  const descricoes = [
    "Sistema apresentando lentidão extrema ao processar vendas no PDV 3.",
    "Erro de comunicação com o servidor TEF durante transação de crédito.",
    "Impressora fiscal não está respondendo aos comandos do sistema.",
    "Dúvida sobre como gerar o relatório de fechamento de caixa mensal.",
    "Solicitação de instalação do sistema em nova máquina do escritório."
  ];

  const pareceres = [
    "Realizada limpeza de cache e otimização do banco de dados local. Sistema voltou a operar com performance normal.",
    "Identificada falha na rota de rede. Configurado DNS alternativo e reiniciado serviço do TEF. Transações normalizadas.",
    "Cabo de comunicação estava com mau contato. Substituído cabo USB e reinstalado driver da impressora.",
    "Orientado o cliente passo a passo via acesso remoto. Enviado manual em PDF para consultas futuras.",
    "Instalação concluída com sucesso. Configurados atalhos e permissões de usuário."
  ];

  const tagsList = [['pdv', 'lentidão'], ['tef', 'rede', 'erro'], ['impressora', 'hardware'], ['relatório', 'dúvida'], ['instalação', 'novo-ponto']];

  return Array.from({ length: 40 }).map((_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isCompleted = status === 'Concluído';
    const typeIndex = Math.floor(Math.random() * descricoes.length);
    const creationDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    const activities = [
      { id: `act-${i}-1`, tipo: 'criacao', usuario: 'Sistema', acao: 'Chamado criado', detalhes: 'Chamado aberto via portal do cliente', data: creationDate.toISOString() },
      { id: `act-${i}-2`, tipo: 'atribuicao', usuario: 'Admin User', acao: 'Atribuição alterada', detalhes: `Atribuído para ${assignees[Math.floor(Math.random() * assignees.length)]}`, data: new Date(creationDate.getTime() + 3600000).toISOString() }
    ];

    if (status !== 'A Fazer') {
      activities.push({ id: `act-${i}-3`, tipo: 'status', usuario: 'Operador User', acao: 'Status alterado', detalhes: `Status alterado para ${status}`, data: new Date(creationDate.getTime() + 7200000).toISOString() });
    }

    if (isCompleted) {
      activities.push({ id: `act-${i}-4`, tipo: 'parecer', usuario: 'Gerente User', acao: 'Parecer técnico adicionado', detalhes: 'Solução aplicada e chamado encerrado', data: new Date(creationDate.getTime() + 86400000).toISOString() });
    }
    
    return {
      id: `T-${1000 + i}`,
      titulo: `Chamado #${1000 + i} - ${categories[Math.floor(Math.random() * categories.length)]}`,
      cliente: clients[Math.floor(Math.random() * clients.length)],
      urgencia: urgencies[Math.floor(Math.random() * urgencies.length)],
      status: status,
      atribuido_a: assignees[Math.floor(Math.random() * assignees.length)],
      tempo_gasto: Math.floor(Math.random() * 240),
      descricao: descricoes[typeIndex],
      categoria: categories[Math.floor(Math.random() * categories.length)],
      parecer_tecnico: isCompleted ? pareceres[typeIndex] : '',
      tags: tagsList[typeIndex],
      activities: activities.sort((a, b) => new Date(b.data) - new Date(a.data)),
      mensagens_nao_lidas: Math.floor(Math.random() * 3),
      data_criacao: creationDate.toISOString(),
      data_atualizacao: new Date(creationDate.getTime() + Math.floor(Math.random() * 86400000)).toISOString()
    };
  });
};

export let mockTickets = generateMockTickets();

export let mockProblems = [
  {
    id: 'P-1001',
    titulo: 'Falha na emissão de NFC-e em contingência',
    descricao: 'Sistema não está alternando automaticamente para contingência offline quando a SEFAZ está indisponível.',
    categoria: 'Suporte',
    tags: ['nfce', 'contingencia', 'sefaz'],
    solucao: 'Atualizada a DLL de comunicação com a SEFAZ para a versão 3.5.2 e ajustado o timeout de resposta no arquivo de configuração local.',
    data_criacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export let mockFiles = [
  { id: '1', nome: 'Manual_Usuario_PDV_v3.pdf', tipo: 'PDF', categoria: 'Manuais', versao: '3.0', tamanho: '2.5 MB', data_upload: '2023-10-15', descricao: 'Manual completo de operação do sistema PDV.' },
  { id: '2', nome: 'Instalador_Lotus_v2.1.exe', tipo: 'EXE', categoria: 'Sistema', versao: '2.1.0', tamanho: '45 MB', data_upload: '2023-11-01', descricao: 'Instalador principal do sistema Lotus.' },
  { id: '3', nome: 'Driver_Impressora_Epson.zip', tipo: 'ZIP', categoria: 'Drivers', versao: '1.0', tamanho: '15 MB', data_upload: '2023-09-20', descricao: 'Pacote de drivers para impressoras térmicas Epson.' },
  { id: '4', nome: 'Guia_Fechamento_Caixa.pdf', tipo: 'PDF', categoria: 'Guias Rápidos', versao: '1.2', tamanho: '800 KB', data_upload: '2023-10-05', descricao: 'Passo a passo para fechamento de caixa cego.' },
  { id: '5', nome: 'Atualizacao_NFCe_DLL.dll', tipo: 'DLL', categoria: 'Bibliotecas', versao: '4.0.1', tamanho: '1.2 MB', data_upload: '2023-11-10', descricao: 'Biblioteca atualizada para emissão de NFC-e.' },
  { id: '6', nome: 'Contrato_Padrao_Servicos.doc', tipo: 'DOC', categoria: 'Comercial', versao: '2023', tamanho: '45 KB', data_upload: '2023-01-15', descricao: 'Modelo de contrato padrão para novos clientes.' },
  { id: '7', nome: 'Manual_TEF_Integrado.pdf', tipo: 'PDF', categoria: 'Manuais', versao: '2.0', tamanho: '3.1 MB', data_upload: '2023-08-22', descricao: 'Configuração e operação do TEF Integrado.' },
  { id: '8', nome: 'Patch_Correcao_Relatorios.exe', tipo: 'EXE', categoria: 'Atualizações', versao: '2.1.1', tamanho: '5 MB', data_upload: '2023-11-15', descricao: 'Patch para correção de erro na geração de relatórios.' },
  { id: '9', nome: 'Tabela_Precos_2024.pdf', tipo: 'PDF', categoria: 'Comercial', versao: '2024.1', tamanho: '1.5 MB', data_upload: '2023-12-01', descricao: 'Tabela de preços atualizada para o próximo ano.' },
  { id: '10', nome: 'Driver_Leitor_Codigo_Barras.zip', tipo: 'ZIP', categoria: 'Drivers', versao: '1.5', tamanho: '8 MB', data_upload: '2023-07-10', descricao: 'Drivers genéricos para leitores de código de barras USB.' },
];

const now = Date.now();
const minutes = (m) => m * 60 * 1000;
const hours = (h) => h * 60 * 60 * 1000;

export const mockWhatsApp = [
  {
    id: '1',
    cliente: 'Supermercado Silva',
    numero_whatsapp: '(11) 99999-9999',
    status: 'ativo',
    data_ultima_mensagem: new Date(now - minutes(5)).toISOString(),
    mensagens: [
      { id: 'm1-1', remetente: 'cliente', texto: 'Olá, estou com um problema na maquininha.', timestamp: new Date(now - minutes(15)).toISOString(), lido: true },
      { id: 'm1-2', remetente: 'bot', texto: 'Bom dia! Qual o número de série do equipamento?', timestamp: new Date(now - minutes(12)).toISOString(), lido: true },
      { id: 'm1-3', remetente: 'cliente', texto: 'É o NS 123456789.', timestamp: new Date(now - minutes(5)).toISOString(), lido: false }
    ]
  },
  {
    id: '2',
    cliente: 'Padaria Pão Quente',
    numero_whatsapp: '(11) 98888-8888',
    status: 'pendente',
    data_ultima_mensagem: new Date(now - minutes(45)).toISOString(),
    mensagens: [
      { id: 'm2-1', remetente: 'cliente', texto: 'Bom dia, o sistema não está abrindo.', timestamp: new Date(now - hours(1)).toISOString(), lido: true },
      { id: 'm2-2', remetente: 'bot', texto: 'Poderia me enviar um print da tela de erro?', timestamp: new Date(now - minutes(55)).toISOString(), lido: true },
      { id: 'm2-3', remetente: 'cliente', texto: 'Aparece "Erro de conexão com o banco".', timestamp: new Date(now - minutes(45)).toISOString(), lido: false },
      { id: 'm2-4', remetente: 'cliente', texto: 'Preciso de ajuda urgente, a fila está grande!', timestamp: new Date(now - minutes(44)).toISOString(), lido: false }
    ]
  },
  {
    id: '3',
    cliente: 'Posto Ipiranga',
    numero_whatsapp: '(11) 97777-7777',
    status: 'ativo',
    data_ultima_mensagem: new Date(now - hours(2)).toISOString(),
    mensagens: [
      { id: 'm3-1', remetente: 'cliente', texto: 'Como faço para emitir o relatório de vendas por frentista?', timestamp: new Date(now - hours(3)).toISOString(), lido: true },
      { id: 'm3-2', remetente: 'bot', texto: 'Vá em Relatórios > Vendas > Por Funcionário e selecione o período desejado.', timestamp: new Date(now - hours(2.5)).toISOString(), lido: true },
      { id: 'm3-3', remetente: 'cliente', texto: 'Deu certo, muito obrigado!', timestamp: new Date(now - hours(2)).toISOString(), lido: true }
    ]
  },
  {
    id: '4',
    cliente: 'Farmácia Saúde',
    numero_whatsapp: '(11) 96666-6666',
    status: 'inativo',
    data_ultima_mensagem: new Date(now - hours(24)).toISOString(),
    mensagens: [
      { id: 'm4-1', remetente: 'bot', texto: 'Olá! Notamos que sua licença vence em 5 dias. Deseja gerar o boleto de renovação?', timestamp: new Date(now - hours(48)).toISOString(), lido: true },
      { id: 'm4-2', remetente: 'cliente', texto: 'Sim, por favor.', timestamp: new Date(now - hours(25)).toISOString(), lido: true },
      { id: 'm4-3', remetente: 'bot', texto: 'Boleto gerado com sucesso. Enviamos para o seu e-mail cadastrado.', timestamp: new Date(now - hours(24)).toISOString(), lido: true }
    ]
  },
  {
    id: '5',
    cliente: 'Loja de Roupas Moda',
    numero_whatsapp: '(11) 95555-5555',
    status: 'ativo',
    data_ultima_mensagem: new Date(now - minutes(10)).toISOString(),
    mensagens: [
      { id: 'm5-1', remetente: 'cliente', texto: 'A impressora de etiquetas parou de funcionar.', timestamp: new Date(now - minutes(20)).toISOString(), lido: true },
      { id: 'm5-2', remetente: 'bot', texto: 'Verifique se o cabo USB está bem conectado e se a luz verde está acesa.', timestamp: new Date(now - minutes(15)).toISOString(), lido: true },
      { id: 'm5-3', remetente: 'cliente', texto: 'A luz está vermelha piscando.', timestamp: new Date(now - minutes(10)).toISOString(), lido: false }
    ]
  },
  {
    id: '6',
    cliente: 'Restaurante Saboroso',
    numero_whatsapp: '(11) 94444-4444',
    status: 'pendente',
    data_ultima_mensagem: new Date(now - minutes(2)).toISOString(),
    mensagens: [
      { id: 'm6-1', remetente: 'cliente', texto: 'Os pedidos do iFood não estão caindo no PDV.', timestamp: new Date(now - minutes(2)).toISOString(), lido: false }
    ]
  },
  {
    id: '7',
    cliente: 'Clínica Bem Estar',
    numero_whatsapp: '(11) 93333-3333',
    status: 'ativo',
    data_ultima_mensagem: new Date(now - hours(5)).toISOString(),
    mensagens: [
      { id: 'm7-1', remetente: 'cliente', texto: 'Gostaria de agendar um treinamento para a nova recepcionista.', timestamp: new Date(now - hours(6)).toISOString(), lido: true },
      { id: 'm7-2', remetente: 'bot', texto: 'Claro! Temos horários disponíveis amanhã às 10h ou às 14h. Qual prefere?', timestamp: new Date(now - hours(5.5)).toISOString(), lido: true },
      { id: 'm7-3', remetente: 'cliente', texto: 'Pode ser às 14h.', timestamp: new Date(now - hours(5)).toISOString(), lido: true },
      { id: 'm7-4', remetente: 'bot', texto: 'Agendado! Enviaremos o link da reunião em breve.', timestamp: new Date(now - hours(4.9)).toISOString(), lido: true }
    ]
  },
  {
    id: '8',
    cliente: 'Mercadinho da Esquina',
    numero_whatsapp: '(11) 92222-2222',
    status: 'inativo',
    data_ultima_mensagem: new Date(now - hours(72)).toISOString(),
    mensagens: [
      { id: 'm8-1', remetente: 'cliente', texto: 'Boa tarde, o leitor de código de barras está bipando mas não lê o produto.', timestamp: new Date(now - hours(74)).toISOString(), lido: true },
      { id: 'm8-2', remetente: 'bot', texto: 'Tente limpar o visor do leitor com um pano seco. Se não resolver, pode ser necessário reconfigurar.', timestamp: new Date(now - hours(73)).toISOString(), lido: true },
      { id: 'm8-3', remetente: 'cliente', texto: 'Limpei e voltou a funcionar. Obrigado!', timestamp: new Date(now - hours(72)).toISOString(), lido: true }
    ]
  }
];
