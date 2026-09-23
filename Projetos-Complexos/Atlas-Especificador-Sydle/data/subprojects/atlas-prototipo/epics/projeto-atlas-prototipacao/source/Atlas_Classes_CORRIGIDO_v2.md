# Atlas V4 Protótipo — Classes, campos e abas (CORRIGIDO v2)

Documento revisado em 2026-06-15 a partir de `Atlas_V4_Classes_Cadastro_Processo_Workflow_CORRIGIDO.md`.
Segunda rodada de ajustes aplicados com base na revisão do documento corrigido.

> **Alterações desta versão (v2) em relação à versão anterior:**
> - Workflow: "tipo(s) de processo" → **"um Tipo de Processo"** (singular, conforme decisão)
> - Unidade Organizacional: nova aba Qualificação Organizacional **removida** — campos mantidos em Dados da Unidade
> - Classe Pessoa: obrigatoriedades revertidas para o original SYDLE; adicionada nota de interpretação
> - Classe Servidor: Lotação revertida para `textOptions`; subseção Sigadoc restaurada; adicionada nota de interpretação
> - `Produto / Parceria` (UO): `undefined` substituído por "sem referência ativa na Fase 1; campo reservado"
> - `Papel no envelope`: convertido para `textOptions` com opções **Aprovador; Assinante; Testemunha**
> - `Parecer`: convertido para `textOptions` com opções **Aprovar; Recusar/Rejeitar**
> - Workflow: "referenciado por Templates" substituído por **"referenciado pela configuração de fluxos de assinatura"**
> - Formulários novos: Tipo de Processo e Métodos/Ações descritos como **listas técnicas do backend**
> - Código `RN-PV-02` corrigido para **`RN-VERS-06`**

---

## Índice

1. [Grupo Cadastro base](#1-grupo-cadastro-base)
2. [Versões de Processo](#2-versões-de-processo)
3. [Workflow de Assinatura](#3-workflow-de-assinatura)
4. [Formulários embutidos (linhas)](#4-formulários-embutidos-linhas)
5. [Resumo — referências e embutidos](#5-resumo--referências-e-embutidos)

---

## 1. Grupo Cadastro base

Pacote: **Cadastro base** (`pkg-patlasv4-proto-cadastro`)

> ~~**1.1 Organização**~~ — **REMOVIDA**
> A classe `Organização` (`cls-patlasv4-proto-org`) foi eliminada conforme RN-UO-02.
> Organização passa a ser uma qualificação da `Unidade Organizacional` com `Representa Organização? = Sim` e `Tipo de Organização = MTI | Parceiro | Cliente`.
> Todos os campos que referenciavam `form-patlasv4-proto-organizacao` foram redirecionados para `form-patlasv4-proto-unidade-organizacional` (UOs qualificadas).

---

## 1.1 Nível Organizacional

Classe: `cls-patlasv4-proto-niv` · Formulário: `form-patlasv4-proto-nivel-organizacional`

### Nível Organizacional

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-nivel-organizacional` |
| **Layout** | Sem seções (layout único) |
| **Modo padrão** | read |
| **Metadados** | Protótipo Atlas — Nível Organizacional. Classifica a posição hierárquica da Unidade Organizacional. Não define a hierarquia. |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Nome | `patlasv4proto-nivel-organizacional-dados-do-nivel-nome` | text | — (sem aba / layout único) | Sim | Não |
| Ativo | `patlasv4proto-nivel-organizacional-dados-do-nivel-ativo` | boolean | — (sem aba / layout único) | **Sim** | Não |

> **Correção:** Campo renomeado de `Ativo/Inativo` para `Ativo` e marcado como **obrigatório** (antes: Obrig.: Não). ID padronizado de `*-ativo-inativo` para `*-ativo`.

---

## 1.2 Unidade Organizacional

Classe: `cls-patlasv4-proto-uo` · Formulário: `form-patlasv4-proto-unidade-organizacional`

### Unidade Organizacional

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-unidade-organizacional` |
| **Layout** | Abas |
| **Modo padrão** | edit |
| **Metadados** | Protótipo Atlas — Unidade Organizacional. Cadastro único da estrutura hierárquica. Unidades raiz com Representa Organização? = Sim representam MTI, Parceiro ou Cliente. Abas: Dados da Unidade, Documentos, Dados de contato, Localização. |

#### Abas / seções

- **Dados da Unidade** (`sec-patlasv4proto-uo-dados` · ícone: description)
- **Documentos** (`sec-patlasv4proto-uo-documentos` · ícone: description)
- **Dados de contato** (`sec-patlasv4proto-uo-dados-contato` · ícone: contact_mail)
- **Localização** (`sec-patlasv4proto-uo-localizacao` · ícone: map)

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Nome | `patlasv4proto-uo-nome` | text | Dados da Unidade | Sim | Não |
| Sigla | `patlasv4proto-uo-sigla` | text | Dados da Unidade | **Sim** | Não |
| Unidade pai | `patlasv4proto-uo-unidade-pai` | referência | Dados da Unidade | Não | Não → **Unidade Organizacional** (`form-patlasv4-proto-unidade-organizacional`) |
| Nível Organizacional | `patlasv4proto-uo-nivel-organizacional` | **referência** | Dados da Unidade | Sim | Não → **Nível Organizacional** (`form-patlasv4-proto-nivel-organizacional`) |
| Nível | `patlasv4proto-uo-nivel` | **number** | Dados da Unidade | Não | Não |
| Unidade substituída por | `patlasv4proto-uo-substituida` | referência | Dados da Unidade | Não | Não → **Unidade Organizacional** (`form-patlasv4-proto-unidade-organizacional`) |
| Horário inicial | `patlasv4proto-uo-hor-ini` | text | Dados da Unidade | Não | Não |
| Horário final | `patlasv4proto-uo-hor-fim` | text | Dados da Unidade | Não | Não |
| Horário de funcionamento | `patlasv4proto-uo-hor-func` | text | Dados da Unidade | Não | Não |
| CNPJ | `patlasv4proto-uo-cnpj` | text | Dados da Unidade | Não | Não |
| Responsável | `patlasv4proto-uo-responsavel` | referência | Dados da Unidade | Não | Não → **Servidor** (`form-patlasv4-proto-servidor`) |
| Estrutura formal | `patlasv4proto-uo-estrutura-formal` | boolean | Dados da Unidade | Não | Não · oculto |
| Código externo | `patlasv4proto-uo-codigo-externo` | text | Dados da Unidade | Não | Não · oculto |
| Ativo | `patlasv4proto-uo-ativo` | boolean | Dados da Unidade | Sim | Não |
| Representa Organização? | `patlasv4proto-uo-representa-organizacao` | boolean | Dados da Unidade | **Sim** | Não |
| Tipo de Organização | `patlasv4proto-uo-tipo-organizacao` | textOptions | Dados da Unidade | Não · condicional (obrigatório quando Representa Organização? = Sim) | Não |
| Produto / Parceria | `patlasv4proto-uo-produto-parceria` | referência | Dados da Unidade | Não | Não · oculto |
| Observações da Organização | `patlasv4proto-uo-observacoes-organizacao` | text | Dados da Unidade | Não | Não |
| Logo | `patlasv4proto-uo-logo` | file | Documentos | Não | Não |
| URL da Logo | `patlasv4proto-uo-url-logo` | text | Documentos | Não | Não |
| E-mails | `patlasv4proto-uo-contato-emails` | referência embutida | Dados de contato | Não | Sim → **Pessoa — E-mail** (`form-patlasv4-proto-pessoa-email`) · exibição: `table` |
| E-mail principal | `patlasv4proto-uo-contato-email-principal` | text | Dados de contato | Não | Não |
| Telefones | `patlasv4proto-uo-contato-telefones` | referência embutida | Dados de contato | Não | Sim → **Pessoa — Telefone** (`form-patlasv4-proto-pessoa-telefone`) · exibição: `table` |
| Endereços | `patlasv4proto-uo-contato-enderecos` | referência embutida | Dados de contato | Não | Sim → **Pessoa — Endereço** (`form-patlasv4-proto-pessoa-endereco`) · exibição: `table` |
| Redes sociais | `patlasv4proto-uo-contato-redes-sociais` | referência embutida | Dados de contato | Não | Sim → **Pessoa — Rede social** (`form-patlasv4-proto-pessoa-rede-social`) · exibição: `table` |
| CEP | `patlasv4proto-uo-loc-cep` | text | Localização | Não | Não |
| Logradouro | `patlasv4proto-uo-loc-logradouro` | text | Localização | Não | Não |
| Número | `patlasv4proto-uo-loc-numero` | text | Localização | Não | Não |
| Complemento | `patlasv4proto-uo-loc-complemento` | text | Localização | Não | Não |
| Bairro | `patlasv4proto-uo-loc-bairro` | text | Localização | Não | Não |
| Cidade | `patlasv4proto-uo-loc-cidade` | text | Localização | Não | Não |
| Estado | `patlasv4proto-uo-loc-estado` | textOptions | Localização | Não | Não |
| País | `patlasv4proto-uo-loc-pais` | textOptions | Localização | Não | Não |

> **Correções aplicadas:**
> - `Sigla` → **obrigatório** (antes: Não)
> - `Nível Organizacional` → convertido de `textOptions` para **referência** a `form-patlasv4-proto-nivel-organizacional`
> - `Nível` → convertido de `textOptions` para **number** (calculado automaticamente pela profundidade hierárquica; raiz = 0)
> - `Ativo` → ID renomeado de `mqfdo9xlp27377` para `patlasv4proto-uo-ativo`; marcado como obrigatório
> - `Representa Organização?` → marcado como **obrigatório** (antes: Não); permanece na aba **Dados da Unidade** para visualização direta pelo usuário
> - Regra de bloqueio: quando `Unidade pai` estiver preenchida, `Representa Organização?` deve ser automaticamente `Não` e permanecer bloqueado (RN-UO-04)

#### Campos de referência

- **Unidade pai** (`patlasv4proto-uo-unidade-pai`) → Unidade Organizacional (`form-patlasv4-proto-unidade-organizacional`)
- **Unidade substituída por** (`patlasv4proto-uo-substituida`) → Unidade Organizacional (`form-patlasv4-proto-unidade-organizacional`)
- **Nível Organizacional** (`patlasv4proto-uo-nivel-organizacional`) → Nível Organizacional (`form-patlasv4-proto-nivel-organizacional`)
- **Produto / Parceria** (`patlasv4proto-uo-produto-parceria`) → sem referência ativa na Fase 1; campo reservado para uso futuro
- **Responsável** (`patlasv4proto-uo-responsavel`) → Servidor (`form-patlasv4-proto-servidor`)

#### Campos de referência embutida

- **E-mails** (`patlasv4proto-uo-contato-emails`) → Pessoa — E-mail (`form-patlasv4-proto-pessoa-email`) · table · múltiplo
- **Telefones** (`patlasv4proto-uo-contato-telefones`) → Pessoa — Telefone (`form-patlasv4-proto-pessoa-telefone`) · table · múltiplo
- **Endereços** (`patlasv4proto-uo-contato-enderecos`) → Pessoa — Endereço (`form-patlasv4-proto-pessoa-endereco`) · table · múltiplo
- **Redes sociais** (`patlasv4proto-uo-contato-redes-sociais`) → Pessoa — Rede social (`form-patlasv4-proto-pessoa-rede-social`) · table · múltiplo

---

## 1.3 Pessoa

Classe: `cls-patlasv4-proto-pes` · Formulário: `form-patlasv4-proto-pessoa`

### Pessoa

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-pessoa` |
| **Layout** | Abas |
| **Modo padrão** | read |
| **Metadados** | Protótipo Atlas — Pessoa. Cadastro base do indivíduo. Não carrega cargo, unidade funcional ou permissão. Layout conforme tela Sydle (Geral, Dados de contato, Complementares, Currículo). |

#### Abas / seções

- **Geral** (`sec-patlasv4proto-pes-geral` · ícone: person)
- **Principal** (`sec-patlasv4proto-pes-principal`) — subseção de *Geral*
- **Informações demográficas** (`sec-patlasv4proto-pes-demograficas`) — subseção de *Geral*
- **Credenciais** (`sec-patlasv4proto-pes-credenciais`) — subseção de *Geral*
- **Dados de contato** (`sec-patlasv4proto-pes-contato` · ícone: mail)
- **Complementares** (`sec-patlasv4proto-pes-complementares` · ícone: info)
- **Currículo** (`sec-patlasv4proto-pes-curriculo` · ícone: school)

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Nome | `patlasv4proto-pes-nome` | text | Geral › Principal | Sim | Não |
| Outros nomes | `patlasv4proto-pes-outros-nomes` | text | Geral › Principal | Não | Não |
| Foto | `patlasv4proto-pes-foto` | file | Geral › Principal | Não | Não |
| Carteira | `patlasv4proto-pes-carteira` | textOptions | Geral › Principal | Não | Não |
| Data de nascimento | `patlasv4proto-pes-nasc` | date | Geral › Principal | Não | Não |
| Falecido? | `patlasv4proto-pes-falecido` | boolean | Geral › Principal | Sim | Não |
| Documentos | `patlasv4proto-pes-documentos` | referência embutida | Geral › Principal | Não | Sim → **Pessoa — Documento** (`form-patlasv4-proto-pessoa-documento`) · exibição: `table` |
| Filiação | `patlasv4proto-pes-filiacao` | referência embutida | Geral › Principal | Não | Sim → **Pessoa — Filiação** (`form-patlasv4-proto-pessoa-filiacao`) · exibição: `table` |
| Sexo | `patlasv4proto-pes-sexo` | textOptions | Geral › Informações demográficas | Não | Não |
| Gênero | `patlasv4proto-pes-genero` | textOptions | Geral › Informações demográficas | Não | Não |
| Deficiências | `patlasv4proto-pes-deficiencias` | text | Geral › Informações demográficas | Não | Não |
| País de nascimento | `patlasv4proto-pes-pais-nasc` | text | Geral › Informações demográficas | Não | Não |
| Nacionalidade | `patlasv4proto-pes-nacionalidade` | text | Geral › Informações demográficas | Não | Não |
| Naturalidade | `patlasv4proto-pes-naturalidade` | text | Geral › Informações demográficas | Não | Não |
| Estado Civil | `patlasv4proto-pes-estado-civil` | text | Geral › Informações demográficas | Não | Não |
| Cor ou raça | `patlasv4proto-pes-cor-raca` | textOptions | Geral › Informações demográficas | Não | Não |
| Ativo para acesso | `patlasv4proto-pes-ativo-acesso` | boolean | Geral › Credenciais | Sim | Não |
| Login | `patlasv4proto-pes-login` | text | Geral › Credenciais | Sim | Não |
| Senha | `patlasv4proto-pes-senha` | text | Geral › Credenciais | Sim | Não |
| Telefones | `patlasv4proto-pes-telefones` | referência embutida | Dados de contato | Não | Sim → **Pessoa — Telefone** (`form-patlasv4-proto-pessoa-telefone`) · exibição: `table` |
| E-mails | `patlasv4proto-pes-emails` | referência embutida | Dados de contato | Não | Sim → **Pessoa — E-mail** (`form-patlasv4-proto-pessoa-email`) · exibição: `table` |
| E-mail principal | `patlasv4proto-pes-email-principal` | text | Dados de contato | Não | Não |
| Endereços | `patlasv4proto-pes-enderecos` | referência embutida | Dados de contato | Não | Sim → **Pessoa — Endereço** (`form-patlasv4-proto-pessoa-endereco`) · exibição: `table` |
| Redes sociais | `patlasv4proto-pes-redes` | referência embutida | Dados de contato | Não | Sim → **Pessoa — Rede social** (`form-patlasv4-proto-pessoa-rede-social`) · exibição: `table` |
| Possui documento pendente de criação no Sigadoc? | `patlasv4proto-pes-sigadoc-pendente` | boolean | Complementares | Não | Não |
| Matrícula no Sigadoc | `patlasv4proto-pes-matricula-sigadoc` | text | Complementares | Não | Não |
| MT-ID | `patlasv4proto-pes-mtid` | text | Complementares | Não | Não |
| Aceite de recebimento de notificação via email | `patlasv4proto-pes-aceite-email` | boolean | Complementares | Não | Não |
| Aceite de recebimento de notificação via sms | `patlasv4proto-pes-aceite-sms` | boolean | Complementares | Não | Não |
| Aceite de recebimento de notificação via Whatsapp | `patlasv4proto-pes-aceite-whatsapp` | boolean | Complementares | Não | Não |
| É um fornecedor? | `patlasv4proto-pes-fornecedor` | textOptions | Complementares | Sim | Não |
| Data do último trânsito em julgado | `patlasv4proto-pes-transito-julgado` | date | Complementares | Não | Não |
| Tipo de companhia | `patlasv4proto-pes-tipo-companhia` | textOptions | Complementares | Não | Não |
| Anexos | `patlasv4proto-pes-anexos` | file | Complementares | Não | Não |
| Clube do servidor | `patlasv4proto-pes-clube-servidor` | text | Complementares | Não | Não |
| Dados bancários | `patlasv4proto-pes-dados-banc` | referência embutida | Complementares | Não | Sim → **Pessoa — Dados bancários** (`form-patlasv4-proto-pessoa-dados-bancarios`) · exibição: `table` |
| Tags | `patlasv4proto-pes-tags` | text | Complementares | Não | Não |
| Código externo | `patlasv4proto-pes-codigo-ext` | text | Complementares | Não | Não |

> **Nota:** Classe Pessoa mantida conforme estrutura existente do SYDLE; regras específicas do Atlas devem apenas interpretar os campos, sem alterar obrigatoriedade da classe.

#### Campos de referência embutida

- **Documentos** (`patlasv4proto-pes-documentos`) → Pessoa — Documento (`form-patlasv4-proto-pessoa-documento`) · table · múltiplo
- **Filiação** (`patlasv4proto-pes-filiacao`) → Pessoa — Filiação (`form-patlasv4-proto-pessoa-filiacao`) · table · múltiplo
- **Telefones** (`patlasv4proto-pes-telefones`) → Pessoa — Telefone (`form-patlasv4-proto-pessoa-telefone`) · table · múltiplo
- **E-mails** (`patlasv4proto-pes-emails`) → Pessoa — E-mail (`form-patlasv4-proto-pessoa-email`) · table · múltiplo
- **Endereços** (`patlasv4proto-pes-enderecos`) → Pessoa — Endereço (`form-patlasv4-proto-pessoa-endereco`) · table · múltiplo
- **Redes sociais** (`patlasv4proto-pes-redes`) → Pessoa — Rede social (`form-patlasv4-proto-pessoa-rede-social`) · table · múltiplo
- **Dados bancários** (`patlasv4proto-pes-dados-banc`) → Pessoa — Dados bancários (`form-patlasv4-proto-pessoa-dados-bancarios`) · table · múltiplo

---

## 1.4 Servidor

Classe: `cls-patlasv4-proto-srv` · Formulário: `form-patlasv4-proto-servidor`

### Servidor

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-servidor` |
| **Layout** | Acordeão |
| **Modo padrão** | edit |
| **Metadados** | Protótipo Atlas — Servidor. Camada de acesso técnico/operacional. Vínculo funcional para workflow e assinatura é exclusivo de Cargo > Ocupantes. |

#### Abas / seções

- **Identificação** (`sec-patlasv4proto-srv-dados` · ícone: badge)
- **Permissões** (`sec-patlasv4proto-srv-permissoes` · ícone: admin_panel_settings)
- **Dados adicionais** (`sec-patlasv4proto-srv-dados-adic` · ícone: tune)
- **Acesso** (`sec-patlasv4proto-srv-acesso` · ícone: vpn_key)

> **Nota:** Classe Servidor mantida conforme estrutura existente do SYDLE. Os campos `Cargo` e `Lotação` em Dados adicionais são informativos e não substituem `Cargo > Ocupantes` como vínculo funcional (RN-SERV-07).

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Pessoa | `patlasv4proto-srv-pessoa` | referência | Identificação | Sim | Não → **Pessoa** (`form-patlasv4-proto-pessoa`) |
| Matrícula | `patlasv4proto-srv-matricula` | text | Identificação | Não | Não |
| Login | `patlasv4proto-srv-login` | text | Identificação | Sim | Não |
| E-mail | `patlasv4proto-srv-email` | text | Identificação | Não | Não |
| Desligado | `patlasv4proto-srv-desligado` | boolean | Identificação | Sim | Não |
| Perfis | `patlasv4proto-srv-perfis` | textOptions | Identificação | Não | Sim |
| Permissões | `patlasv4proto-srv-permissoes` | referência embutida | Permissões | Não | Sim → **Servidor — Permissão** (`form-patlasv4-proto-servidor-permissao`) · exibição: `table` |
| Cargo | `patlasv4proto-srv-cargo` | text | Dados adicionais | Não | Não |
| Carga horária semanal | `patlasv4proto-srv-carga` | text | Dados adicionais | Não | Não |
| Matrícula do Sigadoc | `patlasv4proto-srv-mat-sigadoc` | text | Dados adicionais › Sigadoc | Não | Não |
| Lotação | `patlasv4proto-srv-lotacao` | textOptions | Dados adicionais › Sigadoc | Não | Não |
| Ativo para acesso | `patlasv4proto-srv-ativo-acesso` | boolean | Acesso | Sim | Não |

#### Campos de referência

- **Pessoa** (`patlasv4proto-srv-pessoa`) → Pessoa (`form-patlasv4-proto-pessoa`)

#### Campos de referência embutida

- **Permissões** (`patlasv4proto-srv-permissoes`) → Servidor — Permissão (`form-patlasv4-proto-servidor-permissao`) · table · múltiplo

---

## 1.5 Cargo

Classe: `cls-patlasv4-proto-car` · Formulário: `form-patlasv4-proto-cargo`

### Cargo

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-cargo` |
| **Layout** | Abas |
| **Modo padrão** | edit |
| **Metadados** | Protótipo Atlas — Cargo. Papel funcional vinculado a uma Organização raiz (UO qualificada). Define permissões de processo e é usado em Workflows de Assinatura. |

#### Abas / seções

- **Dados do Cargo** (`sec-cargo-dados-do-cargo` · ícone: folder)
- **Ocupantes** (`sec-cargo-ocupantes` · ícone: folder)
- **Perfil de Permissões** (`sec-cargo-permissoes-de-visualizacao` · ícone: folder)

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Nome do Cargo | `patlasv4proto-cargo-dados-do-cargo-nome-do-cargo` | text | Dados do Cargo | Sim | Não |
| Sigla/Abreviatura | `patlasv4proto-cargo-dados-do-cargo-sigla-abreviatura` | text | Dados do Cargo | **Sim** | Não |
| Organização | `patlasv4proto-cargo-dados-do-cargo-organizacao` | referência | Dados do Cargo | **Sim** | Não → **Unidade Organizacional** (`form-patlasv4-proto-unidade-organizacional`) · filtro: Representa Organização? = Sim |
| Pode assinar | `patlasv4proto-cargo-dados-do-cargo-pode-assinar` | boolean | Dados do Cargo | Sim | Não |
| Ativo | `patlasv4proto-cargo-dados-do-cargo-ativo` | boolean | Dados do Cargo | Sim | Não |
| Observações | `patlasv4proto-cargo-dados-do-cargo-observacoes` | text | Dados do Cargo | Não | Não |
| Ocupantes | `patlasv4proto-cargo-ocupantes-lista` | referência embutida | Ocupantes | Não | Sim → **Cargo — Ocupantes** (`form-patlasv4-proto-cargo-ocupante`) · exibição: `table` |
| Permissões por Processo | `patlasv4proto-cargo-permissoes-de-visualizacao-lista` | referência embutida | Perfil de Permissões | Não | Sim → **Cargo — Permissão de Processo** (`form-patlasv4-proto-cargo-permissao-processo`) · exibição: `table` |

> **Correções aplicadas:**
> - `Sigla/Abreviatura` → **obrigatório** (antes: Não)
> - `Organização` → campo unificado: ID renomeado de `mqb2gfulxkiehk` / `patlasv4proto-cargo-dados-do-cargo-organizacao` para `patlasv4proto-cargo-dados-do-cargo-organizacao` (único); referência redirecionada de `form-patlasv4-proto-organizacao` para **`form-patlasv4-proto-unidade-organizacional`** com filtro `Representa Organização? = Sim`; marcado como **obrigatório** e **visível**
> - Campos **removidos**: `Região` (mqe60gq36fa67w · oculto), `Papel na assinatura` (violava RN-CARGO-08), `Atribuição técnica` (duplicado, oculto), `Atribuição técnica (invisivel)` (mqb2h35gjritbq), `Função` (oculto), `Organização qualificada` (substituído pelo campo Organização unificado), campo sem label `mqb40qby8vuc7q` (modelo antigo oculto)
> - `Permissões por Processo` → referência redirecionada de `Nova classe` (`mqepsb34w8ickk`) para **`form-patlasv4-proto-cargo-permissao-processo`** (novo formulário, lista dinâmica múltipla — ver seção 4)

#### Campos de referência

- **Organização** (`patlasv4proto-cargo-dados-do-cargo-organizacao`) → Unidade Organizacional (`form-patlasv4-proto-unidade-organizacional`) · filtro: Representa Organização? = Sim

#### Campos de referência embutida

- **Ocupantes** (`patlasv4proto-cargo-ocupantes-lista`) → Cargo — Ocupantes (`form-patlasv4-proto-cargo-ocupante`) · table · múltiplo
- **Permissões por Processo** (`patlasv4proto-cargo-permissoes-de-visualizacao-lista`) → Cargo — Permissão de Processo (`form-patlasv4-proto-cargo-permissao-processo`) · table · múltiplo

---

## 2. Versões de Processo

Classe no workspace: **Configurações do Processo** (`cls-patlasv4-proto-cfg`) · Nome do formulário: **Versões de Processo**

### Versões de Processo

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-config-processo` |
| **Layout** | Abas |
| **Modo padrão** | edit |
| **Metadados** | Protótipo Atlas — Configurações do Processo. Controla a vigência das configurações de tipos de processo e métodos/ações disponíveis no Atlas. |

#### Abas / seções

- **Dados da Versão** (`sec-configuracoes-do-processo-versoes` · ícone: folder)
- **Processos da Versão** (`sec-configuracoes-do-processo-tipos-de-processo` · ícone: folder)

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Nome | `patlasv4proto-configuracoes-do-processo-versoes-nome` | text | Dados da Versão | Sim | Não |
| Vigente | `patlasv4proto-configuracoes-do-processo-versoes-vigente` | boolean | Dados da Versão | Sim | Não |
| Ativo | `patlasv4proto-configuracoes-do-processo-versoes-ativo` | boolean | Dados da Versão | Sim | Não |
| Data de início | `patlasv4proto-configuracoes-do-processo-versoes-data-de-inicio` | date | Dados da Versão | Não | Não |
| Data de fim | `patlasv4proto-configuracoes-do-processo-versoes-data-de-fim` | date | Dados da Versão | Não | Não |
| Descrição | `patlasv4proto-configuracoes-do-processo-versoes-descricao` | text | Dados da Versão | Não | Não |
| Processos da Versão | `patlasv4proto-configuracoes-do-processo-tipos-de-processo-lista` | referência embutida | Processos da Versão | Não | **Sim** → **Versão — Processo** (`form-patlasv4-proto-versao-processo`) · exibição: `table` |

> **Correções aplicadas:**
> - `Tipo de processo` → renomeado para `Processos da Versão`; convertido de **referência embutida raiz única (form, Múlt.: Não)** para **referência embutida múltipla (table, Múlt.: Sim)** apontando para novo formulário `form-patlasv4-proto-versao-processo` (lista dinâmica — ver seção 4)
> - `Descrição` → ID padronizado de `patlasv4proto-configuracoes-do-processo-tipos-de-processo-descricao` para `patlasv4proto-configuracoes-do-processo-versoes-descricao`; movido para aba **Dados da Versão** (antes estava misturado na aba Processos da Versão)
> - Campo `Ativo` oculto que estava na aba Processos da Versão → **removido** (duplicado do campo Ativo da versão)

#### Campos de referência embutida

- **Processos da Versão** (`patlasv4proto-configuracoes-do-processo-tipos-de-processo-lista`) → Versão — Processo (`form-patlasv4-proto-versao-processo`) · table · múltiplo

---

## 3. Workflow de Assinatura

Formulário: **Workflow de Assinatura** (`mqebasqyphbwea`) — referenciado pela configuração de fluxos de assinatura.

### Workflow de Assinatura

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `mqebasqyphbwea` |
| **Layout** | Abas |
| **Metadados** | Protótipo Atlas — Workflow de Assinatura. Define a cadeia de etapas de aprovação/assinatura vinculada a uma Versão de Processo e a um Tipo de Processo. Execução técnica via Envelope GED. |

#### Abas / seções

- **Geral** (`sec-mqebd7w3-0kqe9xr`)
- **Etapas do Workflow** (`sec-mqebdc0b-su7wekt`)

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Nome | `mqebbhmoqkwm52` | text | Geral | Sim | Não |
| Tipo Processo | `mqedr9ct0hhc4j` | textOptions | Geral | **Sim** | Não |
| Versão | `mqebbnn93hgiee` | **referência** | Geral | Sim | Não → **Versões de Processo** (`form-patlasv4-proto-config-processo`) |
| Ativo | `mqebbtncrtsktq` | boolean | Geral | Sim | Não |
| Etapas | `mqebf4c2vpv5q8` | referência embutida | Etapas do Workflow | Não | Sim → **Configurações do Processo — Etapas do Workflow** (`form-patlasv4-proto-workflow-etapa`) · exibição: `table` |

> **Correções aplicadas:**
> - `Versão` → convertido de **number** para **referência** a `form-patlasv4-proto-config-processo` (antes: tipo number sem integridade referencial; violava RN-WF-02)
> - `Tipo Processo` → marcado como **obrigatório** (antes: Não); opções do textOptions devem ser exatamente: `Proposta; Contrato; Ordem de Serviço (OS); Termo de Homologação; RAER` — **Pedido de Venda não deve constar** (RN-WF-05/06)

#### Campos de referência

- **Versão** (`mqebbnn93hgiee`) → Versões de Processo (`form-patlasv4-proto-config-processo`)

#### Campos de referência embutida

- **Etapas** (`mqebf4c2vpv5q8`) → Configurações do Processo — Etapas do Workflow (`form-patlasv4-proto-workflow-etapa`) · table · múltiplo

---

## 4. Formulários embutidos (linhas)

Formulários usados como linhas em tabelas (`embeddedReference`) pelas classes acima.

---

### Cargo — Ocupantes

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-cargo-ocupante` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Servidor | `patlasv4proto-cargo-ocupantes-servidor` | **referência** | — (sem aba / layout único) | Sim | Não → **Servidor** (`form-patlasv4-proto-servidor`) |
| Condição | `patlasv4proto-cargo-ocupantes-condicao` | textOptions | — (sem aba / layout único) | Sim | Não |
| Unidade de atuação | `patlasv4proto-cargo-ocupantes-unidade-de-atuacao` | referência | — (sem aba / layout único) | Sim | Não → **Unidade Organizacional** (`form-patlasv4-proto-unidade-organizacional`) |
| Região de atuação | `patlasv4proto-cargo-ocupantes-regiao-atuacao` | **textOptions** | — (sem aba / layout único) | Não | **Sim** |
| Data de início | `patlasv4proto-cargo-ocupantes-data-de-inicio` | date | — (sem aba / layout único) | Não | Não |
| Data de fim | `patlasv4proto-cargo-ocupantes-data-de-fim` | date | — (sem aba / layout único) | Não | Não |
| Observação | `mqe8is4now3bmu` | text | — (sem aba / layout único) | Não | Não |
| Ativo | `patlasv4proto-cargo-ocupantes-ativo` | boolean | — (sem aba / layout único) | Sim | Não |

> **Correções aplicadas:**
> - `Servidor` → referência redirecionada de **Pessoa** (`form-patlasv4-proto-pessoa`) para **Servidor** (`form-patlasv4-proto-servidor`). ID renomeado de `patlasv4proto-cargo-ocupantes-pessoa-servidor` para `patlasv4proto-cargo-ocupantes-servidor`. O campo deve listar apenas Servidores ativos e não desligados (RN-CARGO-03)
> - `Região de atuação` → convertido de **text** (campo livre) para **textOptions múltiplo** com as opções: `Todos; AC; AL; AP; AM; BA; CE; DF; ES; GO; MA; MT; MS; MG; PA; PB; PR; PE; PI; RJ; RN; RS; RO; RR; SC; SP; SE; TO`. ID renomeado de `mqb3fkiq1eaj2i` para `patlasv4proto-cargo-ocupantes-regiao-atuacao`
> - Campo `Produto/Parceria de atuação` (`mqb3dw2s9e8kmy`, oculto, referência undefined) → **removido** (sem destino definido e fora do escopo da Fase 1)
> - `Condição` → opções do textOptions devem ser exatamente: `Titular; Substituto; Suplente`

#### Campos de referência

- **Servidor** (`patlasv4proto-cargo-ocupantes-servidor`) → Servidor (`form-patlasv4-proto-servidor`)
- **Unidade de atuação** (`patlasv4proto-cargo-ocupantes-unidade-de-atuacao`) → Unidade Organizacional (`form-patlasv4-proto-unidade-organizacional`)

---

### Cargo — Permissão de Processo

> **NOVO formulário** — substitui `Perfil de permissções do cargo` (`mqb42v0racoi6h`) e a `Nova classe` (`mqepsb34w8ickk`) no contexto de permissões do Cargo.

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-cargo-permissao-processo` |
| **Layout** | Sem seções (layout único) |
| **Metadados** | Linha de permissão de processo do Cargo. Define qual Tipo de Processo o cargo pode operar e quais Métodos/Ações estão habilitados. Aprovar, Recusar e Assinar não devem constar como opções (RN-CARGO-09). Tipo de Processo e Métodos/Ações são listas técnicas carregadas do backend; o usuário apenas seleciona. |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Tipo de Processo | `patlasv4proto-cargo-perm-tipo-processo` | lista técnica do backend | — (sem aba / layout único) | Sim | Não |
| Métodos/Ações | `patlasv4proto-cargo-perm-metodos-acoes` | lista técnica filtrada pelo Tipo de Processo | — (sem aba / layout único) | Sim | Sim |

> **Substitui:**
> - `Perfil de permissções do cargo` (`mqb42v0racoi6h`) — removido. Modelo antigo com campos booleanos Visualizar/Editar/Cadastrar e typos (`Prcesso`, `permissções`) era incompatível com a especificação
> - `Nova classe` (`mqepsb34w8ickk`) no contexto de Cargo — 5 pares fixos hardcoded removidos; substituídos por lista dinâmica múltipla

---

### Versão — Processo

> **NOVO formulário** — substitui a `Nova classe` (`mqepsb34w8ickk`) no contexto de Versões de Processo.

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-versao-processo` |
| **Layout** | Sem seções (layout único) |
| **Metadados** | Linha da aba Processos da Versão. Define qual Tipo de Processo está habilitado na versão e quais Métodos/Ações estão disponíveis. Métodos/Ações devem ser carregados do backend conforme o Tipo de Processo selecionado; o usuário não cria livremente (RN-VERS-06). |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Tipo de Processo | `patlasv4proto-versao-proc-tipo-processo` | lista técnica do backend | — (sem aba / layout único) | Sim | Não |
| Métodos/Ações | `patlasv4proto-versao-proc-metodos-acoes` | lista técnica filtrada pelo Tipo de Processo | — (sem aba / layout único) | Sim | Sim |

> **Substitui:** `Nova classe` (`mqepsb34w8ickk`) — 10 campos fixos hardcoded (5 pares Tipo de Processo + Métodos/ações) removidos e substituídos por lista dinâmica múltipla

---

### Configurações do Processo — Etapas do Workflow

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-workflow-etapa` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Ordem | `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-ordem` | number | — (sem aba / layout único) | Sim | Não |
| Descrição | `mqecjdq28zqnu3` | text | — (sem aba / layout único) | Sim | Não |
| Organização | `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-organizacao` | referência | — (sem aba / layout único) | Sim | Não → **Unidade Organizacional** (`form-patlasv4-proto-unidade-organizacional`) · filtro: Representa Organização? = Sim |
| Unidade Organizacional | `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-unidade-organizacional` | referência | — (sem aba / layout único) | Não | Não → **Unidade Organizacional** (`form-patlasv4-proto-unidade-organizacional`) |
| Cargo | `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-cargo` | referência | — (sem aba / layout único) | Não | Não → **Cargo** (`form-patlasv4-proto-cargo`) · filtro: Pode assinar = Sim |
| Pessoa específica | `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-pessoa-especifica` | referência | — (sem aba / layout único) | Não | Não → **Pessoa** (`form-patlasv4-proto-pessoa`) |
| Papel no envelope | `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-papel-envelope` | textOptions | — (sem aba / layout único) | Não | Não |
| Parecer | `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-acao` | textOptions | — (sem aba / layout único) | Sim | Não |
| Prazo (dias) | `mqeb447176ugp7` | number | — (sem aba / layout único) | Não | Não |
| Notificação por e-mail | `mqeb4fbm1u7qp7` | boolean | — (sem aba / layout único) | Não | Não |
| Ativo | `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-ativo` | boolean | — (sem aba / layout único) | Sim | Não |

> **Correções aplicadas:**
> - `Organização` → referência redirecionada de `form-patlasv4-proto-organizacao` para **`form-patlasv4-proto-unidade-organizacional`** com filtro `Representa Organização? = Sim`
> - `Papel no envelope` → typo `enveope` corrigido para `envelope`; ID renomeado de `mqemyo2k0d2q25` para `patlasv4proto-configuracoes-do-processo-etapas-do-workflow-papel-envelope`; tipo convertido de `referência` para **`textOptions`** com opções: `Aprovador; Assinante; Testemunha`
> - `Parecer` → tipo convertido de `referência` para **`textOptions`** com opções: `Aprovar; Recusar/Rejeitar`. Recusa deve exigir justificativa e retornar o processo ao início do fluxo (RN-WF-09)
> - `Cargo` → filtro adicionado: listar apenas Cargos ativos com `Pode assinar = Sim` (RN-WF-ET-03)
> - Campo `Assinar com` (`mqekw7b2nxf1v1`, oculto) → **removido** (não consta da especificação; campo remanescente de versão anterior)

#### Campos de referência

- **Organização** (`patlasv4proto-configuracoes-do-processo-etapas-do-workflow-organizacao`) → Unidade Organizacional (`form-patlasv4-proto-unidade-organizacional`) · filtro: Representa Organização? = Sim
- **Unidade Organizacional** (`patlasv4proto-configuracoes-do-processo-etapas-do-workflow-unidade-organizacional`) → Unidade Organizacional (`form-patlasv4-proto-unidade-organizacional`)
- **Cargo** (`patlasv4proto-configuracoes-do-processo-etapas-do-workflow-cargo`) → Cargo (`form-patlasv4-proto-cargo`) · filtro: Pode assinar = Sim
- **Pessoa específica** (`patlasv4proto-configuracoes-do-processo-etapas-do-workflow-pessoa-especifica`) → Pessoa (`form-patlasv4-proto-pessoa`)

---

### Servidor — Permissão

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-servidor-permissao` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Unidade Organizacional | `patlasv4proto-sperm-uo` | referência | — (sem aba / layout único) | Sim | Não → **Unidade Organizacional** (`form-patlasv4-proto-unidade-organizacional`) |
| Atribuições | `patlasv4proto-sperm-atribuicoes` | **textOptions** | — (sem aba / layout único) | Sim | Sim |
| Dados Adicionais | `patlasv4proto-sperm-dados-adic` | text | — (sem aba / layout único) | Não | Não |

> **Correção:** `Atribuições` → convertido de **referência a Cargo** (`form-patlasv4-proto-cargo`) para **textOptions múltiplo**. Atribuições são componentes técnicos de acesso do SYDLE ONE e não devem referenciar a entidade Cargo funcional — isso criava sobreposição entre permissão técnica e vínculo funcional (RN-SERV-05/06). As opções de atribuições técnicas devem ser definidas conforme os perfis do ambiente SYDLE ONE.

#### Campos de referência

- **Unidade Organizacional** (`patlasv4proto-sperm-uo`) → Unidade Organizacional (`form-patlasv4-proto-unidade-organizacional`)

---

### Pessoa — Dados bancários

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-pessoa-dados-bancarios` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Banco | `patlasv4proto-pban-banco` | text | — (sem aba / layout único) | Não | Não |
| Agência | `patlasv4proto-pban-agencia` | text | — (sem aba / layout único) | Não | Não |
| Conta | `patlasv4proto-pban-conta` | text | — (sem aba / layout único) | Não | Não |

---

### Pessoa — Documento

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-pessoa-documento` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Tipo | `patlasv4proto-pdoc-tipo` | text | — (sem aba / layout único) | Sim | Não |
| Número | `patlasv4proto-pdoc-numero` | text | — (sem aba / layout único) | Sim | Não |
| Arquivo | `patlasv4proto-pdoc-arquivo` | file | — (sem aba / layout único) | Não | Não |

---

### Pessoa — E-mail

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-pessoa-email` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Tipo | `patlasv4proto-peml-tipo` | textOptions | — (sem aba / layout único) | Sim | Não |
| Email | `patlasv4proto-peml-email` | text | — (sem aba / layout único) | Sim | Não |

---

### Pessoa — Endereço

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-pessoa-endereco` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| CEP | `patlasv4proto-pend-cep` | text | — (sem aba / layout único) | Sim | Não |
| Logradouro | `patlasv4proto-pend-logradouro` | text | — (sem aba / layout único) | Sim | Não |
| Número | `patlasv4proto-pend-numero` | text | — (sem aba / layout único) | Sim | Não |
| Complemento | `patlasv4proto-pend-complemento` | text | — (sem aba / layout único) | Não | Não |
| Bairro | `patlasv4proto-pend-bairro` | text | — (sem aba / layout único) | Sim | Não |
| Cidade | `patlasv4proto-pend-cidade` | text | — (sem aba / layout único) | Não | Não |
| Estado | `patlasv4proto-pend-estado` | text | — (sem aba / layout único) | Não | Não |
| País | `patlasv4proto-pend-pais` | text | — (sem aba / layout único) | Não | Não |

---

### Pessoa — Filiação

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-pessoa-filiacao` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Nome | `patlasv4proto-pfil-nome` | text | — (sem aba / layout único) | Sim | Não |

---

### Pessoa — Rede social

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-pessoa-rede-social` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Rede | `patlasv4proto-pred-rede` | text | — (sem aba / layout único) | Sim | Não |
| URL | `patlasv4proto-pred-url` | text | — (sem aba / layout único) | Não | Não |
| Usuário | `patlasv4proto-pred-usuario` | text | — (sem aba / layout único) | Não | Não |

---

### Pessoa — Telefone

| Propriedade | Valor |
| --- | --- |
| **ID do formulário** | `form-patlasv4-proto-pessoa-telefone` |
| **Layout** | Sem seções (layout único) |

#### Campos

| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |
| --- | --- | --- | --- | --- | --- |
| Tipo | `patlasv4proto-ptel-tipo` | text | — (sem aba / layout único) | Sim | Não |
| País | `patlasv4proto-ptel-pais` | text | — (sem aba / layout único) | Sim | Não |
| DDI | `patlasv4proto-ptel-ddi` | text | — (sem aba / layout único) | Não | Não |
| Número | `patlasv4proto-ptel-numero` | text | — (sem aba / layout único) | Sim | Não |

---

## 5. Resumo — referências e embutidos

### Cadastro base

| Classe | Referências | Referências embutidas |
| --- | --- | --- |
| ~~Organização~~ | **REMOVIDA** | — |
| Nível Organizacional | — | — |
| Unidade Organizacional | Unidade pai, Unidade substituída por, Nível Organizacional, Produto / Parceria, Responsável | E-mails → Pessoa — E-mail; Telefones → Pessoa — Telefone; Endereços → Pessoa — Endereço; Redes sociais → Pessoa — Rede social |
| Pessoa | — | Documentos → Pessoa — Documento; Filiação → Pessoa — Filiação; Telefones → Pessoa — Telefone; E-mails → Pessoa — E-mail; Endereços → Pessoa — Endereço; Redes sociais → Pessoa — Rede social; Dados bancários → Pessoa — Dados bancários |
| Servidor | Pessoa, Lotação | Permissões → Servidor — Permissão |
| Cargo | Organização (UO qualificada) | Ocupantes → Cargo — Ocupantes; Permissões por Processo → Cargo — Permissão de Processo |

### Versões de Processo e Workflow de Assinatura

**Versões de Processo** (`form-patlasv4-proto-config-processo`)
- Referências: —
- Embutidos: Processos da Versão → Versão — Processo

**Workflow de Assinatura** (`mqebasqyphbwea`)
- Referências: Versão → Versões de Processo
- Embutidos: Etapas → Configurações do Processo — Etapas do Workflow

### Formulários embutidos novos / substituídos

| Formulário | ID | Substitui | Motivo |
| --- | --- | --- | --- |
| Cargo — Permissão de Processo | `form-patlasv4-proto-cargo-permissao-processo` | `mqb42v0racoi6h` (Perfil de permissções do cargo) + `mqepsb34w8ickk` (Nova classe) no Cargo | Modelo booleano e hardcoded incompatível com a especificação |
| Versão — Processo | `form-patlasv4-proto-versao-processo` | `mqepsb34w8ickk` (Nova classe) nas Versões de Processo | 5 pares fixos substituídos por lista dinâmica múltipla |

### Formulários removidos

| Formulário | ID | Motivo |
| --- | --- | --- |
| Organização | `form-patlasv4-proto-organizacao` | Organização não é entidade independente — é qualificação da UO (RN-UO-02) |
| Nova classe | `mqepsb34w8ickk` | Substituída por dois formulários específicos: `form-patlasv4-proto-cargo-permissao-processo` e `form-patlasv4-proto-versao-processo` |
| Perfil de permissções do cargo | `mqb42v0racoi6h` | Modelo incorreto (booleanos fixos + typos). Substituído por `form-patlasv4-proto-cargo-permissao-processo` |
