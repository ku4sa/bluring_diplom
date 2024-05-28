const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
jwt = require('jsonwebtoken');
//jwt = require('express-jwt'); // Import for middleware usage
const { error } = require('console');
const jsonfile = require('jsonfile');
const secretsPath = './.secrets/config.json'; // Replace with your actual path

const secret = "989e80118a8be635344bf29ddd3399a3"
const { Client } = require('pg'); // Assuming you're using the 'pg' library
const connectionString = 'postgres://postgres:120902@localhost:8080/bluring_bd';
const sharp = require('sharp');
const multer = require('multer');
const canvas = require('canvas');
const { type } = require('os');
const upload = multer();

var Jimp = require("jimp");

const app = express();


app.use((req, res, next) => {
  if (req.headers['authorization']) {
    jwt.verify(
      req.headers.authorization.split(' ')[1],
      secret,
      (err, payload) => {
        if (err) next();
        else if (payload) {
          req.username = login;
          if (!req.username) next();
        }
      }
    );
  }
  next();
});


app.get('/user', (req, res) => {
  if (req.user) return res.status(200).json(req.user);
  else
    return res
      .status(401)
      .json({ message: 'Not authorized' });
});


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
        const query = `SELECT * FROM public."Users" WHERE login = $1`;
        const values = [data.email];
        await client.connect();
        const result = await client.query(query, values);
        //пользователь найден

        if (result.rows.length > 0) {

          res.status(200).send({ code: 200, username: data.email, token: generateAccessToken(data.email) });
          console.log('Успешная  авторизация');
        } else {
          const query = 'INSERT INTO public."Users" (login, password) VALUES ($1, $2)'
          const values = [data.email, null];
          await client.query(query, values);
          console.log('Успешная регистрация');
          res.status(200).send({ code: 200, username: data.email, token: generateAccessToken(data.email) });
        }
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

  const query = `SELECT * FROM public."Users" WHERE login = $1`;
  const values = [login];
  await client.connect();
  try {
    const result = await client.query(query, values);

    //пользователь найден
    if (result.rows.length > 0) {
      const user = result.rows[0]; // первого пользователя
      console.log(user)
      if (user.password == null) {
        res.status(400).send({ 'code': 400, 'error': 'Авторизуйтесь с помощью Google' });
      }
      else if (user.password == password) {
        console.log("Успешная авторизация", user)
        const token = generateAccessToken(user)
        console.log(token)
        res.status(200).send({ 'code': 200, 'username': login, 'token': token });
      } else {

        res.status(400).send({ 'code': 400, 'error': 'Неверный пароль' });
      }
    } else {
      res.status(404).send({ 'code': 404, 'error': 'Пользователь не найден' });
    }
  } catch (error) {

    res.render('error', { 'code': 500, errorMessage: 'Глобальная ошибка' });
  } finally {
    await client.end();
  }

})



app.post('/sign_up', async (req, res) => {
  const client = new Client({ connectionString: connectionString });
  console.log("user", req.body);
  login = req.body.login
  password = req.body.password
  // Insert form data into the database
  try {


    const query = `SELECT * FROM public."Users" WHERE login = $1`;
    const values = [login];
    await client.connect();

    const result = await client.query(query, values);
    //пользователь найден
    if (result.rows.length == 0) {
      await client.query('INSERT INTO public."Users" (login, password) VALUES ($1, $2)', [login, password]);

      res.status(200).send({ 'code': 200, 'username': login, });
    } else {
      res.status(403).send({ 'code': 403, 'error': 'Пользователь с таким именем уже существует' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Неудачная попытка регестрации');
  } finally {
    await client.end();
  }
})


app.get('/home', (req, res) => {
  const user = req.username; // Access user info from decoded token
  //console.log({ message: `Welcome, ${user}!` });
  if (user) {
    res.sendStatus(200)
  } else {
    res.sendStatus(401)
  }
});


app.get('/data', (req, res) => {
  res.redirect('/token.html', 302);
});

app.post('/history', upload.any(), async (req, res) => {
  const d1 = req.body.startDate;
  const d2 = req.body.lastDate;
  console.log(d1);
  console.log(d2);
  if (d1 > d2)
    res.status(400).send({ "message": "Некорректные данные" })
  else {
    client = new Client({ connectionString: connectionString });
    await client.connect();
    const result = await client.query('SELECT data as "Дата операции",login as "Пользователь", "resultMessage" as "Комментарий", "isSuccess", image_path, '
      + 'image_path_after, blur_percent as "Процент блюринга", image_width as "Ширина", image_height as "Высота"'
      + ' FROM public."BlurActions" '
      + 'LEFT JOIN public."Parametrs" '
      + ' ON public."BlurActions".id_parametrs = public."Parametrs".id '
      + ' LEFT JOIN public."Formats" '
      + ' ON public."Parametrs".id_formats = public."Formats".id '
      + ' LEFT JOIN public."Users"'
      + 'ON public."BlurActions".id_users = public."Users".id '
      + 'WHERE data BETWEEN $1 AND $2 '
      + 'ORDER BY data ASC;',
      [d1, d2]);
    await client.end();
    console.log(result.rows)

    res.status(200).send({ 'data': result.rows })
  }
});


app.post('/change_blur_parametr', upload.any()
  , async (req, res) => {
    try {
      const blur = parseInt(req.body.blur_percent)
      client = new Client({ connectionString: connectionString });
      await client.connect();
      await client.query('ALTER TABLE public."Parametrs" ALTER COLUMN blur_percent SET DEFAULT ' + blur);
      await client.end();
      res.status(200).send({ "message": "Параметр успешно изменен" })

    } catch (error) {
      res.status(400).send({ "message": error })
    }
  })


app.get('/blur_parametr',
  async (req, res) => {
    try {
      client = new Client({ connectionString: connectionString });
      await client.connect();
      const result = await client.query("SELECT COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_DEFAULT NOTNULL AND COLUMN_NAME = 'blur_percent'");
      console.log(result.rows[0])
      await client.end();
      res.status(200).send({ "code": 200, "blur_parametr": result.rows[0].column_default })

    } catch (error) {
      res.status(400).send({ "message": error })
    }
  })

app.post('/blur', upload.single('file')
  , async (req, res) => {
    const format = req.body.format
    const uploadedFile = req.file;
    try {
      const user_id = await getUser(req.body.user);
      if (uploadedFile == null) throw "Ошибка чтения файла"
      if (format == null) throw "Ошибка чтения формата"
      const width = parseInt(req.body.width)
      const height = parseInt(req.body.height)
      const percentBlur = parseInt(req.body.percent_blur);
      const params_id = await saveData(format, width, height, percentBlur);
      if (uploadedFile) {
        switch (format) {
          case 'bmp': {

            const lenna = await Jimp.read(uploadedFile.buffer);
            await lenna
              .resize(width, height)
              .blur(percentBlur)
              .getBuffer('image/bmp', async (error, buffer) => {
                if (error) {
                  await saveBlur(uploadedFile.originalname, uploadedFile.originalname.split('.')[0] + format, params_id, user_id, true, "Ошибка блюринга бибилиотека Jimp: " + error);
                  throw "Ошибка блюринга бибилиотека Jimp: " + error;
                }
                res.header('Content-Type', 'image/bmp');
                res.send(buffer);
              })
            break;
          }
          default: {
            try {
              const blurredImage = await sharp(uploadedFile.buffer).resize(width, height,)
                .blur(percentBlur) // Значение размытия (в пикселях)
                .toFormat(format)
                .toBuffer();
              res.header('Content-Type', `image/${format}`);
              res.send(blurredImage); // отправка блюринга
            }
            catch (error) {
              await saveBlur(uploadedFile.originalname, uploadedFile.originalname.split('.')[0] + '.' + format, params_id, user_id, true, "Ошибка блюринга библиотека Sharp:" + error);
              throw "Ошибка блюринга библиотека Sharp:" + error;
            } finally {
              break;
            }
          }
        }
        await saveBlur(uploadedFile.originalname, uploadedFile.originalname.split('.')[0] + '.' + format, params_id, user_id, true, "Успешная опперация");
      }
      else {

        throw "Ошибка передачи файла"
      }
    }
    catch (error) {
      await saveBlur(uploadedFile.originalname, uploadedFile.originalname.split('.')[0] + '.' + format, null, null, false, error);
      console.log(error)
      res.status(200).send({ 'message': error })
    }
  })

app.use(express.static(__dirname + "/pages"));
app.use(express.static(__dirname + "/styles"));
app.use(express.static(__dirname + "/scripts"));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



function getSecret() {
  const jsonfile = require('jsonfile');
  const secretsPath = './.secrets/config.json'; // Replace with your actual path
  try {
    const secrets = jsonfile.readFileSync(secretsPath);
    return secrets.JWT_SECRET;
  } catch (err) {
    console.error('Error reading secret:', err);
    return null;
  }
}

function generateAccessToken(login) {
  const payload = {
    login: login,
  };
  console.log('kjk')
  const secret = getSecret()
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  console.log(token)
  return token;
}


async function saveData(format, width, height, blur_percent) {
  try {
    client = new Client({ connectionString: connectionString });
    await client.connect();
    console.log(format)
    const result = await client.query(`SELECT * FROM public."Formats" WHERE name = $1`, [format]);
    if (result.rows[0]) {
      const format_id = result.rows[0].id; // формат изображения
      client = new Client({ connectionString: connectionString });
      await client.connect();
      const params_result = await client.query('INSERT INTO public."Parametrs" (blur_percent, id_formats, image_width, image_height) VALUES ($1, $2, $3, $4) RETURNING id', [blur_percent, format_id, width, height]);
      await client.end();
      if (params_result.rows[0].id) {
        return params_result.rows[0].id;
      }
      else {
        throw "Ошибка при добавлении параметров блюринга"
      }
    }
    else {
      throw "Формат не поддерживается"
    }
  }
  catch (error) {
    console.log(error)
    throw error;
  }
}



async function getUser(username) {
  client = new Client({ connectionString: connectionString });
  await client.connect();
  const result = await client.query(`SELECT * FROM public."Users" WHERE login = $1`, [username]);
  await client.end();
  console.log(result);
  if (result.rows[0]) {
    const user_id = result.rows[0].id; // имя пользователя
    return user_id;
  } else {
    throw "Неавторизованный запрос"
  }


}


async function saveBlur(filename, newfilename, params_id, user_id, result, message) {
  client = new Client({ connectionString: connectionString });
  await client.connect();
  const now = new Date();
  await client.query('INSERT INTO public."BlurActions" (image_path, data, id_parametrs, id_users, image_path_after, "isSuccess", "resultMessage") VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [filename, now, params_id, user_id, newfilename, result, message]);
  await client.end();

}

