const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


// =====================================
// SUAS CREDENCIAIS DIVPAG
// =====================================

const TOKEN =
"paimarcio_1160513795";

const SECRET_KEY =
"9b38072f5530c7db953abf89d118c0ed208540ba474cbdcb0347f1ba11e75b64";


// =====================================
// SERVIR FRONTEND
// =====================================

app.use(express.static(
  path.join(__dirname, "public")
));


// =====================================
// GERAR PIX VIA URL
// EXEMPLO:
// /?valor=50&descricao=Pagamento
// =====================================

app.get("/", async (req, res) => {

  try {

    const valor =
      req.query.valor;

    const descricao =
      req.query.descricao || "";

    if(!valor){

      return res.sendFile(
        path.join(__dirname,
        "public/index.html")
      );

    }

    // =====================================
    // CHAMADA DIVPAG
    // =====================================

    const response = await axios.post(

      "https://api-ovz6.onrender.com",

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

    res.json(response.data);

  } catch(error){

    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({
      erro: "Erro ao gerar PIX"
    });

  }

});


// =====================================
// PORTA
// =====================================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor online na porta ${PORT}`
  );

});