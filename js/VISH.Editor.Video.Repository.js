VISH.Editor.Video.Repository = (function(V, $, undefined) {
	
	var containerDivId = "tab_video_repo_content";
	var carrouselDivId = "tab_video_repo_content_carrousel";
	var previewDivId = "tab_video_repo_content_preview";
	var myInput;
	var timestampLastSearch;

	//Store video metadata
	var currentVideos = new Array();
	var selectedVideo = null;
	

	var init = function(){
		myInput = $("#tab_video_repo_content").find("input[type='search']");
		$(myInput).vewatermark(V.I18n.getTrans("i.SearchContent"));
		$(myInput).keydown(function(event){
			if(event.keyCode == 13) {
				_requestData($(myInput).val());
				$(myInput).blur();
			}
		});
	};
	
	var beforeLoadTab = function(){
		_cleanSearch();
	};
	
	var onLoadTab = function(){
		
	};
	
	var _requestData = function(text){
		_prepareRequest();
		V.Editor.API.requestVideos(text, _onDataReceived, _onAPIError);
	};

	var _prepareRequest = function(){
		_cleanCarrousel();
		_cleanVideoPreview();
		V.Utils.Loader.startLoadingInContainer($("#"+carrouselDivId));
		$(myInput).attr("disabled","true");
		timestampLastSearch = Date.now();
	};

	var _cleanSearch = function(){
		timestampLastSearch = undefined;
		$(myInput).val("");
		$(myInput).removeAttr("disabled");
		_cleanVideoPreview();
		_cleanCarrousel();
	};

	var _cleanCarrousel = function(){
		$("#" + carrouselDivId).hide();
		V.Editor.Carrousel.cleanCarrousel(carrouselDivId);
	};

	var _onDataReceived = function(data){
		if(!_isValidResult()){
			return;
		}

		//The received data is an array of videos
		if((!data)||(data.length==0)){
			_onSearchFinished();
			_drawData(true);
			return;
		}

		var carrouselImages = [];
		currentVideos = new Array();
		$.each(data, function(index,video){
			if(video){
				var videoPoster = (typeof video.avatar_url == "string") ? video.avatar_url : (V.ImagesPath + "icons/example_poster_image.jpg");
				var videoId = "videoCarrousel_" + index;
				var myImg = $("<img src='" + videoPoster + "' videoId='" + videoId + "' title='"+ video.title +"'/>")
				carrouselImages.push(myImg);
				currentVideos[videoId] = video;
			}
		});

		var options = {};
		options.callback = _onImagesLoaded;
		V.Utils.Loader.loadImagesOnContainer(carrouselImages,carrouselDivId,options);
	};
	
	var _onImagesLoaded = function(){
		_onSearchFinished();
		_drawData();
	};
	
	var _onSearchFinished = function(){
		V.Utils.Loader.stopLoadingInContainer($("#"+carrouselDivId));
		$(myInput).removeAttr("disabled");
	};

	var _drawData = function(noResults){
		$("#" + carrouselDivId).show();

		if(!_isValidResult()){
			//We need to clean because data has been loaded by V.Utils.Loader
			_cleanCarrousel();
			return;
		}

		V.Utils.addTempShown([$("#" + containerDivId),$("#" + carrouselDivId)]);

		if(noResults===true){
			$("#" + carrouselDivId).html("<p class='carrouselNoResults'>" + V.I18n.getTrans("i.Noresultsfound") + "</p>");
			V.Utils.removeTempShown([$("#" + containerDivId),$("#" + carrouselDivId)]);
		} else if(noResults===false){
			$("#" + carrouselDivId).html("<p class='carrouselNoResults'>" + V.I18n.getTrans("i.errorViSHConnection") + "</p>");
			V.Utils.removeTempShown([$("#" + containerDivId),$("#" + carrouselDivId)]);
		} else {
			var options = new Array();
			options.callback = _onClickCarrouselElement;
			options.rowItems = 5;
			options.scrollItems = 5;		
			options.afterCreateCarruselFunction = function(){
				//We need to wait even a little more that afterCreate callback
				setTimeout(function(){
					V.Utils.removeTempShown([$("#" + containerDivId),$("#" + carrouselDivId)]);
				},100);
			}
			V.Editor.Carrousel.createCarrousel(carrouselDivId, options);
		}
	};
	
	var _onAPIError = function(){
		if(_isValidResult()){
			_onSearchFinished();
			_drawData(false);
		}
	};
	
	var _onClickCarrouselElement = function(event) {
		var videoId = $(event.target).attr("videoId");
		var renderedVideo = "<div>" + V.Video.HTML5.renderVideoFromJSON(currentVideos[videoId],{loadSources: false, extraClasses: ["preview_video"]}) + "</div>";
		_renderVideoPreview(renderedVideo, currentVideos[videoId]);
		selectedVideo = currentVideos[videoId];
	};

	var _isValidResult = function(){
		if(typeof timestampLastSearch == "undefined"){
			//Old search (not valid).
			return false;
		}

		var isVisible = $("#" + carrouselDivId).is(":visible");
		if(!isVisible){
			return false;
		}

		return true;
	};


	/* Preview */
	
	var _renderVideoPreview = function(renderedVideo,video){
		var videoArea = $("#" + previewDivId).find("#tab_video_repo_content_preview_video");
		var metadataArea = $("#" + previewDivId).find("#tab_video_repo_content_preview_metadata");
		var button = $("#" + previewDivId).find(".okButton");
		$(videoArea).html("");
		$(metadataArea).html("");
		if((renderedVideo)&&(video)){
			renderedVideo = $(renderedVideo);
			$(videoArea).append(renderedVideo);
			var sources = V.Video.HTML5.getSourcesFromJSON(video);
			var videoDOM = $(renderedVideo).find("video");
			V.Video.HTML5.addSourcesToVideoTag(sources,videoDOM,{timestamp:true});

			var table = V.Editor.Utils.generateTable({title:video.title, author:video.author, description:video.description});
			$(metadataArea).html(table);
			$(button).show();
		}
	};
	
	var _cleanVideoPreview = function(){
		var videoArea = $("#" + previewDivId).find("#tab_video_repo_content_preview_video");
		var metadataArea = $("#" + previewDivId).find("#tab_video_repo_content_preview_metadata");
		var button = $("#" + previewDivId).find(".okButton");
		$(videoArea).html("");
		$(metadataArea).html("");
		$(button).hide();
	};
	
	var addSelectedVideo = function(){
		if(selectedVideo != null){
			var options = {};
			if(selectedVideo.poster){
				options['poster'] = selectedVideo.poster;
			} else {
				options['poster'] = V.Editor.Video.HTML5.getDefaultPoster();
			}
			V.Editor.Video.addContent(V.Video.HTML5.renderVideoFromSources(V.Video.HTML5.getSourcesFromJSON(selectedVideo),options));
		}
	};
	
	return {
		init 				: init,
		beforeLoadTab 		: beforeLoadTab,
		onLoadTab 			: onLoadTab,
		addSelectedVideo 	: addSelectedVideo
	};

})(VISH, jQuery);
