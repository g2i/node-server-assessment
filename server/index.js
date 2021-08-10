const app = require('./app');

const PORT = process.env?.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server now listening on port ${PORT}`);
  console.log('Press ctrl-c to stop the server');
});