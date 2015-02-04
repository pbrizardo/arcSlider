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
			element.addEventListener('mouseup',function() {
				if (this._ismousedown) {
					// do something while mouse is down
					alert(element.getTotalLength());
				}
				this._ismousedown = false;
			});
			
			element.addEventListener('mousedown',function() {
				this._ismousedown = true;
			});
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