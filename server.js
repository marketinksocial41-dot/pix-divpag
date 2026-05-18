const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());


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
// GERAR PIX
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

        Exemplo:<br><br>

        /?valor=10&descricao=Pai+Marcio
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


    console.log(response.data);


    // ======================================
    // RETORNO DIVPAG
    // ======================================

    const codigoPix =

      response.data.qrcode ||

      response.data.payload ||

      response.data.pix ||

      response.data.copy_paste;


    if(!codigoPix){

      return res.send(
        "PIX não retornado pela DIVPAG"
      );

    }


    // ======================================
    // HTML PIX
    // ======================================

    res.send(`

<!DOCTYPE html>
<html lang="pt-br">

<head>

<meta charset="UTF-8">

<title>PIX</title>

<script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>

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
text-align:center;
box-shadow:0 0 10px rgba(0,0,0,0.1);
}

#pix{
margin-top:20px;
background:#f1f1f1;
padding:10px;
border-radius:8px;
word-break:break-all;
font-size:13px;
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
}

</style>

</head>

<body>

<div class="card">

<h2>Pagamento PIX</h2>

<h3>R$ ${valor}</h3>

<p>${descricao}</p>

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

      <h2>Erro ao gerar PIX</h2>

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
