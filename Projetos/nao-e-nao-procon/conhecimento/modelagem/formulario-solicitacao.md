# Formulário de Solicitação

ID: `form-nen-solicitacao`

## Dados do estabelecimento

- Nº protocolo — `text` (`nen-sol-protocolo`)
- Status do pedido — `textOptions` (`nen-sol-status`)
- Responsável pelo requerimento * — `text` (`nen-sol-resp`)
- Contato do responsável * — `text` (`nen-sol-contato`)
- CPF do responsável * — `text` (`nen-sol-cpf`)
- Estabelecimento * — `textOptions` (`nen-sol-estab`)
- CNPJ * — `text` (`nen-sol-cnpj`)
- Razão social * — `text` (`nen-sol-razao`)
- Nome fantasia * — `text` (`nen-sol-fantasia`)
- CNAE / atividade * — `text` (`nen-sol-cnae`)
- CEP * — `text` (`nen-sol-cep`)
- Logradouro * — `text` (`nen-sol-logradouro`)
- Número * — `text` (`nen-sol-numero`)
- Bairro * — `text` (`nen-sol-bairro`)
- Complemento — `text` (`nen-sol-complemento`)
- Cidade * — `text` (`nen-sol-cidade`)
- Estado * — `textOptions` (`nen-sol-uf`)
- Endereço completo (composto) — `text` (`nen-sol-end`)
- Município (legado) — `text` (`nen-sol-mun`)
- Fotografia da fachada do estabelecimento * — `file` (`nen-sol-fachada`)

## Enquadramento

- O estabelecimento é casa noturna ou boate? * — `textOptions` (`nen-sol-boate`)
- Realiza espetáculo musical em local fechado, shows ou eventos musicais? * — `textOptions` (`nen-sol-show`)
- Há venda de bebida alcoólica? * — `textOptions` (`nen-sol-alcool`)
- Trata-se de competição ou evento esportivo? * — `textOptions` (`nen-sol-esporte`)

## Equipe e capacitação

- Quantos funcionários/pessoas integrantes da equipe atuam no estabelecimento? * — `number` (`nen-sol-qtd-func`)
- Quantos possuem capacitação para aplicação do Protocolo "Não é Não"? * — `number` (`nen-sol-qtd-cap`)
- Percentual de funcionários capacitados — `text` (`nen-sol-perc`)
- Capacitados * — `embeddedReference` (`nen-sol-capacitados`)

## Sinalização

- O estabelecimento mantém, nos banheiros femininos, informação sobre a disponibilidade do estabelecimento para o auxílio às mulheres que se sintam em situação de risco? * — `textOptions` (`nen-sol-banheiro`)
- Fotografia da sinalização afixada no banheiro feminino * — `file` (`nen-sol-foto-banheiro`)
- O estabelecimento mantém, em local de ampla visualização, informação sobre a disponibilidade do estabelecimento para o auxílio às mulheres que se sintam em situação de risco? * — `textOptions` (`nen-sol-local-visivel`)
- Fotografia da sinalização afixada em local de ampla visualização * — `file` (`nen-sol-foto-local`)

## Procedimentos

- Em caso de possível situação de constrangimento, o estabelecimento orienta sua equipe a verificar, de maneira reservada e respeitosa, se a mulher necessita de assistência? * — `textOptions` (`nen-sol-p1`)
- Havendo indícios de violência, o estabelecimento orienta sua equipe a proteger a mulher e afastá-la do agressor, inclusive do seu alcance visual? * — `textOptions` (`nen-sol-p2`)
- A equipe está orientada a colaborar para identificação de possíveis testemunhas, nos casos de indícios de violência? * — `textOptions` (`nen-sol-p3`)
- A equipe está orientada a solicitar o comparecimento da Polícia Militar ou de outro agente público competente quando necessário? * — `textOptions` (`nen-sol-p4`)
- A equipe está orientada a preservar o local específico em que existam vestígios da violência, inclusive sexual, até a chegada da autoridade competente? * — `textOptions` (`nen-sol-p5`)
- O estabelecimento adota medidas para auxiliar as mulheres que se sintam em situação de risco nas dependências do estabelecimento, mediante a oferta de acompanhamento até o carro, outro meio de transporte ou comunicação à polícia? * — `textOptions` (`nen-sol-p6`)
- A equipe está orientada no sentido de que cabe à própria mulher definir se sofreu constrangimento ou violência para fins de aplicação do Protocolo "Não é Não"? * — `textOptions` (`nen-sol-p7`)
- O estabelecimento presta suporte e assistência imediatos à vítima, quando identificada a prática de assédio sexual ou de conduta relacionada à cultura do estupro e mediante solicitação, abrangendo todas as etapas desde o acolhimento no estabelecimento até o acompanhamento à residência, unidade de saúde, posto policial ou outro local necessário, conforme o art. 2º da Lei Estadual n.º 12.478/2024? * — `textOptions` (`nen-sol-p8`)
- A equipe está orientada sobre o protocolo do Código Sinal Vermelho para, diante de um pedido de socorro (seja pela expressão “sinal vermelho”, pela mão aberta com marca em “X” ou por meios alternativos de comunicação do sinal), coletar o nome da vítima, seu endereço ou telefone e ligar imediatamente para o 190 (Polícia Militar), nos termos da Lei Estadual n.º 11.889/2022? * — `textOptions` (`nen-sol-p9`)
- A equipe está orientada a reconhecer o sinal gestual de pedido de socorro pela mulher, caracterizado por mostrar a palma da mão, dobrar o polegar para dentro e fechar os demais dedos sobre ele? * — `textOptions` (`nen-sol-p10`)
- O estabelecimento se compromete a assegurar os direitos da mulher previstos no Protocolo "Não é Não"? * — `textOptions` (`nen-sol-p11`)

## Câmeras

- O estabelecimento dispõe de sistema de câmeras de segurança? * — `textOptions` (`nen-sol-tem-cam`)
- Em caso de ocorrência, o estabelecimento preservará por pelo menos 30 dias as imagens relacionadas ao fato? — `textOptions` (`nen-sol-cam-30`)
- O estabelecimento garantirá acesso às imagens, nos termos da legislação, à Polícia Civil, perícia oficial e aos diretamente envolvidos? — `textOptions` (`nen-sol-cam-acesso`)

## Declarações

- Declaro que o estabelecimento implementou o Protocolo "Não é Não" e manterá os requisitos necessários durante a vigência do selo. * — `boolean` (`nen-sol-dec-impl`)
- Declaro que as informações e os documentos apresentados são verdadeiros, sob as penas da Lei. * — `boolean` (`nen-sol-dec-ver`)
- Houve sanção administrativa definitiva relacionada ao descumprimento do protocolo nos 12 meses anteriores? * — `textOptions` (`nen-sol-sancao`)
- Comprovante de protocolização — `file` (`nen-sol-comprovante`)
- Declaro que revisei todas as informações e documentos deste formulário e que estão corretos para envio. * — `boolean` (`nen-sol-confere-envio`)

## Métodos

- nen-sol-rascunho (`nen-sol-rascunho`)
- nen-sol-avancar (`nen-sol-avancar`)
- nen-sol-protocolar (`nen-sol-protocolar`)
