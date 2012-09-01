VISH.Editor.Flashcard = (function(V,$,undefined){

	var init = function(){
		$(document).on("click", "#flashcard_button", _onFlashcardButtonClicked );
	};


	var _onFlashcardButtonClicked = function(){
		//first action, set excursion type to "flashcard"
		V.Editor.setExcursionType("flashcard");
		
		//hide slides
		V.Editor.Utils.hideSlides();

		//change thumbnail onclick event (preview slide instead of go to edit it)
		//it will change itself depending on excursionType
		V.Editor.Thumbnails.redrawThumbnails();

		//show flashcard background, should be an image with help
		$("#flashcard-background").show();

		//show change background button

		//show draggable items to create the flashcard


		
		$("#flashcard_button").fancybox({
			'autoDimensions' : false,
			'width': 800,
			'scrolling': 'no',
			'height': 600,
			'padding' : 0,
			"onStart"  : function(data) {
				V.Editor.Utils.loadTab('tab_pic_from_url');
			}
		});
	};

	return {
		init 				: init
	};

}) (VISH, jQuery);