/**
 *
 * @project        Motion Detection in JS
 * @file           WebCamCapture.js
 * @description    Interfaces with the web cam.
 * @author         Benjamin Horn
 * @package        MotionDetector
 * @version        -
 * 
 */
var vis = (function(){
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();

let checkIsStreamActive = function(stream) {
	return stream.getTracks().length > 0
}

var disableButton = function(check) {
	document.getElementById("start-stream").style.display = check ? "none" : "block"
	document.getElementById("stop-stream").style.display = !check ? "none" : "block"
}

;(function(App) {
	
	
	/*
	 * Creates a new web cam capture.
	 *
	 * @param <Element> videoElement The video element where we want to stream the footage.
	 *
	 * @return <Object> The initalized object.
	 *
	 */
	App.WebCamCapture = function(videoElement) {

		var webCamWindow = false;
		var width = 640;
		var height = 480;

		/*
		 * Initializes the object.
		 *
		 * @param <Element> videoElement The video element where we want to stream the footage.
		 *
		 * @return void.
		 *
		 */
		function initialize(videoElement) {
			if(typeof videoElement != 'object') {
				webCamWindow = document.getElementById(videoElement);
			} else {
				webCamWindow = videoElement;
			}

			if(hasSupport()) {
				if(webCamWindow) {
					webCamWindow.style.width = width + 'px';
					webCamWindow.style.height = height + 'px';
					startStream();
					
					// global window events
					window.onkeyup = function(e){
						if(e.enterKey){
							startStream()
						}
					}
					document.getElementById("stop-stream").addEventListener("click", stopStream)
					document.getElementById("start-stream").addEventListener("click", startStream)
					vis(function(){
						 vis() ? initialize(videoElement) : stopStream();
					});
				}
			} else {
				alert('No support found');
			}
		}

		/*
		 * Starts the streaming from the webcamera to the video element.
		 *
		 * @return void.
		 *
		 */
		function stopStream() {
			(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia).call(
				navigator, 
				{video: true}, 
				function(localMediaStream) {
					const tracks = localMediaStream.getTracks();
					tracks[0].stop()
					webCamWindow.srcObject = null;
					webCamWindow.style.backgroundColor ='black'
					document.getElementById("movement").style.display ='none'
					disableButton(false)
				}, 
				console.error
			);
		}
		function startStream() {
			(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia).call(
				navigator, 
				{video: true}, 
				function(localMediaStream) {
					if(webCamWindow) {
						var vendorURL = window.URL || window.webkitURL;

						if (navigator.mozGetUserMedia) {
							webCamWindow.mozSrcObject = localMediaStream;
							webCamWindow.play();
						} else {
							try {
								webCamWindow.srcObject = localMediaStream;
								if(document.getElementById("movement").style.display === 'none') {
									document.getElementById("movement").style.display ='block'
								}
							} catch (error) {
								webCamWindow.src = vendorURL.createObjectURL(localMediaStream);
							}
						}
					}
					// display disable stream button
					disableButton(true)
				}, 
				console.error
			);
		}
		/*
		 * Stops the streaming from the webcamera to the video element.
		 *
		 * @return void.
		 *
		 */

		/*
		 * Captures a still image from the video.
		 *
		 * @param <Element> append An optional element where we want to append the image. 
		 *
		 * @return <Element> A canvas element with the image.
		 *
		 */
		function captureImage(append) {
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d').drawImage(webCamWindow, 0, 0, width, height);

			var pngImage = canvas.toDataURL("image/png"); 
			
			if(append) {
				append.appendChild(canvas);	
			}

			return canvas;
		}

		/*
		 * Sets the size of the video
		 *
		 * @param <Int> w The width.
		 * @param <Int> h The height.
		 *
		 * @return void.
		 *
		 */
		function setSize(w, h) {
			width = w;
			height = h;
		}

		/*
		 * Checks if the browser supports webcam interfacing.
		 *
		 * @return <Boolean>.
		 *
		 */
		function hasSupport(){
			return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia || navigator.msGetUserMedia);
		}

		// Initialize on creation.
		initialize(videoElement);

		// Return public interface.
		return {
			setSize: setSize,
			hasSupport: hasSupport,
			captureImage: captureImage
		};

	}

})(MotionDetector);
