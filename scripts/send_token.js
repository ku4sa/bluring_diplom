function parseData(location) {

    let params = {}
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
    let info = JSON.parse(localStorage.getItem('authInfo'))
    console.log(JSON.parse(localStorage.getItem('authInfo')))
    console.log(info['access_token'])
    console.log(info['expires_in'])
    return info['access_token'];
}


function sendToken(token) {
    console.log(token)
    fetch('/getInfo', {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ 'token': token })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.username != null) {

                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('token', data.token)
                // Успешная регистрация
                window.location.href = "/home.html";
                // alert('Регистрация прошла успешно!');
                parseUserInfo(data)


            } else {
                // Ошибка регистрации
                alert('Ошибка регистрации: ' + data.error);
            }
        })
        .catch(error => console.error('Ошибка при отправке запроса:', error));

}

function parseUserInfo(data) {
    console.log(data)
    console.log(data['name'])
    console.log(data['image'])
    //let info = JSON.parse(data)
    document.getElementById('username').innerHTML += data['name']
    document.getElementById('image').setAttribute('scr', data['image'])
}