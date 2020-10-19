import * as edsLIB from './edsLIB.js';
import * as classes from './classes.js';
import {camera} from "./index.js";
const Params={
    cameramove:false,
    userAudio:false,
    drawRays:true,
    drawNotes:false,
    drawDynBackground:true
};
let boundaries=[];//used to set up frets
let cutOffDistanceFrets=350;//set distance that frets appear at


function setupUI()
{
    let bassSlider=document.querySelector("#bass");
    bassSlider.oninput=e=>{
        bassBiquad.gain.value = bassSlider.value;
    };
    let userbassSlider=document.querySelector("#userBass");
    userbassSlider.oninput=e=>{
        userbassBiquad.gain.value = userbassSlider.value;
    };


    let midSlider=document.querySelector("#mid");
    midSlider.oninput=e=>{
        midBiquad.gain.value = midSlider.value;
       // usermidBiquad.gain.value = midSlider.value;
    };
    let usermidSlider=document.querySelector("#usermid");
    usermidSlider.oninput=e=>{
        usermidBiquad.gain.value = usermidSlider.value;
    };


    let trebleSlider=document.querySelector("#treble");
    trebleSlider.oninput=e=>{
        trebleBiquad.gain.value = trebleSlider.value;
    };
    let usertrebleSlider=document.querySelector("#usertreble");
    usertrebleSlider.oninput=e=>{
        usertrebleBiquad.gain.value = usertrebleSlider.value;
    };

    let highpassSlider=document.querySelector("#highpass");
    highpassSlider.oninput=e=>{
       highpassBiquad.frequency.value = highpassSlider.value;
    };

    let userhighpassSlider=document.querySelector("#userhighpass");
    userhighpassSlider.oninput=e=>{
       userhighpassBiquad.frequency.value = userhighpassSlider.value;
    };

    let detuneSlider=document.querySelector("#detune");
    detuneSlider.oninput=e=>{
        bassBiquad.detune.value = detuneSlider.value;
        midBiquad.detune.value = detuneSlider.value;
        trebleBiquad.detune.value = detuneSlider.value;
    };

    let userdetuneSlider=document.querySelector("#userdetune");
    userdetuneSlider.oninput=e=>{
       userbassBiquad.detune.value = userdetuneSlider.value;
        usermidBiquad.detune.value = userdetuneSlider.value;
       usertrebleBiquad.detune.value = userdetuneSlider.value;
    };
    let volumeSlider=document.querySelector("#volume");
    volumeSlider.oninput=e=>{
        gainNode.gain.value = volumeSlider.value;
    };

    let uservolumeSlider=document.querySelector("#uservolume");
    uservolumeSlider.oninput=e=>{
        userGainNode.gain.value = uservolumeSlider.value;
    };


    // let rayIncremSlider=document.querySelector("#rayIncrem");
    // rayIncremSlider.oninput=e=>{
    //     rayIncrem= rayIncremSlider.value;
    //     camera=new Camera(camera.pos,fov,rayIncrem);
    // };

    let cameraCheckBox=document.querySelector("#camera");
    cameraCheckBox.checked=false;
    cameraCheckBox.onchange=e=>{
        Params.cameramove=!Params.cameramove;
    };

    let userAudioCheckBox=document.querySelector("#userAudiobox");
    userAudioCheckBox.checked=false;
    userAudioCheckBox.onchange=e=>{
        Params.userAudio=!Params.userAudio;
        if(Params.userAudio){
            setupUserAudio();
        }
        else{
            userAudioCtx.close();
        }
    };

    let drawRaysCheckBox=document.querySelector("#drawRays");
    drawRaysCheckBox.checked=true;
    drawRaysCheckBox.onchange=e=>{
        Params.drawRays=!Params.drawRays;
    };

    let drawNotesCheckBox=document.querySelector("#drawNotes");
    drawNotesCheckBox.checked=false;
    drawNotesCheckBox.onchange=e=>{
        Params.drawNotes=!Params.drawNotes;
    };

    let drawDynCheckBox=document.querySelector("#drawDynamic");
    drawDynCheckBox.checked=true;
    drawDynCheckBox.onchange=e=>{
        Params.drawDynBackground=!Params.drawDynBackground;
    };
}

function setupUICanvas()
{
    for(let i=0; i<24;i++)
    {
       // if(i<12){
            boundaries[i]=new classes.Boundary(new edsLIB.Vector2(i*20+100,cutOffDistanceFrets),new edsLIB.Vector2(i*20+101,cutOffDistanceFrets));
        //}
        //else{ boundaries[i]=new Boundary(new Vector2(i*20+100,cutOffDistance-i*3+66),new Vector2(i*20+101,cutOffDistance-i*3+66));}
    }

    for(let i=0; i<6;i++)
    {
       // if(i<12){
            boundaries[i+24]=new classes.Boundary(new edsLIB.Vector2(i*20+100,cutOffDistanceFrets),new edsLIB.Vector2(i*20+101,cutOffDistanceFrets));
        //}
        //else{ boundaries[i]=new Boundary(new Vector2(i*20+100,cutOffDistance-i*3+66),new Vector2(i*20+101,cutOffDistance-i*3+66));}
    }
}

//audio stuff
//embedded audio///////////////////////////////////////////
let audioCtx;
let sourceNode, analyserNode,gainNode;//needed nodes
let bassBiquad, midBiquad, trebleBiquad,highpassBiquad;
let audioData;//frequency data
let audioElement; //audio element
function setupAudio()
{
    // this is a typed array to hold the audio frequency data
    //The || is because WebAudio has not been standardized across browsers yet
    audioCtx =new (window.AudioContext|| window.webkitAudioContext);
    // 4 - create an a source node that points at the <audio> element
    audioElement = document.querySelector('#embeddedAudio');
    audioElement.currentTime=10;

    sourceNode=audioCtx.createMediaElementSource(audioElement);

    bassBiquad=audioCtx.createBiquadFilter();
    bassBiquad.type = "lowshelf";
    bassBiquad.frequency.value = 1000;
    bassBiquad.gain.value = 1;
    bassBiquad.detune.value = 1;

    midBiquad=audioCtx.createBiquadFilter();
    midBiquad.type = "peaking";
    midBiquad.frequency.value = 1000;
    midBiquad.gain.value = 1;
    midBiquad.detune.value = 1;

    trebleBiquad=audioCtx.createBiquadFilter();
    trebleBiquad.type = "highshelf";
    trebleBiquad.frequency.value = 2000;
    trebleBiquad.gain.value = 1;
    trebleBiquad.detune.value = 1;

    highpassBiquad=audioCtx.createBiquadFilter();
    highpassBiquad.type = "highpass";
    highpassBiquad.frequency.value = 0;
    highpassBiquad.gain.value = 1;
    highpassBiquad.detune.value = 1;

    analyserNode=audioCtx.createAnalyser();
    analyserNode.fftSize=256;
    audioData=new Uint8Array(analyserNode.fftSize);

    gainNode=audioCtx.createGain();
    gainNode.gain.value=1;


    sourceNode.connect(bassBiquad);
    bassBiquad.connect(midBiquad);
    midBiquad.connect(trebleBiquad);
    trebleBiquad.connect(highpassBiquad);
    highpassBiquad.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    
    document.querySelector("#embeddedAudio").onplay = (e) => {
        if (audioCtx.state == "suspended") {
            //play=false;
        }
        //play=true;
    };      
}

//user audio////////////////////////////////////////////////////////////////////////
let userAudioCtx;
let userGainNode;
let userSourceNode;
let userAnalyserNode;
let useraudioData;
let userbassBiquad, usermidBiquad, usertrebleBiquad,userhighpassBiquad;
function setupUserAudio()
{
    const userAudio=document.querySelector("#userAudio");
    let devices;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices = devices.filter((d) => d.kind === 'audioinput');
    });

    const handleSuccess=function(stream)
    {
        userAudio.srcObject=stream;

        const AudioContext=window.AudioContext|| window.webkitAudioContext;
        userAudioCtx= new AudioContext();
        userSourceNode=userAudioCtx.createMediaStreamSource(stream);
        
        userAnalyserNode=userAudioCtx.createAnalyser();
        userAnalyserNode.fftSize=256;
        useraudioData=new Uint8Array(userAnalyserNode.fftSize);

        userbassBiquad=userAudioCtx.createBiquadFilter();
        userbassBiquad.type = "lowshelf";
        userbassBiquad.frequency.value = 1000;
        userbassBiquad.gain.value = 1;
        userbassBiquad.detune.value = 1;

        usermidBiquad=userAudioCtx.createBiquadFilter();
        usermidBiquad.type = "peaking";
        usermidBiquad.frequency.value = 1000;
        usermidBiquad.gain.value = 1;
        usermidBiquad.detune.value = 1;

        usertrebleBiquad=userAudioCtx.createBiquadFilter();
        usertrebleBiquad.type = "highshelf";
        usertrebleBiquad.frequency.value = 2000;
        usertrebleBiquad.gain.value = 1;
        usertrebleBiquad.detune.value = 1;


        userhighpassBiquad=userAudioCtx.createBiquadFilter();
        userhighpassBiquad.type = "highpass";
        userhighpassBiquad.frequency.value = 0;
        userhighpassBiquad.gain.value = 1;
        userhighpassBiquad.detune.value = 1;


        userGainNode=userAudioCtx.createGain();
        userGainNode.gain.value=1;

        // 8 - connect the nodes - we now have an audio graph
        userSourceNode.connect(userbassBiquad);
        userbassBiquad.connect(usermidBiquad);
        usermidBiquad.connect(usertrebleBiquad);
        usertrebleBiquad.connect(userhighpassBiquad);
        userhighpassBiquad.connect(userGainNode);
        userGainNode.connect(userAnalyserNode);
        userAnalyserNode.connect(userAudioCtx.destination);
            
    }
    navigator.mediaDevices.getUserMedia({audio: true}).then(handleSuccess);
}

export{Params,analyserNode,audioData,userAnalyserNode,useraudioData,boundaries,setupUI,setupUICanvas,setupAudio,setupUserAudio}