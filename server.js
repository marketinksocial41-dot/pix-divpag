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
// WEBHOOK REAL DIVPAG
// ======================================

app.post("/webhook", (req, res) => {

  try {

    console.log("WEBHOOK RECEBIDO:");
    console.log(req.body);

    const body = req.body;

    const transacaoId =

      body.id ||
      body.txid ||
      body.transaction_id ||
      body.pix_id ||
      body.reference ||
      body.external_id;

    const status = String(
      body.status ||
      body.situacao ||
      body.payment_status ||
      ""
    ).toLowerCase();


    // ======================================
    // CONFIRMAÇÃO REAL
    // ======================================

    const aprovado =

      status.includes("paid") ||
      status.includes("pago") ||
      status.includes("approved") ||
      status.includes("aprovado") ||
      status.includes("completed") ||
      status.includes("concluido");


    if(transacaoId && aprovado){

      pagamentos[transacaoId] = true;

      console.log(
        "PAGAMENTO APROVADO:",
        transacaoId
      );

    }

    res.status(200).send("OK");

  } catch(err){

    console.log(err);

    res.status(500).send("ERRO");

  }

});


// ======================================
// STATUS PAGAMENTO
// ======================================

app.get("/status/:id", (req, res) => {

  const id = req.params.id;

  res.send({

    pago:
      pagamentos[id] || false

  });

});


// ======================================
// IP
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
    // VALIDAÇÃO
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

    const cpfLimpo =
      cpf.replace(/\D/g,"");


    // ======================================
    // PARAMS
    // ======================================

    const params =
      new URLSearchParams();

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
    // WEBHOOK
    // ======================================

    params.append(
      "urlnoty",
      "https://pix-divpag-1.onrender.com/webhook"
    );


    // ======================================
    // GERAR PIX
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

      response.data.reference ||

      response.data.external_id ||

      Date.now().toString();


    console.log(
      "TRANSACAO:",
      transacaoId
    );


    // ======================================
    // PIX INVÁLIDO
    // ======================================

    if(!codigoPix){

      return res.send(`

<pre>

${JSON.stringify(
response.data,
null,
2
)}

</pre>

      `);

    }


    // ======================================
    // HTML
    // ======================================

    res.send(`

<!DOCTYPE html>
<html lang="pt-br">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1.0"
/>

<title>Pagamento PIX</title>

<script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial,sans-serif;
}

body{
background:#f4f4f4;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
padding:20px;
}

.card{
background:white;
width:100%;
max-width:420px;
padding:25px;
border-radius:18px;
box-shadow:0 0 20px rgba(0,0,0,0.08);
text-align:center;
}

h2{
margin-bottom:15px;
}

.valor{
font-size:34px;
font-weight:bold;
color:#198754;
margin-bottom:10px;
}

.descricao{
color:#555;
margin-bottom:20px;
}

#qrcode{
display:flex;
justify-content:center;
margin-top:10px;
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
padding:15px;
border:none;
border-radius:10px;
background:#198754;
color:white;
font-size:16px;
font-weight:bold;
cursor:pointer;
margin-top:15px;
}

button:hover{
opacity:0.9;
}

.loading{
margin-top:20px;
color:#198754;
font-weight:bold;
animation:pulse 1s infinite;
}

.status{
margin-top:15px;
font-size:15px;
color:#666;
}

.success{
display:none;
padding:20px;
background:#ebfff2;
border-radius:14px;
border:2px solid #198754;
animation:fade 0.4s ease;
}

.success h2{
color:#198754;
margin-bottom:10px;
}

.success p{
color:#333;
line-height:1.7;
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

@keyframes fade{

from{
opacity:0;
transform:scale(0.95);
}

to{
opacity:1;
transform:scale(1);
}

}

</style>

</head>

<body>

<div class="card">


<!-- AREA PAGAMENTO -->

<div id="pagamentoArea">

<h2>
Pagamento PIX
</h2>

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

Aguardando pagamento...

</div>

<div class="loading">

Verificando pagamento automaticamente

</div>

</div>


<!-- AREA APROVADO -->

<div
class="success"
id="successArea"
>

<h2>
✅ Pagamento aprovado
</h2>

<p>

Seu pagamento foi confirmado com sucesso.

<br><br>

Aguarde, vamos direcionar você para o seu painel...

</p>

</div>

</div>

<script>


// ======================================
// QR CODE
// ======================================

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


// ======================================
// COPIAR PIX
// ======================================

function copiarPix(){

navigator.clipboard.writeText(
"${codigoPix}"
);

alert("PIX copiado!");

}


// ======================================
// EVITA DUPLICAR
// ======================================

let aprovado = false;


// ======================================
// VERIFICAR PAGAMENTO
// ======================================

async function verificarPagamento(){

if(aprovado){
return;
}

try{

const response = await fetch(

"/status/${transacaoId}"

);

const data =
await response.json();


if(data.pago){

aprovado = true;

mostrarAprovado();

}

}catch(err){

console.log(err);

}

}


// ======================================
// MOSTRAR APROVADO
// ======================================

function mostrarAprovado(){

document
.getElementById("pagamentoArea")
.style.display = "none";

document
.getElementById("successArea")
.style.display = "block";


// ======================================
// FECHA EM 20 SEGUNDOS
// ======================================

setTimeout(() => {

window.close();

window.location.href =
"about:blank";

}, 20000);

}


// ======================================
// LOOP VERIFICAÇÃO
// ======================================

setInterval(() => {

verificarPagamento();

}, 3000);

</script>

</body>

</html>

    `);

  } catch(error){

    console.log(

      error.response?.data ||

      error.message

    );

    res.send(`

<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>Erro</title>

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

<h2>
Erro DIVPAG
</h2>

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
