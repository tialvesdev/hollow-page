import { describe, expect, it } from 'vitest';
import { cadastroSchema, ehUuid, listarPostsSchema, novoPostSchema, perfilSchema } from '@hp/shared';

const erro = (r: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }, campo: string) =>
  r.success ? undefined : r.error!.issues.find((i) => i.path[0] === campo)?.message;

describe('validação dos campos', () => {
  const base = { nome: 'Lia Moraes', email: 'lia@email.com', senha: 'umasenha' };

  it('limpa o nome: tira invisíveis e marcadores de direção, junta espaços', () => {
    const r = cadastroSchema.safeParse({ ...base, nome: '  Lia​   Mo‮raes\n' });
    expect(r.success && r.data.nome).toBe('Lia Moraes');
  });

  it('recusa nome só com símbolos ou com caracteres de código', () => {
    expect(erro(cadastroSchema.safeParse({ ...base, nome: '<script>' }), 'nome')).toMatch(/Use letras/);
    expect(erro(cadastroSchema.safeParse({ ...base, nome: '___' }), 'nome')).toMatch(/pelo menos uma letra/);
    expect(erro(cadastroSchema.safeParse({ ...base, nome: "Robert'); DROP TABLE usuarios;--" }), 'nome')).toBeDefined();
    expect(cadastroSchema.safeParse({ ...base, nome: "Zoë O'Brien-Ñúñez" }).success).toBe(true);
  });

  it('valida e normaliza o e-mail', () => {
    const r = cadastroSchema.safeParse({ ...base, email: '  LIA@Email.COM ' });
    expect(r.success && r.data.email).toBe('lia@email.com');
    expect(erro(cadastroSchema.safeParse({ ...base, email: 'lia@' }), 'email')).toMatch(/e-mail válido/);
    expect(erro(cadastroSchema.safeParse({ ...base, email: 'a b@c.com' }), 'email')).toBeDefined();
  });

  it('senha: mínimo de 8, limite de 72 bytes, não pode ser só espaço', () => {
    expect(erro(cadastroSchema.safeParse({ ...base, senha: '1234567' }), 'senha')).toMatch(/pelo menos 8/);
    expect(erro(cadastroSchema.safeParse({ ...base, senha: '        ' }), 'senha')).toMatch(/só espaços/);
    expect(erro(cadastroSchema.safeParse({ ...base, senha: 'ç'.repeat(40) }), 'senha')).toMatch(/longa demais/);
    expect(cadastroSchema.safeParse({ ...base, senha: 'a'.repeat(72) }).success).toBe(true);
  });

  it('link: completa o https, recusa javascript:, dados embutidos e domínio falso', () => {
    const ok = perfilSchema.safeParse({ link: 'instagram.com/lia' });
    expect(ok.success && ok.data.link).toBe('https://instagram.com/lia');
    expect(erro(perfilSchema.safeParse({ link: 'javascript:alert(1)' }), 'link')).toBeDefined();
    expect(erro(perfilSchema.safeParse({ link: 'https://usuario:senha@site.com' }), 'link')).toBeDefined();
    expect(erro(perfilSchema.safeParse({ link: 'https://localhost' }), 'link')).toBeDefined();
    expect(perfilSchema.safeParse({ link: '' }).success).toBe(true);
  });

  it('publicação: título em uma linha, descrição guarda parágrafos sem lixo', () => {
    const r = novoPostSchema.safeParse({ titulo: ' Pico\nde  Cristal ', descricao: 'linha 1\r\n\r\n\r\n\r\nlinha 2\u0007' });
    expect(r.success && r.data.titulo).toBe('Pico de Cristal');
    expect(r.success && r.data.descricao).toBe('linha 1\n\nlinha 2');
    expect(erro(novoPostSchema.safeParse({ titulo: '   ' }), 'titulo')).toMatch(/título/);
  });

  it('busca e ids: limites de tamanho e formato', () => {
    expect(listarPostsSchema.safeParse({ q: 'x'.repeat(101) }).success).toBe(false);
    expect(listarPostsSchema.safeParse({ cursor: 'x'.repeat(201) }).success).toBe(false);
    expect(listarPostsSchema.safeParse({ tags: 'Cavaleiro,NaoExiste' }).success).toBe(false);
    expect(ehUuid('3f2b8a6e-1c4d-4e5f-9a0b-123456789abc')).toBe(true);
    expect(ehUuid('-'.repeat(36))).toBe(false);
    expect(ehUuid("1' OR '1'='1")).toBe(false);
  });
});
