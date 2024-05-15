function signIn() {
  const registrationForm = document.getElementById('signInForm');
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popup-message');

  registrationForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Предотвратить перезагрузку страницы
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    const formData = {
      login, password,
    };


    console.log(formData)

    fetch('/sign_in', {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ 'login': login, 'password': password })
    })
      .then(response => response.json()) // Обработать ответ JSON
      .then(data => {

        if (data.code == 200) {
          console.log(data)
          sessionStorage.setItem('username', data.username);

          // Успешная регистрация
          window.location.href = "/home.html";


        }
        else {
          popupMessage.innerHTML = data.error
          popup.style.display = 'block';
        }
      })
      .catch(error => {
        console.log(error)
        popupMessage.text = error
        popup.style.display = 'block';
      });
  });
}

function signUp() {

  const registrationForm = document.getElementById('signUpForm');
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popup-message');

  registrationForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Предотвратить перезагрузку страницы
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const password1 = document.getElementById('password1').value;

    const formData = {
      login, password,
    };
    if (password == password1) {


      console.log(formData)

      fetch('/sign_up', {
        method: 'POST',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ 'login': login, 'password': password })
      })
        .then(response => response.json()) // Обработать ответ JSON
        .then(data => {
          console.log(data)
          if (data.code == 200) {

            console.log(data)
            sessionStorage.setItem('username', data.username);

            // Успешная регистрация
            window.location.href = "/home.html";

          }
          else {
            popupMessage.innerHTML = data.error
            popup.style.display = 'block';
          }
        })
        .catch(error => {
          console.log(error)
          popupMessage.text = error
          popup.style.display = 'block';
        });
    } else {
      popupMessage.innerHTML = "Пароли не совпадают"
      popup.style.display = 'block';
    }
  });
}/*
function signUp() {
  const registrationForm = document.getElementById('signUpForm');

  registrationForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Предотвратить перезагрузку страницы

    const formData = new FormData(registrationForm);
    // Создать объект FormData
    console.log(formData)
    fetch('/signUp', {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=UTF-8",
      },

      body: formData
    })
      .then(response => response.json()) // Обработать ответ JSON
      .then(data => {
        if (data.success) {
          // Успешная регистрация
          alert('Регистрация прошла успешно!');
        } else {
          // Ошибка регистрации
          alert('Ошибка регистрации: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Ошибка AJAX:', error);
      });
  });
}
*/

function signInWithGoogle() {

  let endPoint = 'https://accounts.google.com/o/oauth2/auth';
  let form = document.createElement('form');
  form.setAttribute('method', 'GET');
  form.setAttribute('action', endPoint);
  var params = {
    'client_id': '328302254173-7cd4u2f4jrkj9is6891suua3s89pu8ae.apps.googleusercontent.com',
    'redirect_uri': 'http://localhost:3000/data',
    'response_type': 'token',
    'scope': ['https://www.googleapis.com/auth/userinfo.email'],
    'include_granted_scopes': 'true',
    'state': 'pass-through value'
  };
  for (var p in params) {
    var input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', p)
    input.setAttribute('value', params[p])
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}
