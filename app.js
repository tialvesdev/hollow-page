process.env.AMBIENTE_PROCESSO = "desenvolvimento";
// process.env.AMBIENTE_PROCESSO = "producao";

var express = require("express");
var cors = require("cors");
var path = require("path");
var PORTA = process.env.AMBIENTE_PROCESSO == "desenvolvimento" ? 3333 : 8080;

var multer = require('multer');
var fs = require('fs');

var upload = multer({ dest: './public/assets/bucket/' });

var app = express();

var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
var avisosRouter = require("./src/routes/avisos");
var medidasRouter = require("./src/routes/medidas");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/avisos", avisosRouter);
app.use("/medidas", medidasRouter);

app.post('/upload', upload.single('imagem'), (req, res) => {
    console.log('Rota de upload acionada');
    console.log('Arquivo recebido:', req.file);
  
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, './public/assets/bucket/' + req.file.originalname);
    console.log('Caminho temporário:', tempPath);
    console.log('Caminho de destino:', targetPath);
  
    // Mover o arquivo temporário recebido pelo Multer para o local de destino desejado.
    fs.rename(tempPath, targetPath, err => {
      if (err) throw err;
  
      // Salvar o caminho da imagem no banco de dados
      const imagePath = './public/assets/bucket/' + req.file.originalname;
      console.log('Caminho da imagem:', imagePath);
  
      // Salvar imagePath no banco de dados
  
      res.send('Imagem salva com sucesso!');
    });
  });

app.listen(PORTA, function () {
    console.log(`Servidor do seu site já está rodando! Acesse o caminho a seguir para visualizar: http://localhost:${PORTA} \n
    Você está rodando sua aplicação em Ambiente de ${process.env.AMBIENTE_PROCESSO} \n
    \t\tSe "desenvolvimento", você está se conectando ao banco LOCAL (MySQL Workbench). \n
    \t\tSe "producao", você está se conectando ao banco REMOTO (SQL Server em nuvem Azure) \n
    \t\t\t\tPara alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo 'app.js'`);
});
