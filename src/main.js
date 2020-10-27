import * as edsLIB from './edsLIB.js';
import * as setup from './setup.js';
import * as classes from './classes.js';

//canvas stuff
let canvas,ctx;
let width=640; 
let height=480;

//2.5D stuff
let dynamicBackground=[];
let dynamicBackground2=[];
let cubeBounds=[];
let fov=90;
let rayIncrem=1;
let camera=new classes.Camera(new edsLIB.Vector2(width/2,400),fov,rayIncrem);

function init()
{
    canvas= document.querySelector("#canvas1");
    canvas.height=height;
    canvas.width=width*2-50;//-50 just to make it look better
    ctx=canvas.getContext("2d");

    canvas.addEventListener('mousemove', edsLIB.mouseMove,true);//listener for mouse movement
    let fovSlider=document.querySelector("#fov");
    let fovText=document.querySelector("#fovText");
    fovSlider.oninput=e=>{
        fov= fovSlider.value;
        fovText.innerHTML=fov;
        camera=new classes.Camera(camera.pos,fov,rayIncrem);
    };


    setup.setupUICanvas();
    setup.setupAudio();
    setup.setupTime();
    if(setup.Params.userAudio){
        setup.setupUserAudio();
    }
    setup.setupUI();
    
    let fsButton = document.querySelector("#fsButton");
    fsButton.onclick = e => {
        edsLIB.goFullscreen(canvas);
    };
    edsLIB.cls(ctx,width,height);
    update();
}

function drawDynamicBasicBackground(ctx,color,xPos,reverse)
{
    dynamicBackground=[];
    setup.analyserNode.getByteFrequencyData(setup.audioData);
    let totalLoudness =  setup.audioData.reduce((total,num) => total + num);
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

    dynamicBackground2=[];
    let prevPos=new edsLIB.Vector2(xPos,0);
    for(let i=0; i<setup.audioData.length-1;i++)
    {  
        dynamicBackground2.push(new classes.Boundary(new edsLIB.Vector2(prevPos.x,prevPos.y),new edsLIB.Vector2(prevPos.x+direction,baseY+setup.audioData[i]/heightMod)));
        prevPos=new edsLIB.Vector2(prevPos.x+direction,baseY+setup.audioData[i]/heightMod);
    }

    let view=[];
    view=camera.look(dynamicBackground2);
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
            dynamicBackground2.push(new classes.Boundary(new edsLIB.Vector2(prevPos.x,prevPos.y),new edsLIB.Vector2(prevPos.x+direction,baseY+setup.useraudioData[i]/heightMod)));
            prevPos=new edsLIB.Vector2(prevPos.x+direction,baseY+setup.useraudioData[i]/heightMod);
        }

        view=[];
        view=camera.look(dynamicBackground2);
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
function drawCube(ctx,startPos,size,ang)
{
    setup.analyserNode.getByteFrequencyData(setup.audioData);
    let totalLoudness =  setup.audioData.reduce((total,num) => total + num);
    let averageLoudness =  totalLoudness/(setup.analyserNode.fftSize/2);

    if(averageLoudness>size){
        size=averageLoudness/4;
    }
    startPos=new edsLIB.Vector2(startPos.x-(size/2),startPos.y);
    let vec1=new edsLIB.Vector2(startPos.x,startPos.y);
    let vec2=new edsLIB.Vector2(startPos.x+size,startPos.y);
    let vec3=new edsLIB.Vector2(startPos.x,startPos.y-size);
    let vec4=new edsLIB.Vector2(startPos.x+size,startPos.y-size);

    //rotate about centerPos
    let centerPos=new edsLIB.Vector2(startPos.x+(0.5*size),startPos.y-(0.5*size));//centerPos
    vec1=edsLIB.RotateAboutPoint(centerPos,vec1,ang);
    vec2=edsLIB.RotateAboutPoint(centerPos,vec2,ang);
    vec3=edsLIB.RotateAboutPoint(centerPos,vec3,ang);
    vec4=edsLIB.RotateAboutPoint(centerPos,vec4,ang);
    cubeBounds=[];

    cubeBounds.push(new classes.Boundary(vec1,vec2));
    cubeBounds.push(new classes.Boundary(vec1,vec3));
    cubeBounds.push(new classes.Boundary(vec2,vec4));
    cubeBounds.push(new classes.Boundary(vec3,vec4));
        
    let view=[];
    view=camera.look(cubeBounds);
    let color=new edsLIB.Vector3(edsLIB.getRandomInt(16, 255),edsLIB.getRandomInt(16, 255),edsLIB.getRandomInt(16, 255));
    let colorEnd=new edsLIB.Vector3(edsLIB.getRandomInt(16,20),edsLIB.getRandomInt(16,20),edsLIB.getRandomInt(16,20));
    for(let i=0; i<view.length;i++)
    {
        if(setup.Params.cubeGradient){
            ctx.save();
            let grd= ctx.createLinearGradient(width,0,width,height-150);
            grd.addColorStop(0, `#${color.x.toString(16).toUpperCase()}${color.y.toString(16).toUpperCase()}${color.z.toString(16).toUpperCase()}`);
            grd.addColorStop(1, `#${colorEnd.x.toString(16).toUpperCase()}${colorEnd.y.toString(16).toUpperCase()}${colorEnd.z.toString(16).toUpperCase()}`);
            ctx.fillStyle=grd;
            ctx.fillRect(i*(width/view.length)+width,150, (width/view.length), ((size)*4)*fov/view[i].distance);
            ctx.restore();
        }
        else{
            edsLIB.drawRectangle(ctx,i*(width/view.length)+width,150,(width/view.length),((size)*4)*fov/view[i].distance,`rgba(${color.x-view[i].distance},${color.y-view[i].distance},${color.z-view[i].distance},1)`);
        }
    }

}
let rotateCube=0;//incrementor that rotatescube
function draw(ctx)
{
    if(setup.Params.cameramove){
        let boundingrect=canvas.getBoundingClientRect();
        camera.move( new edsLIB.Vector2(edsLIB.xClient-boundingrect.x,edsLIB.yClient-boundingrect.y));
    }
    if(setup.Params.drawRays)
    {
        for(let dynamicbound of dynamicBackground)
        {
            dynamicbound.draw(ctx);
        }
        for(let dynamicbound of dynamicBackground2)
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
        drawDynamicBasicBackground(ctx,color,10,false);
        let amountOfCuts=2;
        for(let i=0;i<=amountOfCuts;i+=1)
        {
            for(let z=0;z<=amountOfCuts;z+=1)
            { 
                drawLineBasedDynamicBackground(ctx,300,150,i*height/amountOfCuts,z,color,1);
                drawLineBasedDynamicBackground(ctx,340,150,i*height/amountOfCuts,z,color,-1);
            }
        }
        drawCube(ctx,new edsLIB.Vector2(width/2,350),10,rotateCube*Math.PI/180);
        rotateCube+=35;
    }
    if(setup.Params.drawNotes){
        drawUICanvas(ctx);
        setup.noteManagerLowE.draw(ctx);
        setup.noteManagerA.draw(ctx);
        setup.noteManagerD.draw(ctx);
        setup.noteManagerG.draw(ctx);
        setup.noteManagerB.draw(ctx);
        setup.noteManagerHighE.draw(ctx);
        drawView(setup.noteManagerLowE,new edsLIB.Vector3(255,255,255),340);
        drawView(setup.noteManagerA,new edsLIB.Vector3(-255,255,255),300);
        drawView(setup.noteManagerD,new edsLIB.Vector3(255,-255,255),260);
        drawView(setup.noteManagerG,new edsLIB.Vector3(255,255,-255),220);
        drawView(setup.noteManagerB,new edsLIB.Vector3(-255,-255,255),180);
        drawView(setup.noteManagerHighE,new edsLIB.Vector3(255,-255,-255),140);
    }
    bitMapManipulation(ctx);
   
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
    setup.noteManagerLowE.move(deltaT/10);
    setup.noteManagerA.move(deltaT/10);
    setup.noteManagerD.move(deltaT/10);
    setup.noteManagerG.move(deltaT/10);
    setup.noteManagerB.move(deltaT/10);
    setup.noteManagerHighE.move(deltaT/10);
}

function bitMapManipulation(ctx)
{
    let imageData=ctx.getImageData(0,0,640*2,height);
    let data=imageData.data;
    let length = data.length;
    let width=imageData.width;
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i=0;i<length;i+=4){
		// C) randomly change every 20th pixel to red
        if(setup.BitmapParams.showNoise&& Math.random()<.05){
            data[i]=data[i+1]=data[i+2]=0;
            data[i]=0;
        } // end if
        if(setup.BitmapParams.invertColors)
        {
            let red=data[i],green=data[i+1],blue=data[i+2];
            data[i]=255-red;
            data[i+1]=255-green;
            data[i+2]=255-blue;
        }
        if(setup.BitmapParams.grayscale){
            //simple gray scale found on https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
            let r = data[i];
            let g = data[i+1];
            let b = data[i+2];
            let v = 0.2126*r + 0.7152*g + 0.0722*b;
            data[i] = data[i+1] = data[i+2] = v 
        }
        if(setup.BitmapParams.brightness){
            //simple brightness found on https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
            data[i] += setup.BitmapParams.adjustment;
            data[i+1] += setup.BitmapParams.adjustment;
            data[i+2] += setup.BitmapParams.adjustment;
        }
        if(setup.BitmapParams.threshold){
            //simple threshold found on https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
            let r = data[i];
            let g = data[i+1];
            let b = data[i+2];
            let v = (0.2126*r + 0.7152*g + 0.0722*b >= setup.BitmapParams.thresholdMod) ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = v
        }
    } // end for
    if(setup.BitmapParams.showEmboss){
        for(let i=0; i<length;i++){
            if(i%4==3)continue;
            data[i]=127+2*data[i]-data[i+4]-data[i+width*4];
        }
    }

    if(setup.BitmapParams.sharpen) 
    {
    //from https://stackoverflow.com/questions/20316680/javascript-sharpen-image-and-edge-detection-not-working
    let weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
        katet = Math.round(Math.sqrt(weights.length)),
        half = (katet * 0.5) | 0,
        dstData = ctx.createImageData(width*2, height),
        dstBuff = dstData.data,
        srcBuff = ctx.getImageData(0, 0, width*2, height).data,
        y = height,
        mix=0.1;

        while (y--) {

            let x = width;

            while (x--) {

                let sy = y,
                    sx = x,
                    dstOff = (y * width*2 + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;

                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {

                        var scy = sy + cy - half;
                        var scx = sx + cx - half;

                        if (scy >= 0 && scy < height && scx >= 0 && scx < width*2) {

                            var srcOff = (scy * width*2 + scx) * 4;
                            var wt = weights[cy * katet + cx];

                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }
                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix)
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx.putImageData(dstData, 0, 0);
    }

    
    // D) copy image data back to canvas
    ctx.putImageData(imageData,0,0);
}

let basetime=Date.now();
let fpsCap=1000/60;
function update(){
    let now=Date.now();
    let check=now-basetime;
    if(check/fpsCap>=1){
        basetime=now;
            edsLIB.cls(ctx,width,height); 
            draw(ctx);
            setup.setupTime();
        if(setup.Params.drawNotes){
            moveNotes(check);
        }
    }
    requestAnimationFrame(update);
}
export{init,ctx,camera}