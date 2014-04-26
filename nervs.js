$(document).ready(function() { // SET UP GAME LOOP
	c=document.getElementById("canvas");
	c.width=750;
	c.height=750;
	$("#canvas").animate({opacity:1.0},2000);
	ctx=c.getContext("2d");
	init();
	setInterval(function(){
		rect = c.getBoundingClientRect();
        draw();
		update();
	},1000/FPS);
});

init = function() {
    FPS = 60; // game set to 60 FPS
    b = new Brain(); // init brain position values
    initPaths(); // create path array
    generateMap(); // randomly generate game field (build each path)
};

update = function() { // game logic
};

draw = function() {
    ctx.fillStyle = "#FF69B4"; // pink brain
    ctx.fillRect(b.x,b.y,b.width,b.height); // draw brain
    
    for (var i=0;i<paths.length;i++) { // loop through paths
        ctx.strokeStyle = 'rgb('+paths[i].color.r+','+paths[i].color.g+','+paths[i].color.b+')'; //select path color
        var curr = paths[i].firstNode; // for iteration
        while (curr.nxt) { // for iteration
            drawLine(curr.x,curr.y,curr.nxt.x,curr.nxt.y); // connect nodes
            curr=curr.nxt; // iterate
        }
    }
};

initPaths = function() {
    paths = new Array(10); // new path array
    for (var i=0;i<paths.length;i++) {
        paths[i] = new Path(i); // fill path array
    }
};

generateMap = function() {
    for(var i=0;i<paths.length;i++) {
        generatePathNodes(paths[i].lastNode,paths[i].firstNode,true); // generate turns for each path recursively
    }
};

generatePathNodes = function(last,node,advance) {
    var rdm = Math.random();
    if (node.y < 200 && advance) { // establish brain node
        node.nxt = new Node(node.x,last.y);
        advance = false;
        return;
    }
    else if (node.y < 200) { // set up for brain node
        node.nxt = new Node(last.x,node.y);
        advance = true;
    }
    else if (advance) { // FORWARD PROGRESSION
        var length = 50 + rdm*100;
        node.nxt = new Node(node.x,node.y-length);
        advance = false;
    }
    else { // LATERAL PROGRESSION
        var length = 20 + rdm*50;
        length= ((rdm>0.5)?length:-length);
        if (length+node.x > 740 || length+node.x < 10) length = -length; 
        node.nxt = new Node(node.x+length,node.y);
        advance = true;
    }
    generatePathNodes(last,node.nxt,advance); // recursion
}; 

Path = function(idx) { // path object
    this.lastNode = new Node (b.x+5+(idx*(paths.length-1)),b.y+b.height);
    this.firstNode = new Node (idx*40+200,730);
    this.color = new Color(parseInt(Math.random()*255),parseInt(Math.random()*255),parseInt(Math.random()*255));
};

Node = function(x,y) { // node object
    this.x = x;
    this.y = y;
    this.nxt;
};

Brain = function() { // brain object
    this.x = 330;
    this.y = 15;
    this.width = 90;
    this.height = 40;
};

drawLine = function (x1,y1,x2,y2) { // custom draw line function
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.closePath();
	ctx.stroke();
};

Color = function (r,g,b) { // custom color object for rgb values
  this.r = r;
  this.g = g;
  this.b = b;
};