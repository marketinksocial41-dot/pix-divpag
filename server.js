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
process.env.CLIENT_ID;

const CLIENT_SECRET =
process.env.CLIENT_SECRET;


// ======================================
// DEBUG
// ======================================

console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", CLIENT_SECRET);


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

</div>

</body>

</html>

      `);

    }


    // ======================================
    // REQUISIÇÃO DIVPAG
    // ======================================

    const response = await axios.post(

      "https://divpag.com/v3/pix/qrcode",

      {
        client_id: CLIENT_ID,

        client_secret: CLIENT_SECRET,

        nome: "Pai Marcio",

        cpf: "12345678901",

        valor: Number(valor),

        descricao: descricao,

        urlnoty: "https://google.com"
      },

      {
        headers: {
          "Content-Type": "application/json"
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
