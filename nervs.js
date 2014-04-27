startup = true;

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
    frameCount = 0;
    signalLife = 500;
    b = new Brain(); // init brain position values
    initPaths(); // create path array
    generateMap(); // randomly generate game field (build each path)
    
    dude = new Player(); // player
    signals = new Array(); // signal array
    if (startup) {
    document.addEventListener('keydown', function(e) { // KEYBOARD INPUT
        if (e.keyCode == 65) { // A - LEFT
            if (paths[dude.selectedIndex].live) {
                dude.input[dude.input.length] = 'l';
            }
        }
        if (e.keyCode == 87) { // W - UP
            if (paths[dude.selectedIndex].live) {
                dude.input[dude.input.length] = 'u';
            }
        }
        if (e.keyCode == 68) { // D - RIGHT
            if (paths[dude.selectedIndex].live) {
                dude.input[dude.input.length] = 'r';
            }
        }
        if (e.keyCode == 32) { // SPACEBAR - CONFIRM
            process();
            clear();
        }
        if (e.keyCode == 66) { // B - RIGHT NERVE SELECTOR
            dude.selectedIndex++;
            if (dude.selectedIndex >= paths.length) dude.selectedIndex=0;
            clear();
        }
        if (e.keyCode == 86) { // V - LEFT NERVE SELECTOR
            dude.selectedIndex--;
            if (dude.selectedIndex < 0) dude.selectedIndex=paths.length-1;
            clear();
        }
    }, false);
        startup = false;
    }
};

update = function() { // game logic
    frameCount++;
    if(frameCount==100) generateSignal(0);
    if(frameCount==signalLife*1) generateSignal(1);
    if(frameCount==signalLife*2) generateSignal(2);
    if(frameCount==signalLife*3) generateSignal(3);
    if(frameCount==signalLife*4) generateSignal(4);
    if(frameCount==signalLife*5) generateSignal(5);
    signalLifetime();
    checkGame();
    checkMatches();
};

draw = function() {
    ctx.fillStyle = "#000000"; // black screen
    ctx.fillRect(0,0,c.width,c.height); // fill screen;
    ctx.fillStyle = "#FF69B4"; // pink brain
    ctx.fillRect(b.x,b.y,b.width,b.height); // draw brain
    
    for (var i=0;i<paths.length;i++) { // loop through paths
        var curr = paths[i].firstNode; // for iteration
        while (curr.nxt) { // for iteration
            if(curr.matched) ctx.strokeStyle = "#FFFFFF";
            else ctx.strokeStyle = 'rgb('+paths[i].color.r+','+paths[i].color.g+','+paths[i].color.b+')'; //select path color
            drawLine(curr.x,curr.y,curr.nxt.x,curr.nxt.y); // connect nodes
            curr=curr.nxt; // iterate
        }
    }
    
    for (var i=0;i<signals.length;i++) {
        if(signals[i].existence<signalLife) ctx.fillStyle = "#FFFF00"; 
        else if(signals[i].existence>=signalLife && signals[i].existence<signalLife*2) ctx.fillStyle = "#FFBB00"; 
        else ctx.fillStyle = "#FF0000"; 
        fillCircle(signals[i].x,signals[i].y,signals[i].radius);
    }
    
    ctx.strokeStyle = "#FF0000"; // red selector
    drawCircle(paths[dude.selectedIndex].firstNode.x, paths[dude.selectedIndex].firstNode.y, dude.selectorRadius); //  draw selector
    
    ctx.fillStyle = "#929292";
    ctx.fillRect(10,10,150,20);
    ctx.fillStyle = "#000000";
    ctx.fillRect(12,12,146,16);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(12,12,146*dude.health,16);
    
    
    ctx.fillStyle = "#FFFF00";
    ctx.fillText("PATTERN:",10,50);
    for(var i=0;i<dude.input.length;i++) { // PRINT USER INPUT
        ctx.fillText(dude.input[i],65+10*i,50);
    }
    ctx.fillText("SCORE: "+dude.score,10,70);
};

process = function () {
    if (paths[dude.selectedIndex].live) { // if there is a signal on selected path
        var counter = 0; // counts matched nodes for signal to traverse
        for(var i=0;i<dude.input.length;i++) { // loop through user input pattern
            if(paths[dude.selectedIndex].key[signals[paths[dude.selectedIndex].signalIndex].nodeVal+i]!=dude.input[i]) { // if any input mismatches with path's key
                return; // exit without doing anything
            }
            counter++; // count every success
        }
        if(counter>0 && frameCount>signalLife) signals[paths[dude.selectedIndex].signalIndex].birth+=signalLife;
        signals[paths[dude.selectedIndex].signalIndex].nodeVal+=counter; // update signal's position on path
        var curr = paths[dude.selectedIndex].firstNode; // temp node to acquire signal's new node position and values
        for (var i=0; i<signals[paths[dude.selectedIndex].signalIndex].nodeVal;i++) {
            curr = curr.nxt; // iterate
        }
        signals[paths[dude.selectedIndex].signalIndex].x = curr.x; // update signal's x
        signals[paths[dude.selectedIndex].signalIndex].y = curr.y; // update signal's y
    } 
    
    if (signals[paths[dude.selectedIndex].signalIndex].y == paths[dude.selectedIndex].lastNode.y) { // IF COMPLETED ENTIRE PATH
        generateSignal(paths[dude.selectedIndex].signalIndex); // generate a new signal
        dude.score++; // increase score
        paths[dude.selectedIndex].live = false; // reset path (no signal)
        paths[dude.selectedIndex].selectedIndex = -1; // reset path (no signal-no signal index)
    }
};

checkMatches = function() {
    var curr = paths[dude.selectedIndex].firstNode; // temp node to acquire signal's node position
    for (var i=0; i<signals[paths[dude.selectedIndex].signalIndex].nodeVal;i++) { // iterate through path until arrive at signal position
        curr = curr.nxt; // iterate
    }
    for(var i=0;i<dude.input.length;i++) {
        if (dude.input[i] == paths[dude.selectedIndex].key[signals[paths[dude.selectedIndex].signalIndex].nodeVal+i]) {
            curr.matched = true;
        }
        else {
            clear();
            return;
        }
        curr=curr.nxt;
    }
};

clear = function() {
    dude.input = new Array();
    for(var i=0;i<paths.length;i++) {
        var curr = paths[i].firstNode;
        while (curr.nxt) {
            curr.matched = false;
            curr = curr.nxt;
        }
    }
};

signalLifetime = function() {
    for(var i=0;i<signals.length;i++) {
        signals[i].existence = frameCount - signals[i].birth;
        if (signals[i].existence > signalLife*3) {
            paths[signals[i].pathIndex].live = false;
            paths[signals[i].pathIndex].signalIndex = -1;
            clear();
            generateSignal(i);
            dude.health-=0.1;
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
    signals[indx] = new Signal(idx,frameCount);
    paths[idx].live = true;
    paths[idx].signalIndex = indx;
};

checkGame = function () {
    if (dude.health < 0.1) init();
}

Player = function () {
    this.selectedIndex = 0;
    this.selectorRadius = 10;
    this.input = new Array();
    this.score = 0;
    this.health = 1;
}

Signal = function (idx,f) {
    this.x = paths[idx].firstNode.x;
    this.y = paths[idx].firstNode.y;
    this.pathIndex = idx;
    this.radius = 5;
    this.birth = f;
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
    
    this.matched = false;
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