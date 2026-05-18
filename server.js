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
// DEBUG
// ======================================

console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", CLIENT_SECRET);


// ======================================
// VER IP DO RENDER
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

    // ======================================
    // VALIDAR VALOR
    // ======================================

    if(!valor){

      return res.send(`

<!DOCTYPE html>
<html lang="pt-br">

<head>

<meta charset="UTF-8">

<title>PIX DIVPAG</title>

<style>

body{
font-family:Arial;
background:#f5f5f5;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
margin:0;
}

.card{
background:white;
padding:25px;
border-radius:12px;
width:400px;
box-shadow:0 0 10px rgba(0,0,0,0.1);
}

.code{
background:#f1f1f1;
padding:10px;
border-radius:8px;
margin-top:10px;
word-break:break-all;
}

</style>

</head>

<body>

<div class="card">

<h2>Informe o valor</h2>

<p>Exemplo:</p>

<div class="code">

/?valor=10&descricao=Pai+Marcio

</div>

<p>

Ver IP do servidor:

</p>

<div class="code">

/ip

</div>

</div>

</body>

</html>

      `);

    }


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
      "Pai Marcio"
    );

    params.append(
      "cpf",
      "12345678901"
    );

    params.append(
      "valor",
      Number(valor)
    );

    params.append(
      "descricao",
      descricao
    );

    params.append(
      "urlnoty",
      "https://google.com"
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
    // RETORNO PIX
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
    // NÃO RETORNOU PIX
    // ======================================

    if(!codigoPix){

      return res.send(`

<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>Resposta DIVPAG</title>

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

<h2>Resposta DIVPAG</h2>

<pre>

${JSON.stringify(
response.data,
null,
2
)}

</pre>

</body>

</html>

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
}

.card{
background:white;
padding:25px;
border-radius:12px;
width:420px;
text-align:center;
box-shadow:0 0 10px rgba(0,0,0,0.1);
}

.valor{
font-size:30px;
font-weight:bold;
color:#198754;
}

.descricao{
margin-top:10px;
color:#555;
}

#qrcode{
margin-top:20px;
}

#pix{
margin-top:20px;
background:#f1f1f1;
padding:10px;
border-radius:8px;
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

</style>

</head>

<body>

<div class="card">

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

</div>

<script>

QRCode.toCanvas(

document.getElementById("qrcode"),

"${codigoPix}",

{
width:280
}

);

function copiarPix(){

navigator.clipboard.writeText(
"${codigoPix}"
);

alert("PIX copiado!");

}

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
