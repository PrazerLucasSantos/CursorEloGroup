# Análise e Decisão

ID: `form-nen-analise-decisao`

## Processo

- Nº protocolo — `text` (`nen-ad-prot`)
- Status * — `textOptions` (`nen-ad-status`)
- Nome do estabelecimento — `text` (`nen-ad-empresa`)
- Analista responsável * — `text` (`nen-ad-analista`)
- Abertura da análise — `date` (`nen-ad-data-abertura`)
- Prazo restante — `text` (`nen-ad-prazo`)

## Análise

_Sem campos nesta seção._

## Pedido

- Formulário de solicitação * — `embeddedReference` (`nen-ad-ref-solicitacao`)

## Checklist

- Dados e fachada * — `textOptions` (`nen-ad-chk-dados`)
- Complementação — Dados e fachada * — `text` (`nen-ad-comp-dados`)
- Enquadramento * — `textOptions` (`nen-ad-chk-enquadramento`)
- Complementação — Enquadramento * — `text` (`nen-ad-comp-enquadramento`)
- Equipe e capacitação * — `textOptions` (`nen-ad-chk-equipe`)
- Complementação — Equipe * — `text` (`nen-ad-comp-equipe`)
- Sinalização (fotos) * — `textOptions` (`nen-ad-chk-sinalizacao`)
- Complementação — Sinalização * — `text` (`nen-ad-comp-sinalizacao`)
- Procedimentos * — `textOptions` (`nen-ad-chk-procedimentos`)
- Complementação — Procedimentos * — `text` (`nen-ad-comp-procedimentos`)
- Câmeras * — `textOptions` (`nen-ad-chk-cameras`)
- Complementação — Câmeras * — `text` (`nen-ad-comp-cameras`)
- Declarações * — `textOptions` (`nen-ad-chk-declaracoes`)
- Complementação — Declarações * — `text` (`nen-ad-comp-declaracoes`)

## Cartaz e Sinal Vermelho

- Forma de acionar o Protocolo no cartaz * — `textOptions` (`nen-ad-chk-sinal-acionar`)
- Telefone 190 no cartaz * — `textOptions` (`nen-ad-chk-sinal-190`)
- Telefone 180 no cartaz * — `textOptions` (`nen-ad-chk-sinal-180`)
- Formato A3 e texto oficial do cartaz * — `textOptions` (`nen-ad-chk-sinal-a3`)
- Sinal Vermelho * — `textOptions` (`nen-ad-chk-codigo`)
- Complementação — Sinal Vermelho * — `text` (`nen-ad-comp-codigo`)

## Apoio

- Observações da análise — `text` (`nen-ad-obs-analise`)
- Documentos da análise — `file` (`nen-ad-docs-analise`)

## Diligência

- Prazo da diligência — `text` (`nen-ad-prazo-diligencia`)
- Pendências (todas de uma vez) * — `text` (`nen-ad-pendencias-diligencia`)
- Formulário de Ajustes — `reference` (`nen-ad-ref-diligencia`)

## Decisão

- Parecer / fundamentação * — `text` (`nen-ad-parecer`)
- Requisitos não atendidos — `text` (`nen-ad-req`)
- Fundamentos legais — `text` (`nen-ad-legal`)
- Data da decisão — `date` (`nen-ad-data-decisao`)

## Resultado

- Selo / certificado — `reference` (`nen-ad-ref-selo`)

## Recurso

- Peça de recurso — `reference` (`nen-ad-ref-recurso`)
- Decisão do recurso * — `textOptions` (`nen-ad-julgamento`)
- Fundamentação do julgamento * — `text` (`nen-ad-julgamento-fund`)

## Métodos

- nen-ad-atender (`nen-ad-atender`)
- nen-ad-salvar (`nen-ad-salvar`)
- nen-ad-diligencia (`nen-ad-diligencia`)
- nen-ad-enviar-analise (`nen-ad-enviar-analise`)
- nen-ad-dil-respondida (`nen-ad-dil-respondida`)
- nen-ad-retomar (`nen-ad-retomar`)
- nen-ad-dil-nao-respondida (`nen-ad-dil-nao-respondida`)
- nen-ad-deferir (`nen-ad-deferir`)
- nen-ad-indeferir (`nen-ad-indeferir`)
- nen-ad-baixar-cert (`nen-ad-baixar-cert`)
- nen-ad-abrir-recurso (`nen-ad-abrir-recurso`)
- nen-ad-julgar-rec (`nen-ad-julgar-rec`)
