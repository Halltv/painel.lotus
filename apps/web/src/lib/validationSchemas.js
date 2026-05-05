
import * as z from 'zod';

export const clientSchema = z.object({
  nome: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .nonempty('O nome é obrigatório'),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, 'Formato de CNPJ inválido (XX.XXX.XXX/XXXX-XX)')
    .nonempty('O CNPJ é obrigatório'),
  custo: z.coerce.number({
    required_error: 'O custo é obrigatório',
    invalid_type_error: 'O custo deve ser um número',
  }).nonnegative('O custo não pode ser negativo'),
  valorTef: z.coerce.number({
    required_error: 'O valor do TEF é obrigatório',
    invalid_type_error: 'O valor deve ser um número',
  }).nonnegative('O valor não pode ser negativo'),
  tipoTef: z.enum(['tef_integrado', 'tef_maquininha_wireless', 'automacao_pdv'], {
    required_error: 'Selecione o tipo de solução',
    invalid_type_error: 'Tipo de solução inválido',
  }),
  email: z.string()
    .email('Formato de e-mail inválido')
    .nonempty('O e-mail é obrigatório'),
  whatsapp: z.string()
    .regex(/^\(\d{2}\)\s\d{5}\-\d{4}$/, 'Formato de WhatsApp inválido ((XX) XXXXX-XXXX)')
    .nonempty('O WhatsApp é obrigatório'),
});

export const ticketDetailsSchema = z.object({
  titulo: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  cliente: z.string().min(1, 'Selecione um cliente'),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  urgencia: z.string().min(1, 'Selecione a urgência'),
  status: z.string().min(1, 'Selecione o status'),
  atribuido_a: z.string().optional(),
  parecer_tecnico: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.status === 'Concluído' && (!data.parecer_tecnico || data.parecer_tecnico.trim() === '')) {
    ctx.addIssue({
      path: ['parecer_tecnico'],
      message: 'Parecer técnico é obrigatório para concluir o chamado.',
      code: z.ZodIssueCode.custom,
    });
  }
});

export const problemSchema = z.object({
  titulo: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  tags: z.string().optional(),
  solucao: z.string().min(10, 'A solução/parecer técnico deve ter pelo menos 10 caracteres'),
});

export const fileUploadSchema = z.object({
  nome: z.string().min(3, 'O nome do arquivo é obrigatório'),
  tipo: z.string().min(1, 'Selecione o tipo de arquivo'),
  categoria: z.string().min(1, 'Selecione a categoria'),
  versao: z.string().min(1, 'A versão é obrigatória (ex: 1.0.0)'),
  descricao: z.string().min(5, 'Forneça uma breve descrição do arquivo'),
});
