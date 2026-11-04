// ==========================================
// CÓDIGO DO APLICATIVO WEB (TELA DE TRIAGEM E PENDÊNCIAS)
// ==========================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Devolução TRUSS - DPC REG')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function buscarDadosItem(nota, ean) {
  const wsBase = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BASE TRUSS");
  const dados = wsBase.getDataRange().getValues();
  
  let resultado = {
    encontrado: false, chave: "", codigo: "",
    erro: "", obs: "", motivo: "", marcador: "",
    status: "", qtdSap: 0
  };

  for (let i = 1; i < dados.length; i++) {
    let notaBase = dados[i][2].toString().trim();
    let eanBase = dados[i][19] ? dados[i][19].toString().trim() : "";

    if (notaBase === nota.toString().trim() && eanBase === ean.toString().trim()) {
      resultado.encontrado = true;
      resultado.chave = dados[i][1].toString().trim(); 
      resultado.codigo = dados[i][14].toString().trim(); 
      resultado.erro = dados[i][10].toString().trim(); 
      resultado.obs = dados[i][11].toString().trim(); 
      resultado.motivo = dados[i][12].toString().trim(); 
      resultado.marcador = dados[i][13].toString().trim(); 
      resultado.status = dados[i][18].toString().trim(); 
      break; 
    }
  }
  return resultado;
}

function salvarLancamentoApp(formulario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wsTriagem = ss.getSheetByName("TRIAGEM");
  
  let email = Session.getActiveUser().getEmail();
  let nomeOperador = "Usuário";
  if(email) {
    let primeiroNome = email.split('@')[0].split('.')[0];
    nomeOperador = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();
  }

  let dataAtual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

  const novaLinha = [
    dataAtual,
    formulario.chave,
    formulario.codigo,
    formulario.qtd,
    formulario.lote,
    formulario.destino,
    formulario.processo,
    formulario.nota,
    formulario.ean,
    nomeOperador
  ];

  // Busca a última linha real baseada na Coluna A ignorando as fórmulas das outras colunas
  let colA = wsTriagem.getRange("A:A").getValues();
  let ultimaLinha = 1;
  for (let i = colA.length - 1; i >= 0; i--) {
    if (colA[i][0] !== "") {
      ultimaLinha = i + 1;
      break;
    }
  }

  // Insere os dados na próxima linha vazia apenas nas colunas de A até J
  wsTriagem.getRange(ultimaLinha + 1, 1, 1, novaLinha.length).setValues([novaLinha]);
  
  return "Lançamento salvo com sucesso!";
}

function buscarPendencias() {
  const wsBase = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BASE TRUSS");
  const dados = wsBase.getDataRange().getValues();
  let pendentes = [];

  for (let i = 1; i < dados.length; i++) {
    let status = dados[i][18] ? dados[i][18].toString().trim() : "";
    
    if (status.includes("Pendente")) {
      let qtdSap = parseFloat(dados[i][16]) || 0;
      let qtdTriada = parseFloat(dados[i][17]) || 0;
      let saldo = qtdSap - qtdTriada;

      if (saldo > 0) {
        pendentes.push({
          nota: dados[i][2].toString(),
          chave: dados[i][1].toString(),
          codigo: dados[i][14].toString(),
          ean: dados[i][19] ? dados[i][19].toString() : "",
          loteSap: dados[i][15] ? dados[i][15].toString() : "",
          saldo: saldo,
          statusTexto: status
        });
      }
    }
  }
  return pendentes;
}

function salvarSobraLogica(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wsTriagem = ss.getSheetByName("TRIAGEM");
  
  let email = Session.getActiveUser().getEmail();
  let nomeOperador = "Usuário";
  if(email) {
    let primeiroNome = email.split('@')[0].split('.')[0];
    nomeOperador = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();
  }

  let dataAtual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

  const novaLinha = [
    dataAtual,
    item.chave,
    item.codigo,
    item.saldo,
    item.loteSap, 
    "B2PSOBRA", 
    "SOBRA LÓGICA",
    item.nota,
    item.ean,
    nomeOperador
  ];

  // Busca a última linha real baseada na Coluna A ignorando as fórmulas das outras colunas
  let colA = wsTriagem.getRange("A:A").getValues();
  let ultimaLinha = 1;
  for (let i = colA.length - 1; i >= 0; i--) {
    if (colA[i][0] !== "") {
      ultimaLinha = i + 1;
      break;
    }
  }

  // Insere os dados na próxima linha vazia apenas nas colunas de A até J
  wsTriagem.getRange(ultimaLinha + 1, 1, 1, novaLinha.length).setValues([novaLinha]);
  
  return "Sobra Lógica registrada com destino B2PSOBRA!";
}
