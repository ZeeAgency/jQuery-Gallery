/**
 * zeeGallery
 * Copyright 2011, Zee Agency
 * Licensed under the CeCILL-C license
 * 
 * http://www.cecill.info/licences/Licence_CeCILL-C_V1-en.html
 * http://www.cecill.info/licences/Licence_CeCILL-C_V1-fr.html
 *
 * @author Julien Cabanès
 */

(function($) {
	$.fn.gallery = function(params) {
		
		// Configuration
		params = $.extend({
			nextClass: 			'next',
			prevClass: 			'prev',
			
			thumbsContainer: 		'.thumbnails',
			thumbsListSelector: 	'.thumbnails > ol',
			thumbsSelector: 		'.thumbnails > ol > li',
			controlsSelector: 		'.controls > a',
			slideshowSelector: 		'.slideshow',
			thumbClickEvent: 		'thumb-click',
			slideEventName:			'slide-select',
			
			duration: 500,
			
			checkArrows: function($controls, step, limit) {
				$controls.filter('.prev')[step <= 1 ? 'disable' : 'enable']();
				$controls.filter('.next')[step >= limit ? 'disable' : 'enable']();
			},
			
			animCSS3: Modernizr.csstransitions && $.fn.css3,
			
			slideMethod: false
			
		}, params);
		
		// Best Animation Method Available
		if(!params.slideMethod) {
			
			// CSS3 Animation
			if(params.animCSS3) {
				
				// translate3d
				if(Modernizr.csstransforms3d) {
					params.slideMethod = function(value, isVertical) {
						return this.css3({transform: 'translate3d('+(isVertical ? '0, '+value+', 0' : value+', 0, 0' )+')'});
					};
				
				// translate2d
				} else if(Modernizr.csstransforms) {
					params.slideMethod = function(value, isVertical) {
						return this.css3({transform: 'translate'+(isVertical ? 'Y' : 'X')+'('+value+')'});
					};
				
				// 
				} else {
					params.slideMethod = function(value, isVertical) {
						var move = {},
							prop = 'margin-'+(isVertical ? 'top' : 'left');
						
						move[prop] = value;
					
						return this.css(move);
					};
				}
			
			// JS Animations
			} else {
				params.slideMethod = function(value, isVertical) {
					var move = {},
						prop = 'margin-'+(isVertical ? 'top' : 'left');
	
					move[prop] = value;
					
					return this.stop(true, false).animate(move, params.duration);
				};
			}
		}
		
		
		return this.each(function() {
		
			// Caching
			var $gallery = $(this),		
				$thumbsContainer = $gallery.find(params.thumbsContainer),		
				$thumbsList = $gallery.find(params.thumbsListSelector),
				$thumbs = $gallery.find(params.thumbsSelector),
				$controls = $gallery.find(params.controlsSelector),
				isVertical = $gallery.hasClass('vertical'),
				
				thumbSize = $thumbs.filter(':first-child')[isVertical ? 'outerHeight' : 'outerWidth'](true),
				stepLength = Math.ceil($thumbsContainer[isVertical ? 'height' : 'width']() / thumbSize),
				
				slide = function(slideId) {
					params.slideMethod.call($thumbsList, (-1*(slideId-1)*$gallery.data('thumbSize'))+'px', $gallery.data('isVertical'));
				};
			
			// Public
			$gallery.data('currentStep', 1)
					.data('thumbSize', thumbSize)
					.data('stepLength', stepLength)
					.data('isVertical', isVertical);
			
			
			// Controls
			$controls.click(function(e) {
				e.preventDefault();
				
				var $a = $(this),
					direction = $a.hasClass(params.nextClass) ? 'next' : 'prev',
					limit = $thumbs.length-$gallery.data('stepLength')+1,
					step = $gallery.data('currentStep') + 
								((direction === 'next' ? 1 : -1) * $gallery.data('stepLength'));
				
				// Limit
				step = step > limit ? limit : step < 1 ? 1 : step;
				
				
				$gallery.data('currentStep', step);
				slide(step);
				
				params.checkArrows($controls, step, limit);
			
			});
			
			// Thumbs click
			$thumbs.find('a').click(function(e) {
				e.preventDefault();
				
				var $thumb = $(this).parent().activate(),
					thumbId = $thumb.prevAll().length+1;
				
				// Slideshow Exchange
				$gallery.find(params.slideshowSelector)
						.trigger(params.slideEventName, thumbId);
				
				$gallery.trigger(params.thumbClickEvent, thumbId);
				
			});
		});
	};
})(jQuery);