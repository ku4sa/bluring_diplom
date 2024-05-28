const dropFileZone = document.querySelector(".upload-zone_dragover")
const statusText = document.getElementById("statusText")
const sizeText = document.getElementById("uploadForm_Size")
const uploadInput = document.querySelector(".form-upload__input")
const blurPercentage = document.getElementById("blurPercentage")
const format = document.getElementById('format');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const fileSizeSpan = document.getElementById('file-size');

getBlurPercent()

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
        blurPercentage.value = data.blur_parametr
      }
    })
    .catch(error => {
      console.log(error)

    });
}

const checkbox = document.getElementById('preserveAspectRatio');

checkbox.addEventListener('change', function () {
  if (this.checked) {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    resizeImage(width, height)
    const widthnew = parseInt(widthInput.value);
    const heightnew = parseInt(heightInput.value);
    calculateFileSize(widthnew, heightnew)
  } else {

  }
});


widthInput.addEventListener('input', calculateFileSize);


heightInput.addEventListener('input', calculateFileSize);

const blurSettings = document.getElementById("blur_settings")

let setStatus = (text) => {
  statusText.textContent = text
}

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
    setStatus('')
  } else {
    setStatus("Можно загружать только изображения")
    return false
  }
})

uploadInput.addEventListener("change", (event) => {
  const file = uploadInput.files?.[0]
  console.log(file)
  if (file && file.type.startsWith("image/")) {
    processingUploadFile(file)
    setStatus('')
  } else {
    uploadInput.files[0] = null
    setStatus("Можно загружать только изображения")
    return false
  }
})

function processingUploadFile(file) {
  if (file) {

    console.log(file)
    const reader = new FileReader();

    const imageFormat = getFileExtension(file)
    format.value = imageFormat




    reader.onload = function (e) {
      const image = new Image();
      image.style.objectFit = "cover"
      image.style.width = "100%"
      image.style.height = "100%"
      image.src = e.target.result;
      image.onload = function () {
        imageContainer.appendChild(image);
        widthInput.value = image.naturalWidth
        heightInput.value = image.naturalHeight
        const ratio = image.naturalWidth / image.naturalHeight
        sessionStorage.setItem('img_ratio', ratio)
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
}

function viewUploadLoader() {
  const uploadLoader = document.getElementById("uploadFile_Loader");
  const btn = document.getElementById("alt_img_btn");
  const blurResult = document.getElementById("blur_result")
  const blurSettings = document.getElementById("blur_settings")
  const blurImageContainer = document.getElementById("blur_imageContainer")

  imageContainer.removeChild(imageContainer.firstChild)
  if (blurImageContainer.firstChild) {
    blurImageContainer.removeChild(blurImageContainer.firstChild)
  }


  if (uploadLoader) {
    uploadLoader.style.display = "grid";

  } else {
    console.warn("Element with ID 'uploadFile_Loader' not found");
  }

  btn.style.display = "none";
  blurSettings.style.display = "none"
  blurResult.style.display = 'none'


}


function hideResult() {

  const blurResult = document.getElementById("blur_result")


  blurResult.style.display = 'none'

}

function resizeImage(newWidth, newHeight) {
  const str = sessionStorage.getItem('img_ratio');
  const imgAspectRatio = parseFloat(str);

  if (newWidth / newHeight > imgAspectRatio) {
    widthInput.value = parseInt(newWidth)
    heightInput.value = parseInt(newWidth / imgAspectRatio)
  } else {
    widthInput.value = parseInt(newHeight * imgAspectRatio)
    heightInput.value = parseInt(newHeight)
  }
}


function calculateFileSize() {
  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);


  // Расчет размера файла в зависимости от формата файла
  const fileSize = calculateFileSizeForFormat(width, height, format.value);
  fileSizeSpan.textContent = `${fileSize.toFixed(2)} KB`;
}

widthInput.addEventListener('input', calculateFileSize);
heightInput.addEventListener('input', calculateFileSize);



function calculateFileSizeForFormat(width, height, format) {
  switch (format) {
    case 'jpeg':
      // Расчет размера файла JPEG
      return calculateFileSizeJPEG(width, height);
    case 'jpg':
      // Расчет размера файла JPEG
      return calculateFileSizeJPEG(width, height);
    case 'png':
      // Расчет размера файла PNG
      return calculateFileSizePNG(width, height);
    case 'bmp':
      // Расчет размера файла PNG
      return estimateBMPFileSizeInKB(width, height, 8)
    case 'webp':
      // Расчет размера файла TIFF
      return estimateWebPFileSizeInKB(width, height);

    default:
      throw new Error(`Unsupported file format: ${format}`);
  }

  function estimateWebPFileSizeInKB(width, height) {
    const avgWebPCompressionRatio = 0.5; // Average compression ratio (0.5 for 50% reduction)
    const estimatedSizeInBytes = (width * height * 4) * avgWebPCompressionRatio;
    const estimatedSizeInKB = estimatedSizeInBytes / 1024;
    return estimatedSizeInKB

  }
}
function estimateBMPFileSizeInKB(width, height, bpp) {
  const approximateSizeInBytes = (width * height * bpp) / 8 + 54;
  const approximateSizeInKB = approximateSizeInBytes / 1024;
  return approximateSizeInKB

}


function calculateFileSizeJPEG(width, height) {
  // Приблизительная формула для расчета размера JPEG
  const quality = 0.8; // Качество JPEG (от 0 до 1)
  const fileSize = (width * height * 3) / 8 * quality; // Размер в байтах
  return fileSize / 1024; // Размер в килобайтах
}

function calculateFileSizeJPEG(width, height) {
  // Приблизительная формула для расчета размера JPEG
  const quality = 0.8; // Качество JPEG (от 0 до 1)
  const fileSize = (width * height * 3) / 8 * quality; // Размер в байтах
  return fileSize / 1024; // Размер в килобайтах
}
function calculateFileSizePNG(width, height) {
  // Приблизительная формула для расчета размера PNG
  const bitDepth = 8; // Глубина цвета PNG (в битах на пиксель)
  const fileSize = width * height * bitDepth / 8; // Размер в байтах
  return fileSize / 1024; // Размер в килобайтах
}

function calculateFileSizeTIFF(width, height) {
  // Расчет размера TIFF зависит от compression used and other factors.
  // For a more accurate calculation, you would need to know the specific compression algorithm and settings.
  // Here is a simplified example using LZW compression:
  const compressionRatio = 0.5; // Степень сжатия LZW (от 0 до 1)
  const fileSize = width * height * 3 * 2 / 8 * compressionRatio; // Размер в байтах (3 байта на пиксель для RGB)
  return fileSize / 1024; // Размер в килобайтах
}

function getCurrentImageFormat() {
  const imageInput = document.getElementById('image');
  const newFormat = getFileExtension(this.files[0]);
  formatSelect.value = newFormat;
};

function getFileExtension(file) {
  const extension = file.name.split('.').pop();
  return extension.toLowerCase();
}


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

    formData.append("percent_blur", blurPercentage.value)
    formData.append('width', widthInput.value)
    formData.append('height', heightInput.value)
    formData.append('format', format.value)
    formData.append("user", sessionStorage.getItem('username'))
    fetch('/blur', {
      method: 'POST',
      headers: {
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

          imageDisplay.appendChild(image);

        };
        console.log(objectURL)


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


function saveFile() {
  const imageURL = blur_imageContainer.querySelector('img').src;
  console.log(blur_imageContainer.querySelector('img').src)
  // const imageURL = imageContainer.querySelector('img').src;
  const link = document.createElement('a');
  link.href = imageURL;
  link.download = 'image.' + format.value; // Set the desired filename for the downloaded image
  link.click();


}