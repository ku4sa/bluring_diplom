/*const btn = document.getElementById("action_btn")

btn.addEventListener("click", function () {
    bluringImage()
})


*/

function bluringImage() {
    const imageDisplay = document.getElementById("blur_imageContainer")
    const uploadInput = document.querySelector(".form-upload__input")
    const blurPercentage = document.getElementById('blurPercentage')
    const file = uploadInput.files?.[0]
    console.log(file)
    if (file && file.type.startsWith("image/")) {
        console.log(blurPercentage.value)
        const formData = new FormData()
        formData.append("file", file)

        formData.append("user", sessionStorage.getItem('username'))

        formData.append("percent_blur", blurPercentage.value)
        fetch('/blur', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            },
            body: formData
        })
            .then(response => response.blob())
            .then(blob => {
                const objectURL = URL.createObjectURL(blob);
                const image = document.createElement('img');
                image.src = objectURL;
                image.style.objectFit = "cover"
                image.style.width = "100%"
                image.style.height = "100%"
                image.onload = function () {
                    URL.revokeObjectURL(objectURL);
                    imageDisplay.appendChild(image);

                };



                showResult()
            })
            .catch(error => console.error('Error fetching image:', error));
    }

};



function showResult() {

    const blurResult = document.getElementById("blur_result")
    const blurSettings = document.getElementById("blur_settings")
    blurSettings.style.display = 'none'
    blurResult.style.display = 'flex'

}


