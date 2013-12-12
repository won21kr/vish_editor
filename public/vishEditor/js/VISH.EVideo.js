VISH.EVideo = (function(V,$,undefined){

	var evideos;
	var state_vid;
	var video; 
	var myvideoId;
	var videoDiv;
	var duracion;
	var balls = []; // Ball array time-ordered
	var nextBall; 
	var prevNextBall; 
	var eback = true;
	var RANGE = 0.300; //seconds around the ball where we should stop
	// myEvideo = evideos['evideoId'] has:
	// myEvideo.balls = [ball1,ball2,...,ball3];
	//Each ball has id, time and ?¿... and a associated slide id


	var initialized = false;

	var init = function(presentation){
		if(!initialized){
			initialized = true;
			_loadEvents();
		}

		if(!evideos){
			evideos = new Array();
		}
		// console.log("evideo init");
	};

	var _loadEvents = function(){
		console.log("_loadEvents");
		$(document).on("click", '.play' , _onClickPlayVideo);
		$(document).on("click", '.transportbar', _onClickTransportBar);
		$(document).on("click", '.eback_button', _toggle);

				
		V.EventsNotifier.registerCallback(V.Constant.Event.onFlashcardSlideClosed, function(params){ 
			var subslide_id = params.slideNumber;
			_onCloseSubslide(subslide_id);
			console.log("he cerrado la slide");
		});

	}


	/*  Sync can be true if you want the arrows to be synchronized 
	*   (moving at the same time and at the same position) or false if not
	*/
	var addBall = function(evideoId, ball){
		// if((!poi)||(!poi.x)||(!poi.y)||(poi.x > 100)||(poi.y > 100)){
		// 	//Corrupted poi
		// 	return;
		// }

		// var flashcard_div = $("#"+ fcId);
		// var poiId = V.Utils.getId(fcId + "_poi");
		// var div_to_add = "<div class='fc_poi' id='" + poiId + "' style='position:absolute;left:"+poi.x+"%;top:"+poi.y+"%'></div>";
		// flashcard_div.append(div_to_add);

		// if(typeof flashcards[fcId] === "undefined"){
		// 	flashcards[fcId] = new Object();
		// 	flashcards[fcId].arrows = [];
		// }

		// //Add arrow
		// var arrow = new Object();
		// arrow.id = poiId;
		// if(sync){
		// 	arrow.position = 0;
		// } else {
		// 	var rand_pos = Math.floor(Math.random()*TOTAL_FRAMES+1)*FRAME_WIDTH;  //position in pixels
		// 	arrow.position = rand_pos;
		// }
		// arrow.slide_id = poi.slide_id;
		// arrow.x = poi.x;
		// arrow.y = poi.y;
		
		// flashcards[fcId].arrows.push(arrow);
		// pois[arrow.id] = arrow;

		// //Add event to the arrow
		// $("#" + poiId).click(function(event){
		// 	V.Events.onFlashcardPoiClicked(poiId);
		// });
	};


	var _toggle = function(){
		var currentSlide = $(V.Slides.getCurrentSlide());
		var transcriptBox = $(currentSlide).find(".transcriptBox");
		var navigation =  $(transcriptBox).find(".navigation");
		var hide_button = $(transcriptBox).find(".hide_button");
		var hide_buttonW = $(hide_button).css("width");
		var hide_buttonPR = $(hide_button).css("padding-right");
		var hide_buttonPT = $(hide_button).css("padding-top");
		var videoBox = $(currentSlide).find(".videoBox");
		var timeDiv = $(videoBox).find(".time");

		if(eback == true){
			
			$(currentSlide).find(".segmentDiv").hide();
			$(currentSlide).find(".segments").hide();
			$(timeDiv).hide();


			var animationTime = 1000;			

			$(hide_button).css("width", hide_buttonW);
			$(hide_button).css("padding-right", hide_buttonPR);
			$(hide_button).css("padding-top", hide_buttonPT);
		
			$(navigation).animate({width: "0%"}, 1000, function(){ _checkAnimationFinish(); });
			$(navigation).animate({"padding-right": "0%"},1000, function(){ _checkAnimationFinish(); });
			$(transcriptBox).animate({width: "5%"}, 1000, function(){ _checkAnimationFinish(); });
			$(videoBox).animate({width: "92%", "margin-top": "8%"}, 1000, function(){ _checkAnimationFinish(); });


		}else{
			_show();
			$(navigation).animate({width: "58%"}, 1000, function(){ console.log("me he ejecutado"); });
			
		}

 // Utilizar el contador para hacer el hide cuando hayan acabado todas las animaciones.

		// $( ".navigation" ).animate({
		// width: "0%"
		// }, 1000, function() {
		// 	var transcriptBox = $(V.Slides.getCurrentSlide()).find(".transcriptBox");
		// 	$(transcriptBox).find(".navigation").css("padding-right", "0%");
		// 	$(transcriptBox).find(".hide_button").css("width","100%");
		// 	$(transcriptBox).css("width","5%")
		// 	_hide();
		// });
		// }else{
		// 	_show();
		// }
	}

	var nAnimationsFinished = 0;
	var nAnimations = 4;
	var _checkAnimationFinish = function(){
		console.log("_checkAnimationFinish called");
		nAnimationsFinished = nAnimationsFinished +1;
		if(nAnimationsFinished===nAnimations){
			_onAnimationsFinish();
			nAnimationsFinished = 0;
		}
	}

	var _onAnimationsFinish = function(){
		console.log("I'm here!");
		_hide();
	}

	var loadEVideo = function(evideoId){
		// console.log("Load EVideo");
		// console.log(evideoId);
	}

	var drawEVideo = function(evideoJSON){ // here we have to add the html parsed in Javascript
		// console.log("draw EVideo");
		// console.log(evideoJSON);

		var evideoDOM = $("#"+evideoJSON.id);

		var videoBox =  $("<div class='videoBox'></div>");
		$(evideoDOM).append(videoBox);


		videoDiv =  $("<div class = 'videoDiv'></div>");
		$(videoBox).append("<div class='time'><span class='curTime'>00:00</span>/<span class='duration'>00:00</span></div>");
		$(videoBox).append(videoDiv);
		_renderVideo();

		var controls = $("<div class='controls'>");
		$(videoBox).append(controls);

		$(controls).append("<div class='e_button'><img class='play' src='images/evideo/play.png'></img></div>");

		var positionview = $("<div class='positionview'></div>");
		$(controls).append(positionview);


		var pViewContent = $("<div class='transportbar'><div class='position'></div><div class= 'segmentDiv'></div></div><ul class='segments' title='chapter navigation' aria-describedby='keys'></ul></div>");
		//$(controls).append("<div class='time'><span class='curTime'>00:00</span>/<span class='duration'>00:00</span></div>");
		$(positionview).append(pViewContent);
		$(videoBox).append("<div style='display: block; clear: both;'></div>");

		var transcriptBox = $("<div class='transcriptBox'></div>");
		$(evideoDOM).append(transcriptBox);
		$(transcriptBox).append("<div class='hide_button'><div class= 'i_letter'>I\n</div><div class='inside_hide'>N\nD\nE\nX</div><div class='eback_button'><div><</div></div></div></div><div class='navigation'><ul class='chapters'></ul>")
	
		video = $('#' + myvideoId)[0];
		// console.log("video");
		// console.log(video);



		//Vars

		// console.log("duracion");
		// console.log(duracion);


		$(video).on("loadeddata", function(){
			if(video.readyState == 4){
				_init(video,evideoJSON);
				var t = _secondsTimeSpanToHMS(video.duration.toFixed(0));
				//console.log("variable t: ");
				//console.log(t);
				$(V.Slides.getCurrentSlide()).find(".duration").html(t);
			duracion = video.duration.toFixed(2);
			} else {
				console.log("Video not loaded appropriately");
			}
		});



var _init = function(video,evideoJSON){
	$(video).on("timeupdate", function(){
		_curTimeUpdate();
		var time = video.currentTime;

		if(typeof nextBall == "object"){
			if(Math.abs(time - nextBall.time) < RANGE){
				if(nextBall.showed == false){
					_popUp(_onCloseSubslide,nextBall);
				}
			}
		}
	});
   	_getBalls(evideoJSON);
   	_getNextBall(0);
	_paintBalls();
	_paintIndex();



}
		//console.log(evideoDOM);

}

var _renderVideo = function(){
	if (true){
		_renderHTML5Video();
	}else{
		//Aquí se renderizarán los vídeos de Youtube
	}

}


var _renderHTML5Video = function(){
	myvideoId = V.Utils.getId();	
	var videoPlayer = $("<video id= '" + myvideoId + "' poster='images/videos/webvtt_talk.png' style='width:100%; 	height: 100% !important;'  preload='metadata'></video>")
	$(videoDiv).append(videoPlayer);
	$(videoPlayer).append("<source src='https://dl.dropboxusercontent.com/u/16070658/html5_video_index/videos/webvtt_talk.webm'></source><source src='images/videos/webvtt_talk.mp4'></source><track class='nav' src='images/videos/webvtt_talk_navigation.vtt' kind='chapters' srclang='en'></track><track class='cc' src='images/videos/webvtt_talk_captions.vtt' kind='captions' label='captions' srclang='en' default></track>");
}


	var _onClickPlayVideo = function(evt){
		console.log("se ejecuta _onClickPlayVideo");
		video= _getCurrentEVideo();
		_togglePlay(video);
	}

	var _togglePlay = function(video){
		console.log("entro en _togglePlay");
		video = _getCurrentEVideo();
		if (video.paused == false) {
			video.pause();
			$(V.Slides.getCurrentSlide()).find(".play").attr("src","images/evideo/play.png");
		} else {
			video.play();
			$(V.Slides.getCurrentSlide()).find(".play").attr("src","images/evideo/pause.png");
		}
}




	var _onClickTransportBar = function(evt){

		var video = _getCurrentEVideo();
		console.log("SEEK");
		console.log(video);

		//this ahora es evt.target

		var bar_width = $('.positionview').outerWidth();
		//var bar_width = document.getElementById('positionview').offsetWidth; // "!it calculates the size of bar_width dinamically, even when you resize the navigation window.
		// console.log("bar_width: ");
		// console.log(videon);
		var offset = $(evt.target).offset();
		var distanceDifference = evt.pageX - offset.left; //eliminar número mágico
		var percentWidth = ((distanceDifference*100) / bar_width)*0.99;
		video.currentTime = (percentWidth * video.duration) / 100;

		nextBall = null;
		_getNextBall(video.currentTime);
		_resetShowParams();
	}



	var _getNextBall = function(time){
			if(typeof time != "number"){
				return null;
			}

			var myNextball;
			var pTime = video.duration;
			for (i = 0; i < balls.length; i++) {
				var ball = balls[i];
				var ballTime = parseFloat(ball.time);
				if((ballTime < pTime)&&(ballTime > 0)&&(ballTime > time)){
					if(ball != nextBall){
						myNextball = ball;
						break;
					}
				}
			}
			if(myNextball){
				nextBall = myNextball;
			} else {
				nextBall = undefined;
			}
			return nextBall;
	}



	var _resetShowParams = function(){
		$(balls).each(function(index,ball){
			ball.showed = false;
		});	
	}

	var _popUp = function(callback, ball){
		var video = _getCurrentEVideo();
		if (video.paused == false) {
			state_vid = true;
		}else{
			state_vid = false;
		}
		video.pause();
		var slide_id = ball.slide_id;
		ball.showed = true;


		V.Slides.openSubslide(slide_id,true);
	}

	var _onCloseSubslide = function(subslide_id){
		var video = $('#' + myvideoId)[0];
		var prevNextBall = nextBall;
		_getNextBall(video.currentTime);
		if(nextBall-prevNextBall < RANGE){
			_popUp(_onCloseSubslide,nextBall);		
		} else {
			if(state_vid == true){
			console.log("state_vid == true");
			video.play(); // we have to know the previous state of the video
			$(V.Slides.getCurrentSlide()).find(".play").attr("src","images/evideo/pause.png");
		}else{
			console.log("state_vid == false");
			video.pause();
		}
	}
	}

var _getBalls = function(evideoJSON){
	for (i = 0; i < evideoJSON.pois.length; i++) {
		var ball = {};
		ball.id = evideoJSON.pois[i].id;
		ball.time = parseFloat(evideoJSON.pois[i].time);
		ball.slide_id = evideoJSON.pois[i].slide_id;
		ball.showed = false;
		ball.minTime = ball.time - RANGE;
		ball.maxTime = ball.time + RANGE;
		balls.push(ball);
	}

	balls.sort(function(A,B){
    	return A.time>B.time;
	});
}


var _paintIndex = function(){
	var video = _getCurrentEVideo();
	for (i = 0; i < balls.length; i++) {
		var item = document.createElement('li');
		item.id = balls[i].id;
		var link = document.createElement('a');
		link.setAttribute('ident', i);
		link.setAttribute('time', balls[i].time);
		link.innerHTML = (i+1) + '.'+ '    ' + balls[i].slide_id;
		$(item).append(link);
		$(V.Slides.getCurrentSlide()).find(".chapters").append(item);
	}

		$(V.Slides.getCurrentSlide()).find(".chapters li a").on("click", function(event){
		video.currentTime = $(event.target).attr("time");
		$(V.Slides.getCurrentSlide()).find(".play").attr("src","images/evideo/play.png");
	    _popUp(_onCloseSubslide,balls[parseInt($(event.target).attr("ident"))]); //migrated to JQuery working
	});
}
var _videoPlayPause = function(evt) {
	var video = _getCurrentEVideo();
	if (evt.keyCode == "32") { // space bar
		_togglePlay(video);
	}
	if (evt.keyCode == "13") { // enter key
		seekChapter(this.getAttribute('data-chapter'));
		// stop event from bubbling
		evt = evt||event; /* get IE event ( not passed ) */
		evt.stopPropagation? evt.stopPropagation() : evt.cancelBubble = true;
	}
}


var _paintBalls = function(){
	for (i = 0; i < balls.length; i++) {
		_paintBall(balls[i]);
	}
}

var _paintBall = function(ballJSON){
	var video = _getCurrentEVideo();
	var segmentDiv = $(V.Slides.getCurrentSlide()).find(".segmentDiv");
	var ball = document.createElement('li');
	var marker = document.createElement('div');
	var segments = 	$(V.Slides.getCurrentSlide()).find(".segments");
	var position = $(V.Slides.getCurrentSlide()).find(".transportbar");
	$(segmentDiv).append(marker);
	$(segments).append(ball);
	marker.className = 'marker';
	ball.className = 'ball';
	var time = parseFloat(ballJSON.time);
   	var duration = parseFloat(video.duration);
   	var bar_width = $(V.Slides.getCurrentSlide()).find(".positionview").width();

   	var perc = bar_width / duration;
   	ball.style.left = ((Math.round((bar_width*time/video.duration) - 10 ) * 100)/($(segments).width()))  + 0.42 + "%"; //we add 8 to adjust the ball
   	marker.style.left =((Math.round((bar_width*time/video.duration)) * 100)/($(position).width())) + 0.2 + "%";
   	ball.onclick = function () {
		video.currentTime = time;
		_popUp(_onCloseSubslide,ballJSON);
	}
}

var _eraseBalls = function(){
	$(V.Slides.getCurrentSlide()).find(".segmentDiv").html('');
	$(V.Slides.getCurrentSlide()).find(".segments").html('');
}

var _curTimeUpdate = function(evt) {
	var video = _getCurrentEVideo();
	var bar_width = $(V.Slides.getCurrentSlide()).find(".positionview").outerWidth();;
	var tiemp = video.currentTime.toFixed(0);
	var tiemph= _secondsTimeSpanToHMS(tiemp);
	$(V.Slides.getCurrentSlide()).find(".curTime").html(tiemph);
	
	var percentWidth = (100*video.currentTime)/video.duration;
	// var wid = (Math.round(bar_width*video.currentTime/video.duration) * 100)/($('.transportbar').width()) + "%";
	//console.log("percentWidth");
	//console.log(percentWidth);
	$(V.Slides.getCurrentSlide()).find(".position").css("width", percentWidth + "%"); //for the html to draw
}

var _hide = function() {
	currentSlide = $(V.Slides.getCurrentSlide());
	/*$(V.Slides.getCurrentSlide()).find(".videoBox").css("width", '92%');
	$(V.Slides.getCurrentSlide()).find(".videoBox").css("margin-top", '8%');
	$(V.Slides.getCurrentSlide()).find(".videoDiv").css("width", '92%');
	$(V.Slides.getCurrentSlide()).find(".videoDiv").css("height", 'auto');
	$(V.Slides.getCurrentSlide()).find(".controls").css("width", '92%');
	$(V.Slides.getCurrentSlide()).find(".time").css("font-size", '1.6rem');
	$(V.Slides.getCurrentSlide()).find(".time").css("margin-bottom", '1%');
	$(V.Slides.getCurrentSlide()).find(".time").css("margin-right", '8%');*/
	$(currentSlide).find(".time").show();
	$(currentSlide).find(".time").css("font-size", '1.6rem');
	$(currentSlide).find(".segmentDiv").show();
	$(currentSlide).find(".segments").show();
	_eraseBalls();
	_paintBalls();
	$(V.Slides.getCurrentSlide()).find(".ball").css("margin-top", '4%');
	eback = false;
}

/*
 * shows the transcriptBox in which the ball index is defined
 *
*/

var _show = function(){
	$(V.Slides.getCurrentSlide()).find(".videoBox").css("width", '55%');
	_eraseBalls();
	_paintBalls();
	$(V.Slides.getCurrentSlide()).find(".navigation").show();
	$(V.Slides.getCurrentSlide()).find(".ball").css("margin-top", '5%');
	$(V.Slides.getCurrentSlide()).find(".hide_button").css("margin-left", "-4%");
	$(V.Slides.getCurrentSlide()).find(".transcriptBox").css("width", "36%");
	$(V.Slides.getCurrentSlide()).find(".videoBox").css("margin-top", '18%');
	$(V.Slides.getCurrentSlide()).find(".time").css("font-size", '1rem');
	$(V.Slides.getCurrentSlide()).find(".time").css("margin-bottom", 'auto');
	$(V.Slides.getCurrentSlide()).find(".transcriptBox").show();
	eback = true;
}

var _secondsTimeSpanToHMS = function(s) {
	var display;
    var h = Math.floor(s/3600); //Get whole hours
   
    s -= h*3600;
    var m = Math.floor(s/60); //Get remaining minutes
    s -= m*60;

     if(h <1){ // if h'd be > 1, we have space to that.
     	display = (m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds

     }else{
     	display =  h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
     }
    return display;
}


// Helpers

var _getCurrentEVideo = function(){
	return $(V.Slides.getCurrentSlide()).find("video")[0];
}



	return {
		init			: init,
		addBall 		: addBall,
		drawEVideo		: drawEVideo,
		loadEVideo		: loadEVideo
	};

}) (VISH, jQuery);