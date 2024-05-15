function sendFile() {
    const uploadInput = document.querySelector(".form-upload__input")
    const blurPercentage = document.getElementById('blurPercentage')
    const file = uploadInput.files?.[0]
    console.log(file)
    if (file && file.type.startsWith("image/")) {
        console.log(blurPercentage.value)
        const formData = new FormData()
        formData.append("file", file)

        formData.append("percent_blur", blurPercentage.nodeValue)
        fetch('/blur', {
            method: 'POST',
            headers: {
            },
            body: formData
        })
            .then(response => response.json()) // Обработать ответ JSON
            .then(data => {

                if (data.code == 200) {
                    console.log(data)



                }
                else {


                }
            })
            .catch(error => {
                console.log(error)

            });
    };
}