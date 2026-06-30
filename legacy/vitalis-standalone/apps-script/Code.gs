/**
 * Vitalis — Backend (Google Apps Script)
 * ------------------------------------------------------------------
 * Transforma uma planilha do Google em "banco" de usuários para o app.
 *
 * COMO USAR (resumo — veja SETUP_SHEETS.md para o passo a passo):
 *   1. Crie uma planilha no Google Drive.
 *   2. Extensões → Apps Script. Apague o conteúdo e cole este arquivo.
 *   3. (Opcional) defina um TOKEN abaixo e use o mesmo em VITE_SHEETS_API_TOKEN.
 *   4. Implantar → Nova implantação → Tipo "App da Web":
 *        - Executar como: Eu
 *        - Quem tem acesso: Qualquer pessoa
 *   5. Copie a URL "/exec" e coloque em VITE_SHEETS_API_URL no app.
 *
 * A aba "Users" e os cabeçalhos são criados automaticamente na 1ª chamada.
 */

// Deixe '' para desativar a checagem de token (ou defina um segredo simples).
var TOKEN = '';

var SHEET_NAME = 'Users';
var HEADERS = ['Email', 'Name', 'PasswordHash', 'Profile', 'Foods', 'Meals', 'Water', 'UpdatedAt'];

// ---------- Helpers ----------

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sha256_(str) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(str), Utilities.Charset.UTF_8);
  return raw.map(function (b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');
}

function normEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Retorna o índice da linha (1-based) do usuário, ou -1.
function findRow_(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return -1; // só cabeçalho (ou vazia): nenhum usuário ainda
  var col = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) {
    if (normEmail_(col[i][0]) === email) return i + 2;
  }
  return -1;
}

function parseJson_(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; } catch (e) { return fallback; }
}

// ---------- Entradas HTTP ----------

function doGet() {
  return json_({ ok: true, service: "Vitalis API", online: true });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (TOKEN && body.token !== TOKEN) return json_({ ok: false, error: 'Token inválido' });

    switch (body.action) {
      case 'register': return register_(body);
      case 'login':    return login_(body);
      case 'sync':     return sync_(body);
      default:         return json_({ ok: false, error: 'Ação desconhecida' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// ---------- Ações ----------

function register_(body) {
  var email = normEmail_(body.email);
  if (!email || !body.password) return json_({ ok: false, error: 'Informe e-mail e senha.' });

  var sheet = getSheet_();
  if (findRow_(sheet, email) !== -1) return json_({ ok: false, error: 'Este e-mail já está cadastrado.' });

  var name = String(body.name || '').trim() || 'Usuário Vitalis';
  var profile = { name: name, email: email };

  sheet.appendRow([
    email,
    name,
    sha256_(body.password),
    JSON.stringify(profile),
    '[]',   // foods
    '[]',   // meals
    '{}',   // water
    new Date().toISOString()
  ]);

  return json_({ ok: true, user: profile, data: { profile: profile, foods: [], meals: [], water: {} } });
}

function login_(body) {
  var email = normEmail_(body.email);
  var sheet = getSheet_();
  var row = findRow_(sheet, email);
  if (row === -1) return json_({ ok: false, error: 'Usuário não encontrado.' });

  var values = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  if (sha256_(body.password) !== String(values[2])) return json_({ ok: false, error: 'Senha incorreta.' });

  var profile = parseJson_(values[3], { name: values[1], email: email });
  var data = {
    profile: profile,
    foods: parseJson_(values[4], []),
    meals: parseJson_(values[5], []),
    water: parseJson_(values[6], {})
  };
  return json_({ ok: true, user: profile, data: data });
}

function sync_(body) {
  var email = normEmail_(body.email);
  var sheet = getSheet_();
  var row = findRow_(sheet, email);
  if (row === -1) return json_({ ok: false, error: 'Usuário não encontrado.' });

  var profile = body.profile || {};
  var name = profile.name || sheet.getRange(row, 2).getValue();

  // Atualiza Name, Profile, Foods, Meals, Water, UpdatedAt (mantém Email e PasswordHash).
  sheet.getRange(row, 2).setValue(name);
  sheet.getRange(row, 4).setValue(JSON.stringify(profile));
  sheet.getRange(row, 5).setValue(JSON.stringify(body.foods || []));
  sheet.getRange(row, 6).setValue(JSON.stringify(body.meals || []));
  sheet.getRange(row, 7).setValue(JSON.stringify(body.water || {}));
  sheet.getRange(row, 8).setValue(new Date().toISOString());

  return json_({ ok: true });
}
