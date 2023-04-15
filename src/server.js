let app = require('../src/app');
const host = '0.0.0.0';
const port = 3000;

app.listen(port, host, () => {
    console.log(`app listening on port ${host}:${port}`)
})