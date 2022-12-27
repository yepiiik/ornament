/**
 * @type HTMLCanvasElement
 */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d")

let cameraOffset = { x: 400, y: 100 }
let canvasEventPosition = { x: 0, y: 0 }

let canvasSize = {width: 0, height: 0}

let cameraZoom = 1
let SCROLL_SENSITIVITY = 2
let MAX_ZOOM = SCROLL_SENSITIVITY**4
let MIN_ZOOM = SCROLL_SENSITIVITY**-2


function draw() {
    canvasSize.width = window.innerWidth;
    canvasSize.height = window.innerHeight;

    // Resize canvas to window scale
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Reszie canvas using results of event functions
    ctx.translate(cameraOffset.x, cameraOffset.y)
    ctx.scale(cameraZoom, cameraZoom)

    // Draw
    ctx.drawImage(qrCode, 0, 0);

    requestAnimationFrame(draw)
}


function defaultCameraOffset() {
    cameraOffset = { x: 400, y: 100 }
}


function drawMainCanvas() {

    // Draw canvas border
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.strokeStyle = "red";
    ctx.stroke();
}


function getCanvasMousePosition() {
    var rect = canvas.getBoundingClientRect();
    return {
      x: window.event.clientX - rect.left,
      y: window.event.clientY - rect.top
    };
  }


function zoom(zoomAmount, eventPosition) {
    // Actual (non-scaled) mouse position on the canvas
    canvasEventPosition.x = (eventPosition.x - cameraOffset.x) / cameraZoom
    canvasEventPosition.y = (eventPosition.y - cameraOffset.y) / cameraZoom

    cameraZoom *= SCROLL_SENSITIVITY**-zoomAmount

    cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
    cameraZoom = Math.max( cameraZoom, MIN_ZOOM )

    // Move canvas
    cameraOffset.x = eventPosition.x - canvasEventPosition.x * cameraZoom
    cameraOffset.y = eventPosition.y - canvasEventPosition.y * cameraZoom

    console.log(cameraZoom)
}


// // Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }        
    }
}


let isDragging = false
let dragStart = { x: 0, y: 0 }


function onPointerDown(e)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x - cameraOffset.x
    dragStart.y = getEventLocation(e).y - cameraOffset.y
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
    prevTouchZoom = null
}

function onPointerMove(e)
{
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x - dragStart.x
        cameraOffset.y = getEventLocation(e).y - dragStart.y
    }
}

function handleTouch(e, singleTouchHandler)
{
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

let prevTouchZoom = null

function handlePinch(e)
{
    e.preventDefault()
    if (isDragging) return;
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    let touchCenter = { x: (touch2.x + touch1.x)/2, y: (touch2.y + touch1.y)/2}
    
    let currentTouchZoom = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (prevTouchZoom == null)
    {
        prevTouchZoom = currentTouchZoom
    }
    else
    {
        zoom(-(currentTouchZoom - prevTouchZoom)/100000, touchCenter)
    }
    prevTouchZoom = currentTouchZoom
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.ctrlKey) {
        zoom(e.deltaY/100, getCanvasMousePosition());
        return;
    }

    if (e.shiftKey) {
        cameraOffset.x -= e.deltaY;
        return;
    }
        
    cameraOffset.x -= e.deltaX;
    cameraOffset.y -= e.deltaY;
})

const qrCode = new Image();
qrCode.src = 'assets/images/qr-code.gif';

defaultCameraOffset()
draw();


