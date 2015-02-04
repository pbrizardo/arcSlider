/*
* arcSlider.js
* By Paul Rizardo
*
* Builds a circular arched slider. Pure javascript and svg.
*
* History
* --------------------------------------------------------------
* 2015-02-03 [PRiz] Created
*
*
*/

(function(window) {

	var arcSlider = {

		options: {
			max: 100,
			min: 0,
			step: 1,
			value: 0,
			values: null,
			angle:180,
			radius:100,
			thickness:5,
			baseColor:"#000000",
			
			// callbacks
			change: null,
			slide: null,
			start: null,
			stop: null
		},
		
		/*
		* SVG path building functions
		*/
		
		// http://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
		_describeArc : function(x, y, radius, startAngle, endAngle){

			var start = this._polarToCartesian(x, y, radius, endAngle);
			var end   = this._polarToCartesian(x, y, radius, startAngle);

			var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

			var d = [
				"M", start.x, start.y, 
				"A", radius, radius, 0, arcSweep, 0, end.x, end.y
			].join(" ");

			return d;       
		},
		
		_buildMainArc : function(x, y, radius, angle) {
			var a1 = 360 - (angle/2);
			var path1 = this._describeArc(x,y,radius,a1,0);
			
			var a2 = angle/2;
			var path2 = this._describeArc(x,y,radius,0,a2);
			
			return path1 + " " + path2;				
		},

		_buildFillArc : function(x, y, radius, startAngle, endAngle) {
			var a1start = startAngle;
			var a1end   = (endAngle < startAngle) ? 0 : endAngle;
			
			var path = this._describeArc(x,y,radius,a1start,a1end);

			if (endAngle < startAngle) {
				path = path + " " + this._describeArc(x,y,radius,0,endAngle);
			}

			return path;
		},
		
		_createPathDOMElement : function(path,color) {
			var element = document.createElementNS(this._namespace,"path");
			element.setAttribute("stroke",color);
			element.setAttribute("stroke-width",this.options.thickness);
			element.setAttribute("fill","none");
			element.setAttribute("d",path);
			
			return element;
		},
		
		_createSVGDOMElement : function(width, height) {
			var element = document.createElementNS(this._namespace,"svg");
			element.setAttribute("width",width);
			element.setAttribute("height",height);
			
			return element;
		},
		
		/*
		* Helper functions
		*/
		
		// http://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
		_polarToCartesian : function(centerX, centerY, radius, angleInDegrees) {
		  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

		  return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		  };
		},		

		_distanceOfTwoPoints : function(p1,p2) {
			return Math.abs(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y,2)));
		},
				
		_setOptions : function(opts) {
			if (opts) {
				for (var property in opts) {
					if (opts.hasOwnProperty(property)) {						
						this.options[property] = opts[property];
					}
				}
			}
			
			return this.options;
		},
		
		/*
		* Event functions
		*/
		_bindPathClickFunction : function(element) {	
			var _self = this;
			element.addEventListener('click',function(e) {
				// the mouse stop event function should be here
				//if (_self._ismousedown) {					
					var clickDistance = _self._distanceOfTwoPoints(_self._center,{x:e.offsetX,y:e.offsetY});
					var angle = (180/Math.PI)*Math.atan2((e.offsetY - _self._center.y),(e.offsetX - _self._center.x));
					angle = angle + 90;
					if (angle < 0) angle = 360 + angle;
					//angle = 360 - angle;

					console.log(angle);
					
					// calc total arc angle
					var arc = 0;
					if (angle < _self.options.angle) {
						arc = 360 - _self.options.angle + arc;
					} else {
						arc = angle - _self.options.angle;
					}

					var path = _self._buildFillArc(_self._center.x, _self._center.y, _self.options.radius, 360 - (_self.options.angle/2), angle);	
					if (_self.subpath) _self.subpath.parentNode.removeChild(_self.subpath);					
					var pathElement = _self.subpath = _self._createPathDOMElement(path,"#000000");
					_self._bindPathClickFunction(pathElement);
					
					//var svgElement = _self._createSVGDOMElement(_self._width, _self._height);
					
					_self._container.childNodes[0].appendChild(pathElement);
					//_self._container.appendChild(svgElement);
										
				
				
				// reset mouse flag
				//_self._ismousedown = false;
			});
			
			// element.addEventListener('mousedown',function() {
			// 	_self._ismousedown = true;
			// });
		},		
		
		/*
		* Public functions
		*/
		
		init : function(obj,opts){
			
			// set global vars
			this._ismousedown = false;
			
			// set container element
			var container = this._container = obj;			
			
			this._namespace = "http://www.w3.org/2000/svg";
			
			// calc dimensions
			this._width = obj.innerWidth || obj.clientWidth;
			this._height = obj.innerHeight || obj.clientHeight;
			var center = this._center = { x : this._width/2, y : this._height/2 };		

			// set options
			var options = this._setOptions(opts);
			options.radius = this.options.radius = center.x - options.thickness;
			
			// build base arc
			var path = this._buildMainArc(center.x,center.y,options.radius,options.angle);	
			var pathElement = this._createPathDOMElement(path,options.baseColor);
			this._bindPathClickFunction(pathElement);
			
			var svgElement = this._createSVGDOMElement(this._width, this._height);
			
			svgElement.appendChild(pathElement);
			container.appendChild(svgElement);
		}		
		
	};
	
	window.arcSlider = function(obj,opts) {
		// apply this keyword to arcSlider object instead of window object
		arcSlider.init.call(arcSlider,obj,opts);
	};
	
})(window);
