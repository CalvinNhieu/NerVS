FPS = 60;

$(document).ready(function() {
	c=document.getElementById("canvas");
	c.width=450;
	c.height=750;
	$("#canvas").animate({opacity:1.0},4000);
	ctx=c.getContext("2d");
	init();
	setInterval(function(){
		rect = c.getBoundingClientRect();
        draw();
		update();
		
	},1000/FPS);
});

init = function() {
};

update = function() {
};

draw = function() {
};
