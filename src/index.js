import * as edsLIB from './edsLIB.js';
import * as setup from './setup.js';
import * as classes from './classes.js';

//canvas stuff
let canvas,ctx;
let width=640; 
let height=480;

//2.5D stuff
let dynamicBackground=[];
let cubeBounds=[];
let fov=90;
let rayIncrem=1;
let camera=new classes.Camera(new edsLIB.Vector2(width/2,400),fov,rayIncrem);

//note stuff
let lowETablature=    "1111111---------";
let ATablature=       "2222222---------";//make sure same length
let DTablature=       "3333333---------";
let GTablature=       "4444444---------";
let BTablature=       "5555555---------";
let highETablature=   "6666666---------";
let noteManagerLowE= new classes.NoteManager(lowETablature);
let noteManagerA= new classes.NoteManager(ATablature);
let noteManagerD= new classes.NoteManager(DTablature);
let noteManagerG= new classes.NoteManager(GTablature);
let noteManagerB= new classes.NoteManager(BTablature);
let noteManagerHighE= new classes.NoteManager(highETablature);




function init()
{
    canvas= document.querySelector("#canvas1");
    canvas.height=height;
    canvas.width=width*2;
    ctx=canvas.getContext("2d");

    canvas.addEventListener('mousemove', edsLIB.mouseMove,false);//listener for mouse movement
    let fovSlider=document.querySelector("#fov");
    fovSlider.oninput=e=>{
        fov= fovSlider.value;
        camera=new classes.Camera(camera.pos,fov,rayIncrem);
    };


    setup.setupUICanvas();
    setup.setupAudio();
    if(setup.Params.userAudio){
        setup.setupUserAudio();
    }
    setup.setupUI();
    
    edsLIB.cls(ctx,width,height);
    update();
}

function drawDynamicBasicBackground(ctx,color,xPos,reverse)
{
    setup.analyserNode.getByteFrequencyData(setup.audioData);
    //let totalLoudness =  setup.audioData.reduce((total,num) => total + num);
    let barSpacing=4;
    let margin=5;
    let screenWidthForBars=width-(setup.audioData.length*barSpacing)-margin*2;
    let barWidth=screenWidthForBars/setup.audioData.length;
    let topSpacing=100;
    for(let i=0; i<setup.audioData.length-1;i++)
    {   if(setup.audioData[i]!=0){
        dynamicBackground.push(new classes.Boundary(new edsLIB.Vector2(topSpacing+256-setup.audioData[i],margin+i*(barWidth+barSpacing)),new edsLIB.Vector2(topSpacing+256-setup.audioData[i],barWidth),setup.audioData[i]));
        }
    }

    let view=[];
    view=camera.look(dynamicBackground);
    if(reverse){
    view=view.reverse();
    }
    for(let i=0; i<view.length;i++)
    { 
        edsLIB.drawRectangle(ctx,i*(width/view.length)+width+xPos,height,(width/view.length),(-view[i].height*2)*fov/view[i].distance,`rgba(${color.x-view[i].distance},${color.y-view[i].distance},${color.z-view[i].distance},1)`);
    }

    //for user audio
    if(setup.Params.userAudio&&setup.userAnalyserNode!=undefined)
    {
        setup.userAnalyserNode.getByteFrequencyData(setup.useraudioData);
        totalLoudness =  setup.useraudioData.reduce((total,num) => total + num);
        for(let i=0; i<setup.useraudioData.length-1;i++)
        {
            dynamicBackground.push(new classes.Boundary(new edsLIB.Vector2(topSpacing+256-setup.useraudioData[i],margin+i*(barWidth+barSpacing)+100),new edsLIB.Vector2(topSpacing+256-setup.useraudioData[i],barWidth+100),setup.useraudioData[i]));
        }

        view=[];
        view=camera.look(dynamicBackground);
        if(reverse){
            view=view.reverse();
        }
        for(let i=0; i<view.length;i++)
        {
            if(setup.useraudioData[i]!=0){
            edsLIB.drawRectangle(ctx,i*(width/view.length)+width-xPos,height-200,(width/view.length),(-view[i].height*2)*fov/view[i].distance,`rgba(${color.x-view[i].distance},${color.y-view[i].distance},${color.z-view[i].distance},1)`);
            }
        }
    }
    
}

function drawLineBasedDynamicBackground(ctx,xPos,baseY,heightPos,heightMod,color,direction){
    setup.analyserNode.getByteFrequencyData(setup.audioData);

    dynamicBackground=[];
    let prevPos=new edsLIB.Vector2(xPos,0);
    for(let i=0; i<setup.audioData.length-1;i++)
    {  
        dynamicBackground.push(new classes.Boundary(new edsLIB.Vector2(prevPos.x,prevPos.y),new edsLIB.Vector2(prevPos.x+direction,baseY+setup.audioData[i]/heightMod)));
        prevPos=new edsLIB.Vector2(prevPos.x+direction,baseY+setup.audioData[i]/heightMod);
    }

    let view=[];
    view=camera.look(dynamicBackground);
    for(let i=0; i<view.length;i++)
    { 
        if(setup.audioData[i]!=0){
        edsLIB.drawRectangle(ctx,i*(width/view.length)+width,heightPos,(width/view.length),(45)*fov/view[i].distance,`rgba(${color.x-view[i].distance},${color.y-view[i].distance},${color.z-view[i].distance},1)`);
        }
    }

    if(setup.Params.userAudio&&setup.userAnalyserNode!=undefined)
    {
        setup.userAnalyserNode.getByteFrequencyData(setup.useraudioData);
        prevPos=new edsLIB.Vector2(xPos,0);
        for(let i=0; i<setup.useraudioData.length-1;i++)
        {
            dynamicBackground.push(new classes.Boundary(new edsLIB.Vector2(prevPos.x,prevPos.y),new edsLIB.Vector2(prevPos.x+direction,baseY+setup.useraudioData[i]/heightMod)));
            prevPos=new edsLIB.Vector2(prevPos.x+direction,baseY+setup.useraudioData[i]/heightMod);
        }

        view=[];
        view=camera.look(dynamicBackground);
        for(let i=0; i<view.length;i++)
        {
            if(setup.useraudioData[i]!=0){
                edsLIB.drawRectangle(ctx,i*(width/view.length)+width,heightPos,(width/view.length),(45)*fov/view[i].distance,`rgba(${color.x-view[i].distance},${color.y-view[i].distance},${color.z-view[i].distance},1)`);
            }
        }
    }
}
function drawUICanvas(ctx){
    
    let view=[];
    view=camera.look(setup.boundaries);
    for(let i=0; i<view.length;i++)
    {
        edsLIB.drawRectangle(ctx,i*(width/view.length)+width,height-250,(width/view.length),(height/2)*fov/view[i].distance,"white");
    }
}
function drawCube(ctx,startPos,size)
{
    dynamicBackground=[];
    setup.analyserNode.getByteFrequencyData(setup.audioData);
    let totalLoudness =  setup.audioData.reduce((total,num) => total + num);
    let averageLoudness =  totalLoudness/(setup.analyserNode.fftSize/2);

    if(averageLoudness>size){
        size=averageLoudness/4;
    }
    let ang=45*Math.PI/180;
    startPos=new edsLIB.Vector2(startPos.x-(0.5*size),startPos.y);
    let cubeRot=new edsLIB.Vector2(Math.sin(ang) +  Math.cos(ang),Math.cos(ang) - Math.sin(ang));
    cubeBounds=[];

    cubeBounds.push(new classes.Boundary(new edsLIB.Vector2(startPos.x,startPos.y),new edsLIB.Vector2(startPos.x+size,startPos.y)));
    cubeBounds.push(new classes.Boundary(new edsLIB.Vector2(startPos.x,startPos.y),new edsLIB.Vector2(startPos.x,startPos.y-size)));
    cubeBounds.push(new classes.Boundary(new edsLIB.Vector2(startPos.x+size,startPos.y),new edsLIB.Vector2(startPos.x+size,startPos.y-size)));
    cubeBounds.push(new classes.Boundary(new edsLIB.Vector2(startPos.x,startPos.y-size),new edsLIB.Vector2(startPos.x+size,startPos.y-size)));
        
    let view=[];
    view=camera.look(cubeBounds);
    let color=new edsLIB.Vector3(edsLIB.getRandomInt(255, 255),edsLIB.getRandomInt(255, 255),edsLIB.getRandomInt(255, 255));
    for(let i=0; i<view.length;i++)
    {
        edsLIB.drawRectangle(ctx,i*(width/view.length)+width,150,(width/view.length),((size)*4)*fov/view[i].distance,`rgba(${color.x-view[i].distance},${color.y-view[i].distance},${color.z-view[i].distance},1)`);
    }

}
function draw(ctx)
{
    if(setup.Params.cameramove){
        camera.move( new edsLIB.Vector2(edsLIB.xClient,edsLIB.yClient));
    }
    if(setup.Params.drawRays)
    {
        for(let dynamicbound of dynamicBackground)
        {
            dynamicbound.draw(ctx);
        }
        for(let cubebound of cubeBounds)
        {
            cubebound.draw(ctx);
        }
        camera.drawRays(ctx);
    }
    if(setup.Params.drawDynBackground){
        let color=new edsLIB.Vector3(edsLIB.getRandomInt(0, 255),edsLIB.getRandomInt(0, 255),edsLIB.getRandomInt(0, 255));
        drawDynamicBasicBackground(ctx,color,0,true);
        drawDynamicBasicBackground(ctx,color,50,false);
        let amountOfCuts=2;
        for(let i=0;i<=amountOfCuts;i+=1)
        {
            for(let z=0;z<=amountOfCuts;z+=1)
            { 
                drawLineBasedDynamicBackground(ctx,300,150,i*height/amountOfCuts,z,color,1);
                drawLineBasedDynamicBackground(ctx,340,150,i*height/amountOfCuts,z,color,-1);
            }
        }
        drawCube(ctx,new edsLIB.Vector2(width/2,350),10);
    }
    if(setup.Params.drawNotes){
        noteManagerLowE.draw(ctx);
        noteManagerA.draw(ctx);
        noteManagerD.draw(ctx);
        noteManagerG.draw(ctx);
        noteManagerB.draw(ctx);
        noteManagerHighE.draw(ctx);
        drawView(noteManagerLowE,new edsLIB.Vector3(255,255,255),340);
        drawView(noteManagerA,new edsLIB.Vector3(-255,255,255),300);
        drawView(noteManagerD,new edsLIB.Vector3(255,-255,255),260);
        drawView(noteManagerG,new edsLIB.Vector3(255,255,-255),220);
        drawView(noteManagerB,new edsLIB.Vector3(-255,-255,255),180);
        drawView(noteManagerHighE,new edsLIB.Vector3(255,-255,-255),140);
    }
    //drawUICanvas(ctx);
   
}

function drawView(noteManager,color,heightMod)
{
    let view=[];//array to be printed
    view=camera.look(noteManager.drawQueue);
    for(let i=0; i<view.length;i++){
        edsLIB.drawRectangle(ctx,i*(width/view.length)+width,height-heightMod,(width/view.length),(30)*fov/view[i].distance,`rgba(${color.x-view[i].distance},${color.y-view[i].distance},${color.z-view[i].distance},1)`);//use other context
    }
}
function moveNotes(deltaT)
{
    noteManagerLowE.move(deltaT/10);
    noteManagerA.move(deltaT/10);
    noteManagerD.move(deltaT/10);
    noteManagerG.move(deltaT/10);
    noteManagerB.move(deltaT/10);
    noteManagerHighE.move(deltaT/10);
}


let basetime=Date.now();
let fpsCap=1000/60;//denominator is fps
function update(){
    let now=Date.now();
    let check=now-basetime;
    if(check/fpsCap>=1){
        basetime=now;
            edsLIB.cls(ctx,width,height); 
            draw(ctx);
        if(setup.Params.drawNotes){
            moveNotes(check);
        }
    }
    requestAnimationFrame(update);
}
export{init,ctx,camera}