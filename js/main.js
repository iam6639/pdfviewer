const url = '../docs/pdf.pdf'

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumPending = null;

const scale = 1.5,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

//Rendering the page
const renderPage = num =>{
  pageIsRendering = true

  //get the page
  pdfDoc.getPage(num).then(page => {
    
    const viewport = page.getViewport({scale})
    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderCtx = {
      canvasContext : ctx,
      viewport
    }

    //using the actual render function 
    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false
      if(pageNumPending !== null){
        renderPage(pageNumPending)
        pageNumPending = null
      }
    })

    document.querySelector('#page-num').textContent = num
  })
};

const queueRenderPage = num => {
  if(pageIsRendering){
    pageNumPending = num
  }
  else{
    renderPage(num)
  }
}

const showPrevPage = () => {
  if(pageNum <= 1){
    return
  }
  pageNum--;
  queueRenderPage(pageNum)
}

const showNextPage = () => {
  if(pageNum >= pdfDoc.numPages){
    return
  }
  pageNum++;
  queueRenderPage(pageNum)
}

//getting the document
pdfjsLib.getDocument(url).promise
  .then(_pdfDoc => {
    pdfDoc = _pdfDoc;
    document.querySelector('#page-count').textContent = pdfDoc.numPages
    renderPage(pageNum);
  })
  .catch(err => {
    const div = document.createElement('div')
    div.className = 'error'
    div.appendChild(document.createTextNode(err.message))
    document.querySelector('body').insertBefore(div,canvas)
    document.querySelector('.top-bar').style.display = 'none'
  })

//button events
document.getElementById('prev-page').addEventListener('click', showPrevPage)
document.getElementById('next-page').addEventListener('click', showNextPage)