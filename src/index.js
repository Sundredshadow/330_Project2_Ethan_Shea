import * as edsLIB from './edsLIB.js';
import * as setup from './setup.js';
import * as classes from './classes.js';

//canvas stuff
let canvas,ctx;
let width=640; 
let height=480;

//2.5D stuff
let dynamicBackground=[];
let fov=90;
let rayIncrem=.1;
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

function drawDynamicBackground(ctx)
{
    dynamicBackground=[];
    setup.analyserNode.getByteFrequencyData(setup.audioData);
    let totalLoudness =  setup.audioData.reduce((total,num) => total + num);


    let barSpacing=4;
    let margin=5;
    let screenWidthForBars=width-(setup.audioData.length*barSpacing)-margin*2;
    let barWidth=screenWidthForBars/setup.audioData.length;
    let topSpacing=200;
    for(let i=0; i<setup.audioData.length-1;i++)
    {   if(setup.audioData[i]!=0){
        //dynamicBackground.push(new classes.Boundary(new edsLIB.Vector2(topSpacing+256-setup.audioData[i],340),new edsLIB.Vector2(topSpacing+255-setup.audioData[i],340)));
        dynamicBackground.push(new classes.Boundary(new edsLIB.Vector2(topSpacing+256-setup.audioData[i],margin+i*(barWidth+barSpacing)+100),new edsLIB.Vector2(topSpacing+256-setup.audioData[i],barWidth+100)));
        }
    }

    let view=[];
    view=camera.look(dynamicBackground);
    for(let i=0; i<view.length;i++)
    { 
        let color=new edsLIB.Vector3(edsLIB.getRandomInt(255, 255),edsLIB.getRandomInt(255, 255),edsLIB.getRandomInt(255, 255));
        edsLIB.drawRectangle(ctx,i*(width/view.length)+width,height-200,(width/view.length),(100)*fov/view[i],`rgba(${color.x-view[i]},${color.y-view[i]},${color.z-view[i]},1)`);
    }


    //for user audio
    if(setup.Params.userAudio&&setup.userAnalyserNode!=undefined)
    {
        dynamicBackground=[];
        setup.userAnalyserNode.getByteFrequencyData(setup.useraudioData);
        totalLoudness =  setup.useraudioData.reduce((total,num) => total + num);
        for(let i=0; i<setup.useraudioData.length-1;i++)
        {
            //dynamicBackground.push(new classes.Boundary(new edsLIB.Vector2(topSpacing+256-setup.useraudioData[i],340),new edsLIB.Vector2(topSpacing+255-setup.useraudioData[i],340)));
            dynamicBackground.push(new classes.Boundary(new edsLIB.Vector2(topSpacing+256-setup.useraudioData[i],margin+i*(barWidth+barSpacing)+100),new edsLIB.Vector2(topSpacing+256-setup.useraudioData[i],barWidth+100)));
        }

        view=[];
        view=camera.look(dynamicBackground);
        for(let i=0; i<view.length;i++)
        {
            if(setup.audioData[i]!=0){
            let color=new edsLIB.Vector3(edsLIB.getRandomInt(255, 255),edsLIB.getRandomInt(255, 255),edsLIB.getRandomInt(255, 255));
            edsLIB.drawRectangle(ctx,i*(width/view.length)+width,height-200,(width/view.length),(100)*fov/view[i],`rgba(${color.x-view[i]},${0},${0},1)`);
            }
        }
    }
    
}
function drawUICanvas(ctx){
    
    let view=[];
    view=camera.look(setup.boundaries);
    for(let i=0; i<view.length;i++)
    {
        edsLIB.drawRectangle(ctx,i*(width/view.length)+width,height-250,(width/view.length),(height/2)*fov/view[i],"white");
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
        camera.drawRays(ctx);
        
    }
    if(setup.Params.drawDynBackground){
        drawDynamicBackground(ctx);
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
        edsLIB.drawRectangle(ctx,i*(width/view.length)+width,height-heightMod,(width/view.length),(30)*fov/view[i],`rgba(${color.x-view[i]},${color.y-view[i]},${color.z-view[i]},1)`);//use other context
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