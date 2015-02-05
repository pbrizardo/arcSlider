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
			var a1 = this._startAngle = 360 - (angle/2);
			var path1 = this._describeArc(x,y,radius,a1,0);
			
			var a2 = this._endAngle = angle/2;
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
			//element.setAttribute("vector-effect","non-scaling-stroke");
			element.setAttribute("d",path);
			
			return element;
		},
		
		_createSVGDOMElement : function(width, height) {
			var element = document.createElementNS(this._namespace,"svg");
			element.setAttribute("viewBox","0 0 " + width + " " + height);
			//element.setAttribute("preserveAspectRatio", "xMinYMin meet");
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

		_getCenter : function() {
			// var width = this._container.innerWidth || this._container.clientWidth;
			// var height = this._container.innerHeight || this._container.clientHeight;
			// var w = height < width ? height : width;
			// w = w/2;
			// return {x:w, y:w};

			return this._center;
		},

		_draw : function() {


			// calc dimensions
			var width = this._container.innerWidth || this._container.clientWidth;
			var height = this._container.innerHeight || this._container.clientHeight;
			this._width = height < width ? height : width;
			this._height = this._width;
			var c = this._width/2;
			var center = this._center = {x:c,y:c};

			// set options
			this.options.radius = center.x - options.thickness;
			
			// build base arc
			var pathElement = this._createPathDOMElement(this.basePath,options.baseColor);
			this._bindPathClickFunction(pathElement);
			if (this._subPath) {
				var traceElement = this._createPathDOMElement(this._subPath,"#000000");
				this._bindPathClickFunction(traceElement);
			}
			
			var svgContainer = this._container.childNodes[0];
			for (var i in this._container.childNodes) {
				svgContainer.childNodes[i].parentNode.removeChild(svgContainer.childNodes[i]);
			};
			
			svgContainer.appendChild(pathElement);
			svgContainer.appendChild(traceElement);
		},
		
		/*
		* Event functions
		*/
		_bindPathClickFunction : function(element) {	
			var _self = this;
			element.addEventListener('click',function(e) {
				// the mouse stop event function should be here
				//if (_self._ismousedown) {					

					var center =  _self._getCenter();
					var clickDistance = _self._distanceOfTwoPoints(center,{x:e.offsetX,y:e.offsetY});
					var angle = (180/Math.PI)*Math.atan2((e.offsetY - center.y),(e.offsetX - center.x));
					angle = angle + 90;
					if (angle < 0) angle = 360 + angle;
					//angle = 360 - angle;

					console.log({x:e.offsetX,y:e.offsetY});
					console.log(center);
					console.log(angle);
					
					// calc total arc angle
					var arc = 0;
					if (angle < _self.options.angle) {
						arc = 360 - _self.options.angle + arc;
					} else if (angle > _self.endAngle) {

					} else {
						arc = angle - _self.options.angle;
					}

					if (angle > _self.endAngle) angle = _self.endAngle;

					var path = _self.basePath = _self._buildFillArc(center.x, center.y, _self.options.radius, 360 - (_self.options.angle/2), angle);	
					if (_self._subpath) _self._subpath.parentNode.removeChild(_self.subpath);					
					var pathElement = _self._subpath = _self._createPathDOMElement(path,"#000000");
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
			var width = obj.innerWidth || obj.clientWidth;
			var height = obj.innerHeight || obj.clientHeight;
			this._width = height < width ? height : width;
			this._height = this._width;
			var c = this._width/2;
			var center = this._center = {x:c,y:c};

			// set options
			var options = this._setOptions(opts);
			
			var svgElement = this._createSVGDOMElement(this._width, this._height);
			container.appendChild(svgElement);						
			
			this._draw();			

			// Check for all browsers
		    this._container.addEventListener('webkitTransitionEnd', draw, true);
		    this._container.addEventListener('MSTransitionEnd', draw, true);
		    this._container.addEventListener('oTransitionEnd', draw, true);
		    this._container.addEventListener('transitionend', draw, true);
		}		
		
	};
	
	window.arcSlider = function(obj,opts) {
		// apply this keyword to arcSlider object instead of window object
		arcSlider.init.call(arcSlider,obj,opts);
	};
	
})(window);
