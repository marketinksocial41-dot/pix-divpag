const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());


// ======================================
// CREDENCIAIS DIVPAG
// ======================================

const CLIENT_ID =
"paimarcio_5410097704";

const CLIENT_SECRET =
"2a5d5a3f3fa1f851e8de8c0411d3ed8bc9d0ed2df3ae748f79b65c531a1c71e8";


// ======================================
// ARMAZENAMENTO TEMPORÁRIO
// ======================================

const pagamentos = {};


// ======================================
// DEBUG
// ======================================

console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", CLIENT_SECRET);


// ======================================
// WEBHOOK DIVPAG
// ======================================
// RECEBE CONFIRMAÇÃO REAL DO PAGAMENTO
// ======================================

app.post("/webhook", (req, res) => {

  try {

    console.log("WEBHOOK RECEBIDO:");
    console.log(req.body);

    const transacaoId =

      req.body.id ||

      req.body.txid ||

      req.body.transaction_id ||

      req.body.pix_id;

    const status = (
      req.body.status ||
      ""
    ).toLowerCase();

    if(
      transacaoId &&
      (
        status.includes("pago") ||
        status.includes("paid") ||
        status.includes("approved") ||
        status.includes("aprovado")
      )
    ){

      pagamentos[transacaoId] = true;

      console.log(
        "Pagamento confirmado:",
        transacaoId
      );

    }

    res.send("OK");

  } catch(err){

    console.log(err);

    res.send("ERRO");

  }

});


// ======================================
// CONSULTAR STATUS
// ======================================

app.get("/status/:id", (req, res) => {

  const id = req.params.id;

  res.send({
    pago: pagamentos[id] || false
  });

});


// ======================================
// VER IP
// ======================================

app.get("/ip", async (req, res) => {

  try {

    const response = await axios.get(
      "https://api.ipify.org?format=json"
    );

    res.send(response.data);

  } catch(err){

    res.send({
      erro: err.message
    });

  }

});


// ======================================
// ROTA PRINCIPAL
// ======================================

app.get("/", async (req, res) => {

  try {

    const valor =
      req.query.valor;

    const descricao =
      req.query.descricao || "Pagamento";

    const nome =
      req.query.nome;

    const cpf =
      req.query.cpf;


    // ======================================
    // VALIDAR CAMPOS
    // ======================================

    if(!valor){

      return res.send("Valor obrigatório");

    }

    if(!nome){

      return res.send("Nome obrigatório");

    }

    if(!cpf){

      return res.send("CPF obrigatório");

    }


    // ======================================
    // LIMPAR CPF
    // ======================================

    const cpfLimpo = cpf.replace(/\D/g, "");


    // ======================================
    // FORM DATA DIVPAG
    // ======================================

    const params = new URLSearchParams();

    params.append(
      "client_id",
      CLIENT_ID
    );

    params.append(
      "client_secret",
      CLIENT_SECRET
    );

    params.append(
      "nome",
      nome
    );

    params.append(
      "cpf",
      cpfLimpo
    );

    params.append(
      "valor",
      Number(valor)
    );

    params.append(
      "descricao",
      descricao
    );


    // ======================================
    // WEBHOOK URL
    // ======================================

    params.append(
      "urlnoty",
      "https://pix-divpag-1.onrender.com/webhook"
    );


    // ======================================
    // REQUISIÇÃO DIVPAG
    // ======================================

    const response = await axios.post(

      "https://divpag.com/v3/pix/qrcode",

      params,

      {
        headers: {
          "Content-Type":
          "application/x-www-form-urlencoded"
        }
      }

    );


    console.log("RESPOSTA DIVPAG:");
    console.log(response.data);


    // ======================================
    // PIX
    // ======================================

    const codigoPix =

      response.data.qrcode ||

      response.data.qrcodepix ||

      response.data.payload ||

      response.data.pix ||

      response.data.copy_paste ||

      response.data.emv ||

      response.data.qrcode_text;


    // ======================================
    // ID TRANSAÇÃO
    // ======================================

    const transacaoId =

      response.data.id ||

      response.data.txid ||

      response.data.transaction_id ||

      response.data.pix_id ||

      Date.now().toString();


    // ======================================
    // NÃO RETORNOU PIX
    // ======================================

    if(!codigoPix){

      return res.send(`
        <pre>
${JSON.stringify(response.data,null,2)}
        </pre>
      `);

    }


    // ======================================
    // HTML FINAL
    // ======================================

    res.send(`

<!DOCTYPE html>
<html lang="pt-br">

<head>

<meta charset="UTF-8">

<title>Pagamento PIX</title>

<script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>

<style>

body{
font-family:Arial;
background:#f5f5f5;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
margin:0;
padding:20px;
}

.card{
background:white;
padding:25px;
border-radius:14px;
width:420px;
text-align:center;
box-shadow:0 0 15px rgba(0,0,0,0.1);
}

.valor{
font-size:32px;
font-weight:bold;
color:#198754;
}

.descricao{
margin-top:10px;
color:#555;
}

#qrcode{
margin-top:20px;
display:flex;
justify-content:center;
}

#pix{
margin-top:20px;
background:#f1f1f1;
padding:12px;
border-radius:10px;
word-break:break-all;
font-size:13px;
text-align:left;
}

button{
width:100%;
padding:14px;
margin-top:15px;
border:none;
border-radius:8px;
background:#198754;
color:white;
font-size:16px;
cursor:pointer;
font-weight:bold;
}

button:hover{
opacity:0.9;
}

.status{
margin-top:18px;
font-size:16px;
color:#666;
}

.loading{
margin-top:15px;
color:#198754;
font-weight:bold;
animation:pulse 1s infinite;
}

.success{
display:none;
margin-top:20px;
padding:20px;
background:#e9fff1;
border-radius:12px;
border:2px solid #198754;
}

.success h2{
color:#198754;
margin-bottom:10px;
}

.countdown{
font-size:25px;
font-weight:bold;
margin-top:10px;
color:#198754;
}

@keyframes pulse{

0%{
opacity:0.5;
}

50%{
opacity:1;
}

100%{
opacity:0.5;
}

}

</style>

</head>

<body>

<div class="card">

<div id="pagamentoArea">

<h2>Pagamento PIX</h2>

<div class="valor">

R$ ${valor}

</div>

<div class="descricao">

${descricao}

</div>

<div id="qrcode"></div>

<div id="pix">

${codigoPix}

</div>

<button onclick="copiarPix()">

Copiar PIX

</button>

<div class="status">

Aguardando confirmação do pagamento...

</div>

<div class="loading">

Verificando pagamento automaticamente...

</div>

</div>


<!-- PAGAMENTO CONCLUÍDO -->

<div class="success" id="successArea">

<h2>
✅ Pagamento concluído
</h2>

<p>
Seu pagamento foi aprovado com sucesso.
</p>

<p>
Fechando página em:
</p>

<div class="countdown" id="countdown">

10

</div>

</div>

</div>

<script>

QRCode.toCanvas(

"${codigoPix}",

{
width:280
},

function(error, canvas){

  if(error){

    console.log(error);
    return;

  }

  document
    .getElementById("qrcode")
    .appendChild(canvas);

}

);

function copiarPix(){

navigator.clipboard.writeText(
"${codigoPix}"
);

alert("PIX copiado!");

}


// ======================================
// CONSULTA PAGAMENTO REAL
// ======================================

async function verificarPagamento(){

  try {

    const response = await fetch(
      "/status/${transacaoId}"
    );

    const data =
      await response.json();

    if(data.pago){

      pagamentoAprovado();

    }

  } catch(err){

    console.log(err);

  }

}


// ======================================
// PAGAMENTO APROVADO
// ======================================

function pagamentoAprovado(){

document
.getElementById("pagamentoArea")
.style.display = "none";

document
.getElementById("successArea")
.style.display = "block";

let tempo = 10;

const countdown =
document.getElementById("countdown");

const interval = setInterval(() => {

tempo--;

countdown.innerHTML = tempo;

if(tempo <= 0){

clearInterval(interval);

window.close();

window.location.href = "about:blank";

}

}, 1000);

}


// ======================================
// LOOP VERIFICAÇÃO
// ======================================

setInterval(() => {

verificarPagamento();

}, 5000);

</script>

</body>

</html>

    `);

  } catch(error){

    console.log(
      error.response?.data || error.message
    );

    res.send(`

<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>Erro DIVPAG</title>

<style>

body{
font-family:Arial;
background:#f5f5f5;
padding:30px;
}

pre{
background:white;
padding:20px;
border-radius:12px;
overflow:auto;
}

</style>

</head>

<body>

<h2>Erro DIVPAG</h2>

<pre>

${JSON.stringify(
error.response?.data ||
error.message,
null,
2
)}

</pre>

</body>

</html>

    `);

  }

});


// ======================================
// PORTA
// ======================================

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "Servidor online na porta " + PORT
  );

});
