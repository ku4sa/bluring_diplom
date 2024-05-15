const express = require('express');
const bodyParser = require('body-parser');

const { error } = require('console');

//var pgp = require("pg-promise")(/*options*/);
//var db = pgp("postgres://postgres:12345@host:port/database");

const { Client } = require('pg'); // Assuming you're using the 'pg' library
const connectionString = 'postgres://postgres:120902@localhost:8080/bluring_bd';



/*const { Client } = require('pg');
var pgp = require("pg-promise")(/*options);
var db = pgp("postgres://postgres:120902@localhost:5432/bluring_bd");*/

/*db.one("SELECT $1 AS value", 123)
    .then(function (data) {
        console.log("DATA:", data.value);
    })
    .catch(function (error) {
        console.log("ERROR:", error);
    });*/



const app = express();
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

app.use(function (request, response, next) {
  const fs = require('fs');
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const data = `${hour}:${minutes}:${seconds} ${request.method} ${request.url} ${request.get("user-agent")}`;
  console.log('/n/n' + data + '/n/n');
  fs.appendFile("server.log", data + "\n", function (error) {
    if (error) return console.log(error); // если возникла ошибка    
  });
  next();
});

app.get('*.js', function (req, res, next) {
  const mimeType = 'application/javascript';
  res.contentType(mimeType);
  next();
});


app.post('/getInfo', (req, res) => {
  const client = new Client({ connectionString: connectionString });
  console.log("---", req.body);
  token = req.body['token']
  fetch(
    'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + token
  ).then(response => response.json())
    .then(async (data) => {
      console.log(data)
      try {
        const query = `SELECT * FROM users WHERE login = $1`;
        const values = [data.email];
        await client.connect();
        const result = await client.query(query, values);
        //пользователь найден

        if (result.rows.length > 0) {
          res.status(200).send(data)
          console.log('Успешная  авторизация');
        } else {
          const query = 'INSERT INTO public.users (login, password) VALUES ($1, $2)'
          const values = [data.email, null];
          await client.query(query, values);
          console.log('Успешная регистрация');
          res.status(200).send(data);
        }
        //res.redirect('/data');
      } catch (error) {
        console.error('Ошибка при регистрации пользователя: ', error);
        // res.status(500).send('Неудачная попытка регестрации');
      } finally {
        await client.end();
      }

    })
    .catch(error => console.error('Ошибка при отправке запроса:', error))
})


app.post('/sign_in', async (req, res) => {
  
 const client = new Client({ connectionString: connectionString });
  login = req.body['login']
  password = req.body['password']

  const query = `SELECT * FROM users WHERE login = $1`;
  const values = [login];
  await client.connect();
  try {
    const result = await client.query(query, values);

    //пользователь найден
    if (result.rows.length > 0) {
      const user = result.rows[0]; // первого пользователя
      console.log(user)
      if (user.password == password) {
        console.log("Успешная авторизация", user)
       
        res.status(200).send({ 'code': 200, 'username': login, });
      } else {
        //res.render('error', { errorMessage: 'Неверный пароль' });
        res.status(400).send({ 'code': 400, 'error': 'Неверный пароль' });
      }
    } else {
      res.status(404).send({'code': 404, 'error': 'Пользователь не найден' });

      // res.render('error', { errorMessage: 'Пользователь не найден' });
    }
  } catch (error) {

    //res.status(500).send({ 'error': 'Глобальная ошибка' }); // Send an internal server error
    res.render('error', { 'code': 500, errorMessage: 'Глобальная ошибка' });
  } finally {
    await client.end(); // Close the database connection
  }

})



app.post('/sign_up', async (req, res) => {
  const client = new Client({ connectionString: connectionString });
  console.log("user", req.body);
  login = req.body.login
  password = req.body.password
  // Insert form data into the database
  try {
    const query = `SELECT * FROM users WHERE login = $1`;
    const values = [login];
    await client.connect();

    const result = await client.query(query, values);
    //пользователь найден
    if (result.rows.length == 0) {
      await client.query('INSERT INTO public.users (login, password) VALUES ($1, $2)', [login, password]);

      res.status(200).send({ 'code': 200, 'username': login, });
    } else {
      res.status(403).send({ 'code': 403, 'error': 'Пользователь с таким логином уже существует' });
    }

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Неудачная попытка регестрации');
  } finally {
    await client.end();
  }
})

app.get('/data', (req, res) => {
  console.log('lol');
  console.log(req.query)
  /*let params = {}
    let regex = /([^&=]+)=([^&]+)/g, m;
    while (m = regex.exec(location.href)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2])
        console.log(m[1])
        console.log(m[2])

    }
    if (Object.keys(params).length > 0) {

        localStorage.setItem('authInfo', JSON.stringify(params))
    }
    //hide access token
    window.history.pushState({}, document.title, "/" + "auth.html")
    //let info = JSON.parse(localStorage.getItem('authInfo'))
    console.log(JSON.parse(localStorage.getItem('authInfo')))
    console.log(info['access_token'])
    console.log(info['expires_in'])
    return info['access_token'];*/
  res.redirect('/token.html', 302);
});




app.use(express.static(__dirname + "/pages"));
app.use(express.static(__dirname + "/styles"));
app.use(express.static(__dirname + "/scripts"));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



//});
