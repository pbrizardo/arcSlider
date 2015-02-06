# arcSlider

No jQuery needed.
Slider only slides. Need to implement the values system.

================================
To use
================================
// get element
var slider = document.getElementById('arcSlider');
<br />
// set options
<br />
var options = {
	thickness:50,
	angle:120,
	baseColor:"blue",
	traceColor:'red',
	width:500,
	height:500,
	radius:200
};
<br />
// display!!!!!
<br/>
arcSlider(slider, options);

================================
Options (w/example values)
================================
Note: Credits to jQuery slider, I used their options as a base.

max: 100,
min: 0,
value: 0,
values: null, <-- I believe array of values, hrmmmm
angle:180,
radius:100,
thickness:5,
width:250,
height:250,
baseColor:"#000000",
traceColor:"#000000",

slide: null, <-- function objects, duh
start: null,
stop: null
