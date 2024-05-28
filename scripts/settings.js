const blur_settings = document.getElementById('blur_percent');
const blur_btn = document.getElementById('blur_settings_button');
const blurError = document.getElementById('blurError');
const dateError = document.getElementById('dateError');
const history_btn = document.getElementById('history_btn');
const s_date = document.getElementById('start_date');
const l_date = document.getElementById('last_date');


s_date.addEventListener('change', (event) => parseDate());
l_date.addEventListener('change', (event) => parseDate());



getBlurPercent()


blur_settings.addEventListener('input', (event) => parseBlur())

function getBlurPercent() {
    fetch('/blur_parametr', {
        method: 'GET',
        headers: {
        },
    }).then(response => response.json()) // Обработать ответ JSON
        .then(data => {
            console.log(data)
            if (data.code == 200) {
                console.log(data.blur_parametr)
                blur_settings.value = data.blur_parametr
            }
        })
        .catch(error => {
            console.log(error)

        });
}
function changeBlurSettings() {
    const formData = new FormData()
    formData.append("blur_percent", blur_settings.value)

    fetch('/change_blur_parametr', {
        method: 'POST',
        headers: {
        },
        body: formData
    }).then(response => response.json()) // Обработать ответ JSON
        .then(data => {
            if (data.code == 200) {
                console.log(data)
            }

            console.log(data)
        })
        .catch(error => {
            console.log(error)

        });
}




function parseBlur() {
    const blur_value = parseInt(blur_settings.value)
    if (blur_value) {
        if (blur_value < 1 || blur_value > 1000) {
            blurError.textContent = 'Процент блюринга должен лежать в диапазоне от 1 до 1000';
            blurError.style.display = 'block';
            blur_btn.disabled = true;

        }
        else {
            blurError.textContent = '';
            blurError.style.display = 'none';
            blur_btn.disabled = false;
        }

    } else {
        blurError.textContent = 'Введите целое число';
        blurError.style.display = 'block';
        blur_btn.disabled = true;
    }
}


function parseDate() {
    console.log('лол')
    const dateInput1 = s_date.querySelector("input[type='date']");
    const dateInput2 = l_date.querySelector("input[type='date']");
    if (dateInput1.value && dateInput2.value) {
        const startDateObject = new Date(dateInput1.value);
        const formattedDate1 = startDateObject.toISOString().replace('Z', '+03:00');

        const lastdateObject = new Date(dateInput2.value);
        const formattedDate2 = lastdateObject.toISOString().replace('Z', '+03:00');

        if (startDateObject > lastdateObject) {
            dateError.textContent = 'Некорректный диапазон';
            dateError.style.display = 'block';
            history_btn.disabled = true;
            return null;
        }
        else {
            dateError.textContent = '';
            dateError.style.display = 'none';
            history_btn.disabled = false;
            return [formattedDate1, formattedDate2];
        }
    } else {
        dateError.textContent = 'Укажите дату';
        dateError.style.display = 'block';
        history_btn.disabled = true;
        return null;
    }
}



function getDateFromElement(value) {
    const startDateDiv = document.getElementById(value);
    startDateDiv.addEventListener('change', (event) => parseDate(startDateDiv.querySelector("input[type='date']").value));
}


function createTableFromData(data) {
    // Создание базовой структуры таблицы
    const table = document.createElement('table');
    table.classList.add('table');
    const tableHeader = document.createElement('thead');
    const tableBody = document.createElement('tbody');

    // Создание заголовка таблицы
    const headerRow = document.createElement('tr');
    for (const key in data[0]) {

        if (key == 'image_path') {

            const headerCell = document.createElement('th');
            headerCell.scope = 'col'
            headerCell.textContent = "Название файла";
            headerRow.appendChild(headerCell);


            const headerCell2 = document.createElement('th');
            headerCell2.scope = 'col'
            headerCell2.textContent = "Формат";
            headerRow.appendChild(headerCell2);
        } else if (key == "image_path_after") {
            const headerCell = document.createElement('th');
            headerCell.scope = 'col'
            headerCell.textContent = "в";
            headerRow.appendChild(headerCell);


            const headerCell2 = document.createElement('th');
            headerCell2.scope = 'col'
            headerCell2.textContent = "Формат";
            headerRow.appendChild(headerCell2);


        }
        else if (key != "isSuccess") {
            const headerCell = document.createElement('th');
            headerCell.scope = 'col'
            headerCell.textContent = key;
            headerRow.appendChild(headerCell);
        }

        else { }

    }
    tableHeader.appendChild(headerRow);
    tableHeader.style.backgroundColor = '#f0f0f0';
    tableHeader.style.fontSize = '16px';
    tableHeader.style.fontWeight = 'bold';


    // Добавление строк данных
    for (const obj of data) {
        const row = document.createElement('tr');
        for (const key in obj) {
            size = ""

            if (key == 'image_path') {

                const cell = document.createElement('td');

                cell.textContent = obj[key].split('.')[0];
                row.appendChild(cell);
                const cell2 = document.createElement('td');
                cell2.textContent = obj[key].split('.')[1];
                row.appendChild(cell2);

            } else if (key == "image_path_after") {
                const cell = document.createElement('td');
                cell.textContent = "--->";
                row.appendChild(cell);
                const cell2 = document.createElement('td');
                cell2.textContent = obj[key].split('.')[1] ?? "Не определен"
                row.appendChild(cell2);
            } else if (key == 'isSuccess') {
                if (obj[key] == true) {

                } else {
                    row.style.backgroundColor = "#FFFF00"
                }

            }
            else if (key == "Дата операции") {
                const cell = document.createElement('td');
                cell.textContent = new Date(obj[key]).toLocaleString();
                row.appendChild(cell);
            }
            else if (key != "isSuccess") {
                const cell = document.createElement('td');
                cell.textContent = obj[key];
                row.appendChild(cell);
            }
            row.classList.add('table-row');
        }
        tableBody.classList.add('table-body');
        tableBody.appendChild(row);
    }

    // Сборка таблицы и возврат
    table.appendChild(tableHeader);
    table.appendChild(tableBody);
    return table;
}


function getHistory() {
    const values = parseDate()
    console.log(values)
    const formData = new FormData()
    formData.append("startDate", values[0])
    formData.append("lastDate", values[1])
    fetch('/history', {
        method: 'POST',
        headers: {
        },
        body: formData
    }).then(response => response.json()) // Обработать ответ JSON
        .then(data => {
            console.log(data.data)
            if (data.data) {
                console.log(data.data)

                const table = createTableFromData(data.data);
                const container = document.getElementById('table_container');
                if (container.firstChild) {
                    container.removeChild(container.firstChild)
                }
                container.appendChild(table);
            }
            else {

            }
        })
        .catch(error => {
            console.log(error)

        });
}

