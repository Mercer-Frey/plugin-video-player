;(function(){

let htmlControls = '<div id="overlay"></div><div id="mouse-hide"></div><div class="volume-value-container"></div><div class="volume-icon-container"></div><div class="chips-field-left overlay-chips noselect" data-chip-side="left" data-rewind="-10"></div><div class="chips-field-right overlay-chips noselect" data-chip-side="right" data-rewind="+10"></div><div class="video-controls noselect master-pause master-volume-on chips-side-left" id="video-controls"> <div class="master-stop-container"><span id="master-stop"></span></div> <div class="master-play-container"><span id="master-play-pause"></span></div> <div class="master-dec-container"><span id="master-current-dec" class="master-rewind" data-chip-side="left" data-rewind="-10"></span></div> <div class="bar-container noselect"> <input type="range" id="video-progress" max="10000" value="0"> </div> <div class="master-inc-container"><span id="master-current-inc" class="master-rewind" data-chip-side="right" data-rewind="+10"></span></div> <div class="master-time-container"><span id="current-time">0:00</span><span> / </span><span id="full-time">0:00</span></div> <div class="speed-options-container noselect"> <ul class="speed-options noselect"> <li data-speed="4" data-speed-number="2" class="center master-speed noselect">x4</li> <li data-speed="2" data-speed-number="1" class="center master-speed noselect">x2</li> <li data-speed="1" data-speed-number="0" class="center master-speed active-speed noselect">x1</li> <li data-speed="0.75" data-speed-number="-1" class="center master-speed noselect">0.75</li> <li data-speed="0.5" data-speed-number="-2" class="center master-speed noselect">0.5</li> <li data-speed="0.25" data-speed-number="-3" class="center master-speed noselect">0.25</li> </ul> <div id="current-speed" class="noselect">x1</div> </div> <div class="volume-options-container noselect"> <div class="master-volume-range noselect"> <input id="master-volume" type="range" min="0" max="100" value="100" step="1"> </div> <div class="volume-range">100</div> <div id="volume-on-off" class="noselect"></div> </div> <div class="master-middle-video"><span id="master-middle-video"></span></div> <div class="master-maximaze-video"><span id="master-maximaze-video"></span></div></div>';

var videos = document.getElementsByTagName('video');
for(var i=0; i<videos.length;i++)
  if( videos[i].classList.contains('video-master')){
    var wrapper = document.createElement('div');
    wrapper.classList.add('master-video-container');
    wrapper.setAttribute('tabindex', [i]);
    wrapper.innerHTML = videos[i].outerHTML;
    wrapper.insertAdjacentHTML('beforeend', htmlControls);
    videos[i].parentNode.replaceChild(wrapper,videos[i]);
    videos[i].onmousemove = videoMaster();
  }

function videoMaster(){
	let video 						= document.querySelector('video');
	let videoContainer 				= document.querySelector('.master-video-container');
	let masterVideoControls 		= document.querySelector('#video-controls');
	let masterOverlay 				= document.querySelector('#overlay');
	let masterPlayPause 			= document.querySelector('#master-play-pause');
	let masterStop 					= document.querySelector('#master-stop');
	let masterVideoProgress			= document.querySelector('#video-progress');
	let masterProgressContainer 	= document.querySelector('.bar-container');
	let masterCurrentTime 			= document.querySelector('#current-time');
	let masterFullTime 				= document.querySelector('#full-time');
	let masterVolumeOnOf 			= document.querySelector('#volume-on-off');
	let masterVolumeInput 			= document.querySelector('#master-volume');
	let masterVolumeInputClick 		= document.querySelector('.master-volume-range');
	let masterRangeValue	 		= document.querySelector('.volume-range');
	let masterCurrentSpeed 			= document.querySelector('#current-speed');
	let masterFieldLeft	 			= document.querySelector('.chips-field-left');
	let masterFieldRight  			= document.querySelector('.chips-field-right');
	let masterSpeedListener 		= document.querySelector('.speed-options');
	let masterMaximaze 				= document.querySelector('.master-maximaze-video');
	let masterMiddle 				= document.querySelector('.master-middle-video');
	let overlayChips 				= document.querySelectorAll('.overlay-chips');
	let masterButtonsRewind 		= document.querySelectorAll('.master-rewind');
	let masterSpeedList 			= document.querySelectorAll('.master-speed');

	video.ontimeupdate = progressUpdate;
	videoContainer.onclick = showControls;
	videoContainer.onwheel = wheelVolume;
	videoContainer.onmousemove = showControls;
	videoContainer.onmouseenter = activeKeylistener;
	videoContainer.onmouseleave = showControls;
	masterProgressContainer.onmousedown = videoRewind;
	masterProgressContainer.onmouseup = play;
	masterVolumeInput.oninput = videoVolumeRange;
	masterVideoProgress.oninput = onInputUpdate;
	masterStop.onclick = stop;
	masterPlayPause.onclick = switchPlayPause;
	masterOverlay.onclick = switchPlayPause;
	masterOverlay.ondblclick = fullScreen;
	masterVolumeOnOf.onclick = switchVolume;
	masterMaximaze.onclick = fullScreen;
	masterMiddle.onclick = middleScreen;
	masterVideoControls.onmouseenter = flagMouseOn;
	masterVideoControls.onmouseleave = flagMouseOff;

	masterButtonsRewind.forEach((e)=>{
		e.onclick = debounce(addChips, 200);
	})
	overlayChips.forEach((e)=>{
		e.addEventListener("dblclick", debounce(addChips, 500));
		e.addEventListener("click", debounce(switchPlayPause, 200));
	})
	masterSpeedListener.addEventListener( "click", (e)=>{
		let currentSpeed = e.target.getAttribute('data-speed');
		if(currentSpeed !== null){
			for (var i = 0; i < masterSpeedList.length; i++) {
				if (masterSpeedList[i].classList.contains('active-speed')){
					masterSpeedList[i].classList.remove('active-speed');
				}
			}
			e.target.classList.add('active-speed');
			masterCurrentSpeed.innerHTML = 'x'+currentSpeed;
			speedChange(currentSpeed);
		}
	});
	setTimeout(()=>{
		masterFullTime.innerHTML = secondsToTime(video.duration);
		masterVolumeInput.value = 100;
		video.volume = 1;
	},200);

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
		showControls();
		masterCurrentSpeed.innerHTML = 'x1';
		speedChange(1);
		pause();
		video.currentTime = 0;
	}
	function flagMouseOn(){
		masterVideoControls.classList.add('mouse-on-controls');
	}
	function flagMouseOff(){
		masterVideoControls.classList.remove('mouse-on-controls');
	}
	var hideControls;
	function showControls(){
		clearTimeout(hideControls);
		document.querySelector('#mouse-hide').classList.remove('mouse-hide');
		masterVideoControls.style.cssText = 'bottom: 0;opacity: 1;-webkit-transform: scaleY(1);-ms-transform: scaleY(1);transform: scaleY(1);';
		masterFieldLeft.style.cssText = 'left: 0;-webkit-transform: scaleX(1);-ms-transform: scaleX(1);transform: scaleX(1);';
		masterFieldRight.style.cssText = 'right: 0;-webkit-transform: scaleX(1);-ms-transform: scaleX(1);transform: scaleX(1);';
		if(!masterVideoControls.classList.contains('mouse-on-controls')) {	
			hideControls = setTimeout(() => {
			setTimeout(()=>{document.querySelector('#mouse-hide').classList.add('mouse-hide')}, 1000);
			masterVideoControls.style.cssText = 'bottom: -65px;opacity: 0;-webkit-transform: scaleY(0);-ms-transform: scaleY(0);transform: scaleY(0);';
			masterFieldLeft.style.cssText = 'left: -25%;-webkit-transform: scaleX(0);-ms-transform: scaleX(0);transform: scaleX(0);';
			masterFieldRight.style.cssText = 'right: --25%;-webkit-transform: scaleX(0);-ms-transform: scaleX(0);transform: scaleX(0);';
		}, 2000)

		}
	}
	function progressUpdate(){
		let a = secondsToTime(video.currentTime);
		masterCurrentTime.innerHTML = a;
		let d = video.duration;
		let c = video.currentTime;
		masterVideoProgress.value = 10000 * c / d;
		let v = 100 * c / d;
	}
	function videoRewind() {
		showControls();
		pause();
		let w = this.offsetWidth;
		let o = event.offsetX;
		masterVideoProgress.value = 10000 * o / w;
		video.currentTime = video.duration * o / w;
		var parrentWidth = w;
	}
	function onInputUpdate(e){
		masterOverlay.style.backgroundImage = "none";
		masterPlayPause.style.backgroundImage = "url(img/video/pause.svg)";
		var inp = this.value / 100 ;
		video.currentTime = video.duration / 100 * inp;
		masterCurrentTime.innerHTML = secondsToTime(video.currentTime);
	}
	function actionRewindNum(rw){
		let rewindAttr = rw;
		video.currentTime = video.currentTime + +rewindAttr;
		play();
	}
	function videoRewindPercent(percent) {
		video.currentTime = video.duration / 100 * percent;
		play();
	}
	function speedChange(speed){
		play();
		video.playbackRate = +speed;
	}

	function switchPlayPause(){
		showControls();
		if(masterVideoControls.classList.contains('master-pause')){
			play();

		}else{
			pause();
		}
	}
	function speedChangeKey(num){
		exit:for (var i = 0; i < masterSpeedList.length; i++) {
			if (masterSpeedList[i].classList.contains('active-speed')) {
				var dataSpeedNumber = masterSpeedList[i].getAttribute('data-speed-number');
				if(dataSpeedNumber >= -3 && dataSpeedNumber <= 2){
					var nextSpeed = masterSpeedList[i + num].getAttribute('data-speed');
					if(nextSpeed){
						masterSpeedList[i].classList.remove('active-speed');
						masterSpeedList[i + num].classList.add('active-speed');
						masterCurrentSpeed.innerHTML = 'x'+nextSpeed;
						speedChange(nextSpeed);
						play();
						break exit;						
					}
				}
			}
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
	var volumeVideoCurrent = 1;
	function videoVolumeRange(){
		showControls();
		let v = this.value;
		volumeVideoCurrent = video.volume;
		video.volume = v / 100;
		currentVolumeKey = video.volume;
		masterRangeValue.style.bottom = ((60/100)*(video.volume *100)) + 24 + "px";
		masterRangeValue.innerHTML = +Math.round((video.volume * 100));
		if(video.volume > 0){
			iconVolumeOn();
		}else{
			iconVolumeOff();
		}
	}
	var rememberVolume;
	function switchVolume(){
		showControls();
		if(masterVideoControls.classList.contains('master-volume-on')){
			iconVolumeOff();
			rememberVolume = video.volume;
			masterVolumeInput.value = 0;
			video.volume = 0;
			volumeVideoCurrent = 0;
			currentVolumeKey =  0;
			masterRangeValue.style.bottom = 24 + "px";
			masterRangeValue.innerHTML = 0;
		}else{
			masterVolumeInput.value = rememberVolume * 100;
			video.volume = rememberVolume;
			volumeVideoCurrent = rememberVolume;
			currentVolumeKey =  rememberVolume;			
			masterRangeValue.style.bottom = ((60/100)*(volumeVideoCurrent *100)) + 24 + "px";
			masterRangeValue.innerHTML = Math.round((volumeVideoCurrent*100));
			iconVolumeOn();
		}
	}
	function videoVolumeClick(e){
		showControls();
		if(e.layerX > 0 ){
			iconVolumeOn();
			let parrentWidth = e.explicitOriginalTarget.offsetWidth;
			let currentVolumeClick = e.layerX / parrentWidth * 100;
			volumeVideoCurrent = currentVolumeClick;
			rememberVolume = currentVolumeClick / 100;
			currentVolumeKey = currentVolumeClick / 100;
			masterVolumeInput.value = currentVolumeClick;
			video.volume = volumeVideoCurrent / 100;
			masterRangeValue.style.bottom = ((60/100)*(video.volume *100)) + 24 + "px";
			masterRangeValue.innerHTML = +Math.round((video.volume * 100));
		}
		else{
			iconVolumeOff();
		}
	}
	function wheelVolume(e) {
		e.preventDefault();
		if (e.deltaY > 0) {changeVolumeKey(-5);addVolumeKeySign("value", "icon", 400);}
		if (e.deltaY < 0) {changeVolumeKey(5);addVolumeKeySign("value", "icon", 400);}
	}
    var valueOverlayColorTimer;
    var iconOverlayColorTimer;
	function animateBgSigns(type, ms){
		(type === "value") ? timerSigns = valueOverlayColorTimer : timerSigns = iconOverlayColorTimer;
		clearTimeout(timerSigns);
		var overlayType = document.querySelector('.volume-'+type+'-overlay');
		overlayType.style.background = 'rgba(0,0,0, 0.3)';
		timerSigns = setTimeout(()=>{
			overlayType.style.background = 'none';
		}, ms);
		return overlayType;
	}
	function createVloumeSign(type){1
    	let sign = document.createElement('span');
    	sign.classList.add('volume-'+type);
    	sign.classList.add('volume-sign');
    	if(type === 'icon') {
    		if(video.volume > 0.0000001 ) {
    			sign.style.backgroundImage = 'url(img/video/volume-on.svg)';
    			iconVolumeOn();
    		}else{
    			sign.style.backgroundImage = 'url(img/video/volume-off.svg)';
    			iconVolumeOff();
    		}
    	}
    	if(type === 'value') sign.innerHTML = +Math.round((video.volume * 100)) + '%';
    	return sign;
	}
	function createOverlaySign(type){
    	var overlaySign = document.createElement('div');
	    overlaySign.classList.add('volume-'+type+'-overlay');
	    overlaySign.classList.add('volume-signs-overlay');
		overlaySign.classList.add('noselect');
		document.querySelector('.volume-'+type+'-container').appendChild(overlaySign);
		return overlaySign;
	}
	function cleanOverlay(sign, ms, type){
		setTimeout(()=>{
			sign.remove();
			if(!document.querySelector('.volume-sign')){
				document.querySelectorAll('.volume-signs-overlay').forEach(e=>e.remove());
				masterVideoControls.classList.remove('volume-signs-active');
			}
		}, ms);	
	}
	var currentVolumeKey = 1;
	function changeVolumeKey(num){
		currentVolumeKey = (+currentVolumeKey*100 + +num) / 100;
		if(currentVolumeKey >= 1){
			currentVolumeKey = 1;
		}
		if(currentVolumeKey <= 0){
			currentVolumeKey = 0;
		}
		video.volume = +currentVolumeKey;
		volumeVideoCurrent = +currentVolumeKey;
		rememberVolume = +currentVolumeKey;
		masterVolumeInput.value = video.volume * 100;
		masterRangeValue.style.bottom = ((60/100)*(video.volume *100)) + 24 + "px";
		masterRangeValue.innerHTML = +Math.round((video.volume * 100));
	}

	function addVolumeKeySign(value, icon, msI) {
		showControls();
		masterVideoControls.classList.add('volume-signs-active');
		if(!document.querySelector('.volume-signs-overlay')){
			var newOverlayValue = createOverlaySign(value);
			var newOverlayicon = createOverlaySign(icon);
			let newValue = createVloumeSign(value);
			let newIcon = createVloumeSign(icon);
			newOverlayValue.appendChild(newValue);
			newOverlayicon.appendChild(newIcon);
			cleanOverlay(newValue, 1000, value);
			cleanOverlay(newIcon, 1000, icon);
			animateBgSigns(icon, msI);
		}else{
			let newValue =  createVloumeSign(value);
			let newIcon =  createVloumeSign(icon);
			document.querySelector('.volume-value-overlay').appendChild(newValue);
			document.querySelector('.volume-icon-overlay').appendChild(newIcon);
			cleanOverlay(newValue, 1000, value);
			cleanOverlay(newIcon, 1000, icon);
			animateBgSigns(icon, msI);
		}
	}

    var shipFieldColorTimer;
	function animateBgField(){
		clearTimeout(shipFieldColorTimer);
		document.querySelectorAll('.chips-field').forEach(e=>{
			e.style.background = 'rgba(0, 0, 0, 0.3)';
			shipFieldColorTimer = setTimeout(()=>{
				e.style.background = 'none';
			},300)
		})
	}
	function cleanField(chip){
		setTimeout(()=>{
			chip.remove();
			if(!document.querySelector('.master-chip')) {document.querySelector('.chips-field').remove()};
		}, 1000);	
	}
	function createChip(chAtt){
    	let chip = document.createElement('span');
    	chip.classList.add('master-chip');
    	chip.innerHTML = chAtt+' sec';	
    	return chip;
	}
    function createChipField(chip, chSide){
    	masterVideoControls.setAttribute('data-chips-side', chSide);
    	var chField = document.createElement('div');
	    chField.classList.add('chips-field');
		chField.classList.add('noselect');
		document.querySelector('.chips-field-' + chSide).appendChild(chField);
		chField.appendChild(chip);
		cleanField(chip);
    }
    function addChips(chAtt, chSide) {
    	showControls();
    	if(chAtt && chSide){
    		var chAtt = chAtt;
    		var chSide = chSide;
    	}else{
    		var chAtt = this.getAttribute('data-rewind');
    		var chSide = this.getAttribute('data-chip-side');
    	}
		let chip = createChip(chAtt);
		actionRewindNum(chAtt);
    	if(document.querySelector('.chips-field')){
    		if(chSide !== masterVideoControls.getAttribute('data-chips-side')){
	    		document.querySelector('.chips-field').remove();
				createChipField(chip, chSide);
				animateBgField();
    		}else{
    			document.querySelector('.chips-field').appendChild(chip);
    			animateBgField();
				cleanField(chip);
    		}
    	}else{
			createChipField(chip, chSide);
    		animateBgField();
    	}
    }
	function middleScreen(){
		showControls();
		if (!videoContainer.classList.contains("middle-screen")) {
		    videoContainer.classList.add("middle-screen");
		    video.classList.add("video-middle-screen");
		}else{
		    videoContainer.classList.remove("middle-screen");
		    video.classList.remove("video-middle-screen");
		}
	};
	function fullScreen(){
		showControls();
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
		showControls();
		if(document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if(document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if(document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}
	function escScreenSwitch(){
		videoContainer.classList.add("middle-screen");
		videoContainer.classList.add("fullscreen");
		video.classList.add("video-middle-screen");
		videoContainer.classList.remove("fullscreen");
		videoContainer.classList.remove("middle-screen");
		video.classList.remove("video-middle-screen");
	}
	function activeKeylistener(){
		this.focus();
		videoContainer.onkeydown = keyboardOptions;
	}

	function disabledKeylistener(){
		videoContainer.onkeydown = null;
		this.blur();
	}
	function keyboardOptions(e) {
		showControls();
		if(e.keyCode === 32) switchPlayPause();
		if(e.keyCode === 77) switchVolume();
		if(e.keyCode === 70) fullScreen();
		if(e.keyCode === 68) middleScreen();
		if(e.keyCode === 83) stop();
		if(e.keyCode === 27) escScreenSwitch();
		if(e.keyCode === 67) speedChangeKey(-1);
		if(e.keyCode === 88) speedChangeKey(1);
		if(e.keyCode === 37) addChips("-10", 'left');
		if(e.keyCode === 39) addChips("+10", 'right');
		if(e.keyCode === 38) {changeVolumeKey(10);addVolumeKeySign("value", "icon", 400);}
		if(e.keyCode === 40) {changeVolumeKey(-10);addVolumeKeySign("value", "icon", 400);}
		if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) videoRewindPercent((e.key * 10));
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
})();
