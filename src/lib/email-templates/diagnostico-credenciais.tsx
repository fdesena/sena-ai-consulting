import * as React from 'react'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  nome?: string
  email?: string
  senha?: string
  loginUrl?: string
  perfilUrl?: string
  agendaUrl?: string
  whatsappUrl?: string
}

const Email = ({
  nome = 'olá',
  email = 'seu-email@exemplo.com',
  senha = 'sua-senha-temporaria',
  loginUrl = 'https://senaconsulting.app/auth',
  perfilUrl = 'https://senaconsulting.app/painel/perfil',
  agendaUrl = 'https://calendar.app.google/UhKn3fDKNtN9kzb76',
  whatsappUrl = 'https://wa.me/5511999999999',
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu diagnóstico está pronto — acesse seu painel</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brand}>
          <Text style={brandText}>Sena Consulting</Text>
          <Text style={brandSub}>BÚSSOLA DIGITAL &amp; IA</Text>
        </Section>

        <Heading style={h1}>Seu diagnóstico está pronto, {nome} 👋</Heading>

        <Text style={p}>
          Criamos uma conta para você acessar o seu diagnóstico completo e o
          plano de 30 dias a qualquer momento.
        </Text>

        <Section style={box}>
          <Text style={label}>SEU ACESSO</Text>
          <Text style={cred}><b>Login:</b> {email}</Text>
          <Text style={cred}><b>Senha:</b> {senha}</Text>
          <Text style={hint}>
            Por segurança, sua senha inicial é igual ao seu email. Troque assim
            que entrar, em <i>Perfil → alterar senha</i>.
          </Text>
        </Section>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={loginUrl} style={btnPrimary}>Entrar no painel</Button>
        </Section>

        <Hr style={hr} />

        <Heading as="h2" style={h2}>Próximos passos</Heading>

        <Text style={p}>
          <b>1. Agende uma conversa gratuita de 30 min</b> comigo para destrincharmos
          juntos os seus resultados.
        </Text>
        <Section style={{ textAlign: 'center', margin: '12px 0 20px' }}>
          <Button href={agendaUrl} style={btnAlt}>Agendar 30 min com Felipe</Button>
        </Section>

        <Text style={p}>
          <b>2. Prefere conversar agora?</b> Me chame direto no WhatsApp.
        </Text>
        <Section style={{ textAlign: 'center', margin: '12px 0 8px' }}>
          <Button href={whatsappUrl} style={btnAlt}>Falar no WhatsApp</Button>
        </Section>

        <Hr style={hr} />

        <Text style={foot}>
          Trocar a senha: <Link href={perfilUrl} style={link}>{perfilUrl}</Link>
        </Text>
        <Text style={foot}>Sena Consulting · Estratégia + Execução com IA</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Seu diagnóstico Bússola Digital & IA está pronto',
  displayName: 'Diagnóstico — credenciais de acesso',
  previewData: {
    nome: 'Maria',
    email: 'maria@exemplo.com',
    senha: 'maria@exemplo.com',
    loginUrl: 'https://senaconsulting.app/auth',
    perfilUrl: 'https://senaconsulting.app/painel/perfil',
    agendaUrl: 'https://calendar.app.google/UhKn3fDKNtN9kzb76',
    whatsappUrl: 'https://wa.me/5511999999999',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Bricolage Grotesque',Arial,sans-serif", color: '#1A1916' }
const container = { padding: '28px 28px 36px', maxWidth: '600px', margin: '0 auto' }
const brand = { marginBottom: '20px' }
const brandText = { fontSize: '16px', fontWeight: 700, margin: 0, color: '#1A1916' }
const brandSub = { fontSize: '10px', letterSpacing: '1px', color: '#7A756D', margin: '2px 0 0', fontFamily: "'Fragment Mono',monospace" }
const h1 = { fontSize: '24px', fontWeight: 700, letterSpacing: '-0.4px', margin: '8px 0 14px' }
const h2 = { fontSize: '18px', fontWeight: 700, margin: '8px 0 12px' }
const p = { fontSize: '15px', lineHeight: '1.55', color: '#1A1916', margin: '0 0 14px' }
const box = { background: '#FBFAF8', border: '1px solid #E2DDD6', borderRadius: '12px', padding: '18px 18px 10px', margin: '18px 0' }
const label = { fontSize: '10px', letterSpacing: '1.5px', color: '#C8853A', margin: '0 0 8px', fontFamily: "'Fragment Mono',monospace" }
const cred = { fontSize: '15px', margin: '4px 0' }
const hint = { fontSize: '12.5px', color: '#7A756D', margin: '10px 0 0', lineHeight: '1.5' }
const btnPrimary = { background: '#1A1916', color: '#ffffff', padding: '14px 24px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' as const }
const btnAlt = { background: '#C8853A', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' as const }
const hr = { borderColor: '#E2DDD6', margin: '24px 0' }
const foot = { fontSize: '12px', color: '#7A756D', margin: '6px 0', lineHeight: '1.5' }
const link = { color: '#C8853A' }
