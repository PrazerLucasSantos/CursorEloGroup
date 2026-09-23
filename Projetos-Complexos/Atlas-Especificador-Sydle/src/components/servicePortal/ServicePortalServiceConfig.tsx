import { useState } from 'react'
import type { FlowStep } from '../../types'
import FlowStepConfigAutosizeTextarea from '../FlowStepConfigAutosizeTextarea'
import ServicePortalFieldHelpLabel from './ServicePortalFieldHelpLabel'

interface Props {
  step: FlowStep
  onUpdateStep: (patch: Partial<FlowStep>) => void
}

export default function ServicePortalServiceConfig({ step, onUpdateStep }: Props) {
  const [openHelpId, setOpenHelpId] = useState<string | null>(null)

  return (
    <div className="flow-step-config__bpmn">
      <div className="acc acc--open">
        <div className="acc__header" aria-label="Configurações de serviço">
          <span className="acc__header-main">
            <span className="acc__name">Configurações · Serviço</span>
          </span>
        </div>
        <div className="acc__body">
          <ServicePortalFieldHelpLabel
            id="sp-service-name"
            label="Nome do serviço"
            help="Nome exibido para os usuários no catálogo e no fluxo."
            openId={openHelpId}
            onToggle={setOpenHelpId}
          >
            <input
              type="text"
              className="acc__input"
              value={step.servicePortalServiceName ?? ''}
              onChange={(e) =>
                onUpdateStep({
                  servicePortalServiceName: e.target.value === '' ? undefined : e.target.value,
                })
              }
              placeholder="Ex.: Solicitar aditivo contratual"
            />
          </ServicePortalFieldHelpLabel>

          <ServicePortalFieldHelpLabel
            id="sp-service-code"
            label="Código/ID do serviço"
            help="Identificador técnico no catálogo para integração e rastreabilidade."
            openId={openHelpId}
            onToggle={setOpenHelpId}
          >
            <input
              type="text"
              className="acc__input"
              value={step.servicePortalServiceCode ?? ''}
              onChange={(e) =>
                onUpdateStep({
                  servicePortalServiceCode: e.target.value === '' ? undefined : e.target.value,
                })
              }
              placeholder="Ex.: srv-contrato-aditivo"
            />
          </ServicePortalFieldHelpLabel>

          <ServicePortalFieldHelpLabel
            id="sp-service-entry-url"
            label="Rota/URL de entrada"
            help="URL inicial do serviço (portal ou integração externa)."
            openId={openHelpId}
            onToggle={setOpenHelpId}
          >
            <input
              type="text"
              className="acc__input"
              value={step.servicePortalServiceEntryUrl ?? ''}
              onChange={(e) =>
                onUpdateStep({
                  servicePortalServiceEntryUrl: e.target.value === '' ? undefined : e.target.value,
                })
              }
              placeholder="Ex.: /servicos/aditivo-contratual"
            />
          </ServicePortalFieldHelpLabel>

          <ServicePortalFieldHelpLabel
            id="sp-service-summary"
            label="Resumo do serviço"
            help="Descrição do escopo e do resultado esperado ao executar este serviço."
            openId={openHelpId}
            onToggle={setOpenHelpId}
          >
            <FlowStepConfigAutosizeTextarea
              className="acc__input acc__textarea flow-step-config__textarea-doc"
              value={step.servicePortalServiceSummary ?? ''}
              onChange={(e) =>
                onUpdateStep({
                  servicePortalServiceSummary: e.target.value === '' ? undefined : e.target.value,
                })
              }
              placeholder="Descreva o serviço e quando ele deve ser usado."
            />
          </ServicePortalFieldHelpLabel>

          <ServicePortalFieldHelpLabel
            id="sp-service-sla"
            label="SLA esperado"
            help="Prazo de atendimento prometido ou meta operacional do serviço."
            openId={openHelpId}
            onToggle={setOpenHelpId}
          >
            <input
              type="text"
              className="acc__input"
              value={step.servicePortalServiceSla ?? ''}
              onChange={(e) =>
                onUpdateStep({
                  servicePortalServiceSla: e.target.value === '' ? undefined : e.target.value,
                })
              }
              placeholder="Ex.: até 2 dias úteis após solicitação"
            />
          </ServicePortalFieldHelpLabel>

          <ServicePortalFieldHelpLabel
            id="sp-service-owner"
            label="Área responsável"
            help="Unidade responsável por operar e responder pelo serviço."
            openId={openHelpId}
            onToggle={setOpenHelpId}
          >
            <input
              type="text"
              className="acc__input"
              value={step.servicePortalServiceOwnerArea ?? ''}
              onChange={(e) =>
                onUpdateStep({
                  servicePortalServiceOwnerArea: e.target.value === '' ? undefined : e.target.value,
                })
              }
              placeholder="Ex.: Coordenadoria de contratos"
            />
          </ServicePortalFieldHelpLabel>
        </div>
      </div>
    </div>
  )
}
