/*
* arcSlider.js
* By Paul Rizardo
*
* Builds a circular arched slider. Pure javascript and svg.
*
* History
* --------------------------------------------------------------
* 2015-02-03 [PRiz] Created
* 2015-02-06 [PRiz] Added values implementation. Can only step by 1.
*
*/

(function(window) {

	var arcSlider = {

		options: {
			max: 100,
			min: 0,
			//step: 1,
			value: 0,
			values: null,
			angle:180,
			radius:100,
			thickness:5,
			width:250,
			height:250,
			baseColor:"#000000",
			traceColor:"#000000",
			
			// callbacks
			//change: null,
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

			// if endAngle is greater, it means that the left half circle is filled and need to fill the rest
			if (endAngle < startAngle) {
				// if endAngle is greater than arc's endEngle...
				if (endAngle > this._endAngle) {
					// if angle is close to startAngle, send path with no fillbar, else set to arc's endAngle
					if ((Math.abs(this._startAngle - endAngle) < Math.abs(this._endAngle - endAngle))) {
						return this._describeArc(x,y,radius,this._startAngle,this._startAngle);
					}
					else endAngle = this._endAngle;
				}
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

		_draw : function() {
			
			// build base arc
			var pathElement = this._basePathElement = this._createPathDOMElement(this._basePath,this.options.baseColor);
			this._bindPathClickFunction(pathElement);

			if (this._subPath) {
				var traceElement = this._createPathDOMElement(this._subPath,this.options.traceColor);
				this._bindPathClickFunction(traceElement);
			}
			
			var svgContainer = this._container.childNodes[0];
			if (svgContainer.childNodes.length) {
				for (var i in svgContainer.childNodes) {
					svgContainer.childNodes[i].parentNode.removeChild(svgContainer.childNodes[i]);
				}
			}
			
			svgContainer.appendChild(pathElement);
			if (traceElement) svgContainer.appendChild(traceElement);
		},

		_buildShim : function() {
			var _self = this;
			var element = this._shim = document.createElement('div');
			element.style.height = element.style.width = this.options.thickness;
			element.style.position = 'absolute';
			//element.style.backgroundColor = "#000000";			
			this._container.appendChild(element);

			
			element.addEventListener('mousedown', function(e) {
				_self._onMouseDownEvent.call(_self,e);
			}, false);		
			element.addEventListener('mouseup', function(e) {
				_self._onMouseUpEvent.call(_self,e);
			}, false);		
			// element.addEventListener('mousemove', function(e) {
			// 	e.preventDefault();
			// 	_self._onMouseMoveEvent.call(_self,e);		
			// }, false);
		},

		_displayFillArc : function(e) {

			var center = this._center;			
			var uupos = this._container.childNodes[0].createSVGPoint();
				uupos.x = e.clientX;
		        uupos.y = e.clientY;
		        var ctm = this._container.childNodes[0].getScreenCTM();
		        if (ctm = ctm.inverse())
		            uupos = uupos.matrixTransform(ctm);

			var angle = (180/Math.PI)*Math.atan2((uupos.y - center.y),(uupos.x - center.x));
			// adjust offset of first offset :0
			angle = angle + 90;
			// for some reason, the atan2 function produces negative angles.
			if (angle < 0) angle = 360 + angle;				

			var path = this._subPath = this._buildFillArc(center.x, center.y, this.options.radius, this._startAngle, angle);
			if (this._subPathElement) {				
				this._subPathElement.setAttribute('d',path);
			} else {
				var traceElement = this._subPathElement = this._createPathDOMElement(path,this.options.traceColor,true);
				this._bindPathClickFunction(traceElement);							
				this._container.childNodes[0].appendChild(traceElement);
			}

			console.log(angle);
		},

		_setValue : function() {
			var pathLength = this._basePathElement.getTotalLength();
			var traceLength = (this._subPathElement) ? this._subPathElement.getTotalLength() : 0;

			var pathRatio = traceLength/pathLength;
			
			var totalTicks = (this.options.values) ? this.options.values.length - 1 : this.options.max - this.options.min;
			var subTicks = Math.floor(totalTicks * pathRatio);

			this.options.value = (this.options.values) ? this.options.values[subTicks] : this.options.min + subTicks;
		},
		
		/*
		* Event functions
		*/
		_onMouseMoveEvent : function(e) {		
			if (this._ismousedown) {
				var offset = this._shim.clientWidth/2
				this._shim.style.top  = e.pageY - offset;
				this._shim.style.left = e.pageX - offset;

				this._displayFillArc(e);
				this._setValue();

				if (typeof this.options.slide === 'function') {
					this.options.slide(this.options,e);
				}
			}
		},

		_onMouseDownEvent : function(e) {
			var _self = this;	
			e.preventDefault();		
			this._ismousedown = true;			
			var offset = this._shim.clientWidth/2;
			this._shim.style.top  = e.clientY - offset;
			this._shim.style.left = e.clientX - offset;

			this._displayFillArc(e);
			this._setValue();

			if (typeof this.options.start === 'function') {
					this.options.start(this.options,e);
			}

			document.addEventListener('mousemove',function(e) {
				_self._onMouseMoveEvent.call(_self,e);
			}, false);
	
		},

		_onMouseUpEvent : function(e) {
			e.preventDefault();
			if (this._ismousedown) {
				this._displayFillArc(e);
				this._setValue();
				if (typeof this.options.stop === 'function') {
					this.options.stop(this.options,e);
				}
			}
			this._ismousedown = false;	
			document.removeEventListener('mousemove');	
		},		

		_bindPathClickFunction : function(element) {	
			var _self = this;	
			element.addEventListener('mousedown', function(e) {
				_self._onMouseDownEvent.call(_self,e);
			}, false);		
			element.addEventListener('mouseup', function(e) {
				_self._onMouseUpEvent.call(_self,e);
			}, false);			
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

			// set options
			var options = this._setOptions(opts);			

			// get dimensions
			var width = this.options.width
			var height = this.options.height

			// calc center
			var smallestLength = width < height ? width : height;
			var c = smallestLength/2;
			var center = this._center = {x:c,y:c};
			
			// create <svg> tag and append to container element
			var svgElement = this._createSVGDOMElement(this.options.width, this.options.height);
			container.appendChild(svgElement);						

			// store base path globally
			this._basePath = this._buildMainArc(center.x,center.y,this.options.radius,this.options.angle);

			// TODO: Draw subpath if value is provided

			this._draw();		
			this._buildShim();	
		}		
		
	};
	
	window.arcSlider = function(obj,opts) {
		// apply this keyword to arcSlider object instead of window object
		arcSlider.init.call(arcSlider,obj,opts);
	};
	
})(window);
