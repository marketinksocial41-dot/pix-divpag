const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());


// =====================================
// CREDENCIAIS DIVPAG
// =====================================

const TOKEN =
"paimarcio_1160513795";

const SECRET_KEY =
"9b38072f5530c7db953abf89d118c0ed208540ba474cbdcb0347f1ba11e75b64";


// =====================================
// ROTA PRINCIPAL
// =====================================

app.get("/", async (req, res) => {

  try {

    const valor =
      req.query.valor;

    const descricao =
      req.query.descricao || "Pagamento";

    // Se não informar valor
    if(!valor){

      return res.send(`
        <h2>Informe o valor</h2>

        Exemplo:<br><br>

        /?valor=10&descricao=Pai+Marcio
      `);

    }


    // =====================================
    // CHAMADA DIVPAG
    // =====================================

    const response = await axios.post(

      "https://api.divpag.com.br/pix",

      {
        valor,
        descricao
      },

      {
        headers: {
          token: TOKEN,
          "secret-key": SECRET_KEY
        }
      }

    );


    // =====================================
    // AJUSTE CONFORME RETORNO DA DIVPAG
    // =====================================

    const codigoPix =

      response.data.pix ||

      response.data.qrcode ||

      response.data.payload ||

      response.data.copiaecola;


    if(!codigoPix){

      return res.send("PIX não retornado");

    }


    // =====================================
    // HTML AUTOMÁTICO
    // =====================================

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
  width:400px;
  background:white;
  padding:25px;
  border-radius:12px;
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
  margin-top:15px;
  width:100%;
  padding:14px;
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

    res.send("Erro ao gerar PIX");

  }

});


// =====================================
// PORTA
// =====================================

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "Servidor online"
  );

});
