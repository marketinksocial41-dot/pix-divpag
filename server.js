const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());


// ======================================
// CREDENCIAIS DIVPAG
// ======================================

const CLIENT_ID =
"paimarcio_7296392775";

const CLIENT_SECRET =
"cf5d4772d85c371533b1debf3e59df75b0a5cf1c6a56746c5fc2c82549fa4593";


// ======================================
// ROTA PRINCIPAL
// ======================================

app.get("/", async (req, res) => {

  try {

    const valor =
      req.query.valor;

    const descricao =
      req.query.descricao || "Pagamento";

    if(!valor){

      return res.send(`

<h2>Informe o valor</h2>

Exemplo:

<br><br>

/?valor=10&descricao=Pai+Marcio

      `);

    }


    // ======================================
    // PAYLOAD DIVPAG
    // ======================================

    const payload = {

      client_id: CLIENT_ID,

      client_secret: CLIENT_SECRET,

      nome: "Pai Marcio",

      cpf: "12345678901",

      valor: Number(valor),

      descricao: descricao,

      urlnoty:
      "https://google.com"

    };


    // ======================================
    // REQUISIÇÃO DIVPAG
    // ======================================

    const response = await axios.post(

      "https://divpag.com/v3/pix/qrcode",

      payload

    );


    console.log(response.data);


    // ======================================
    // QR CODE PIX
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
    // NÃO RETORNOU
    // ======================================

    if(!codigoPix){

      return res.send(`

<h2>Resposta DIVPAG</h2>

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

`${codigoPix}`,

{
width:280
}

);

function copiarPix(){

navigator.clipboard.writeText(
`${codigoPix}`
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

<h2>Erro DIVPAG</h2>

<pre>

${JSON.stringify(
error.response?.data ||
error.message,
null,
2
)}

</pre>

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
    "Servidor online"
  );

});
