import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import {
  CADASTRO_ORG_INICIAL,
  GRUPO_EXECUCAO_ID,
  OPCOES_BOOLEAN,
  OPCOES_CARGO_REF,
  OPCOES_CONDICAO_CARGO,
  OPCOES_REGIME_TRIBUTACAO,
  OPCOES_BANCO,
  OPCOES_TIPO_CHAVE_PIX,
  OPCOES_TIPO_CONTA,
  contaModoSomentePix,
  contaOcultaPix,
  OPCOES_TIPO_EMAIL,
  OPCOES_TIPO_TRIBUTO,
  OPCOES_PESSOA_REF,
  OPCOES_UNIDADE_CAMINHO,
  buildEtapas,
  cloneCadastro,
  enviarRascunhoParaAprovacao,
  hasDraftChanges,
  progressoGeral,
  badgeClassStatusDoc,
  syncGruposFromRascunho,
  type CadastroOrganizacional,
  type DocExecucao,
  type DocumentoMipp,
  type SnapshotCadastro,
} from './portalClienteOrgData'

type Props = {
  onHome: () => void
  onToast: (msg: string) => void
  /** Voltar ao Meu painel / detalhe (modo Atender). */
  onBack?: () => void
  breadcrumbTrail?: string[]
  title?: string
  initialCadastro?: CadastroOrganizacional
  /** Chamado após Salvar (envio à MTI). */
  onSaved?: (cadastro: CadastroOrganizacional) => void
}

function newOrgId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

type ListaOrgId =
  | 'contas'
  | 'tributos'
  | 'emails'
  | 'telefones'
  | 'enderecos'
  | 'redes'
  | 'cargos'
  | 'pessoas'
  | 'convites'

const LISTAS_VAZIAS: Record<ListaOrgId, string[]> = {
  contas: [],
  tributos: [],
  emails: [],
  telefones: [],
  enderecos: [],
  redes: [],
  cargos: [],
  pessoas: [],
  convites: [],
}

function OrgListToolbar({
  onAdd,
  onDelete,
  canDelete,
}: {
  onAdd: () => void
  onDelete: () => void
  canDelete: boolean
}) {
  return (
    <div className="pc-org-list-toolbar" role="toolbar">
      <button type="button" className="pc-org-list-toolbar__btn" aria-label="Adicionar" onClick={onAdd}>
        <span className="material-symbols-outlined" aria-hidden>
          add
        </span>
      </button>
      <button
        type="button"
        className="pc-org-list-toolbar__btn"
        aria-label="Excluir selecionados"
        disabled={!canDelete}
        onClick={onDelete}
      >
        <span className="material-symbols-outlined" aria-hidden>
          delete
        </span>
      </button>
      <button type="button" className="pc-org-list-toolbar__btn" aria-label="Adicionar item" onClick={onAdd}>
        <span className="material-symbols-outlined" aria-hidden>
          add_circle
        </span>
      </button>
    </div>
  )
}

function OrgTh({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <th scope="col">
      <span className="pc-org-table__th">
        <span>
          {children}
          {required ? <span className="pc-req"> *</span> : null}
        </span>
        <span className="material-symbols-outlined pc-org-table__th-icon" aria-hidden>
          arrow_drop_down
        </span>
      </span>
    </th>
  )
}

function OrgListFab({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <button type="button" className="pc-org-list-fab" aria-label={label} onClick={onAdd}>
      <span className="material-symbols-outlined" aria-hidden>
        add
      </span>
    </button>
  )
}

function OrgFormFooter({
  primaryLabel,
  primaryIcon = 'check',
  secondaryLabel,
  secondaryIcon = 'send',
  cancelDisabled,
  primaryDisabled,
  secondaryDisabled,
  onCancel,
  onPrimary,
  onSecondary,
}: {
  primaryLabel: string
  primaryIcon?: string
  secondaryLabel?: string
  secondaryIcon?: string
  cancelDisabled?: boolean
  primaryDisabled?: boolean
  secondaryDisabled?: boolean
  onCancel: () => void
  onPrimary: () => void
  onSecondary?: () => void
}) {
  return (
    <div className="pc-org-form-footer">
      <button
        type="button"
        className="pc-org-form-footer__cancel"
        disabled={cancelDisabled}
        onClick={onCancel}
      >
        <span className="material-symbols-outlined" aria-hidden>
          close
        </span>
        Cancelar
      </button>
      {onSecondary && secondaryLabel ? (
        <button
          type="button"
          className="pc-org-form-footer__secondary"
          disabled={secondaryDisabled}
          onClick={onSecondary}
        >
          <span className="material-symbols-outlined" aria-hidden>
            {secondaryIcon}
          </span>
          {secondaryLabel}
        </button>
      ) : null}
      <button
        type="button"
        className="pc-org-form-footer__primary"
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        <span className="material-symbols-outlined" aria-hidden>
          {primaryIcon}
        </span>
        {primaryLabel}
      </button>
    </div>
  )
}

function AccordionBlock({
  id,
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  icon: string
  open: boolean
  onToggle: (id: string) => void
  children: ReactNode
}) {
  return (
    <div className={`sy-accordion__item${open ? ' sy-accordion__item--open' : ''}`}>
      <button
        type="button"
        className="sy-accordion__trigger"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined" aria-hidden>
          {icon}
        </span>
        <span className="sy-accordion__title">{title}</span>
        <span className="material-symbols-outlined sy-accordion__chevron" aria-hidden>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {open ? <div className="sy-accordion__panel">{children}</div> : null}
    </div>
  )
}

function SelectOpcoes({
  value,
  options,
  disabled,
  onChange,
  allowEmpty,
  emptyLabel = 'Selecione',
}: {
  value: string
  options: readonly string[]
  disabled?: boolean
  onChange: (v: string) => void
  allowEmpty?: boolean
  emptyLabel?: string
}) {
  const opts = allowEmpty && value && !options.includes(value) ? [value, ...options] : [...options]
  return (
    <select className="sy-dem-input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {opts.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export default function CadastroOrganizacionalPage({
  onHome,
  onToast,
  onBack,
  breadcrumbTrail,
  title,
  initialCadastro,
  onSaved,
}: Props) {
  const [cadastro, setCadastro] = useState<CadastroOrganizacional>(() =>
    cloneCadastro(initialCadastro ?? CADASTRO_ORG_INICIAL),
  )
  const [acordeoesAbertos, setAcordeoesAbertos] = useState<string[]>(['dados-cadastro', 'dados-org'])
  const [gruposAbertos, setGruposAbertos] = useState<string[]>([])
  const [etapasAbertas, setEtapasAbertas] = useState<string[]>(['etapa-0'])
  const [docUpload, setDocUpload] = useState<{ tipo: 'mipp' | 'execucao'; id: string } | null>(null)
  const [docDetalhe, setDocDetalhe] = useState<{ tipo: 'mipp' | 'execucao'; id: string } | null>(null)
  const [selecionados, setSelecionados] = useState<Record<ListaOrgId, string[]>>(() => ({ ...LISTAS_VAZIAS }))
  const fileRef = useRef<HTMLInputElement>(null)

  function toggleSel(lista: ListaOrgId, id: string) {
    setSelecionados((prev) => {
      const cur = prev[lista]
      return { ...prev, [lista]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }
    })
  }

  function limparSel(lista: ListaOrgId) {
    setSelecionados((prev) => ({ ...prev, [lista]: [] }))
  }

  function toggleSelTodos(lista: ListaOrgId, ids: string[]) {
    setSelecionados((prev) => {
      const all = ids.length > 0 && ids.every((id) => prev[lista].includes(id))
      return { ...prev, [lista]: all ? [] : [...ids] }
    })
  }

  function todosSelecionados(lista: ListaOrgId, ids: string[]) {
    return ids.length > 0 && ids.every((id) => selecionados[lista].includes(id))
  }

  const snap = cadastro.rascunho
  const editavel =
    cadastro.statusAprovacao === 'Vigente' ||
    cadastro.statusAprovacao === 'Rascunho local' ||
    cadastro.statusAprovacao === 'Ajuste solicitado'
  const dirty = hasDraftChanges(cadastro)
  const geral = useMemo(() => progressoGeral(cadastro.grupos), [cadastro.grupos])
  const etapas = useMemo(() => buildEtapas(snap.documentosMipp), [snap.documentosMipp])
  const emailPrincipal = snap.contato.emails.find((e) => e.principal)?.email ?? ''
  const execucaoAberto = gruposAbertos.includes(GRUPO_EXECUCAO_ID)
  const execucaoPreenchidos = snap.docsExecucao.filter((d) => d.arquivo && d.status !== 'Recusado').length
  const docDetalheMipp: DocumentoMipp | null =
    docDetalhe?.tipo === 'mipp'
      ? (snap.documentosMipp.find((d) => d.id === docDetalhe.id) ?? null)
      : null
  const docDetalheExec: DocExecucao | null =
    docDetalhe?.tipo === 'execucao'
      ? (snap.docsExecucao.find((d) => d.id === docDetalhe.id) ?? null)
      : null

  function patchRascunho(updater: (prev: SnapshotCadastro) => SnapshotCadastro) {
    setCadastro((prev) => {
      const rascunho = updater(prev.rascunho)
      const next: CadastroOrganizacional = {
        ...prev,
        rascunho,
        statusAprovacao:
          prev.statusAprovacao === 'Aguardando MTI' ? prev.statusAprovacao : 'Rascunho local',
      }
      return syncGruposFromRascunho(next)
    })
  }

  function toggleGrupo(id: string) {
    setGruposAbertos((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  function toggleEtapa(id: string) {
    setEtapasAbertas((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  function toggleAcordeao(id: string) {
    setAcordeoesAbertos((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  function abrirUpload(tipo: 'mipp' | 'execucao', id: string) {
    if (!editavel) return
    setDocUpload({ tipo, id })
    window.setTimeout(() => fileRef.current?.click(), 0)
  }

  function onArquivoSelecionado(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !docUpload) return
    const { tipo, id } = docUpload
    patchRascunho((r) => {
      if (tipo === 'mipp') {
        return {
          ...r,
          documentosMipp: r.documentosMipp.map((d) =>
            d.id === id
              ? {
                  ...d,
                  arquivo: file.name,
                  dataAnexo: new Date().toISOString().slice(0, 10),
                  status: 'Pendente' as const,
                  observacaoAjuste: undefined,
                  origem: 'Parceiro' as const,
                }
              : d,
          ),
        }
      }
      return {
        ...r,
        docsExecucao: r.docsExecucao.map((d) =>
          d.id === id
            ? {
                ...d,
                arquivo: file.name,
                dataAnexo: new Date().toISOString().slice(0, 10),
                status: 'Pendente' as const,
                origem: 'Parceiro' as const,
              }
            : d,
        ),
      }
    })
    onToast(`Arquivo "${file.name}" anexado — alteração em rascunho`)
    setDocUpload(null)
    e.target.value = ''
  }

  function abrirDocDetalhe(tipo: 'mipp' | 'execucao', id: string) {
    setDocDetalhe({ tipo, id })
  }

  function fecharDocDetalhe() {
    setDocDetalhe(null)
  }

  function formatDocDate(iso?: string): string {
    if (!iso) return '—'
    const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
  }

  function descartarRascunho() {
    setCadastro((prev) =>
      syncGruposFromRascunho({
        ...prev,
        rascunho: structuredClone(prev.publicado),
        statusAprovacao: 'Vigente',
        motivoAjusteMti: undefined,
      }),
    )
    onToast('Rascunho descartado — voltou aos dados publicados pela MTI')
  }

  function cancelarAlteracoes() {
    if (cadastro.statusAprovacao === 'Aguardando MTI') {
      onToast('Há um envio aguardando aprovação da MTI')
      return
    }
    if (!dirty) {
      onToast('Não há alterações em rascunho para cancelar')
      return
    }
    descartarRascunho()
  }

  function salvarEEnviarParaMti() {
    if (cadastro.statusAprovacao === 'Aguardando MTI') {
      onToast('Há um envio aguardando aprovação da MTI')
      return
    }
    if (!editavel) {
      onToast('Cadastro não está editável no momento')
      return
    }
    if (!dirty && cadastro.statusAprovacao !== 'Ajuste solicitado') {
      onToast('Não há alterações para enviar à MTI')
      return
    }
    const enviado = enviarRascunhoParaAprovacao(cadastro)
    setCadastro(enviado)
    onToast('Cadastro salvo e enviado à MTI para análise')
    onSaved?.(enviado)
  }

  const aguardandoMti = cadastro.statusAprovacao === 'Aguardando MTI'

  function adicionarConta() {
    patchRascunho((r) => ({
      ...r,
      contasBancarias: [
        ...r.contasBancarias,
        {
          id: newOrgId('cb'),
          banco: '',
          agencia: '',
          tipoConta: '',
          numeroConta: '',
          cpfCnpj: '',
          tipoChavePix: '',
          chavePix: '',
          origem: 'Parceiro',
        },
      ],
    }))
  }

  function excluirContasSelecionadas() {
    const ids = selecionados.contas
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      contasBancarias: r.contasBancarias.filter((x) => !ids.includes(x.id)),
    }))
    limparSel('contas')
  }

  function adicionarTributo() {
    patchRascunho((r) => ({
      ...r,
      tributos: {
        ...r.tributos,
        linhas: [...r.tributos.linhas, { id: newOrgId('tr'), tipo: '', aliquotaPct: '', documento: '' }],
      },
    }))
  }

  function excluirTributosSelecionados() {
    const ids = selecionados.tributos
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      tributos: { ...r.tributos, linhas: r.tributos.linhas.filter((x) => !ids.includes(x.id)) },
    }))
    limparSel('tributos')
  }

  function adicionarEmail() {
    patchRascunho((r) => ({
      ...r,
      contato: {
        ...r.contato,
        emails: [...r.contato.emails, { id: newOrgId('em'), tipo: 'Comercial', email: '', principal: false }],
      },
    }))
  }

  function excluirEmailsSelecionados() {
    const ids = selecionados.emails
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      contato: { ...r.contato, emails: r.contato.emails.filter((x) => !ids.includes(x.id)) },
    }))
    limparSel('emails')
  }

  function adicionarTelefone() {
    patchRascunho((r) => ({
      ...r,
      contato: {
        ...r.contato,
        telefones: [
          ...r.contato.telefones,
          { id: newOrgId('tel'), tipo: 'Comercial', pais: 'Brasil', ddi: '+55', numero: '' },
        ],
      },
    }))
  }

  function excluirTelefonesSelecionados() {
    const ids = selecionados.telefones
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      contato: { ...r.contato, telefones: r.contato.telefones.filter((x) => !ids.includes(x.id)) },
    }))
    limparSel('telefones')
  }

  function adicionarEndereco() {
    patchRascunho((r) => ({
      ...r,
      contato: {
        ...r.contato,
        enderecos: [
          ...r.contato.enderecos,
          {
            id: newOrgId('end'),
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: '',
            pais: 'Brasil',
          },
        ],
      },
    }))
  }

  function excluirEnderecosSelecionados() {
    const ids = selecionados.enderecos
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      contato: { ...r.contato, enderecos: r.contato.enderecos.filter((x) => !ids.includes(x.id)) },
    }))
    limparSel('enderecos')
  }

  function adicionarRede() {
    patchRascunho((r) => ({
      ...r,
      contato: {
        ...r.contato,
        redesSociais: [...r.contato.redesSociais, { id: newOrgId('rs'), rede: '', usuario: '', url: '' }],
      },
    }))
  }

  function excluirRedesSelecionadas() {
    const ids = selecionados.redes
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      contato: { ...r.contato, redesSociais: r.contato.redesSociais.filter((x) => !ids.includes(x.id)) },
    }))
    limparSel('redes')
  }

  function adicionarCargo() {
    patchRascunho((r) => ({
      ...r,
      cargosAtribuidos: [
        ...r.cargosAtribuidos,
        { id: newOrgId('cg'), cargo: '', unidade: snap.dadosUnidade.nome, titular: '' },
      ],
    }))
  }

  function excluirCargosSelecionados() {
    const ids = selecionados.cargos
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      cargosAtribuidos: r.cargosAtribuidos.filter((x) => !ids.includes(x.id)),
    }))
    limparSel('cargos')
  }

  function adicionarPessoa() {
    patchRascunho((r) => ({
      ...r,
      usuarios: [
        ...r.usuarios,
        {
          id: newOrgId('usr'),
          nome: '',
          cpf: '',
          email: '',
          cargo: OPCOES_CARGO_REF[0],
          condicao: OPCOES_CONDICAO_CARGO[0],
          origem: 'Parceiro',
          ativo: true,
        },
      ],
      usuariosCadastrados: r.usuariosCadastrados + 1,
    }))
  }

  function excluirPessoasSelecionadas() {
    const ids = selecionados.pessoas
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      usuarios: r.usuarios.filter((x) => !ids.includes(x.id)),
      usuariosCadastrados: Math.max(0, r.usuariosCadastrados - ids.length),
    }))
    limparSel('pessoas')
  }

  function adicionarConvite() {
    patchRascunho((r) => ({
      ...r,
      convites: [
        ...r.convites,
        {
          id: newOrgId('cv'),
          email: '',
          cargo: OPCOES_CARGO_REF[0],
          ativo: true,
          enviadoEm: new Date().toISOString().slice(0, 10),
        },
      ],
    }))
  }

  function excluirConvitesSelecionados() {
    const ids = selecionados.convites
    if (ids.length === 0) return
    patchRascunho((r) => ({
      ...r,
      convites: r.convites.filter((x) => !ids.includes(x.id)),
    }))
    limparSel('convites')
  }

  return (
    <section className="pc-page pc-page--org">
      <div className="pc-org-contextbar">
        <div className="pc-org-contextbar__title">
          <span className="material-symbols-outlined" aria-hidden>
            domain_add
          </span>
          <span>{title ?? 'Cadastro da organização'}</span>
        </div>
        <button type="button" className="pc-org-contextbar__close" aria-label="Fechar" onClick={onBack ?? onHome}>
          <span className="material-symbols-outlined" aria-hidden>
            close
          </span>
        </button>
      </div>

      <nav className="pc-breadcrumb" aria-label="Trilha">
        <button type="button" onClick={onHome}>
          <span className="material-symbols-outlined" aria-hidden>
            home
          </span>
        </button>
        {(breadcrumbTrail ?? ['Catálogo de Serviços - Atlas', 'Cadastro da organização']).map((item, idx) => (
          <span key={`${item}-${idx}`}>
            <span>/</span>
            {onBack && idx === 0 ? (
              <button type="button" className="pc-linkish" onClick={onBack}>
                {item}
              </button>
            ) : (
              <span>{item}</span>
            )}
          </span>
        ))}
      </nav>

      <header className="pc-org-header">
        <div>
          <h1>{title ?? 'Cadastro da organização'}</h1>
        </div>
      </header>

      {dirty && cadastro.statusAprovacao !== 'Aguardando MTI' && (
        <div className="sy-alert sy-alert--warning" role="status">
          <span className="material-symbols-outlined" aria-hidden>
            edit_note
          </span>
          <p>
            Há alterações em rascunho. Clique em <strong>Salvar</strong> para enviar à MTI para análise.
          </p>
        </div>
      )}

      {cadastro.motivoAjusteMti && (
        <div className="sy-alert sy-alert--danger" role="alert">
          <span className="material-symbols-outlined" aria-hidden>
            error
          </span>
          <div>
            <strong>Ajuste solicitado pela MTI</strong>
            <p>{cadastro.motivoAjusteMti}</p>
          </div>
        </div>
      )}

      <div className="pc-org-main">
        <article className="pc-org-sydle-form sy-dem-form">
          <p className="pc-org-sydle-form__intro">
            Formulário para completar o cadastro da organização <span className="pc-req">*</span>
          </p>
          <div className="sy-accordion" aria-label="Seções do cadastro">
            <AccordionBlock
              id="dados-cadastro"
              title="Dados do Cadastro"
              icon="badge"
              open={acordeoesAbertos.includes('dados-cadastro')}
              onToggle={toggleAcordeao}
            >
              <div className="sy-alert sy-alert--warning" role="status">
                <span className="material-symbols-outlined" aria-hidden>
                  warning
                </span>
                <div>
                  <strong>Protheus</strong>
                  <p>
                    Não foi possível se conectar ao Protheus para obtenção automática do código do
                    Cliente/Parceiro.
                  </p>
                </div>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">
                    Nome<span className="pc-req"> *</span>
                  </span>
                  <input className="sy-dem-input" type="text" value={snap.dadosUnidade.nome} readOnly />
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">
                    Sigla<span className="pc-req"> *</span>
                  </span>
                  <input className="sy-dem-input" type="text" value={snap.dadosUnidade.sigla} readOnly />
                </label>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">
                    CNPJ<span className="pc-req"> *</span>
                  </span>
                  <input className="sy-dem-input" type="text" value={snap.dadosCadastro.cnpj} readOnly />
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Código do cliente/parceiro</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={snap.dadosUnidade.codigoClienteParceiro || 'vazio'}
                    readOnly
                  />
                </label>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field pc-org-toggle-field">
                  <span className="sy-dem-label">Ativo</span>
                  <span className="pc-org-toggle" aria-label={snap.dadosUnidade.ativo ? 'Ativo' : 'Inativo'}>
                    <input
                      type="checkbox"
                      className="pc-org-toggle__input"
                      checked={snap.dadosUnidade.ativo}
                      readOnly
                      disabled
                      tabIndex={-1}
                    />
                    <span
                      className={`pc-org-toggle__track${snap.dadosUnidade.ativo ? ' pc-org-toggle__track--on' : ''}`}
                      aria-hidden
                    />
                  </span>
                </label>
              </div>
            </AccordionBlock>

            <AccordionBlock
              id="dados-org"
              title="Dados da Organização"
              icon="business"
              open={acordeoesAbertos.includes('dados-org')}
              onToggle={toggleAcordeao}
            >
              <div className="sy-alert sy-alert--warning" role="status">
                <span className="material-symbols-outlined" aria-hidden>
                  info
                </span>
                <div>
                  <strong>Consulta CNPJ</strong>
                  <p>
                    Não foi possível se conectar à API de Consulta de CNPJ para obtenção automática das
                    informações do Cliente/Parceiro. Se desejar, pode inserir manualmente.
                  </p>
                </div>
              </div>
              <h3 className="sy-accordion__section-title">Identificação</h3>
              <div className="sy-dem-row sy-dem-row--2">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Razão social</span>
                <input
                  className="sy-dem-input"
                  type="text"
                  value={snap.dadosCadastro.razaoSocial}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      dadosCadastro: { ...r.dadosCadastro, razaoSocial: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">Nome fantasia</span>
                <input
                  className="sy-dem-input"
                  type="text"
                  value={snap.dadosCadastro.nomeFantasia}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      dadosCadastro: { ...r.dadosCadastro, nomeFantasia: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
            <div className="sy-dem-row sy-dem-row--1">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Natureza jurídica</span>
                <input
                  className="sy-dem-input"
                  type="text"
                  value={snap.dadosCadastro.naturezaJuridica}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      dadosCadastro: { ...r.dadosCadastro, naturezaJuridica: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
            <h3 className="sy-accordion__section-title">Inscrições e CNAE</h3>
            <div className="sy-dem-row sy-dem-row--4">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Inscrição municipal</span>
                <input
                  className="sy-dem-input"
                  type="text"
                  value={snap.dadosCadastro.inscricaoMunicipal}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      dadosCadastro: { ...r.dadosCadastro, inscricaoMunicipal: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">Inscrição estadual</span>
                <input
                  className="sy-dem-input"
                  type="text"
                  value={snap.dadosCadastro.inscricaoEstadual}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      dadosCadastro: { ...r.dadosCadastro, inscricaoEstadual: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">CNAE (atividade principal)</span>
                <input
                  className="sy-dem-input"
                  type="text"
                  value={snap.dadosCadastro.cnae}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      dadosCadastro: { ...r.dadosCadastro, cnae: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">CNAE (atividade secundária)</span>
                <input
                  className="sy-dem-input"
                  type="text"
                  value={snap.dadosCadastro.cnaeSecundaria}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      dadosCadastro: { ...r.dadosCadastro, cnaeSecundaria: e.target.value },
                    }))
                  }
                />
              </label>
            </div>

            <h3 className="sy-accordion__section-title">Contas bancárias</h3>
            <div className="pc-org-table-panel">
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarConta}
                  onDelete={excluirContasSelecionadas}
                  canDelete={selecionados.contas.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                {(() => {
                  const contas = snap.contasBancarias
                  const showBancariosCol =
                    contas.length === 0 ||
                    contas.some((c) => !contaModoSomentePix(c.tipoChavePix))
                  const showPixCol =
                    contas.length === 0 ||
                    contas.some((c) => {
                      const somentePix = contaModoSomentePix(c.tipoChavePix)
                      return somentePix || !contaOcultaPix(c.tipoConta)
                    })
                  return (
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'contas',
                                snap.contasBancarias.map((c) => c.id),
                              )}
                              onChange={() =>
                                toggleSelTodos(
                                  'contas',
                                  snap.contasBancarias.map((c) => c.id),
                                )
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      {showBancariosCol && <OrgTh required>Tipo de conta</OrgTh>}
                      {showPixCol && <OrgTh required>Tipo de chave Pix</OrgTh>}
                      {showBancariosCol && <OrgTh required>Banco</OrgTh>}
                      {showBancariosCol && <OrgTh required>Agência</OrgTh>}
                      {showBancariosCol && <OrgTh required>Conta (com dígito)</OrgTh>}
                      {showBancariosCol && <OrgTh required>CPF/CNPJ</OrgTh>}
                      {showPixCol && <OrgTh>Chave Pix</OrgTh>}
                    </tr>
                  </thead>
                  <tbody>
                    {contas.map((c) => {
                      const somentePix = contaModoSomentePix(c.tipoChavePix)
                      const ocultaPix = !somentePix && contaOcultaPix(c.tipoConta)
                      const mostraBancarios = !somentePix
                      const mostraPix = !ocultaPix
                      return (
                        <tr
                          key={c.id}
                          className={
                            selecionados.contas.includes(c.id) ? 'pc-org-table__row--selected' : undefined
                          }
                        >
                          {editavel && (
                            <td className="pc-org-table__check">
                              <label className="pc-org-list-check">
                                <input
                                  type="checkbox"
                                  checked={selecionados.contas.includes(c.id)}
                                  onChange={() => toggleSel('contas', c.id)}
                                />
                              </label>
                            </td>
                          )}
                          {showBancariosCol && (
                          <td>
                            {mostraBancarios ? (
                              <SelectOpcoes
                                value={c.tipoConta}
                                options={OPCOES_TIPO_CONTA}
                                disabled={!editavel}
                                allowEmpty
                                onChange={(v) =>
                                  patchRascunho((r) => ({
                                    ...r,
                                    contasBancarias: r.contasBancarias.map((x) => {
                                      if (x.id !== c.id) return x
                                      const limpaPix = contaOcultaPix(v)
                                      return {
                                        ...x,
                                        tipoConta: v,
                                        ...(limpaPix ? { tipoChavePix: '', chavePix: '' } : {}),
                                      }
                                    }),
                                  }))
                                }
                              />
                            ) : null}
                          </td>
                          )}
                          {showPixCol && (
                          <td>
                            {mostraPix ? (
                              <SelectOpcoes
                                value={c.tipoChavePix ?? ''}
                                options={OPCOES_TIPO_CHAVE_PIX}
                                disabled={!editavel}
                                allowEmpty
                                onChange={(v) =>
                                  patchRascunho((r) => ({
                                    ...r,
                                    contasBancarias: r.contasBancarias.map((x) =>
                                      x.id === c.id
                                        ? { ...x, tipoChavePix: v, ...(v ? {} : { chavePix: '' }) }
                                        : x,
                                    ),
                                  }))
                                }
                              />
                            ) : null}
                          </td>
                          )}
                          {showBancariosCol && (
                          <td>
                            {mostraBancarios ? (
                              <SelectOpcoes
                                value={c.banco}
                                options={OPCOES_BANCO}
                                disabled={!editavel}
                                allowEmpty
                                onChange={(v) =>
                                  patchRascunho((r) => ({
                                    ...r,
                                    contasBancarias: r.contasBancarias.map((x) =>
                                      x.id === c.id ? { ...x, banco: v } : x,
                                    ),
                                  }))
                                }
                              />
                            ) : null}
                          </td>
                          )}
                          {showBancariosCol && (
                          <td>
                            {mostraBancarios ? (
                              <input
                                className="sy-dem-input"
                                type="text"
                                value={c.agencia}
                                readOnly={!editavel}
                                onChange={(e) =>
                                  patchRascunho((r) => ({
                                    ...r,
                                    contasBancarias: r.contasBancarias.map((x) =>
                                      x.id === c.id ? { ...x, agencia: e.target.value } : x,
                                    ),
                                  }))
                                }
                              />
                            ) : null}
                          </td>
                          )}
                          {showBancariosCol && (
                          <td>
                            {mostraBancarios ? (
                              <input
                                className="sy-dem-input"
                                type="text"
                                value={c.numeroConta}
                                readOnly={!editavel}
                                onChange={(e) =>
                                  patchRascunho((r) => ({
                                    ...r,
                                    contasBancarias: r.contasBancarias.map((x) =>
                                      x.id === c.id ? { ...x, numeroConta: e.target.value } : x,
                                    ),
                                  }))
                                }
                              />
                            ) : null}
                          </td>
                          )}
                          {showBancariosCol && (
                          <td>
                            {mostraBancarios ? (
                              <input
                                className="sy-dem-input"
                                type="text"
                                value={c.cpfCnpj ?? ''}
                                readOnly={!editavel}
                                onChange={(e) =>
                                  patchRascunho((r) => ({
                                    ...r,
                                    contasBancarias: r.contasBancarias.map((x) =>
                                      x.id === c.id ? { ...x, cpfCnpj: e.target.value } : x,
                                    ),
                                  }))
                                }
                              />
                            ) : null}
                          </td>
                          )}
                          {showPixCol && (
                          <td>
                            {mostraPix ? (
                              <input
                                className="sy-dem-input"
                                type="text"
                                value={c.chavePix ?? ''}
                                placeholder="vazio"
                                readOnly={!editavel}
                                onChange={(e) =>
                                  patchRascunho((r) => ({
                                    ...r,
                                    contasBancarias: r.contasBancarias.map((x) =>
                                      x.id === c.id ? { ...x, chavePix: e.target.value } : x,
                                    ),
                                  }))
                                }
                              />
                            ) : null}
                          </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                  )
                })()}
              </div>
              {editavel && <OrgListFab onAdd={adicionarConta} label="Adicionar conta" />}
            </div>
            </AccordionBlock>

            <AccordionBlock
              id="documentos"
              title="Documentos"
              icon="folder_open"
              open={acordeoesAbertos.includes('documentos')}
              onToggle={toggleAcordeao}
            >
              <p className="pc-org-dados__hint">
                Etapas definidas pela MTI no back-office (Etapa → Grupo → Documento). Anexe os arquivos
                solicitados; ao salvar, o cadastro é enviado para análise.
              </p>
              <div className="sy-dem-row sy-dem-row--2 pc-org-etapas-meta">
                <div className="sy-dem-field">
                  <span className="sy-dem-label">Etapas a incluir</span>
                  <div className="pc-org-etapa-chips">
                    {etapas.length === 0 ? (
                      <span className="pc-org-etapa-chips__empty">vazio</span>
                    ) : (
                      etapas.map((etapa) => (
                        <span key={etapa.id} className="pc-org-etapa-chip">
                          {etapa.nome}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="sy-dem-field">
                  <span className="sy-dem-label">Progresso</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={
                      geral.total === 0
                        ? 'vazio'
                        : `${geral.preenchidos}/${geral.total} (${geral.pct}%)`
                    }
                    readOnly
                  />
                </div>
              </div>
              <h3 className="sy-accordion__section-title">
                Etapas incluídas<span className="pc-req"> *</span>
              </h3>
              <div className="sy-accordion sy-accordion--nested" aria-label="Etapas documentacionais">
                {etapas.map((etapa) => {
                  const etapaAberta = etapasAbertas.includes(etapa.id)
                  return (
                    <div
                      key={etapa.id}
                      className={`sy-accordion__item${etapaAberta ? ' sy-accordion__item--open' : ''}`}
                    >
                      <button
                        type="button"
                        className="sy-accordion__trigger"
                        aria-expanded={etapaAberta}
                        onClick={() => toggleEtapa(etapa.id)}
                      >
                        <span className="material-symbols-outlined sy-accordion__chevron" aria-hidden>
                          {etapaAberta ? 'expand_more' : 'chevron_right'}
                        </span>
                        <span className="sy-accordion__title">{etapa.nome}</span>
                        <span
                          className={`sy-badge ${
                            etapa.preenchidos === etapa.total && etapa.total > 0
                              ? 'sy-badge--success'
                              : 'sy-badge--neutral'
                          }`}
                        >
                          {etapa.preenchidos}/{etapa.total}
                        </span>
                      </button>
                      {etapaAberta && (
                        <div className="sy-accordion__panel">
                          <div className="sy-accordion sy-accordion--nested" aria-label={`Grupos de ${etapa.nome}`}>
                            {etapa.grupos.map((grupo) => {
                              const aberto = gruposAbertos.includes(grupo.id)
                              const docsGrupo = snap.documentosMipp.filter(
                                (d) => d.etapa === etapa.nome && d.grupo === grupo.nome,
                              )
                              return (
                                <div
                                  key={grupo.id}
                                  className={`sy-accordion__item${aberto ? ' sy-accordion__item--open' : ''}`}
                                >
                                  <button
                                    type="button"
                                    className="sy-accordion__trigger"
                                    aria-expanded={aberto}
                                    onClick={() => toggleGrupo(grupo.id)}
                                  >
                                    <span className="material-symbols-outlined sy-accordion__chevron" aria-hidden>
                                      {aberto ? 'expand_more' : 'chevron_right'}
                                    </span>
                                    <span className="sy-accordion__title">{grupo.nome}</span>
                                    <span
                                      className={`sy-badge ${
                                        grupo.preenchidos === grupo.total ? 'sy-badge--success' : 'sy-badge--neutral'
                                      }`}
                                    >
                                      {grupo.preenchidos}/{grupo.total}
                                    </span>
                                  </button>
                                  {aberto && (
                                    <div className="sy-accordion__panel">
                                      <table className="sy-table">
                                        <thead>
                                          <tr>
                                            <th>Descrição</th>
                                            <th>Anexo</th>
                                            <th>Status</th>
                                            <th />
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {docsGrupo.map((doc) => (
                                            <tr
                                              key={doc.id}
                                              className={
                                                doc.status === 'Recusado' ? 'sy-table__row--danger' : undefined
                                              }
                                            >
                                              <td>
                                                {doc.tipo}
                                                <span className="pc-req"> *</span>
                                              </td>
                                              <td>
                                                <div className="sy-anexo">
                                                  {doc.arquivo && (
                                                    <span className="sy-anexo__file">
                                                      <span className="material-symbols-outlined" aria-hidden>
                                                        picture_as_pdf
                                                      </span>
                                                      {doc.arquivo}
                                                    </span>
                                                  )}
                                                  {editavel && (
                                                    <button
                                                      type="button"
                                                      className="sy-btn-icon"
                                                      aria-label={`Anexar ${doc.tipo}`}
                                                      onClick={() => abrirUpload('mipp', doc.id)}
                                                    >
                                                      <span className="material-symbols-outlined" aria-hidden>
                                                        upload
                                                      </span>
                                                    </button>
                                                  )}
                                                </div>
                                              </td>
                                              <td>
                                                <span className={`sy-badge ${badgeClassStatusDoc(doc.status)}`}>
                                                  {doc.status}
                                                </span>
                                              </td>
                                              <td>
                                                <button
                                                  type="button"
                                                  className="pc-btn pc-btn--sm"
                                                  onClick={() => abrirDocDetalhe('mipp', doc.id)}
                                                >
                                                  Detalhes
                                                  <span className="material-symbols-outlined" aria-hidden>
                                                    open_in_new
                                                  </span>
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </AccordionBlock>

            <AccordionBlock
              id="habilitacao"
              title="Habilitação documental"
              icon="verified"
              open={acordeoesAbertos.includes('habilitacao')}
              onToggle={toggleAcordeao}
            >
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Status da habilitação</span>
                  <input className="sy-dem-input" type="text" value={cadastro.statusHabilitacao} readOnly />
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">NDA assinado</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={cadastro.ndaAssinado ? 'Sim' : 'Não'}
                    readOnly
                  />
                </label>
              </div>
              <h3 className="sy-accordion__section-title">Documentos de execução da parceria</h3>
              <div className={`sy-accordion__item${execucaoAberto ? ' sy-accordion__item--open' : ''}`}>
                <button
                  type="button"
                  className="sy-accordion__trigger"
                  aria-expanded={execucaoAberto}
                  onClick={() => toggleGrupo(GRUPO_EXECUCAO_ID)}
                >
                  <span className="material-symbols-outlined sy-accordion__chevron" aria-hidden>
                    {execucaoAberto ? 'expand_more' : 'chevron_right'}
                  </span>
                  <span className="sy-accordion__title">Documentos de execução da parceria</span>
                  <span
                    className={`sy-badge ${
                      execucaoPreenchidos === snap.docsExecucao.length ? 'sy-badge--success' : 'sy-badge--neutral'
                    }`}
                  >
                    {execucaoPreenchidos}/{snap.docsExecucao.length}
                  </span>
                </button>
                {execucaoAberto && (
                  <div className="sy-accordion__panel">
                    <table className="sy-table">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Arquivo</th>
                          <th>Origem</th>
                          <th>Status</th>
                          <th>Anexo</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {snap.docsExecucao.map((doc) => (
                          <tr key={doc.id}>
                            <td>{doc.tipo}</td>
                            <td>
                              {doc.arquivo ? (
                                <span className="sy-anexo__file">
                                  <span className="material-symbols-outlined" aria-hidden>
                                    picture_as_pdf
                                  </span>
                                  {doc.arquivo}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>
                              <span
                                className={`sy-badge ${doc.origem === 'MTI' ? 'sy-badge--neutral' : 'sy-badge--warning'}`}
                              >
                                {doc.origem}
                              </span>
                            </td>
                            <td>
                              <span className={`sy-badge ${badgeClassStatusDoc(doc.status)}`}>{doc.status}</span>
                            </td>
                            <td>
                              {editavel && doc.origem !== 'MTI' && (
                                <button
                                  type="button"
                                  className="sy-btn-icon"
                                  aria-label={`Anexar ${doc.tipo}`}
                                  onClick={() => abrirUpload('execucao', doc.id)}
                                >
                                  <span className="material-symbols-outlined" aria-hidden>
                                    upload
                                  </span>
                                </button>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="pc-btn pc-btn--sm"
                                onClick={() => abrirDocDetalhe('execucao', doc.id)}
                              >
                                Detalhes
                                <span className="material-symbols-outlined" aria-hidden>
                                  open_in_new
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </AccordionBlock>

            <AccordionBlock
              id="tributos"
              title="Tributos e Encargos"
              icon="account_balance"
              open={acordeoesAbertos.includes('tributos')}
              onToggle={toggleAcordeao}
            >
              <h3 className="sy-accordion__section-title">Regime e isenções</h3>
            <div className="sy-dem-row sy-dem-row--1">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Regime</span>
                <select
                  className="sy-dem-input"
                  value={snap.tributos.regimeTributacao}
                  disabled={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      tributos: { ...r.tributos, regimeTributacao: e.target.value },
                    }))
                  }
                >
                  {OPCOES_REGIME_TRIBUTACAO.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="sy-dem-row sy-dem-row--2">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Isento ICMS</span>
                <select
                  className="sy-dem-input"
                  value={snap.tributos.isentoIcms ? 'Sim' : 'Não'}
                  disabled={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      tributos: {
                        ...r.tributos,
                        isentoIcms: e.target.value === 'Sim',
                        isentoIcmsDoc: e.target.value === 'Sim' ? r.tributos.isentoIcmsDoc : undefined,
                      },
                    }))
                  }
                >
                  <option>Não</option>
                  <option>Sim</option>
                </select>
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">Documento de isenção ICMS</span>
                <div className="pc-org-table__doc">
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={snap.tributos.isentoIcmsDoc ?? ''}
                    readOnly
                    placeholder={snap.tributos.isentoIcms ? 'Anexe o documento' : '—'}
                    disabled={!snap.tributos.isentoIcms}
                  />
                  {editavel && snap.tributos.isentoIcms && (
                    <button
                      type="button"
                      className="pc-org-table__upload"
                      aria-label="Anexar documento de isenção ICMS"
                      onClick={() =>
                        patchRascunho((r) => ({
                          ...r,
                          tributos: { ...r.tributos, isentoIcmsDoc: `isencao_icms_${Date.now()}.pdf` },
                        }))
                      }
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        upload
                      </span>
                    </button>
                  )}
                </div>
              </label>
            </div>
            <div className="sy-dem-row sy-dem-row--2">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Isento IE</span>
                <select
                  className="sy-dem-input"
                  value={snap.tributos.isentoInscricaoEstadual ? 'Sim' : 'Não'}
                  disabled={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      tributos: {
                        ...r.tributos,
                        isentoInscricaoEstadual: e.target.value === 'Sim',
                        isentoIeDoc: e.target.value === 'Sim' ? r.tributos.isentoIeDoc : undefined,
                      },
                    }))
                  }
                >
                  <option>Não</option>
                  <option>Sim</option>
                </select>
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">Documento de isenção IE</span>
                <div className="pc-org-table__doc">
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={snap.tributos.isentoIeDoc ?? ''}
                    readOnly
                    placeholder={snap.tributos.isentoInscricaoEstadual ? 'Anexe o documento' : '—'}
                    disabled={!snap.tributos.isentoInscricaoEstadual}
                  />
                  {editavel && snap.tributos.isentoInscricaoEstadual && (
                    <button
                      type="button"
                      className="pc-org-table__upload"
                      aria-label="Anexar documento de isenção IE"
                      onClick={() =>
                        patchRascunho((r) => ({
                          ...r,
                          tributos: { ...r.tributos, isentoIeDoc: `isencao_ie_${Date.now()}.pdf` },
                        }))
                      }
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        upload
                      </span>
                    </button>
                  )}
                </div>
              </label>
            </div>
            <div className="sy-dem-row sy-dem-row--1">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Observação</span>
                <textarea
                  className="sy-dem-input sy-dem-input--area"
                  rows={2}
                  value={snap.tributos.observacao ?? ''}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      tributos: { ...r.tributos, observacao: e.target.value },
                    }))
                  }
                />
              </label>
            </div>

          <section className="sy-dem-section">
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">
                Alíquotas e documentos{editavel ? <span className="pc-req"> *</span> : null}
              </h3>
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarTributo}
                  onDelete={excluirTributosSelecionados}
                  canDelete={selecionados.tributos.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'tributos',
                                snap.tributos.linhas.map((l) => l.id),
                              )}
                              onChange={() =>
                                toggleSelTodos(
                                  'tributos',
                                  snap.tributos.linhas.map((l) => l.id),
                                )
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      <OrgTh required>Tipo</OrgTh>
                      <OrgTh required>Alíquota (%)</OrgTh>
                      <OrgTh required>Documento</OrgTh>
                    </tr>
                  </thead>
                <tbody>
                  {snap.tributos.linhas.map((linha) => (
                    <tr
                      key={linha.id}
                      className={
                        selecionados.tributos.includes(linha.id) ? 'pc-org-table__row--selected' : undefined
                      }
                    >
                      {editavel && (
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.tributos.includes(linha.id)}
                              onChange={() => toggleSel('tributos', linha.id)}
                            />
                          </label>
                        </td>
                      )}
                      <td>
                        <SelectOpcoes
                          value={linha.tipo}
                          options={OPCOES_TIPO_TRIBUTO}
                          disabled={!editavel}
                          allowEmpty
                          onChange={(v) =>
                            patchRascunho((r) => ({
                              ...r,
                              tributos: {
                                ...r.tributos,
                                linhas: r.tributos.linhas.map((x) =>
                                  x.id === linha.id ? { ...x, tipo: v } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="number"
                          step="0.01"
                          value={linha.aliquotaPct}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              tributos: {
                                ...r.tributos,
                                linhas: r.tributos.linhas.map((x) =>
                                  x.id === linha.id ? { ...x, aliquotaPct: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <div className="pc-org-table__doc">
                          <input
                            className="sy-dem-input"
                            type="text"
                            value={linha.documento ?? ''}
                            readOnly={!editavel}
                            placeholder="Arquivo ou referência"
                            onChange={(ev) =>
                              patchRascunho((r) => ({
                                ...r,
                                tributos: {
                                  ...r.tributos,
                                  linhas: r.tributos.linhas.map((x) =>
                                    x.id === linha.id ? { ...x, documento: ev.target.value } : x,
                                  ),
                                },
                              }))
                            }
                          />
                          {editavel && (
                            <button
                              type="button"
                              className="pc-org-table__upload"
                              aria-label="Anexar documento"
                              onClick={() =>
                                patchRascunho((r) => ({
                                  ...r,
                                  tributos: {
                                    ...r.tributos,
                                    linhas: r.tributos.linhas.map((x) =>
                                      x.id === linha.id
                                        ? { ...x, documento: `documento_${linha.id}.pdf` }
                                        : x,
                                    ),
                                  },
                                }))
                              }
                            >
                              <span className="material-symbols-outlined" aria-hidden>
                                upload
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              {editavel && <OrgListFab onAdd={adicionarTributo} label="Adicionar alíquota" />}
            </div>
          </section>
            </AccordionBlock>

            <AccordionBlock
              id="contato"
              title="Contato"
              icon="contact_mail"
              open={acordeoesAbertos.includes('contato')}
              onToggle={toggleAcordeao}
            >
          <section className="sy-dem-section">
            <h3 className="sy-dem-section__title">Contato principal</h3>
            <div className="sy-dem-row sy-dem-row--1">
              <label className="sy-dem-field">
                <span className="sy-dem-label">E-mail principal</span>
                <input
                  className="sy-dem-input"
                  type="email"
                  value={emailPrincipal}
                  readOnly={!editavel}
                  onChange={(e) =>
                    patchRascunho((r) => ({
                      ...r,
                      contato: {
                        ...r.contato,
                        emails: r.contato.emails.map((x) =>
                          x.principal ? { ...x, email: e.target.value } : x,
                        ),
                      },
                    }))
                  }
                />
              </label>
            </div>
          </section>

          <section className="sy-dem-section">
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">
                E-mails{editavel ? <span className="pc-req"> *</span> : null}
              </h3>
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarEmail}
                  onDelete={excluirEmailsSelecionados}
                  canDelete={selecionados.emails.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'emails',
                                snap.contato.emails.map((e) => e.id),
                              )}
                              onChange={() =>
                                toggleSelTodos('emails', snap.contato.emails.map((e) => e.id))
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      <OrgTh required>Tipo</OrgTh>
                      <OrgTh required>E-mail</OrgTh>
                      <OrgTh>Principal</OrgTh>
                    </tr>
                  </thead>
                <tbody>
                  {snap.contato.emails.map((e) => (
                    <tr
                      key={e.id}
                      className={
                        selecionados.emails.includes(e.id) ? 'pc-org-table__row--selected' : undefined
                      }
                    >
                      {editavel && (
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.emails.includes(e.id)}
                              onChange={() => toggleSel('emails', e.id)}
                            />
                          </label>
                        </td>
                      )}
                      <td>
                        <SelectOpcoes
                          value={e.tipo}
                          options={OPCOES_TIPO_EMAIL}
                          disabled={!editavel}
                          allowEmpty
                          onChange={(v) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                emails: r.contato.emails.map((x) =>
                                  x.id === e.id ? { ...x, tipo: v } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="email"
                          value={e.email}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                emails: r.contato.emails.map((x) =>
                                  x.id === e.id ? { ...x, email: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="sy-dem-input"
                          value={e.principal ? 'Sim' : 'Não'}
                          disabled={!editavel}
                          onChange={(ev) => {
                            const tornarPrincipal = ev.target.value === 'Sim'
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                emails: r.contato.emails.map((x) => ({
                                  ...x,
                                  principal: tornarPrincipal ? x.id === e.id : x.id === e.id ? false : x.principal,
                                })),
                              },
                            }))
                          }}
                        >
                          <option>Não</option>
                          <option>Sim</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              {editavel && <OrgListFab onAdd={adicionarEmail} label="Adicionar e-mail" />}
            </div>
          </section>

          <section className="sy-dem-section">
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">
                Telefones{editavel ? <span className="pc-req"> *</span> : null}
              </h3>
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarTelefone}
                  onDelete={excluirTelefonesSelecionados}
                  canDelete={selecionados.telefones.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'telefones',
                                snap.contato.telefones.map((t) => t.id),
                              )}
                              onChange={() =>
                                toggleSelTodos(
                                  'telefones',
                                  snap.contato.telefones.map((t) => t.id),
                                )
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      <OrgTh required>Tipo</OrgTh>
                      <OrgTh>País</OrgTh>
                      <OrgTh required>DDI</OrgTh>
                      <OrgTh required>Número</OrgTh>
                    </tr>
                  </thead>
                <tbody>
                  {snap.contato.telefones.map((t) => (
                    <tr
                      key={t.id}
                      className={
                        selecionados.telefones.includes(t.id) ? 'pc-org-table__row--selected' : undefined
                      }
                    >
                      {editavel && (
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.telefones.includes(t.id)}
                              onChange={() => toggleSel('telefones', t.id)}
                            />
                          </label>
                        </td>
                      )}
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={t.tipo}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                telefones: r.contato.telefones.map((x) =>
                                  x.id === t.id ? { ...x, tipo: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={t.pais}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                telefones: r.contato.telefones.map((x) =>
                                  x.id === t.id ? { ...x, pais: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={t.ddi}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                telefones: r.contato.telefones.map((x) =>
                                  x.id === t.id ? { ...x, ddi: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={t.numero}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                telefones: r.contato.telefones.map((x) =>
                                  x.id === t.id ? { ...x, numero: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              {editavel && <OrgListFab onAdd={adicionarTelefone} label="Adicionar telefone" />}
            </div>
          </section>

          <section className="sy-dem-section">
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">
                Endereços{editavel ? <span className="pc-req"> *</span> : null}
              </h3>
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarEndereco}
                  onDelete={excluirEnderecosSelecionados}
                  canDelete={selecionados.enderecos.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'enderecos',
                                snap.contato.enderecos.map((en) => en.id),
                              )}
                              onChange={() =>
                                toggleSelTodos(
                                  'enderecos',
                                  snap.contato.enderecos.map((en) => en.id),
                                )
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      <OrgTh required>CEP</OrgTh>
                      <OrgTh required>Logradouro</OrgTh>
                      <OrgTh required>Número</OrgTh>
                      <OrgTh>Complemento</OrgTh>
                      <OrgTh required>Bairro</OrgTh>
                      <OrgTh required>Cidade</OrgTh>
                      <OrgTh required>UF</OrgTh>
                      <OrgTh required>País</OrgTh>
                    </tr>
                  </thead>
                <tbody>
                  {snap.contato.enderecos.map((en) => (
                    <tr
                      key={en.id}
                      className={
                        selecionados.enderecos.includes(en.id) ? 'pc-org-table__row--selected' : undefined
                      }
                    >
                      {editavel && (
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.enderecos.includes(en.id)}
                              onChange={() => toggleSel('enderecos', en.id)}
                            />
                          </label>
                        </td>
                      )}
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={en.cep}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                enderecos: r.contato.enderecos.map((x) =>
                                  x.id === en.id ? { ...x, cep: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={en.logradouro}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                enderecos: r.contato.enderecos.map((x) =>
                                  x.id === en.id ? { ...x, logradouro: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={en.numero}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                enderecos: r.contato.enderecos.map((x) =>
                                  x.id === en.id ? { ...x, numero: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={en.complemento}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                enderecos: r.contato.enderecos.map((x) =>
                                  x.id === en.id ? { ...x, complemento: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={en.bairro}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                enderecos: r.contato.enderecos.map((x) =>
                                  x.id === en.id ? { ...x, bairro: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={en.cidade}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                enderecos: r.contato.enderecos.map((x) =>
                                  x.id === en.id ? { ...x, cidade: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={en.uf}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                enderecos: r.contato.enderecos.map((x) =>
                                  x.id === en.id ? { ...x, uf: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={en.pais}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                enderecos: r.contato.enderecos.map((x) =>
                                  x.id === en.id ? { ...x, pais: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              {editavel && <OrgListFab onAdd={adicionarEndereco} label="Adicionar endereço" />}
            </div>
          </section>

          <section className="sy-dem-section">
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">
                Redes sociais{editavel ? <span className="pc-req"> *</span> : null}
              </h3>
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarRede}
                  onDelete={excluirRedesSelecionadas}
                  canDelete={selecionados.redes.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'redes',
                                snap.contato.redesSociais.map((rs) => rs.id),
                              )}
                              onChange={() =>
                                toggleSelTodos(
                                  'redes',
                                  snap.contato.redesSociais.map((rs) => rs.id),
                                )
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      <OrgTh required>Rede</OrgTh>
                      <OrgTh>Usuário</OrgTh>
                      <OrgTh required>URL</OrgTh>
                    </tr>
                  </thead>
                <tbody>
                  {snap.contato.redesSociais.map((rs) => (
                    <tr
                      key={rs.id}
                      className={
                        selecionados.redes.includes(rs.id) ? 'pc-org-table__row--selected' : undefined
                      }
                    >
                      {editavel && (
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.redes.includes(rs.id)}
                              onChange={() => toggleSel('redes', rs.id)}
                            />
                          </label>
                        </td>
                      )}
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={rs.rede}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                redesSociais: r.contato.redesSociais.map((x) =>
                                  x.id === rs.id ? { ...x, rede: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={rs.usuario}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                redesSociais: r.contato.redesSociais.map((x) =>
                                  x.id === rs.id ? { ...x, usuario: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={rs.url}
                          readOnly={!editavel}
                          onChange={(ev) =>
                            patchRascunho((r) => ({
                              ...r,
                              contato: {
                                ...r.contato,
                                redesSociais: r.contato.redesSociais.map((x) =>
                                  x.id === rs.id ? { ...x, url: ev.target.value } : x,
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              {editavel && <OrgListFab onAdd={adicionarRede} label="Adicionar rede" />}
            </div>
          </section>
            </AccordionBlock>

            <AccordionBlock
              id="usuarios"
              title="Usuários"
              icon="group"
              open={acordeoesAbertos.includes('usuarios')}
              onToggle={toggleAcordeao}
            >
          <p className="pc-org-dados__hint">
            Somente o Responsável da organização acessa esta seção. O pré-cadastro usa os mesmos campos do
            back-office; o colaborador recebe e-mail para concluir em Meus dados.
          </p>
          <section className="sy-dem-section">
            <h3 className="sy-dem-section__title">Limites</h3>
            <div className="sy-dem-row sy-dem-row--2">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Limite usuários</span>
                <input className="sy-dem-input" type="text" value={String(snap.limiteUsuarios)} readOnly />
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">Usuários cadastrados</span>
                <input className="sy-dem-input" type="text" value={String(snap.usuariosCadastrados)} readOnly />
              </label>
            </div>
          </section>

          <section className="sy-dem-section">
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">
                Cargos atribuídos{editavel ? <span className="pc-req"> *</span> : null}
              </h3>
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarCargo}
                  onDelete={excluirCargosSelecionados}
                  canDelete={selecionados.cargos.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'cargos',
                                snap.cargosAtribuidos.map((c) => c.id),
                              )}
                              onChange={() =>
                                toggleSelTodos(
                                  'cargos',
                                  snap.cargosAtribuidos.map((c) => c.id),
                                )
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      <OrgTh required>Cargo</OrgTh>
                      <OrgTh required>Unidade</OrgTh>
                      <OrgTh>Titular</OrgTh>
                    </tr>
                  </thead>
                <tbody>
                  {snap.cargosAtribuidos.map((c) => (
                    <tr
                      key={c.id}
                      className={
                        selecionados.cargos.includes(c.id) ? 'pc-org-table__row--selected' : undefined
                      }
                    >
                      {editavel && (
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.cargos.includes(c.id)}
                              onChange={() => toggleSel('cargos', c.id)}
                            />
                          </label>
                        </td>
                      )}
                      <td>
                        <SelectOpcoes
                          value={c.cargo}
                          options={OPCOES_CARGO_REF}
                          disabled={!editavel}
                          allowEmpty
                          onChange={(v) =>
                            patchRascunho((r) => ({
                              ...r,
                              cargosAtribuidos: r.cargosAtribuidos.map((x) =>
                                x.id === c.id ? { ...x, cargo: v } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <SelectOpcoes
                          value={c.unidade}
                          options={OPCOES_UNIDADE_CAMINHO}
                          disabled={!editavel}
                          allowEmpty
                          onChange={(v) =>
                            patchRascunho((r) => ({
                              ...r,
                              cargosAtribuidos: r.cargosAtribuidos.map((x) =>
                                x.id === c.id ? { ...x, unidade: v } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <SelectOpcoes
                          value={c.titular ?? ''}
                          options={OPCOES_PESSOA_REF}
                          disabled={!editavel}
                          allowEmpty
                          onChange={(v) =>
                            patchRascunho((r) => ({
                              ...r,
                              cargosAtribuidos: r.cargosAtribuidos.map((x) =>
                                x.id === c.id ? { ...x, titular: v || undefined } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              {editavel && <OrgListFab onAdd={adicionarCargo} label="Adicionar cargo" />}
            </div>
          </section>

          <section className="sy-dem-section">
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">
                Pessoas nos cargos{editavel ? <span className="pc-req"> *</span> : null}
              </h3>
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarPessoa}
                  onDelete={excluirPessoasSelecionadas}
                  canDelete={selecionados.pessoas.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'pessoas',
                                snap.usuarios.map((u) => u.id),
                              )}
                              onChange={() =>
                                toggleSelTodos('pessoas', snap.usuarios.map((u) => u.id))
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      <OrgTh required>Nome</OrgTh>
                      <OrgTh required>CPF</OrgTh>
                      <OrgTh required>E-mail</OrgTh>
                      <OrgTh required>Cargo</OrgTh>
                      <OrgTh>Condição</OrgTh>
                      <OrgTh>Ativo</OrgTh>
                    </tr>
                  </thead>
                <tbody>
                  {snap.usuarios.map((u) => (
                    <tr
                      key={u.id}
                      className={
                        selecionados.pessoas.includes(u.id) ? 'pc-org-table__row--selected' : undefined
                      }
                    >
                      {editavel && (
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.pessoas.includes(u.id)}
                              onChange={() => toggleSel('pessoas', u.id)}
                            />
                          </label>
                        </td>
                      )}
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={u.nome}
                          readOnly={!editavel}
                          onChange={(e) =>
                            patchRascunho((r) => ({
                              ...r,
                              usuarios: r.usuarios.map((x) =>
                                x.id === u.id ? { ...x, nome: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={u.cpf}
                          readOnly={!editavel}
                          onChange={(e) =>
                            patchRascunho((r) => ({
                              ...r,
                              usuarios: r.usuarios.map((x) =>
                                x.id === u.id ? { ...x, cpf: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={u.email}
                          readOnly={!editavel}
                          onChange={(e) =>
                            patchRascunho((r) => ({
                              ...r,
                              usuarios: r.usuarios.map((x) =>
                                x.id === u.id ? { ...x, email: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <SelectOpcoes
                          value={u.cargo}
                          options={OPCOES_CARGO_REF}
                          disabled={!editavel}
                          allowEmpty
                          onChange={(v) =>
                            patchRascunho((r) => ({
                              ...r,
                              usuarios: r.usuarios.map((x) =>
                                x.id === u.id ? { ...x, cargo: v } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <SelectOpcoes
                          value={u.condicao}
                          options={OPCOES_CONDICAO_CARGO}
                          disabled={!editavel}
                          allowEmpty
                          onChange={(v) =>
                            patchRascunho((r) => ({
                              ...r,
                              usuarios: r.usuarios.map((x) =>
                                x.id === u.id ? { ...x, condicao: v } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="sy-dem-input"
                          value={u.ativo ? 'Sim' : 'Não'}
                          disabled={!editavel}
                          onChange={(e) =>
                            patchRascunho((r) => ({
                              ...r,
                              usuarios: r.usuarios.map((x) =>
                                x.id === u.id ? { ...x, ativo: e.target.value === 'Sim' } : x,
                              ),
                            }))
                          }
                        >
                          {OPCOES_BOOLEAN.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              {editavel && <OrgListFab onAdd={adicionarPessoa} label="Adicionar pessoa" />}
            </div>
          </section>

          <section className="sy-dem-section">
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">
                Convites{editavel ? <span className="pc-req"> *</span> : null}
              </h3>
              {editavel && (
                <OrgListToolbar
                  onAdd={adicionarConvite}
                  onDelete={excluirConvitesSelecionados}
                  canDelete={selecionados.convites.length > 0}
                />
              )}
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      {editavel && (
                        <th className="pc-org-table__check" scope="col">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={todosSelecionados(
                                'convites',
                                snap.convites.map((cv) => cv.id),
                              )}
                              onChange={() =>
                                toggleSelTodos('convites', snap.convites.map((cv) => cv.id))
                              }
                              aria-label="Selecionar todos"
                            />
                          </label>
                        </th>
                      )}
                      <OrgTh required>E-mail</OrgTh>
                      <OrgTh required>Cargo</OrgTh>
                      <OrgTh>Ativo</OrgTh>
                      <OrgTh>Enviado em</OrgTh>
                    </tr>
                  </thead>
                <tbody>
                  {snap.convites.map((cv) => (
                    <tr
                      key={cv.id}
                      className={
                        selecionados.convites.includes(cv.id) ? 'pc-org-table__row--selected' : undefined
                      }
                    >
                      {editavel && (
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.convites.includes(cv.id)}
                              onChange={() => toggleSel('convites', cv.id)}
                            />
                          </label>
                        </td>
                      )}
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={cv.email}
                          readOnly={!editavel}
                          onChange={(e) =>
                            patchRascunho((r) => ({
                              ...r,
                              convites: r.convites.map((x) =>
                                x.id === cv.id ? { ...x, email: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <SelectOpcoes
                          value={cv.cargo}
                          options={OPCOES_CARGO_REF}
                          disabled={!editavel}
                          allowEmpty
                          onChange={(v) =>
                            patchRascunho((r) => ({
                              ...r,
                              convites: r.convites.map((x) =>
                                x.id === cv.id ? { ...x, cargo: v } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="sy-dem-input"
                          value={cv.ativo ? 'Sim' : 'Não'}
                          disabled={!editavel}
                          onChange={(e) =>
                            patchRascunho((r) => ({
                              ...r,
                              convites: r.convites.map((x) =>
                                x.id === cv.id ? { ...x, ativo: e.target.value === 'Sim' } : x,
                              ),
                            }))
                          }
                        >
                          {OPCOES_BOOLEAN.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={new Date(
                            cv.enviadoEm.length === 10 ? `${cv.enviadoEm}T12:00:00` : cv.enviadoEm,
                          ).toLocaleDateString('pt-BR')}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              {editavel && <OrgListFab onAdd={adicionarConvite} label="Adicionar convite" />}
            </div>
          </section>
            </AccordionBlock>

          </div>
        </article>

      <OrgFormFooter
        primaryLabel="Salvar"
        primaryIcon="check"
        cancelDisabled={aguardandoMti || !dirty}
        primaryDisabled={
          aguardandoMti ||
          !editavel ||
          (!dirty && cadastro.statusAprovacao !== 'Ajuste solicitado')
        }
        onCancel={cancelarAlteracoes}
        onPrimary={salvarEEnviarParaMti}
      />
      </div>

      {(docDetalheMipp || docDetalheExec) && (
        <div className="pc-modal-backdrop" role="presentation" onClick={fecharDocDetalhe}>
          <div
            className="pc-modal pc-modal--wide pc-org-doc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pc-org-doc-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {docDetalheMipp && (
              <div className="sy-dem-form sy-dem-form--panel">
                <h2 id="pc-org-doc-modal-title" className="pc-org-doc-modal__title">
                  Detalhes do documento
                </h2>
                <section className="sy-dem-section">
                  <h3 className="sy-dem-section__title">Identificação</h3>
                  <div className="sy-dem-row sy-dem-row--2">
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Tipo de documento</span>
                      <input className="sy-dem-input" type="text" value={docDetalheMipp.tipo} readOnly />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Número</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={docDetalheMipp.numero || '—'}
                        readOnly
                      />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Grupo</span>
                      <input className="sy-dem-input" type="text" value={docDetalheMipp.grupo} readOnly />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Status</span>
                      <input className="sy-dem-input" type="text" value={docDetalheMipp.status} readOnly />
                    </label>
                  </div>
                </section>
                <section className="sy-dem-section">
                  <h3 className="sy-dem-section__title">Anexo e vencimento</h3>
                  <div className="sy-dem-row sy-dem-row--2">
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Arquivo</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={docDetalheMipp.arquivo || '—'}
                        readOnly
                      />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Data de anexo</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={formatDocDate(docDetalheMipp.dataAnexo)}
                        readOnly
                      />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Data de vencimento</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={formatDocDate(docDetalheMipp.dataVencimento)}
                        readOnly
                      />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Modo de vencimento</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={docDetalheMipp.modoVencimento}
                        readOnly
                      />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Origem</span>
                      <input className="sy-dem-input" type="text" value={docDetalheMipp.origem} readOnly />
                    </label>
                  </div>
                  {docDetalheMipp.observacaoAjuste && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Observação de ajuste</span>
                        <input
                          className="sy-dem-input"
                          type="text"
                          value={docDetalheMipp.observacaoAjuste}
                          readOnly
                        />
                      </label>
                    </div>
                  )}
                </section>
              </div>
            )}
            {docDetalheExec && (
              <div className="sy-dem-form sy-dem-form--panel">
                <h2 id="pc-org-doc-modal-title" className="pc-org-doc-modal__title">
                  Detalhes do documento de execução
                </h2>
                <section className="sy-dem-section">
                  <h3 className="sy-dem-section__title">Identificação</h3>
                  <div className="sy-dem-row sy-dem-row--2">
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Tipo</span>
                      <input className="sy-dem-input" type="text" value={docDetalheExec.tipo} readOnly />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Ativo</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={docDetalheExec.ativo ? 'Sim' : 'Não'}
                        readOnly
                      />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Status</span>
                      <input className="sy-dem-input" type="text" value={docDetalheExec.status} readOnly />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Origem</span>
                      <input className="sy-dem-input" type="text" value={docDetalheExec.origem} readOnly />
                    </label>
                  </div>
                </section>
                <section className="sy-dem-section">
                  <h3 className="sy-dem-section__title">Anexo e referência</h3>
                  <div className="sy-dem-row sy-dem-row--2">
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Arquivo</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={docDetalheExec.arquivo || '—'}
                        readOnly
                      />
                    </label>
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Data do anexo</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={formatDocDate(docDetalheExec.dataAnexo)}
                        readOnly
                      />
                    </label>
                  </div>
                  <div className="sy-dem-row sy-dem-row--1">
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">URL</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={docDetalheExec.url || '—'}
                        readOnly
                      />
                    </label>
                  </div>
                  <div className="sy-dem-row sy-dem-row--1">
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Observação</span>
                      <input
                        className="sy-dem-input"
                        type="text"
                        value={docDetalheExec.observacao || '—'}
                        readOnly
                      />
                    </label>
                  </div>
                </section>
              </div>
            )}
            <div className="pc-modal__actions">
              <button type="button" className="pc-btn pc-btn--primary" onClick={fecharDocDetalhe}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        className="pc-skip"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onArquivoSelecionado}
        aria-hidden
        tabIndex={-1}
      />
    </section>
  )
}
