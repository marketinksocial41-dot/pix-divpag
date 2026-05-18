const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());


// ======================================
// CREDENCIAIS DIVPAG
// ======================================

const TOKEN =
"paimarcio_7296392775";

const SECRET_KEY =
"cf5d4772d85c371533b1debf3e59df75b0a5cf1c6a56746c5fc2c82549fa4593";


// ======================================
// URL API DIVPAG
// ======================================

const API_URL =
"https://divpag.com/v3";


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
}

.card{
background:white;
padding:25px;
border-radius:12px;
width:400px;
box-shadow:0 0 10px rgba(0,0,0,0.1);
}

h2{
margin-top:0;
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

</div>

</body>

</html>

      `);

    }


    // ======================================
    // REQUISIÇÃO DIVPAG
    // ======================================

    const response = await axios.post(

      `${API_URL}/pix/qrcode`,

      {
        value: Number(valor),
        description: descricao
      },

      {
        headers: {

          client_id: TOKEN,

          client_secret: SECRET_KEY,

          "Content-Type":
          "application/json"

        }

      }

    );


    // ======================================
    // DEBUG
    // ======================================

    console.log("RESPOSTA DIVPAG:");

    console.log(response.data);


    // ======================================
    // RETORNO PIX
    // ======================================

    const codigoPix =

      response.data.qrcode ||

      response.data.payload ||

      response.data.pix ||

      response.data.copy_paste ||

      response.data.emv;


    // ======================================
    // NÃO RETORNOU PIX
    // ======================================

    if(!codigoPix){

      return res.send(`

<h2>PIX não retornado pela DIVPAG</h2>

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

h2{
margin-top:0;
}

.valor{
font-size:30px;
font-weight:bold;
color:#198754;
}

.descricao{
margin-top:10px;
font-size:16px;
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

<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>Erro PIX</title>

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

<h2>Erro ao gerar PIX</h2>

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
