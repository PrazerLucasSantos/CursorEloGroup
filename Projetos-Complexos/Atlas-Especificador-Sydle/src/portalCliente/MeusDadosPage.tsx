import { useState, type ReactNode } from 'react'
import { AnexoUpload } from './AnexoField'
import {
  OPCOES_CONDICAO_CARGO_PESSOA,
  OPCOES_COR_RACA,
  OPCOES_DEFICIENCIA,
  OPCOES_ESTADO_CIVIL,
  OPCOES_GENERO,
  OPCOES_NATURALIDADE,
  OPCOES_PAIS,
  OPCOES_PERFIL_PESSOA,
  OPCOES_REGIAO_UF,
  OPCOES_SEXO,
  OPCOES_STATUS_VINCULO,
  OPCOES_TIPO_EMAIL_PESSOA,
  OPCOES_TIPO_FILIACAO,
  PESSOA_LOGADA_INICIAL,
  clonePessoa,
  newRowId,
  type PessoaCadastro,
} from './portalClientePessoaData'

type Props = {
  onHome: () => void
  onToast: (msg: string) => void
}

type ListaPessoaId = 'documentos' | 'filiacoes' | 'telefones' | 'emails' | 'enderecos' | 'redes'

const LISTAS_VAZIAS: Record<ListaPessoaId, string[]> = {
  documentos: [],
  filiacoes: [],
  telefones: [],
  emails: [],
  enderecos: [],
  redes: [],
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

function OrgTh({ children, required }: { children: ReactNode; required?: boolean }) {
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

function PillChoice({
  value,
  options,
  onChange,
  allowEmpty,
}: {
  value: string
  options: readonly string[]
  onChange: (v: string) => void
  allowEmpty?: boolean
}) {
  return (
    <div className="pc-pill-row" role="group">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`pc-pill-btn${value === o ? ' pc-pill-btn--active' : ''}`}
          aria-pressed={value === o}
          onClick={() => onChange(allowEmpty && value === o ? '' : o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function SelectOpcoes({
  value,
  options,
  onChange,
  allowEmpty,
}: {
  value: string
  options: readonly string[]
  onChange: (v: string) => void
  allowEmpty?: boolean
}) {
  return (
    <select className="sy-dem-input" value={value} onChange={(e) => onChange(e.target.value)}>
      {allowEmpty ? <option value="">Selecione</option> : null}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export default function MeusDadosPage({ onHome, onToast }: Props) {
  const [pessoa, setPessoa] = useState<PessoaCadastro>(() => clonePessoa(PESSOA_LOGADA_INICIAL))
  const [checkpoint, setCheckpoint] = useState<PessoaCadastro>(() => clonePessoa(PESSOA_LOGADA_INICIAL))
  const [selecionados, setSelecionados] = useState<Record<ListaPessoaId, string[]>>(() => ({
    ...LISTAS_VAZIAS,
  }))
  const [acordeoesAbertos, setAcordeoesAbertos] = useState<string[]>(['pessoa', 'profissional'])

  function toggleAcordeao(id: string) {
    setAcordeoesAbertos((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  function patch(partial: Partial<PessoaCadastro>) {
    setPessoa((p) => ({ ...p, ...partial }))
  }

  function toggleSel(lista: ListaPessoaId, id: string) {
    setSelecionados((prev) => {
      const cur = prev[lista]
      return { ...prev, [lista]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }
    })
  }

  function toggleSelTodos(lista: ListaPessoaId, ids: string[]) {
    setSelecionados((prev) => {
      const all = ids.length > 0 && ids.every((id) => prev[lista].includes(id))
      return { ...prev, [lista]: all ? [] : [...ids] }
    })
  }

  function todosSelecionados(lista: ListaPessoaId, ids: string[]) {
    return ids.length > 0 && ids.every((id) => selecionados[lista].includes(id))
  }

  function limparSel(lista: ListaPessoaId) {
    setSelecionados((prev) => ({ ...prev, [lista]: [] }))
  }

  function salvar() {
    setCheckpoint(clonePessoa(pessoa))
    onToast('Meus dados salvos')
  }

  function cancelar() {
    setPessoa(clonePessoa(checkpoint))
    setSelecionados({ ...LISTAS_VAZIAS })
    onToast('Alterações descartadas')
  }

  function adicionarDocumento() {
    setPessoa((p) => ({
      ...p,
      documentos: [...p.documentos, { id: newRowId('doc'), tipo: '', numero: '', arquivo: '' }],
    }))
  }

  function excluirDocumentos() {
    setPessoa((p) => ({
      ...p,
      documentos: p.documentos.filter((x) => !selecionados.documentos.includes(x.id)),
    }))
    limparSel('documentos')
  }

  function adicionarFiliacao() {
    setPessoa((p) => ({
      ...p,
      filiacoes: [...p.filiacoes, { id: newRowId('fil'), nome: '', tipoVinculo: 'Outro' }],
    }))
  }

  function excluirFiliacoes() {
    setPessoa((p) => ({
      ...p,
      filiacoes: p.filiacoes.filter((x) => !selecionados.filiacoes.includes(x.id)),
    }))
    limparSel('filiacoes')
  }

  function adicionarTelefone() {
    setPessoa((p) => ({
      ...p,
      telefones: [
        ...p.telefones,
        { id: newRowId('tel'), tipo: 'Celular', pais: 'Brasil', ddi: '+55', numero: '' },
      ],
    }))
  }

  function excluirTelefones() {
    setPessoa((p) => ({
      ...p,
      telefones: p.telefones.filter((x) => !selecionados.telefones.includes(x.id)),
    }))
    limparSel('telefones')
  }

  function adicionarEmail() {
    setPessoa((p) => ({
      ...p,
      emails: [...p.emails, { id: newRowId('em'), tipo: 'Institucional', email: '' }],
    }))
  }

  function excluirEmails() {
    setPessoa((p) => ({
      ...p,
      emails: p.emails.filter((x) => !selecionados.emails.includes(x.id)),
    }))
    limparSel('emails')
  }

  function adicionarEndereco() {
    setPessoa((p) => ({
      ...p,
      enderecos: [
        ...p.enderecos,
        {
          id: newRowId('end'),
          cep: '',
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          pais: 'Brasil',
        },
      ],
    }))
  }

  function excluirEnderecos() {
    setPessoa((p) => ({
      ...p,
      enderecos: p.enderecos.filter((x) => !selecionados.enderecos.includes(x.id)),
    }))
    limparSel('enderecos')
  }

  function adicionarRede() {
    setPessoa((p) => ({
      ...p,
      redesSociais: [...p.redesSociais, { id: newRowId('rs'), rede: '', url: '', usuario: '' }],
    }))
  }

  function excluirRedes() {
    setPessoa((p) => ({
      ...p,
      redesSociais: p.redesSociais.filter((x) => !selecionados.redes.includes(x.id)),
    }))
    limparSel('redes')
  }

  return (
    <section className="pc-page pc-meus-dados">
      <nav className="pc-breadcrumb" aria-label="Trilha">
        <button type="button" onClick={onHome}>
          <span className="material-symbols-outlined" aria-hidden>
            home
          </span>
        </button>
        <span>
          <span>/</span>
          <span>Catálogo de Serviços - Atlas</span>
        </span>
        <span>
          <span>/</span>
          <span>Meus dados</span>
        </span>
      </nav>

      <header className="pc-org-header">
        <div>
          <h1>Meus dados</h1>
        </div>
      </header>

      <div className="pc-org-main">
        <article className="pc-org-sydle-form sy-dem-form">
          <p className="pc-org-sydle-form__intro">
            Atualize seus dados pessoais, profissionais e de contato <span className="pc-req">*</span>
          </p>
          <div className="sy-accordion" aria-label="Seções dos meus dados">
            <AccordionBlock
              id="pessoa"
              title="Pessoa"
              icon="person"
              open={acordeoesAbertos.includes('pessoa')}
              onToggle={toggleAcordeao}
            >
              <h3 className="sy-accordion__section-title">Dados pessoais</h3>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">
                    Nome <span className="pc-req">*</span>
                  </span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={pessoa.nome}
                    onChange={(e) => patch({ nome: e.target.value })}
                  />
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Outros nomes</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={pessoa.outrosNomes}
                    onChange={(e) => patch({ outrosNomes: e.target.value })}
                  />
                </label>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <div className="sy-dem-field">
                  <span className="sy-dem-label">Foto</span>
                  <AnexoUpload
                    nome={pessoa.foto}
                    tamanhoKb={pessoa.fotoKb}
                    accept="image/*"
                    onFile={(f) => {
                      patch({ foto: f.nome, fotoKb: f.tamanhoKb })
                      onToast(`Foto "${f.nome}" anexada`)
                    }}
                    onClear={() => patch({ foto: undefined, fotoKb: undefined })}
                  />
                </div>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Data de nascimento</span>
                  <input
                    className="sy-dem-input"
                    type="date"
                    value={pessoa.dataNascimento}
                    onChange={(e) => patch({ dataNascimento: e.target.value })}
                  />
                </label>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">
                    CPF <span className="pc-req">*</span>
                  </span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    inputMode="numeric"
                    value={pessoa.cpf}
                    placeholder="000.000.000-00"
                    onChange={(e) => patch({ cpf: e.target.value })}
                  />
                </label>
                <label className="sy-dem-field pc-org-toggle-field">
                  <span className="sy-dem-label">
                    Falecido? <span className="pc-req">*</span>
                  </span>
                  <span className="pc-org-toggle" aria-label={pessoa.falecido ? 'Sim' : 'Não'}>
                    <input
                      type="checkbox"
                      className="pc-org-toggle__input"
                      checked={pessoa.falecido}
                      onChange={(e) => patch({ falecido: e.target.checked })}
                    />
                    <span
                      className={`pc-org-toggle__track${pessoa.falecido ? ' pc-org-toggle__track--on' : ''}`}
                      aria-hidden
                    />
                  </span>
                </label>
              </div>

              <h3 className="sy-accordion__section-title">Documentos</h3>
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">Documentos</h3>
              <OrgListToolbar
                onAdd={adicionarDocumento}
                onDelete={excluirDocumentos}
                canDelete={selecionados.documentos.length > 0}
              />
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      <th className="pc-org-table__check" scope="col">
                        <label className="pc-org-list-check">
                          <input
                            type="checkbox"
                            checked={todosSelecionados(
                              'documentos',
                              pessoa.documentos.map((d) => d.id),
                            )}
                            onChange={() =>
                              toggleSelTodos(
                                'documentos',
                                pessoa.documentos.map((d) => d.id),
                              )
                            }
                            aria-label="Selecionar todos"
                          />
                        </label>
                      </th>
                      <OrgTh>Tipo</OrgTh>
                      <OrgTh>Número</OrgTh>
                      <OrgTh>Campos adicionais</OrgTh>
                      <OrgTh>Arquivo</OrgTh>
                      <OrgTh>Vencimento</OrgTh>
                    </tr>
                  </thead>
                  <tbody>
                    {pessoa.documentos.map((d) => (
                      <tr
                        key={d.id}
                        className={
                          selecionados.documentos.includes(d.id)
                            ? 'pc-org-table__row--selected'
                            : undefined
                        }
                      >
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.documentos.includes(d.id)}
                              onChange={() => toggleSel('documentos', d.id)}
                            />
                          </label>
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={d.tipo}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                documentos: p.documentos.map((x) =>
                                  x.id === d.id ? { ...x, tipo: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={d.numero}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                documentos: p.documentos.map((x) =>
                                  x.id === d.id ? { ...x, numero: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={d.camposAdicionais ?? ''}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                documentos: p.documentos.map((x) =>
                                  x.id === d.id ? { ...x, camposAdicionais: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <AnexoUpload
                            nome={d.arquivo}
                            tamanhoKb={d.arquivoKb}
                            accept=".pdf,image/*,.doc,.docx"
                            onFile={(f) =>
                              setPessoa((p) => ({
                                ...p,
                                documentos: p.documentos.map((x) =>
                                  x.id === d.id
                                    ? { ...x, arquivo: f.nome, arquivoKb: f.tamanhoKb }
                                    : x,
                                ),
                              }))
                            }
                            onClear={() =>
                              setPessoa((p) => ({
                                ...p,
                                documentos: p.documentos.map((x) =>
                                  x.id === d.id
                                    ? { ...x, arquivo: undefined, arquivoKb: undefined }
                                    : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            type="date"
                            value={d.vencimento ?? ''}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                documentos: p.documentos.map((x) =>
                                  x.id === d.id ? { ...x, vencimento: e.target.value } : x,
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
              <OrgListFab onAdd={adicionarDocumento} label="Adicionar documento" />
            </div>

              <h3 className="sy-accordion__section-title">Informações complementares</h3>
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">Filiação</h3>
              <OrgListToolbar
                onAdd={adicionarFiliacao}
                onDelete={excluirFiliacoes}
                canDelete={selecionados.filiacoes.length > 0}
              />
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      <th className="pc-org-table__check" scope="col">
                        <label className="pc-org-list-check">
                          <input
                            type="checkbox"
                            checked={todosSelecionados(
                              'filiacoes',
                              pessoa.filiacoes.map((f) => f.id),
                            )}
                            onChange={() =>
                              toggleSelTodos(
                                'filiacoes',
                                pessoa.filiacoes.map((f) => f.id),
                              )
                            }
                            aria-label="Selecionar todos"
                          />
                        </label>
                      </th>
                      <OrgTh required>Nome</OrgTh>
                      <OrgTh required>Tipo de vínculo</OrgTh>
                      <OrgTh>Documento</OrgTh>
                    </tr>
                  </thead>
                  <tbody>
                    {pessoa.filiacoes.map((f) => (
                      <tr
                        key={f.id}
                        className={
                          selecionados.filiacoes.includes(f.id)
                            ? 'pc-org-table__row--selected'
                            : undefined
                        }
                      >
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.filiacoes.includes(f.id)}
                              onChange={() => toggleSel('filiacoes', f.id)}
                            />
                          </label>
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={f.nome}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                filiacoes: p.filiacoes.map((x) =>
                                  x.id === f.id ? { ...x, nome: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <SelectOpcoes
                            value={f.tipoVinculo}
                            options={OPCOES_TIPO_FILIACAO}
                            onChange={(v) =>
                              setPessoa((p) => ({
                                ...p,
                                filiacoes: p.filiacoes.map((x) =>
                                  x.id === f.id ? { ...x, tipoVinculo: v } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <AnexoUpload
                            nome={f.documento}
                            tamanhoKb={f.documentoKb}
                            accept=".pdf,image/*"
                            onFile={(file) =>
                              setPessoa((p) => ({
                                ...p,
                                filiacoes: p.filiacoes.map((x) =>
                                  x.id === f.id
                                    ? {
                                        ...x,
                                        documento: file.nome,
                                        documentoKb: file.tamanhoKb,
                                      }
                                    : x,
                                ),
                              }))
                            }
                            onClear={() =>
                              setPessoa((p) => ({
                                ...p,
                                filiacoes: p.filiacoes.map((x) =>
                                  x.id === f.id
                                    ? { ...x, documento: undefined, documentoKb: undefined }
                                    : x,
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
              <OrgListFab onAdd={adicionarFiliacao} label="Adicionar filiação" />
            </div>
            <div className="sy-dem-row sy-dem-row--2">
              <div className="sy-dem-field">
                <span className="sy-dem-label">Sexo</span>
                <PillChoice
                  value={pessoa.sexo}
                  options={OPCOES_SEXO}
                  allowEmpty
                  onChange={(v) => patch({ sexo: v })}
                />
              </div>
              <label className="sy-dem-field">
                <span className="sy-dem-label">Gênero</span>
                <SelectOpcoes
                  value={pessoa.genero}
                  options={OPCOES_GENERO}
                  allowEmpty
                  onChange={(v) => patch({ genero: v })}
                />
              </label>
            </div>
            <div className="sy-dem-row sy-dem-row--2">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Deficiências</span>
                <SelectOpcoes
                  value={pessoa.deficiencias}
                  options={OPCOES_DEFICIENCIA}
                  onChange={(v) => patch({ deficiencias: v })}
                />
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">País de nascimento</span>
                <SelectOpcoes
                  value={pessoa.paisNascimento}
                  options={OPCOES_PAIS}
                  onChange={(v) => patch({ paisNascimento: v })}
                />
              </label>
            </div>
            <div className="sy-dem-row sy-dem-row--2">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Nacionalidade</span>
                <SelectOpcoes
                  value={pessoa.nacionalidade}
                  options={OPCOES_PAIS}
                  onChange={(v) => patch({ nacionalidade: v })}
                />
              </label>
              <label className="sy-dem-field">
                <span className="sy-dem-label">Naturalidade</span>
                <SelectOpcoes
                  value={pessoa.naturalidade}
                  options={OPCOES_NATURALIDADE}
                  onChange={(v) => patch({ naturalidade: v })}
                />
              </label>
            </div>
            <div className="sy-dem-row sy-dem-row--2">
              <label className="sy-dem-field">
                <span className="sy-dem-label">Estado civil</span>
                <SelectOpcoes
                  value={pessoa.estadoCivil}
                  options={OPCOES_ESTADO_CIVIL}
                  allowEmpty
                  onChange={(v) => patch({ estadoCivil: v })}
                />
              </label>
            </div>
            <div className="sy-dem-field">
              <span className="sy-dem-label">Cor ou raça</span>
              <PillChoice
                value={pessoa.corRaca}
                options={OPCOES_COR_RACA}
                allowEmpty
                onChange={(v) => patch({ corRaca: v })}
              />
            </div>
            </AccordionBlock>

            <AccordionBlock
              id="profissional"
              title="Profissional"
              icon="work"
              open={acordeoesAbertos.includes('profissional')}
              onToggle={toggleAcordeao}
            >
              <div className="sy-alert sy-alert--warning" role="status">
                <span className="material-symbols-outlined" aria-hidden>
                  warning
                </span>
                <p>
                  Não foi possível se conectar ao Protheus para obtenção automática da matrícula do
                  servidor. Se desejar, pode inserir manualmente.
                </p>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Organização</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={pessoa.organizacao}
                    onChange={(e) => patch({ organizacao: e.target.value })}
                  />
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Cargo</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={pessoa.cargo}
                    onChange={(e) => patch({ cargo: e.target.value })}
                  />
                </label>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Matrícula</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={pessoa.matricula}
                    onChange={(e) => patch({ matricula: e.target.value })}
                    placeholder={pessoa.perfil === 'MTI' ? 'Obrigatória para MTI' : '—'}
                  />
                </label>
                <div className="sy-dem-field">
                  <span className="sy-dem-label">Condição</span>
                  <PillChoice
                    value={pessoa.condicaoCargo}
                    options={OPCOES_CONDICAO_CARGO_PESSOA}
                    allowEmpty
                    onChange={(v) => patch({ condicaoCargo: v as PessoaCadastro['condicaoCargo'] })}
                  />
                </div>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Região de atuação</span>
                  <SelectOpcoes
                    value={pessoa.regiaoAtuacao}
                    options={OPCOES_REGIAO_UF}
                    allowEmpty
                    onChange={(v) => patch({ regiaoAtuacao: v })}
                  />
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Perfil</span>
                  <SelectOpcoes
                    value={pessoa.perfil}
                    options={OPCOES_PERFIL_PESSOA}
                    allowEmpty
                    onChange={(v) => patch({ perfil: v as PessoaCadastro['perfil'] })}
                  />
                </label>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Unidade organizacional</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={pessoa.unidadeOrganizacional}
                    onChange={(e) => patch({ unidadeOrganizacional: e.target.value })}
                  />
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Status vínculo funcional</span>
                  <select className="sy-dem-input" value={pessoa.statusVinculoFuncional} disabled>
                    <option value="">—</option>
                    {OPCOES_STATUS_VINCULO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Data última validação Protheus</span>
                  <input
                    className="sy-dem-input"
                    type="date"
                    value={pessoa.dataValidacaoProtheus}
                    readOnly
                  />
                </label>
              </div>
            </AccordionBlock>

            <AccordionBlock
              id="contato"
              title="Contato"
              icon="call"
              open={acordeoesAbertos.includes('contato')}
              onToggle={toggleAcordeao}
            >
            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">Telefones</h3>
              <OrgListToolbar
                onAdd={adicionarTelefone}
                onDelete={excluirTelefones}
                canDelete={selecionados.telefones.length > 0}
              />
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      <th className="pc-org-table__check" scope="col">
                        <label className="pc-org-list-check">
                          <input
                            type="checkbox"
                            checked={todosSelecionados(
                              'telefones',
                              pessoa.telefones.map((t) => t.id),
                            )}
                            onChange={() =>
                              toggleSelTodos(
                                'telefones',
                                pessoa.telefones.map((t) => t.id),
                              )
                            }
                            aria-label="Selecionar todos"
                          />
                        </label>
                      </th>
                      <OrgTh required>Tipo</OrgTh>
                      <OrgTh required>País</OrgTh>
                      <OrgTh>DDI</OrgTh>
                      <OrgTh required>Número</OrgTh>
                    </tr>
                  </thead>
                  <tbody>
                    {pessoa.telefones.map((t) => (
                      <tr
                        key={t.id}
                        className={
                          selecionados.telefones.includes(t.id)
                            ? 'pc-org-table__row--selected'
                            : undefined
                        }
                      >
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.telefones.includes(t.id)}
                              onChange={() => toggleSel('telefones', t.id)}
                            />
                          </label>
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={t.tipo}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                telefones: p.telefones.map((x) =>
                                  x.id === t.id ? { ...x, tipo: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={t.pais}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                telefones: p.telefones.map((x) =>
                                  x.id === t.id ? { ...x, pais: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={t.ddi}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                telefones: p.telefones.map((x) =>
                                  x.id === t.id ? { ...x, ddi: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={t.numero}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                telefones: p.telefones.map((x) =>
                                  x.id === t.id ? { ...x, numero: e.target.value } : x,
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
              <OrgListFab onAdd={adicionarTelefone} label="Adicionar telefone" />
            </div>

            <div className="pc-meus-dados-email-principal sy-dem-row sy-dem-row--1">
              <label className="sy-dem-field">
                <span className="sy-dem-label">E-mail principal</span>
                <div className="pc-meus-dados-email-principal__row">
                  <input
                    className="sy-dem-input"
                    type="email"
                    value={pessoa.emailPrincipal}
                    onChange={(e) => patch({ emailPrincipal: e.target.value })}
                  />
                  <span className="sy-badge sy-badge--success">Principal</span>
                </div>
              </label>
            </div>

            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">E-mails</h3>
              <OrgListToolbar
                onAdd={adicionarEmail}
                onDelete={excluirEmails}
                canDelete={selecionados.emails.length > 0}
              />
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      <th className="pc-org-table__check" scope="col">
                        <label className="pc-org-list-check">
                          <input
                            type="checkbox"
                            checked={todosSelecionados(
                              'emails',
                              pessoa.emails.map((e) => e.id),
                            )}
                            onChange={() =>
                              toggleSelTodos(
                                'emails',
                                pessoa.emails.map((e) => e.id),
                              )
                            }
                            aria-label="Selecionar todos"
                          />
                        </label>
                      </th>
                      <OrgTh required>Tipo</OrgTh>
                      <OrgTh required>E-mail</OrgTh>
                    </tr>
                  </thead>
                  <tbody>
                    {pessoa.emails.map((em) => (
                      <tr
                        key={em.id}
                        className={
                          selecionados.emails.includes(em.id)
                            ? 'pc-org-table__row--selected'
                            : undefined
                        }
                      >
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.emails.includes(em.id)}
                              onChange={() => toggleSel('emails', em.id)}
                            />
                          </label>
                        </td>
                        <td>
                          <SelectOpcoes
                            value={em.tipo}
                            options={OPCOES_TIPO_EMAIL_PESSOA}
                            onChange={(v) =>
                              setPessoa((p) => ({
                                ...p,
                                emails: p.emails.map((x) =>
                                  x.id === em.id ? { ...x, tipo: v } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            type="email"
                            value={em.email}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                emails: p.emails.map((x) =>
                                  x.id === em.id ? { ...x, email: e.target.value } : x,
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
              <OrgListFab onAdd={adicionarEmail} label="Adicionar e-mail" />
            </div>

            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">Endereços</h3>
              <OrgListToolbar
                onAdd={adicionarEndereco}
                onDelete={excluirEnderecos}
                canDelete={selecionados.enderecos.length > 0}
              />
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      <th className="pc-org-table__check" scope="col">
                        <label className="pc-org-list-check">
                          <input
                            type="checkbox"
                            checked={todosSelecionados(
                              'enderecos',
                              pessoa.enderecos.map((e) => e.id),
                            )}
                            onChange={() =>
                              toggleSelTodos(
                                'enderecos',
                                pessoa.enderecos.map((e) => e.id),
                              )
                            }
                            aria-label="Selecionar todos"
                          />
                        </label>
                      </th>
                      <OrgTh required>CEP</OrgTh>
                      <OrgTh required>Logradouro</OrgTh>
                      <OrgTh required>Número</OrgTh>
                      <OrgTh>Complemento</OrgTh>
                      <OrgTh required>Bairro</OrgTh>
                      <OrgTh>Cidade</OrgTh>
                      <OrgTh>Estado</OrgTh>
                      <OrgTh>País</OrgTh>
                    </tr>
                  </thead>
                  <tbody>
                    {pessoa.enderecos.map((end) => (
                      <tr
                        key={end.id}
                        className={
                          selecionados.enderecos.includes(end.id)
                            ? 'pc-org-table__row--selected'
                            : undefined
                        }
                      >
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.enderecos.includes(end.id)}
                              onChange={() => toggleSel('enderecos', end.id)}
                            />
                          </label>
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={end.cep}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                enderecos: p.enderecos.map((x) =>
                                  x.id === end.id ? { ...x, cep: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={end.logradouro}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                enderecos: p.enderecos.map((x) =>
                                  x.id === end.id ? { ...x, logradouro: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={end.numero}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                enderecos: p.enderecos.map((x) =>
                                  x.id === end.id ? { ...x, numero: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={end.complemento ?? ''}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                enderecos: p.enderecos.map((x) =>
                                  x.id === end.id ? { ...x, complemento: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={end.bairro}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                enderecos: p.enderecos.map((x) =>
                                  x.id === end.id ? { ...x, bairro: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input className="sy-dem-input" value={end.cidade} readOnly />
                        </td>
                        <td>
                          <input className="sy-dem-input" value={end.estado} readOnly />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={end.pais}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                enderecos: p.enderecos.map((x) =>
                                  x.id === end.id ? { ...x, pais: e.target.value } : x,
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
              <OrgListFab onAdd={adicionarEndereco} label="Adicionar endereço" />
            </div>

            <div className="pc-org-table-panel">
              <h3 className="pc-org-table-panel__label">Redes sociais</h3>
              <OrgListToolbar
                onAdd={adicionarRede}
                onDelete={excluirRedes}
                canDelete={selecionados.redes.length > 0}
              />
              <div className="pc-org-table-wrap">
                <table className="pc-org-table">
                  <thead>
                    <tr>
                      <th className="pc-org-table__check" scope="col">
                        <label className="pc-org-list-check">
                          <input
                            type="checkbox"
                            checked={todosSelecionados(
                              'redes',
                              pessoa.redesSociais.map((r) => r.id),
                            )}
                            onChange={() =>
                              toggleSelTodos(
                                'redes',
                                pessoa.redesSociais.map((r) => r.id),
                              )
                            }
                            aria-label="Selecionar todos"
                          />
                        </label>
                      </th>
                      <OrgTh required>Rede</OrgTh>
                      <OrgTh>URL</OrgTh>
                      <OrgTh>Usuário</OrgTh>
                    </tr>
                  </thead>
                  <tbody>
                    {pessoa.redesSociais.map((rs) => (
                      <tr
                        key={rs.id}
                        className={
                          selecionados.redes.includes(rs.id)
                            ? 'pc-org-table__row--selected'
                            : undefined
                        }
                      >
                        <td className="pc-org-table__check">
                          <label className="pc-org-list-check">
                            <input
                              type="checkbox"
                              checked={selecionados.redes.includes(rs.id)}
                              onChange={() => toggleSel('redes', rs.id)}
                            />
                          </label>
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={rs.rede}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                redesSociais: p.redesSociais.map((x) =>
                                  x.id === rs.id ? { ...x, rede: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={rs.url}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                redesSociais: p.redesSociais.map((x) =>
                                  x.id === rs.id ? { ...x, url: e.target.value } : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="sy-dem-input"
                            value={rs.usuario}
                            onChange={(e) =>
                              setPessoa((p) => ({
                                ...p,
                                redesSociais: p.redesSociais.map((x) =>
                                  x.id === rs.id ? { ...x, usuario: e.target.value } : x,
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
              <OrgListFab onAdd={adicionarRede} label="Adicionar rede" />
            </div>
            </AccordionBlock>

            <AccordionBlock
              id="credenciais"
              title="Credenciais / Acesso"
              icon="key"
              open={acordeoesAbertos.includes('credenciais')}
              onToggle={toggleAcordeao}
            >
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">
                    Ativo para acesso <span className="pc-req">*</span>
                  </span>
                  <select
                    className="sy-dem-input"
                    value={pessoa.ativoParaAcesso ? 'Sim' : 'Não'}
                    onChange={(e) => patch({ ativoParaAcesso: e.target.value === 'Sim' })}
                  >
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Login</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={pessoa.login}
                    disabled={!pessoa.ativoParaAcesso}
                    onChange={(e) => patch({ login: e.target.value })}
                  />
                </label>
              </div>
              <div className="sy-dem-row sy-dem-row--2">
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Senha</span>
                  <input
                    className="sy-dem-input"
                    type="password"
                    value={pessoa.senha}
                    readOnly
                    disabled={!pessoa.ativoParaAcesso}
                  />
                </label>
                <label className="sy-dem-field">
                  <span className="sy-dem-label">Token do certificado digital</span>
                  <input
                    className="sy-dem-input"
                    type="text"
                    value={pessoa.tokenCertificado}
                    onChange={(e) => patch({ tokenCertificado: e.target.value })}
                    placeholder="Token A3 (se aplicável)"
                  />
                </label>
              </div>
            </AccordionBlock>
          </div>
        </article>

        <div className="pc-org-form-footer">
          <button type="button" className="pc-org-form-footer__cancel" onClick={cancelar}>
            <span className="material-symbols-outlined" aria-hidden>
              close
            </span>
            Cancelar
          </button>
          <button type="button" className="pc-org-form-footer__primary" onClick={salvar}>
            <span className="material-symbols-outlined" aria-hidden>
              check
            </span>
            Salvar
          </button>
        </div>
      </div>
    </section>
  )
}
