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
    
    dude = new Player(); // player
    signals = new Array(3); // signal array
    
    generateSignal(0);
    generateSignal(1);
    generateSignal(2);
    
    document.addEventListener('keydown', function(e) { // KEYBOARD INPUT
        if (e.keyCode == 65) { // A - LEFT
            if (paths[dude.selectedIndex].live) dude.input[dude.input.length] = 'l';
        }
        if (e.keyCode == 87) { // W - UP
            if (paths[dude.selectedIndex].live) dude.input[dude.input.length] = 'u';
        }
        if (e.keyCode == 68) { // D - RIGHT
            if (paths[dude.selectedIndex].live) dude.input[dude.input.length] = 'r';
        }
        if (e.keyCode == 83) { // S - DOWN
            process();
            dude.input = new Array();
        }
        if (e.keyCode == 16) { // SHIFT - NERVE SELECTOR
            dude.selectedIndex++;
            if (dude.selectedIndex >= paths.length) dude.selectedIndex=0;
            dude.input = new Array();
        }
    }, false);        
    document.addEventListener('keyup', function(e) { // KEYBOARD INPUT
    }, false);
};

update = function() { // game logic
};

draw = function() {
    ctx.fillStyle = "#000000"; // black screen
    ctx.fillRect(0,0,c.width,c.height); // fill screen;
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
    
    ctx.fillStyle = "#FFFF00"; // yellow signals
    for (var i=0;i<signals.length;i++) {
        fillCircle(signals[i].x,signals[i].y,signals[i].radius);
    }
    
    ctx.strokeStyle = "#FF0000"; // red selector
    drawCircle(paths[dude.selectedIndex].firstNode.x, paths[dude.selectedIndex].firstNode.y, dude.selectorRadius); //  draw selector
    
    ctx.fillText("PATTERN:",10,20);
    for(var i=0;i<dude.input.length;i++) { // PRINT USER INPUT
        ctx.fillText(dude.input[i],65+10*i,20);
    }
    ctx.fillText("SCORE: "+dude.score,10,40);
};

process = function () {
    if (paths[dude.selectedIndex].live) {
        var counter = 0;
        for(var i=0;i<dude.input.length;i++) {
            if(paths[dude.selectedIndex].key[signals[paths[dude.selectedIndex].signalIndex].nodeVal+i]!=dude.input[i]) {
                return;
            }
            counter++;
        }
        signals[paths[dude.selectedIndex].signalIndex].nodeVal+=counter;
        var curr = paths[dude.selectedIndex].firstNode;
        for (var i=0; i<signals[paths[dude.selectedIndex].signalIndex].nodeVal;i++) {
            curr = curr.nxt;
        }
        signals[paths[dude.selectedIndex].signalIndex].x = curr.x;
        signals[paths[dude.selectedIndex].signalIndex].y = curr.y;
    } 
    
    if (signals[paths[dude.selectedIndex].signalIndex].y == paths[dude.selectedIndex].lastNode.y) { // IF COMPLETED
        generateSignal(paths[dude.selectedIndex].signalIndex);
        dude.score++;
        paths[dude.selectedIndex].live = false;
        paths[dude.selectedIndex].selectedIndex = -1;
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
        generatePathNodes(paths[i].key,paths[i].lastNode,paths[i].firstNode,true); // generate turns for each path recursively
    }
};

generatePathNodes = function(key,last,node,advance) {
    var rdm = Math.random();
    if (node.y < 210 && advance) { // establish brain node
        node.nxt = new Node(node.x,last.y);
        key[key.length] = 'u';
        advance = false;
        return;
    }
    else if (node.y < 210) { // set up for brain node
        node.nxt = new Node(last.x,node.y);
        key[key.length] = ((node.nxt.x > node.x)?'r':'l');
        advance = true;
    }
    else if (advance) { // FORWARD PROGRESSION
        var length = 50 + rdm*100;
        node.nxt = new Node(node.x,node.y-length);
        key[key.length] = 'u';
        advance = false;
    }
    else { // LATERAL PROGRESSION
        var length = 35 + rdm*50;
        length= ((rdm>0.5)?length:-length);
        if (length+node.x > 740 || length+node.x < 10) length = -length;
        node.nxt = new Node(node.x+length,node.y);
        key[key.length] = ((node.nxt.x > node.x)?'r':'l');
        advance = true;
    }
    generatePathNodes(key,last,node.nxt,advance); // recursion
};

generateSignal = function(indx) {
    var idx = parseInt(Math.random()*10);
    if (paths[idx].live) {
        generateSignal(indx);
        return;
    }
    signals[indx] = new Signal(idx);
    paths[idx].live = true;
    paths[idx].signalIndex = indx;
};

Player = function () {
    this.selectedIndex = 0;
    this.selectorRadius = 10;
    this.input = new Array();
    this.score = 0;
}

Signal = function (idx) {
    this.x = paths[idx].firstNode.x;
    this.y = paths[idx].firstNode.y;
    this.radius = 5;
    this.nodeVal = 0;
}

Path = function(idx) { // path object
    this.lastNode = new Node (b.x+5+(idx*(paths.length-1)),b.y+b.height); // brain node
    this.firstNode = new Node (idx*40+200,730); // nerve ending node
    
    this.key = new Array(); // answer key char array
    this.live = false; // has signal or not
    this.signalIndex = -1;
    
    this.color = new Color(parseInt(Math.random()*255),parseInt(Math.random()*255),parseInt(Math.random()*255)); // unique color
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

drawCircle = function (x1,y1,r) {
	ctx.beginPath();
	ctx.arc(x1,y1,r,0,2*Math.PI);
	ctx.closePath();
	ctx.stroke();
};

fillCircle = function (x1,y1,r) {
	ctx.beginPath();
	ctx.arc(x1,y1,r,0,2*Math.PI);
	ctx.closePath();
	ctx.fill();
};

Color = function (r,g,b) { // custom color object for rgb values
  this.r = r;
  this.g = g;
  this.b = b;
};