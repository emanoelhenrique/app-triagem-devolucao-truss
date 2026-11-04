# 📦 Sistema Integrado de Triagem e Reconciliação (Devolução TRUSS)

<img width="1900" height="907" alt="image" src="https://github.com/user-attachments/assets/2da98782-93ef-40f8-9a0e-1846df194ce6" />

## 📌 O Problema
O processo de devolução de mercadorias no recebimento apresentava um desafio de cardinalidade: uma única nota fiscal continha múltiplos materiais, o que obrigava os operadores a duplicar linhas manualmente numa folha de cálculo para registar cada item triado. Além disso, a operação exigia a consulta simultânea de três fontes de dados distintas — o registo do recebimento físico, os relatórios de extração do ERP SAP (J_1BNFLIN e J1BNFE) e o sistema de tickets de reclamação de clientes (Yungas). Esta fragmentação resultava num fluxo de trabalho lento, propenso a erros de digitação e sem visibilidade em tempo real sobre os saldos pendentes de cada nota.

## 💡 A Solução
Desenvolvi um **Web App em Google Apps Script** suportado por uma arquitetura de dados relacional construída no Google Sheets, eliminando totalmente a duplicação manual de dados. O sistema funciona como um hub central que unifica as fontes de informação e guia o operador através de uma interface limpa. Ao introduzir o número da nota e ler o código de barras (EAN), a aplicação cruza automaticamente os dados com a extração do SAP e os tickets de reclamação, apresentando imediatamente as diretrizes de destinação e calculando os saldos em tempo real.

### Arquitetura e Funcionalidades Principais:
* **Motor de Reconciliação (Base TRUSS):** Um script de *back-end* compila e formata as extrações brutas do SAP e as reclamações do Yungas (importadas via `IMPORTRANGE`) numa base de dados unificada, mapeando a chave de acesso da nota aos respetivos materiais.
* **Tradução Automática EAN-SAP:** A aplicação inclui uma tabela de conversão interna que traduz instantaneamente o código de barras comercial (EAN) lido pelo operador para o código de material (SKU) correspondente no SAP, garantindo a integridade dos registos.
* **Painel de Triagem Inteligente:** O *front-end* apresenta os detalhes da devolução (erro reportado, motivo, status) assim que o item é lido. O sistema aplica regras de negócio dinâmicas, como classificar automaticamente itens como "Dedutível" ou emitir alertas de "Sobra Física" caso a quantidade triada exceda o saldo registado.
* **Auditoria de Pendências (Sobra Lógica):** Um separador dedicado lista, em tempo real, as chaves e materiais com "Saldo Pendente". Caso a triagem física seja concluída e o sistema indique peças em falta, o operador pode registá-las como "Sobra Lógica" (destino B2PSOBRA) com um único clique na aplicação.
* **Exportação Direta de KPIs:** Um botão no menu customizado do Sheets ("Lançar no KPIs") processa todos os registos da aba de triagem e injeta-os diretamente na base central de produtividade da operação, num formato padronizado e sem necessidade de preenchimento manual.

## 🛠️ Metodologias e Ferramentas
* **Front-end:** HTML5, CSS3, JavaScript (Interface responsiva com sistema de abas e feedback visual dinâmico).
* **Back-end e Integração:** Google Apps Script (Manipulação de arrays bidimensionais, formatação condicional via código, funções `onOpen` e chamadas assíncronas `google.script.run`).
* **Base de Dados:** Google Sheets (Estruturação relacional, funções `IMPORTRANGE` para federação de dados).

## 🚀 Impacto e Resultados
* **Eficiência Operacional:** O fim da necessidade de duplicar linhas manualmente e cruzar planilhas acelerou drasticamente o fluxo de triagem no recebimento.
* **Precisão e Integridade:** A validação EAN-SAP e a leitura automática dos motivos de devolução (Yungas) eliminaram os erros de digitação e os desvios de destinação de material.
* **Visibilidade em Tempo Real:** A equipa passou a ter um controlo exato sobre os saldos de cada devolução, facilitando o fecho de turno e garantindo que todas as discrepâncias (Sobra Lógica/Física) são devidamente rastreadas.
