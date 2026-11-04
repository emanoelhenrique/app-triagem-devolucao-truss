function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ Menu TRUSS')
    .addItem('Atualizar BASE TRUSS', 'gerarBaseTruss')
    .addItem('Lançar no KPIs', 'exportarParaKPIs')
    .addToUi();
}

function gerarBaseTruss() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wsDev = ss.getSheetByName("Devolução");
  const wsJ1 = ss.getSheetByName("J_1BNFLIN");
  const wsBase = ss.getSheetByName("BASE TRUSS");

  try {
    const ultLinhaDev = wsDev.getLastRow();
    const ultLinhaJ1 = wsJ1.getLastRow();

    if (ultLinhaDev < 1) return;

    // 1. Pegar DADOS e FORMATAÇÕES da aba Devolução (Colunas A até N = 1 a 14)
    const rangeDev = wsDev.getRange(1, 1, ultLinhaDev, 14);
    const dadosDev = rangeDev.getValues();
    const bgDev = rangeDev.getBackgrounds();
    const colorDev = rangeDev.getFontColors();
    const weightDev = rangeDev.getFontWeights();
    const validDev = rangeDev.getDataValidations(); 

    // Pegar dados da aba J_1BNFLIN
    const dadosJ1 = wsJ1.getRange(1, 1, ultLinhaJ1, 23).getValues();

    // 2. Mapear os itens da J_1BNFLIN pela Chave de Acesso
    const mapaJ1 = {};
    for (let i = 1; i < dadosJ1.length; i++) { 
      let chaveJ1 = dadosJ1[i][0].toString().trim(); 
      let material = dadosJ1[i][4];                  
      let lote = dadosJ1[i][7];                      
      let qtd = dadosJ1[i][22];                      

      if (chaveJ1) {
        if (!mapaJ1[chaveJ1]) mapaJ1[chaveJ1] = [];
        mapaJ1[chaveJ1].push([material, lote, qtd]);
      }
    }

    // 3. Preparar as listas para guardar tudo (dados e formatos)
    const outValues = [];
    const outBg = [];
    const outColor = [];
    const outWeight = [];
    const outValid = [];

    // Função auxiliar para criar as 3 colunas novas no final com formato padrão
    function estender(arrOrigem, valorPadrao) {
      let novoArr = arrOrigem.slice();
      novoArr.push(valorPadrao, valorPadrao, valorPadrao);
      return novoArr;
    }

    // Montar Cabeçalho
    let cabecalhoVal = dadosDev[0].slice();
    cabecalhoVal.push("MATERIAL (SAP)", "LOTE (SAP)", "QUANTIDADE (SAP)");
    outValues.push(cabecalhoVal);
    outBg.push(estender(bgDev[0], bgDev[0][0])); 
    outColor.push(estender(colorDev[0], colorDev[0][0]));
    outWeight.push(estender(weightDev[0], "bold"));
    outValid.push(estender(validDev[0], null));

    // 4. Cruzar os dados mantendo a sequência e formatos da aba Devolução
    for (let i = 1; i < dadosDev.length; i++) {
      let linhaDev = dadosDev[i].slice(); 
      let chaveDev = linhaDev[1] ? linhaDev[1].toString().trim() : ""; 

      if (chaveDev === "") continue; 

      let bgLinha = estender(bgDev[i], "#ffffff"); 
      let colorLinha = estender(colorDev[i], "#000000"); 
      let weightLinha = estender(weightDev[i], "normal");
      let validLinha = estender(validDev[i], null); 

      let itensJ1 = mapaJ1[chaveDev];

      if (itensJ1 && itensJ1.length > 0) {
        for (let j = 0; j < itensJ1.length; j++) {
          outValues.push(linhaDev.concat(itensJ1[j]));
          outBg.push(bgLinha);
          outColor.push(colorLinha);
          outWeight.push(weightLinha);
          outValid.push(validLinha);
        }
      } else {
        outValues.push(linhaDev.concat(["", "", ""]));
        outBg.push(bgLinha);
        outColor.push(colorLinha);
        outWeight.push(weightLinha);
        outValid.push(validLinha);
      }
    }

    // 5. Limpar APENAS as colunas de A até Q (deixando as fórmulas da R em diante intactas)
    wsBase.getRange("A:Q").clear(); 
    
    // 14 colunas antigas + 3 colunas novas = 17 colunas no total
    const destRange = wsBase.getRange(1, 1, outValues.length, 17); 
    
    destRange.setValues(outValues);
    destRange.setBackgrounds(outBg);
    destRange.setFontColors(outColor);
    destRange.setFontWeights(outWeight);
    destRange.setDataValidations(outValid);

    SpreadsheetApp.getUi().alert("BASE TRUSS gerada e atualizada com sucesso!");

  } catch (e) {
    SpreadsheetApp.getUi().alert("Erro ao gerar a base: " + e.message);
  }
}
