const { Connection, Request } = require('tedious');

const config = {
  server: 'DAVID\\SQLEXPRESS01',
  authentication: {
    type: 'default',
    options: {
      userName: 'Pruebas',
      password: 'pruebas123'
    }
  },
  options: {
    port: 1433,
    database: 'ColegioEnriqueDeOsso',
    encrypt: false, 
    trustServerCertificate: true
  }
};

const connection = new Connection(config);

connection.on('connect', err => {
  if (err) {
    console.error('Error de conexión:', err.message);
  } else {
    console.log(' Conexión exitosa a SQL Server');
  }
});

connection.connect();
