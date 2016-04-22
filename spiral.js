var countries;
var table;
var wars = [];
var spiralArray = [];
var gridPoints = [];
var mergedWars = [];

var lengthSpiral;
var cx; //center of spiral
var cy;
var warDeathMin = 100000000000;
var warDeathMax = 0;

var myFont;
var button;

var drawAll = false;

var War = function (name) {
    this.name = name;
    this.participants = [];
    this.points = [];
    this.selected;

    this.computeDates = function () {
        //create variables to compare and get the minimum and maximum
        var warStartDate = new ODate(2010, 0, 0);
        var warEndDate = new ODate(1700, 0, 0);

        //go to the list of participants and get the max date and minimum
        for (var i = 0; i < this.participants.length; i++) {
            var p = this.participants[i];
            warStartDate = p.startDate.min(warStartDate);
            warEndDate = p.endDate.max(warEndDate);
        }
        this.warStartDate = warStartDate;
        this.warEndDate = warEndDate;
    }

    //get the overall batDeath for each war
    this.computeDeath = function () {
        var death = 0;
        for (var i = 0; i < this.participants.length; i++) {
            var p = this.participants[i];
            death = death + p.batDeath;
        }
        this.warDeath = death;
    }

}

var Participant = function (country, startDate, endDate, batDeath) {
    this.country = country;
    this.startDate = startDate;
    this.endDate = endDate;
    this.batDeath = batDeath;
}

var ODate = function (AAAA, MM, DD) {
    this.year = AAAA;
    this.month = MM;
    this.day = DD;

    this.min = function (otherdate) {
        if (getDecimalDate(otherdate) < getDecimalDate(this)) {
            return otherdate;
        } else {
            return this;
        }
    }

    this.max = function (otherdate) {
        if (getDecimalDate(otherdate) > getDecimalDate(this)) {
            return otherdate;
        } else {
            return this;
        }
    }
}

var Grid = function (year, point) {
    this.year = year;
    this.point = point;
}


/*------------------------------ preload + setup --------------------------*/

function preload() {
    myFont = loadFont("assets/OpenSans-Regular.ttf");
    table = loadTable("data/Inter-StateWarData_v4.0.csv", "csv", "header");
}


function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    frameRate(50);
    
    textFont(myFont);
    
    //set up button
    button = createButton('all the wars');
    button.addClass('button');
    button.position(0.1*windowWidth, 0.4*windowHeight);
    button.mousePressed(drawAllLines);
    
    
    table.getRows().forEach(function (row) {
        var warName = row.getString("WarName");
        var participantName = row.getString("StateName");
        var batDeath = int(row.getString("BatDeath")); //integer
        var startYear = int(row.getString("StartYear1"));
        var startMonth = int(row.getString("StartMonth1"));
        var startDay = int(row.getString("StartDay1"));
        var endYear = int(row.getString("EndYear1"));
        var endMonth = int(row.getString("EndMonth1"));
        var endDay = int(row.getString("EndDay1"));

        var startDate = new ODate(startYear, startMonth, startDay);
        var endDate = new ODate(endYear, endMonth, endDay);

        var participant = new Participant(participantName, startDate, endDate, batDeath);

        /*Search for a war with this name in the array*/
        var war = getWar(warName); //getWar is a function defined below

        if (war == "false") {
            //create a new war
            var myWar = new War(warName);
            myWar.participants.push(participant);
            wars.push(myWar);
        } else {
            //fill the existing war with new data
            war.participants.push(participant);
        }

    });

    wars.forEach(function (w) {
        w.computeDates();
        w.computeDeath();
    });

    function getWar(name) {
        for (var i = 0; i < wars.length; i++) {
            var war = wars[i];
            if (war.name == name) {
                return war;
            }
        }
        return "false";
    }

    setupAgain();

} //end of setup



function setupAgain() {
    spiralArray = [];
    gridPoints = [];
    warsNewStructure = [];

    cx = windowWidth * 2 / 3;
    cy = windowHeight / 2;
    var angle_incr = radians(4);
    var outer_rad = width * .32;

    lengthSpiral = 0;

    //push points on spiral to spiralArray
    for (var i = 0; i < 1000; i += 0.02) {
        //Reference: http://tj626.imnyuad.com/blog/nature-of-code-assignment-1-my-first-venture-into-p5-js/
        var ratio = sq(i) / 1500000; //bigger the number, smaller the size
        var spiral_rad = ratio * outer_rad;
        var angle = i * angle_incr;
        var x1 = cx + cos(angle) * spiral_rad;
        var y1 = cy + sin(angle) * spiral_rad;

        var ratio2 = sq(i + 1) / 1000000;
        var spiral_rad2 = ratio2 * outer_rad;
        var angle2 = (i + 1) * angle_incr;
        var x2 = cx + cos(angle2) * spiral_rad2;
        var y2 = cy + sin(angle2) * spiral_rad2;

        var p = createVector(x1, y1);
        spiralArray.push(p); //push to array

        var d = dist(x1, y1, x2, y2);
        lengthSpiral = lengthSpiral + d;
    }


    //push points of each war into the array of wars
    wars.forEach(function (war) {
        war.points = [];

        //get the minimum and maximum of warDeath
        if (war.warDeath < warDeathMin) {
            warDeathMin = war.warDeath;
        }
        if (war.warDeath > warDeathMax) {
            warDeathMax = war.warDeath;
        }

        var posd = 0;
        var tStart = scaleTime(war.warStartDate);
        var tEnd = scaleTime(war.warEndDate);

        for (var i = 0; i < 1000; i += 0.02) {
            var ratio = sq(i) / 1500000;
            var spiral_rad = ratio * outer_rad;
            var angle = i * angle_incr;
            var x1 = cx + cos(angle) * spiral_rad;
            var y1 = cy + sin(angle) * spiral_rad;

            var ratio2 = sq(i + 1) / 1000000;
            var spiral_rad2 = ratio2 * outer_rad;
            var angle2 = (i + 1) * angle_incr;
            var x2 = cx + cos(angle2) * spiral_rad2;
            var y2 = cy + sin(angle2) * spiral_rad2;

            var d = dist(x1, y1, x2, y2);
            posd = posd + d;

            if (posd <= tEnd && posd >= tStart) {
                war.points.push(createVector(x1, y1));
            }
        }
    }); //end of war.forEach


    //push points of years into the array gridPoints
    for (t = 1820; t <= 2003; t += 10) {
        var posd = 0;
        for (var i = 0; i < 1000; i += 0.02) {
            var ratio = sq(i) / 1500000;
            var spiral_rad = ratio * outer_rad;
            var angle = i * angle_incr;
            var x1 = cx + cos(angle) * spiral_rad;
            var y1 = cy + sin(angle) * spiral_rad;

            var ratio2 = sq(i + 1) / 1000000;
            var spiral_rad2 = ratio2 * outer_rad;
            var angle2 = (i + 1) * angle_incr;
            var x2 = cx + cos(angle2) * spiral_rad2;
            var y2 = cy + sin(angle2) * spiral_rad2;

            var d = dist(x1, y1, x2, y2);
            posd = posd + d;

            var yeard = scaleTime(new ODate(t, 1, 1));

            if (posd >= yeard) {
                var point = createVector(x1, y1);
                var thisPoint = new Grid(t, point);
                gridPoints.push(thisPoint);
                break;
            }
        }
    }


    //dealing with wars that are too close
    for (var i = 0; i < wars.length - 1; i++) {
        for (var j = i + 1; j < wars.length; j++) {
            var war1 = wars[i];
            var war2 = wars[j];

            var isThereWar1 = false;
            mergedWars.forEach(function (merge) {
                merge.forEach(function (ww) {
                    if (ww == war1) {
                        isThereWar1 = true;
                    }
                });
            });

            if (!isThereWar1) {
                var merge = [];
                merge.push(war1);
                mergedWars.push(merge);
            }

            var distance = dist(war1.points[0].x, war1.points[0].y, war2.points[0].x, war2.points[0].y);

            // if war1 very close to war2, push them to warsNewStructure
            if (distance < 5) {
                //check if it is there already
                mergedWars.forEach(function (merge) {
                    var war1There = false;
                    var war2There = false;
                    merge.forEach(function (ww) {
                        if (ww == war1) {
                            war1There = true;
                        }

                        if (ww == war2) {
                            war2There = true;
                        }

                    });

                    if (war1There && !war2There)
                        merge.push(war2);
                });
            }

        }
    }

    //print(wars);
    //print(mergedWars);

} //end of setupAgain


function windowResized() {
    setupAgain();
    resizeCanvas(windowWidth, windowHeight);
}


/*------------------------------ draw --------------------------*/
function draw() {

    //background(255);
    background(252,251,250);


    //draw basic spiral
    beginShape();
    noFill();
    stroke(200);
    strokeWeight(0.75);
    spiralArray.forEach(function (p) {
        vertex(p.x, p.y);
    })
    endShape();
    
    
    //add year marks
    gridPoints.forEach(function (p) {
        //mark lines
        var dir = p5.Vector.sub(p.point, createVector(2/3*width, height/2));
        dir.normalize();
        stroke(180);
        line(p.point.x+dir.x, p.point.y+dir.y, p.point.x-2*dir.x, p.point.y-2*dir.y);
        dir.mult(3);
        
        //mark text
        push();
        translate(p.point.x+dir.x, p.point.y+dir.y);
        rotate(atan2(p.point.y - cy, p.point.x - cx) + PI / 2);
        noStroke();
        fill(0,120);
        textSize(8);
        text(p.year, 0, 0);
        pop();
    });
    
    
    //draw a little circle at the beginning of each curve
    wars.forEach(function (w) {
        fill(130);
        noStroke();
        ellipse(w.points[0].x, w.points[0].y, 3, 3);
    });


    function average(c) {
        var avgx = 0;
        var avgy = 0;

        for (i = 0; i < c.length; i++) {
            avgx += c[i].points[0].x;
            avgy += c[i].points[0].y;
        }

        var avg = createVector(avgx, avgy);
        avg.div(c.length);
        return avg;
    }


    //mouse over behavior
    mergedWars.forEach(function (m) {
        var avg = average(m);
        
        var distMouse = dist(mouseX, mouseY, avg.x, avg.y);
        if (distMouse < 3) {
            
            var finalTooltip = "";
            
            for (i = 0; i < m.length; i++) {
                //draw segment curve for the selected war
                noFill();
                strokeCap(SQUARE);
                strokeWeight(scaleDeath(m[i].warDeath));
                stroke(206, 17, 38, 80);
                beginShape();
                m[i].points.forEach(function (p) {
                    vertex(p.x, p.y);
                });
                endShape();

                
                var dir = p5.Vector.sub(m[i].points[0], createVector(2/3*width, height/2));
                dir.normalize();
                dir.mult(3);
                
                //add text of start year
                startYear = m[i].warStartDate.year;
                push();
                translate(m[i].points[0].x+dir.x, m[i].points[0].y+dir.y);
                rotate(atan2(m[i].points[0].y - cy, m[i].points[0].x - cx) + PI / 2);
                noStroke();
                fill(120);
                textSize(10);
                text(startYear, 0, 0); //Transformations are cumulative
                pop();
                

                //text of tooltip
                startDate = m[i].warStartDate.year + "." + m[i].warStartDate.month + "." + m[i].warStartDate.day;
                endDate = m[i].warEndDate.year + "." + m[i].warEndDate.month + "." + m[i].warEndDate.day;
                tooltip = "War Name: " + m[i].name + "\n" + "Start Date: " + startDate + "\n" + "End Date: " + endDate + "\n" + "Casualty: " + nfc(m[i].warDeath);
                finalTooltip = finalTooltip + tooltip + "\n\n";
            }
            
            //tooltip
            push();
            translate(0.1*windowWidth, 0.48*windowHeight);
            noStroke();
            fill(100);
            textSize(11);
            textLeading(18);
            text(finalTooltip, 0, 0);
            pop();

        }
    })//end of mergedWars.forEach

    
    if(drawAll){
        wars.forEach(function (w) {
            //draw segment curve for each war
            noFill();
            strokeCap(SQUARE);
            strokeWeight(scaleDeath(w.warDeath));
            stroke(206, 17, 38, 80);
            beginShape();
            w.points.forEach(function (p) {
                vertex(p.x, p.y);
            });
            endShape();
        });
    }
    

} //end of draw function



function drawAllLines(){
    if(drawAll == false){
        drawAll = true;
        button.addClass("highlighted");
        button.removeClass("disabled");
    } 
    else if(drawAll == true){
        drawAll = false;
        button.addClass("disabled");
        button.removeClass("highlighted");
    } 
}

/*------------------------------ other functions --------------------------*/

function getDecimalDate(date) {
    return date.year + (date.month - 1) / 12 + (date.day - 1) / 365;
}

//scale of curve length
function scaleTime(time) {
    var t = getDecimalDate(time);
    return map(t, getDecimalDate(wars[0].warStartDate), getDecimalDate(wars[94].warEndDate), 0, lengthSpiral);
}

//scale of stroke weight
function scaleDeath(d) {
    return map(log(d), log(warDeathMin), log(warDeathMax), 1, 30);
}