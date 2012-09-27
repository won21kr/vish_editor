VISH.Utils = (function(V,undefined){
	
	  var init = function(){
			//Code here...
		}
	
	  var getOuterHTML = function(tag){
      //In some old browsers (before firefox 11 for example) outerHTML does not work
      //Trick to provide full browser support
      if (typeof($(tag)[0].outerHTML)=='undefined'){
        return $(tag).clone().wrap('<div></div>').parent().html();
      } else {
				return $(tag)[0].outerHTML;
			}
	  }

/**
	* function to dinamically add a css
	*/
	var loadCSS = function(path){
		$("head").append("<link>");
		css = $("head").children(":last");
		css.attr({
			rel:  "stylesheet",
			type: "text/css",
			href: path
		});
	};

    var generateTable = function(author,title,description){
        
	    if(!author){
	     author = "";
	    }
	    if(!title){
	      title = "";
	    }
	    if(!description){
	      description = "";
	    }
    
      return "<table class=\"metadata\">"+
         "<tr class=\"even\">" +
           "<td class=\"title header_left\">" + VISH.Editor.I18n.getTrans("i.Author") + "</td>" + 
           "<td class=\"title header_right\"><div class=\"height_wrapper\">" + author + "</div></td>" + 
         "</tr>" + 
         "<tr class=\"odd\">" + 
           "<td class=\"title\">" + VISH.Editor.I18n.getTrans("i.Title") + "</td>" + 
           "<td class=\"info\"><div class=\"height_wrapper\">" + title + "</div></td>" + 
         "</tr>" + 
         "<tr class=\"even\">" + 
           "<td colspan=\"2\" class=\"title_description\">" + VISH.Editor.I18n.getTrans("i.Description") + "</td>" + 
         "</tr>" + 
         "<tr class=\"odd\">" + 
           "<td colspan=\"2\" class=\"info_description\"><div class=\"height_wrapper_description\">" + description + "</div></td>" + 
         "</tr>" + 
       "</table>";
    }
			
	//Check minium requirements to init vish editor
	var checkMiniumRequirements = function(){
		var browserRequirements = true;
		var device = VISH.Status.getDevice();

		switch(device.browser.name){
			case VISH.Constant.IE:
				if(VISH.Editing){
					if(device.browser.version < 9){
						browserRequirements = false;
					}
				} else {
					if(device.browser.version < 8){
						browserRequirements = false;
					}
				}
				break;
			case VISH.Constant.FIREFOX:
				break;
			case VISH.Constant.CHROME:
				break;
			default:
				//Allow...
			break;
		}
				
		if(!browserRequirements){
			$.fancybox(
				$("#requirements_form_wrapper").html(),
				{
					'autoDimensions'  : false,
					'width'           : 650,
					'height'          : 400,
					'showCloseButton' : false,
					'padding'       : 0,
					'onClosed'      : function(){
						//Do nothing!
					}
				}
			);
			return false;
		}

		return true;
	}
		
    var convertToTagsArray = function(tags){
	    var tagsArray = [];
	    
	    if((!tags)||(tags.length==0)){
	      return tagsArray;
	    }
	    
	    $.each(tags, function(index, tag) {
	      tagsArray.push(tag.value)
	    });
	    
	    return tagsArray;
    }
		
		var getURLParameter = function(name){
			return decodeURIComponent((location.search.match(RegExp("[?|&]"+name+'=(.+?)(&|$)'))||[,null])[1]);
		}
		
		//Help function to autocomplete user inputs.
		//Add HTTP if is not present.
		var autocompleteUrls = function(input){
			var http_urls_pattern=/(^http(s)?:\/\/)/g
			var objectInfo = VISH.Object.getObjectInfo();
			
			if((objectInfo.wrapper==null)&&(input.match(http_urls_pattern)==null)){
        return "http://" + input;
      } else {
				return input;
			}
		}


   var filterFilePath = function(path){
	 	 return path.replace("C:\\fakepath\\","");
	 }

var getZoomInStyle = function(zoom){
    var style = "";
    style = style + "-ms-transform: scale(" + zoom + "); ";
		style = style + "-ms-transform-origin: 0 0; ";
    style = style + "-moz-transform: scale(" + zoom + "); ";
		style = style + "-moz-transform-origin: 0 0; ";
    style = style + "-o-transform: scale(" + zoom + "); ";
		style = style + "-o-transform-origin: 0 0; ";
    style = style + "-webkit-transform: scale(" + zoom + "); ";
		style = style + "-webkit-transform-origin: 0 0; ";
    return style;
   }

var getZoomFromStyle = function(style){
    
		var zoom = 1; //Initial or default zoom
		
		if(!style){
			return zoom;
		}
		
		//Patterns
		var moz_zoom_pattern = /-moz-transform: ?scale\(([0-9]+.[0-9]+)\)/g
		var webkit_zoom_pattern = /-webkit-transform: ?scale\(([0-9]+.[0-9]+)\)/g
		var opera_zoom_pattern = /-o-transform: ?scale\(([0-9]+.[0-9]+)\)/g
		var ie_zoom_pattern = /-ms-transform: ?scale\(([0-9]+.[0-9]+)\)/g

		
    $.each(style.split(";"), function(index, property){
			 
	     if (property.match(moz_zoom_pattern) != null) {
			 	//Mozilla Firefox
		   	var result = moz_zoom_pattern.exec(property);
		   	if (result[1]) {
		   		zoom = parseFloat(result[1]);
		   		return false;
		   	}
		   } else if (property.match(webkit_zoom_pattern)!=null) {
			 	  //Google Chrome
          var result = webkit_zoom_pattern.exec(property);
          if(result[1]){
            zoom = parseFloat(result[1]);
            return false;
          }
	     } else if (property.match(opera_zoom_pattern)!=null) {
			 	  //Opera
          var result = opera_zoom_pattern.exec(property);
          if(result[1]){
            zoom = parseFloat(result[1]);
            return false;
          }
			 } else if (property.match(ie_zoom_pattern)!=null) {
			 	  //Iexplorer
          var result = ie_zoom_pattern.exec(property);
          if(result[1]){
            zoom = parseFloat(result[1]);
            return false;
          }
       }
    });
		
    return zoom;
   }

   return {
			init : init,
	    	getOuterHTML : getOuterHTML,
			generateTable : generateTable,
			loadCSS			: loadCSS,
			checkMiniumRequirements : checkMiniumRequirements,
			convertToTagsArray : convertToTagsArray,
			getURLParameter : getURLParameter,
			getZoomFromStyle : getZoomFromStyle,
			getZoomInStyle    : getZoomInStyle,
			autocompleteUrls : autocompleteUrls,
			filterFilePath : filterFilePath
   };



}) (VISH);