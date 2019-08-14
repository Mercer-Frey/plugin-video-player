;(function(){

function videoMaster(){
	let htmlControls = '<div id="overlay"></div><div class="chips-field-left overlay-chips noselect" data-chip-side="left" data-rewind="-10"></div><div class="chips-field-right overlay-chips noselect" data-chip-side="right" data-rewind="+10"></div><div class="video-controls noselect master-pause master-volume-on chips-side-left" id="video-controls"><div class="master-stop-container"><span id="master-stop"></span></div><div class="master-play-container"><span id="master-play-pause"></span></div><div class="master-dec-container"><span id="master-current-dec" class="master-rewind" data-chip-side="left" data-rewind="-10"></span></div><div class="bar-container noselect"><progress id="video-progress" max="100" value="0"></progress><div class="progress-value-container noselect"><span class="progress-value"></span></div></div><div class="master-inc-container"><span id="master-current-inc" class="master-rewind" data-chip-side="right" data-rewind="+10"></span></div><div class="master-time-container"><span id="current-time">0:00</span><span> / </span><span id="full-time">0:00</span></div><div class="speed-options-container noselect"><ul class="speed-options noselect"><li data-speed="4" class="center master-speed noselect">x4</li><li data-speed="2" class="center master-speed noselect">x2</li><li data-speed="1" class="center master-speed noselect">x1</li><li data-speed="0.75" class="center master-speed noselect">0.75</li><li data-speed="0.5" class="center master-speed noselect">0.5</li><li data-speed="0.25" class="center master-speed noselect">0.25</li></ul><div id="current-speed" class="noselect">x1</div></div><div class="volume-options-container noselect"><div class="master-volume-range noselect"><input id="master-volume" type="range" min="0" max="100" value="30" step="1"></div><div id="volume-on-off" class="noselect"></div></div><div class="master-maximaze-video"><span id="master-maximaze-video"></span></div></div><!-- /.video-controls -->';
	document.querySelector('.master-video-container').insertAdjacentHTML('beforeend', htmlControls);

	let video = document.querySelector('#video-master');
	let videoContainer = document.querySelector('.master-video-container');
	let masterVideoControls = document.querySelector('#video-controls');
	let masterOverlay = document.querySelector('#overlay');
	let masterPlayPause = document.querySelector('#master-play-pause');
	let masterStop = document.querySelector('#master-stop');
	let masterButtonsRewind = document.querySelectorAll('.master-rewind');
	let masterVideoProgress = document.querySelector('#video-progress');
	let masterProgressContainer = document.querySelector('.bar-container');
	let masterProgressValue = document.querySelector('.progress-value');
	let masterProgressValueContainer = document.querySelector('.progress-value-container');
	let masterCurrentTime = document.querySelector('#current-time');
	let masterFullTime = document.querySelector('#full-time');
	let masterVolumeOnOf = document.querySelector('#volume-on-off');
	let masterVolumeInput = document.querySelector('#master-volume');
	let masterVolumeInputClick = document.querySelector('.master-volume-range');
	let masterCurrentSpeed = document.querySelector('#current-speed');
	let masterSpeedListener = document.querySelector('.speed-options');
	let overlayChips = document.querySelectorAll('.overlay-chips');
	let masterMaximaze = document.querySelector('.master-maximaze-video');

	video.ontimeupdate = progressUpdate;
	masterProgressContainer.onclick = videoRewind;
	// masterProgressContainer.onmouseup = mouseInputNull;
	masterVolumeInput.oninput = videoVolumeRange;
	masterVolumeInputClick.onclick = videoVolumeClick;
	masterStop.onclick = stop;
	masterPlayPause.onclick = switchPlayPause;
	masterOverlay.onclick = switchPlayPause;
	masterVolumeOnOf.onclick = switchVolume;
	masterMaximaze.onclick = fullScreen;

	masterButtonsRewind.forEach((e)=>{
		e.onclick = debounce(addChips, 200);
	})
	overlayChips.forEach((e)=>{
		e.addEventListener("dblclick", debounce(addChips, 500));
		e.addEventListener("click", debounce(switchPlayPause, 200));
	})
	masterSpeedListener.addEventListener( "click", (e)=>{
		console.log('sadg');
		let currentSpeed = e.target.getAttribute('data-speed');
		if(currentSpeed !== null){
			masterCurrentSpeed.innerHTML = 'x'+currentSpeed;
			speedChange(currentSpeed);
		}
	});
	setTimeout(()=>{
		masterFullTime.innerHTML = secondsToTime(video.duration);
	},200);
	masterVolumeInput.value = 100;
	video.volume = 100;

	function play() {
		video.play();
		masterVideoControls.classList.remove('master-pause');
		masterVideoControls.classList.add('master-play');
		masterPlayPause.style.backgroundImage = "url(img/video/pause.svg)";
		masterOverlay.style.backgroundImage = "none";
	}
	function pause() {
		video.pause();
		masterVideoControls.classList.remove('master-play');
		masterVideoControls.classList.add('master-pause');
		masterPlayPause.style.backgroundImage = "url(img/video/play.svg)";
		masterOverlay.style.backgroundImage = "url(img/video/play-overlay.svg)";
	}
	function stop() {
		masterCurrentSpeed.innerHTML = 'x1';
		speedChange(1);
		pause();
		video.currentTime = 0;
	}

	function progressUpdate(){
		let a = secondsToTime(video.currentTime);
		masterCurrentTime.innerHTML = a;
		let d = video.duration;
		let c = video.currentTime;
		masterVideoProgress.value = 100 * c / d;
		let v = 100 * c / d;
		masterProgressValue.style.left = v+'%';
	}
	function videoRewind() {
		console.log(this); 
		let w = this.offsetWidth;
		let o = event.offsetX;
		this.value = 100 * o / w;
		pause();
		video.currentTime = video.duration * o / w;
		play();
		var parrentWidth = w;
		// masterProgressValueContainer.onmousemove = (e)=>{
		// 	pause();
		// 	var parrentWidth = this.clientWidth;
		// 	var percentPointMove = e.layerX / parrentWidth * 100;
		// 	console.log('1', percentPointMove);
		// 	var positionMove = video.duration / 100 * percentPointMove;
		// 	masterVideoProgress.value = positionMove;
		// 	masterProgressValue.style.left = positionMove+'%';
		// 	console.log('2', positionMove);
		// 	console.log('3', video.currentTime);
		// 	video.currentTime = positionMove;
		// 	console.log('4', video.currentTime);
		// };
	}
	// function mouseInputNull(){ 
	// 	masterProgressValueContainer.onmousemove = null;
	// }
	function actionRewindNum(rw){
		let rewindAttr = rw;
		video.currentTime = video.currentTime + +rewindAttr;
		play();
	}
	function speedChange(speed){
		play();
		video.playbackRate = +speed;
	}

	function switchPlayPause(){
		if(masterVideoControls.classList.contains('master-pause')){
			play();

		}else{
			pause();
		}
	}
	function iconVolumeOn() {
		masterVideoControls.classList.remove('master-volume-off');
		masterVideoControls.classList.add('master-volume-on');
		masterVolumeOnOf.style.backgroundImage = "url(img/video/volume-on.svg)";
	}
	function iconVolumeOff(){
		masterVideoControls.classList.remove('master-volume-on');
		masterVideoControls.classList.add('master-volume-off');
		masterVolumeOnOf.style.backgroundImage = "url(img/video/volume-off.svg)";
	}
	var volumeVideoCurrent;
	function videoVolumeRange(){
		let v = this.value;
		volumeVideoCurrent = video.volume;
		console.log(volumeVideoCurrent);
		video.volume = v / 100;
		if(video.volume > 0){
			iconVolumeOn();
		}else{
			iconVolumeOff();
		}
	}

	function switchVolume(){
		if(masterVideoControls.classList.contains('master-volume-on')){
			iconVolumeOff();
			volumeVideoCurrent = video.volume;
			masterVolumeInput.value = 0;
			video.volume = 0;
		}else{
			masterVolumeInput.value = volumeVideoCurrent * 100;
			video.volume = volumeVideoCurrent;
			iconVolumeOn();
		}
	}
	function videoVolumeClick(e){
		if(e.layerX > 0 ){
			iconVolumeOn();
			let currentVolumeClick = e.layerX / 70 * 100;
			volumeVideoCurrent = currentVolumeClick;
			masterVolumeInput.value =  e.layerX;
			video.volume = volumeVideoCurrent / 100;
		}
		else{
			iconVolumeOff();
		}
	}
    function createChipField(chip, side){
    	document.querySelector('.video-controls').setAttribute('data-chips-side', side);
    	var chField = document.createElement('div');
	    chField.classList.add('chips-field');
		chField.classList.add('noselect');
		document.querySelector('.chips-field-' + side).appendChild(chField);
		document.querySelector('.chips-field').appendChild(chip);
		setTimeout(()=>{
			chip.remove();
		}, 1000);
    }
    function addChips() {
    	console.log(this);
    	let chAtt = this.getAttribute('data-rewind');
    	let chSide = this.getAttribute('data-chip-side');
    	let chip = document.createElement('p');
    	chip.classList.add('master-chip');
    	chip.innerHTML = chAtt+' sec';
		actionRewindNum(chAtt);
    	if(document.querySelector('.chips-field')){
    		if(chSide !== document.querySelector('.video-controls').getAttribute('data-chips-side')){
	    		document.querySelector('.chips-field').remove();
				createChipField(chip, chSide);
    		}else{
    			document.querySelector('.chips-field').appendChild(chip);
    			setTimeout(()=>{
					chip.remove();
				}, 1000);
    		}
    	}else{
			createChipField(chip, chSide);
    	}
    }
	function fullScreen(){
		if (!videoContainer.classList.contains("fullscreen")) {
		    videoContainer.classList.add("fullscreen");
		    requestFullscreen(videoContainer);
		}else{
		    videoContainer.classList.remove("fullscreen");
		    cancelFullscreen();
		}

	};
	function requestFullscreen(e) {
	  if ( e.requestFullscreen ) {
	    e.requestFullscreen();
	  } else if ( e.mozRequestFullScreen ) {
	    e.mozRequestFullScreen();
	  } else if ( e.webkitRequestFullScreen ) {
	    e.webkitRequestFullScreen( Element.ALLOW_KEYBOARD_INPUT );
	  }
	}
	function cancelFullscreen() {
		if(document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if(document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if(document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}
	function debounce(f, ms) {

	    let isCooldown = false;

	    return function() {
	        if (isCooldown) return;

	        f.apply(this, arguments);

	        isCooldown = true;

	        setTimeout(() => isCooldown = false, ms);
	    };
	};
    function secondsToTime(time){
        var h = Math.floor(time / (60 * 60)),
            dm = time % (60 * 60),
            m = Math.floor(dm / 60),
            ds = dm % 60,
            s = Math.ceil(ds);
        if (s === 60) {
            s = 0;
            m = m + 1;
        }
        if (s < 10) {
            s = '0' + s;
        }
        if (m === 60) {
            m = 0;
            h = h + 1;
        }
        if (m < 10) {
            m = m;
        }
        if (h === 0) {
            fulltime = m + ':' + s;
        } else {
            fulltime = h + ':' + m + ':' + s;
        }
        return fulltime;
    }	
}
videoMaster();
})();
