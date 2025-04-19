const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

// Configuração do Sequelize
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.MYSQL_HOST,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  retry: {
    max: 10, // Tentar reconectar até 10 vezes
    timeout: 5000 // Intervalo de 5 segundos entre tentativas
  }
});

// Modelo Person
const Person = sequelize.define('Person', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'people'
});

// Função para inicializar o banco e iniciar o servidor
async function initialize() {
  try {
    // Aguardar conexão com o MySQL
    await sequelize.authenticate();
    console.log('Conexão com MySQL estabelecida com sucesso.');
    
    // Sincronizar modelos
    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');
    
    // Rotas
    app.get('/', async (req, res) => {
      try {
        const name = req.query.name || 'AVK BLACK DEV';
        
        // Adicionar novo registro
        await Person.create({ name });
        
        // Listar todos os registros
        const people = await Person.findAll();
        
        const listagem = people.map(p => `<li>${p.name}</li>`).join('');
        
        res.send(`
          <h1>Full Cycle Rocks!</h1>
          <h2>Listagem:</h2>
          <ul>${listagem}</ul>
        `);
      } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
      }
    });
    
    // Iniciar servidor
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
    
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
    process.exit(1); // Encerrar com erro
  }
}

// Inicializar aplicação
initialize();