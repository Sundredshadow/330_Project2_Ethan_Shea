//library functions includeded vec2 and vec3 because they are just generally speaking useful classes
class Vector2
{
    constructor(x,y)
    {
        this.x=x;
        this.y=y;
    }
}

class Vector3{
    constructor(x,y,z)
    {
        this.x=x;
        this.y=y;
        this.z=z;
    }
}

function normalize2D(vec){

    let vecMag=vectorMagnitude(vec);
    return new Vector2(vec.x/vecMag,vec.y/vecMag)
}

function vectorMagnitude(vec){
    return Math.abs(Math.sqrt(vec.x*vec.x+vec.y*vec.y));
}

function distanceBetweenVectors(vec1,vec2){
    return Math.sqrt((Math.pow(vec1.x-vec2.x,2)+Math.pow(vec1.y-vec2.y,2)));
}

function RotateAboutPoint(centerPoint,pointToRotate,ang)
{
    let sin=Math.sin(ang);
    let cos=Math.cos(ang);
    pointToRotate=new Vector2(pointToRotate.x-centerPoint.x,pointToRotate.y-centerPoint.y);
    let newVec= new Vector2( pointToRotate.x*cos- pointToRotate.y*sin, pointToRotate.x * sin +  pointToRotate.y * cos);
    return new Vector2(newVec.x+centerPoint.x,newVec.y+centerPoint.y);
}

let xClient=0
let yClient=0;
function mouseMove(e){
    xClient=e.clientX;
    yClient=e.clientY;
}

function drawLine(ctx,x1,y1,x2,y2,lineWidth=1,strokeStyle="black")
{
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.closePath(); 
    if(lineWidth<=0)
    {
        lineWidth=1;
    }
    ctx.lineWidth=lineWidth;
    ctx.strokeStyle=strokeStyle
    ctx.stroke();
    ctx.restore();
}

function drawRectangle(ctx,x,y,width,height,fillStyle="black",lineWidth=0,strokeStyle="black")
{
    ctx.fillStyle=fillStyle;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x,y,width,height);
    ctx.closePath(); 
    ctx.fill();
    if(lineWidth>0){
        ctx.lineWidth=lineWidth;
        ctx.strokeStyle=strokeStyle;
        ctx.stroke();
    }
    ctx.restore();
}


function cls(ctx,width,height){//clear screen
    ctx.clearRect(0,0,width,height);
    drawRectangle(ctx,0,0,width*2,height);
    drawLine(ctx,width,0,width,height,1,"white")
}

//randoms bunch are generated on start so doesn't have to be recalled
let posRand=0;
let randoms= new Float32Array(1000).fill(0);
for(let z=0;z<1000;z++)
{  
    randoms[z]=Math.random();
}  
function getRandomInt(min, max) {
    if(posRand>=1000){posRand=0;}
    let temp=Math.floor(randoms[posRand] * (max - min + 1)) + min;
    posRand++;
    return temp;
}

const goFullscreen = (element) => {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullscreen) {
        element.mozRequestFullscreen();
    } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
    // .. and do nothing if the method is not supported
};


export{RotateAboutPoint,goFullscreen,xClient,yClient,Vector2,Vector3,normalize2D,vectorMagnitude,distanceBetweenVectors,mouseMove,drawLine,drawRectangle,cls,getRandomInt}