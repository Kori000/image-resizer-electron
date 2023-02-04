const form = document.querySelector('#img-form')
const img = document.querySelector('#img')
const outputPath = document.querySelector('#output-path')
const filename = document.querySelector('#filename')
const heightInput = document.querySelector('#height')
const widthInput = document.querySelector('#width')

// get the image
function loadImage(e) {
  console.log(e)

  const file = e.target.files[0]
  if (file['type'] === 'image/gif')
    return alertWarning('GIF images are not supported')
  if (!isFileImage(file)) {
    alertError('Please select an image file')
    return
  }

  // get original image dimensions
  const originalImage = new Image()
  originalImage.src = URL.createObjectURL(file)
  originalImage.onload = e => {
    widthInput.value = e.target.width
    heightInput.value = e.target.height
  }
  alertSuccess('Image loaded successfully')

  form.style.display = 'block'
  filename.innerHTML = file.name
  const currentFolder = path.dirname(img.files[0].path)
  outputPath.innerHTML = path.join(currentFolder, 'imageresizer')
}

// Send image to main process
function sendImage(e) {
  e.preventDefault()

  const width = widthInput.value
  const height = heightInput.value
  const imgPath = img.files[0].path

  if (!img.files[0]) {
    alertError('Please select an image')
    return
  }
  if (!width || !height) {
    alertError('Please enter width and height')
    return
  }

  // Send to main ipcRenderer to resize
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height
  })
}

// Catch the image:done event
ipcRenderer.on('image:done', () => {
  alertSuccess(`Image resize to ${widthInput.value} x ${heightInput.value}`)
  form.style.display = 'none'
  img.value = null
})

// verify if the file is an image
function isFileImage(file) {
  const acceptedImageTypes = ['image/jpeg', 'image/png']
  return file && acceptedImageTypes.includes(file['type'])
}

// Error Toast
function alertError(message) {
  toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    className: 'toast-animate',
    style: {
      position: 'fixed',
      top: 0,
      right: 0,
      padding: '10px',
      backgroundColor: '#ff5f6d',
      color: '#fff',
      textAlign: 'center'
    }
  })
}
// Warning Toast
function alertWarning(message) {
  toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    className: 'toast-animate',
    style: {
      position: 'fixed',
      top: 0,
      right: 0,
      padding: '10px',
      backgroundColor: '#ff9f43',
      color: '#fff',
      textAlign: 'center'
    }
  })
}
// Success Toast
function alertSuccess(message) {
  toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    className: 'toast-animate',
    style: {
      position: 'fixed',
      top: 0,
      right: 0,
      padding: '10px',
      backgroundColor: '#00b09b',
      color: '#fff',
      textAlign: 'center'
    }
  })
}

img.addEventListener('change', loadImage)
form.addEventListener('submit', sendImage)
