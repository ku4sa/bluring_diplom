const dropFileZone = document.querySelector(".upload-zone_dragover")
const statusText = document.getElementById("uploadForm_Hint")
const sizeText = document.getElementById("uploadForm_Size")
const uploadInput = document.querySelector(".form-upload__input")
//const imageDisplay = document.querySelector("image-display")

const blurSettings = document.querySelector(".blur_settings")

let setStatus = (text) => {
  statusText.textContent = text
}

const uploadUrl = "/unicorns";

["dragover", "drop"].forEach(function (event) {
  document.addEventListener(event, function (evt) {
    evt.preventDefault()
    return false
  })
})

dropFileZone.addEventListener("dragenter", function () {
  dropFileZone.classList.add("_active")
})

dropFileZone.addEventListener("dragleave", function () {
  dropFileZone.classList.remove("_active")
})

dropFileZone.addEventListener("drop", function () {
  dropFileZone.classList.remove("_active")
  const file = event.dataTransfer?.files[0]
  if (!file) {
    return
  }

  if (file.type.startsWith("image/")) {
    uploadInput.files = event.dataTransfer.files
    processingUploadFile(file)
  } else {
    //setStatus("Можно загружать только изображения")
    return false
  }
})

uploadInput.addEventListener("change", (event) => {
  const file = uploadInput.files?.[0]
  console.log(file)
  if (file && file.type.startsWith("image/")) {


    processingUploadFile(file)
  } else {
    //setStatus("Можно загружать только изображения")
    return false
  }
})

function processingUploadFile(file) {
  if (file) {

    console.log(file)
    const reader = new FileReader();

    reader.onload = function (e) {
      const image = new Image();
      image.style.objectFit = "cover"
      image.style.width = "100%"
      image.style.height = "100%"
      image.src = e.target.result;
      image.onload = function () {
        imageContainer.appendChild(image);
      };
    };

    reader.readAsDataURL(file);
    hideUploadLoader()

  }
}


function hideUploadLoader() {
  const uploadLoader = document.getElementById("uploadFile_Loader");
  const btn = document.getElementById("alt_img_btn");
  if (uploadLoader) {
    uploadLoader.style.display = "none";

  } else {
    console.warn("Element with ID 'uploadFile_Loader' not found");
  }
  if (btn) {
    btn.style.display = "block";
    blurSettings.style.display = "flex"

  } else {
    console.warn("Element with ID 'uploadFile_Loader' not found");
  }
  //hideResult()
}

function viewUploadLoader() {
  const uploadLoader = document.getElementById("uploadFile_Loader");
  const btn = document.getElementById("alt_img_btn");
  const blurResult = document.getElementById("blur_result")

  const blurImageContainer = document.getElementById("blur_imageContainer")

  imageContainer.removeChild(imageContainer.firstChild)
  blurImageContainer.removeChild(blurImageContainer.firstChild)
  if (uploadLoader) {
    uploadLoader.style.display = "grid";

  } else {
    console.warn("Element with ID 'uploadFile_Loader' not found");
  }
  if (btn) {
    btn.style.display = "none";
    blurSettings.style.display = "none"
    blurResult.style.display = 'none'
  } else {
    console.warn("Element with ID 'uploadFile_Loader' not found");
  }


  //hideResult()
}


function hideResult() {

  const blurResult = document.getElementById("blur_result")


  blurResult.style.display = 'none'

}