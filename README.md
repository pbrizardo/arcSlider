# arcSlider

A pure javascript library that utilizes SVG functions to make a responsive widget.

- [Demo](http://plnkr.co/edit/v3t0XIE1EIst0qHWIXeD?p=preview)

###TODO
Add flag to remove responsive behavior.

Add cursor

Add ability to change arc position (eg. vertical)

Snap to values

###To use
```sh
// get element
var slider = document.getElementById('arcSlider');

// set options
var options = {
	thickness:50,
	angle:120,
	baseColor:'blue',
	traceColor:'red',
	width:500,
	height:500,
	radius:200
};

// display!!!!!
var arc = arcSlider(slider, options);

// get value of arc
alert(arc.getValue());
```

###Options (w/example values)
Note: Credits to jQuery slider, I used their options as a base.

```sh
max: 100
min: 0
value: 0
values: [2,3,'hi','all'] (takes precedence over min and max value)
angle:180
radius:100
thickness:5
width:250
height:250
baseColor:"#000000"
traceColor:"#000000"

slide: function() { ... }
start: null
stop: null
```
###API
setValue(number) : sets the current value by either the min/max range or a valid index of the values array.

getValue(): gets current value (or actual value (not index) in the values array)
