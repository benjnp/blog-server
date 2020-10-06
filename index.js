const app = require('./app')

app.listen(8080, err => {
    if (err) console.error(err);
    console.log('Server listening on port 8080...');
});