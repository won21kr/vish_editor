VISH.Editor.Slides = (function(V,$,undefined){

	var showSlides = function(){
		$(".slides > article").removeClass("temp_hidden");
	};

	var hideSlides = function(){
		$(".slides > article").addClass("temp_hidden");
	};

	/**
	 * function to know if the slides have the focus or not
	 * Use to disable actions (like keyboard shortcuts) when the slide is not focused 
	 * @return false if other element has the focus
	 */
	var isSlideFocused = function() {
		//Wysiwyg is focused.
		if($(".wysiwygInstance").is(":focus")){
			return false;
		}
		
		//Fancybox is showing
		if($("#fancybox-content").is(":visible")){
			return false;
		}

		//Generic input is focused
		if($("input").is(":focus")){
			return false;
		}

		//An area is focused
		if(V.Editor && V.Editor.getCurrentArea()!==null){
			return false;
		}

		return true;
	};


	/*
	 *	Move slide_to_move after or before reference_slide.
	 *  Movement param posible values: "after", "before"
	 */
	var moveSlideTo = function(orgPosition, destPosition){
		var slide_to_move = V.Slides.getSlideWithNumber(orgPosition);
		var reference_slide = V.Slides.getSlideWithNumber(destPosition);

		if((typeof slide_to_move === "undefined")||(typeof reference_slide === "undefined")){
			return;
		}

		if(typeof slide_to_move.length !== undefined){
			slide_to_move = $(slide_to_move)[0];
			if(typeof slide_to_move === "undefined"){
				return;
			}
		}

		if(typeof reference_slide.length !== undefined){
			reference_slide = $(reference_slide)[0];
			if(typeof reference_slide === "undefined"){
				return;
			}
		}

		if((slide_to_move.tagName!="ARTICLE")||(reference_slide.tagName!="ARTICLE")||(slide_to_move==reference_slide)){
			return;
		}

		//We must move slide orgPosition after or before destPosition
		var movement = null;
		if(destPosition > orgPosition){
			movement = "after";
		} else if(destPosition < orgPosition){
			movement = "before";
		} else {
			return;
		}

		var article_to_move = slide_to_move;
		var article_reference = reference_slide;

		var moving_current_slide = false;
		var currentSlide = V.Slides.getCurrentSlide();
		var oldCurrentSlideNumber = parseInt($(currentSlide).attr("slidenumber"));
		if(currentSlide === article_to_move){
			moving_current_slide = true;
		}

		var textAreas = copyTextAreasOfSlide(article_to_move);
		$(article_to_move).remove();
		if(movement=="after"){
			$(article_reference).after(article_to_move);
		} else if(movement=="before") {
			$(article_reference).before(article_to_move);
		} else {
			V.Debugging.log("V.Slides: Error. Movement not defined... !");
			return;
		}

		$(article_to_move).addClass("temp_shown");

		//Refresh Draggable Objects
		V.Editor.Utils.refreshDraggables(article_to_move);

		//Reload text areas
		_cleanTextAreas(article_to_move);
		_loadTextAreasOfSlide(article_to_move,textAreas);

		$(article_to_move).removeClass("temp_shown");

		//Update slideEls
		V.Slides.setSlides(document.querySelectorAll('section.slides > article'));

		//Update scrollbar params and counters
		$("#slides_list").find("div.wrapper_barbutton:has(img[slidenumber])").each(function(index,div){
			var slideNumber = index+1;
			var p = $(div).find("p.ptext_barbutton");
			$(p).html(slideNumber);
			var img = $(div).find("img.image_barbutton");
			$(img).attr("slidenumber",slideNumber);
		});

		//Update current slide number
		var newCurrentSlideNumber;

		if(moving_current_slide){
			newCurrentSlideNumber = destPosition;
		} else {
			if((orgPosition > oldCurrentSlideNumber)&&(destPosition <= oldCurrentSlideNumber)){
				newCurrentSlideNumber = (oldCurrentSlideNumber+1);
			} else if((orgPosition < oldCurrentSlideNumber)&&(destPosition >= oldCurrentSlideNumber)){
				newCurrentSlideNumber = (oldCurrentSlideNumber-1);
			}
		}

		if(typeof newCurrentSlideNumber == "number"){
			V.Slides.setCurrentSlideNumber(newCurrentSlideNumber);
		}
		
		//Update slides classes next and past.
		//Current slide needs to be stablished before this call.
		V.Slides.updateSlides();
	}

	var copySlideWithNumber = function(slideNumber,options){
		var slide = V.Slides.getSlideWithNumber(slideNumber);
		if(slide===null){
			return;
		}
		var newSlide = $(slide).clone();
		copySlide(newSlide,options);
	}

	var copySlide = function(slideToCopy,options){
		slideToCopy = _cleanTextAreas(slideToCopy);
		slideToCopy = V.Editor.Utils.replaceIdsForSlide(slideToCopy);
		var newId = $(slideToCopy).attr("id");

		if(typeof slideToCopy == "undefined"){
			return;
		}

		var slideToCopyType = V.Slides.getSlideType(slideToCopy);

		/////////////////
		//Pre-copy actions
		/////////////////

		/////////////////
		//Copy actions
		/////////////////

		var currentSlide = V.Slides.getCurrentSlide();
		if(currentSlide){
			$(currentSlide).after(slideToCopy);
		} else {
			$("section#slides_panel").append(slideToCopy);
		}
		
		/////////////////
		//Post-copy actions
		/////////////////
		var slideCopied = $("#"+newId);

		//Restore draggables
		V.Editor.Utils.refreshDraggables(slideCopied);

		//Restore text areas
		if(slideToCopyType === V.Constant.STANDARD){
			if(options.textAreas){
				_loadTextAreasOfSlide(slideCopied,options.textAreas);
			}
		}
		
		//Update slideEls and refresh classes
		V.Slides.updateSlides();

		//Redraw thumbnails
		V.Editor.Thumbnails.redrawThumbnails(function(){
			if(currentSlide){
				V.Slides.goToSlide(V.Slides.getCurrentSlideNumber()+1);
				V.Editor.Thumbnails.moveThumbnailsToSlide(V.Slides.getCurrentSlideNumber());
			} else {
				V.Slides.goToSlide(1);
				V.Editor.Thumbnails.moveThumbnailsToSlide(1);
			}
		});
	}

	var _cleanTextAreas = function(slide){
		$(slide).find("div[type='text'],div.wysiwygTextArea").each(function(index,textArea){
			$(textArea).html("");
		});
		return slide;
	}

	var copyTextAreasOfSlide = function(slide){
		var textAreas = {};

		//Copy text areas
		$(slide).find("div[type='text']").each(function(index,textArea){
			var areaId = $(textArea).attr("areaid");
			var ckEditor = V.Editor.Text.getCKEditorFromZone(textArea);
			if((areaId)&&(ckEditor!==null)){
				textAreas[areaId] = ckEditor.getData();
			}
		});

		//Copy quiz areas
		$(slide).find("div[type='quiz']").each(function(index,quizArea){
			var areaId = $(quizArea).attr("areaid");
			textAreas[areaId] = [];
			$(quizArea).find("div.wysiwygTextArea").each(function(index,textArea){
				var ckEditor = V.Editor.Text.getCKEditorFromTextArea(textArea);
				if((areaId)&&(ckEditor!==null)){
					textAreas[areaId].push(ckEditor.getData());
				}
			});
		});

		return textAreas;
	}

	var _loadTextAreasOfSlide = function(slide,textAreas){
		$(slide).find("div[type='text']").each(function(index,textArea){
			var areaId = $(textArea).attr("areaid");
			if((areaId)&&(textAreas[areaId])){
				var data = textAreas[areaId];
				V.Editor.Text.launchTextEditor({}, $(textArea), data);
			}
		});

		$(slide).find("div[type='quiz']").each(function(index,quizArea){
			var areaId = $(quizArea).attr("areaid");
			if((areaId)&&(textAreas[areaId])){
				var data = textAreas[areaId];
				$(quizArea).find("div.wysiwygTextArea").each(function(index,textArea){
					var parent = $(textArea).parent();
					$(parent).html("");
					V.Editor.Text.launchTextEditor({}, $(parent), data[index], {autogrow: true});
				});
			}
		});
	}

	var addSlide = function(slide){
		appendSlide(slide);

		var oldCurrentSlideNumber = V.Slides.getCurrentSlideNumber();
		//currentSlide number is next slide
		V.Slides.setCurrentSlideNumber(oldCurrentSlideNumber+1);

		if($(slide).attr("type")===V.Constant.STANDARD){
			V.Editor.Tools.addTooltipsToSlide(slide);
		}

		V.Slides.updateSlides();
		V.Editor.Thumbnails.redrawThumbnails(function(){
			V.Slides.triggerLeaveEvent(oldCurrentSlideNumber);
			V.Slides.lastSlide();
			V.Editor.Thumbnails.selectThumbnail(V.Slides.getCurrentSlideNumber());
			V.Slides.triggerEnterEvent(V.Slides.getCurrentSlideNumber());
		});
	};

	var appendSlide = function(slide){
		$('.slides').append(slide);
	}

	var removeSlide = function(slideNumber){
		var slide = V.Slides.getSlideWithNumber(slideNumber);
		if(slide===null){
			return;
		}

		if(V.Editor.Slideset.isSlideset(slide)){
			V.Editor.Slideset.onLeaveSlideset(slide);
		}

		var removing_current_slide = false;
		if(V.Slides.getCurrentSlide() === slide){
			removing_current_slide = true;
		}

		$(slide).remove();
		if(removing_current_slide){
			if((V.Slides.getCurrentSlideNumber()===1)&&(V.Slides.getSlidesQuantity()>1)){
				V.Slides.setCurrentSlideNumber(1);
			} else {
				V.Slides.setCurrentSlideNumber(V.Slides.getCurrentSlideNumber()-1);
			}
		}
		V.Slides.updateSlides();				
		V.Editor.Thumbnails.redrawThumbnails();
	};

	//////////////
	// Subslides
	//////////////

	var isSubslide = function(slide){
		var parent = $(slide).parent()[0];
		if(parent){
			return (parent.tagName==="ARTICLE");
		} else {
			return false;
		}
	};

	var addSubslide = function(slideset,subslide){ 
		var subslide = $(subslide).css("display","none");
		$(slideset).append(subslide);
		V.Editor.Tools.addTooltipsToSlide(subslide);

		V.Editor.Thumbnails.drawSlidesetThumbnails($(slideset).find("article"),function(){
			//Subslides Thumbnails drawed succesfully
			V.Editor.Slideset.openSubslide(subslide);
			V.Editor.Thumbnails.selectSubslideThumbnail($(subslide).attr("slidenumber"));
		});
	};

	var removeSubslide = function(subslide){
		if(typeof subslide !== "object"){
			return;
		}

		var slideset = $(subslide).parent();
		V.Editor.Slideset.closeSubslide(subslide);
		$(subslide).remove();

		V.Editor.Thumbnails.drawSlidesetThumbnails($(slideset).find("article"),function(){
			//Subslides Thumbnails drawed succesfully
		});
	};

	return {
		showSlides				: showSlides,
		hideSlides				: hideSlides,
		isSlideFocused			: isSlideFocused,
		moveSlideTo				: moveSlideTo,
		copySlide				: copySlide,
		copySlideWithNumber		: copySlideWithNumber,
		appendSlide				: appendSlide,
		addSlide 				: addSlide,
		removeSlide				: removeSlide,
		addSubslide				: addSubslide,
		removeSubslide			: removeSubslide,
		isSubslide				: isSubslide,
		copyTextAreasOfSlide	: copyTextAreasOfSlide
	};

}) (VISH, jQuery);