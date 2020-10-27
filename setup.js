import * as edsLIB from './edsLIB.js';
import * as classes from './classes.js';
import {camera} from "./main.js";
const Params={
    cameramove:false,
    userAudio:false,
    drawRays:true,
    drawNotes:false,
    drawDynBackground:true,
    cubeGradient:false    
};

const BitmapParams={
    showNoise:false,
    invertColors:false,
    showEmboss:false,
    sharpen:false,
    grayscale:false,
    brightness:false,
    adjustment:0,
    threshold:false,
    thresholdMod:100
}

let boundaries=[];//used to set up frets
let cutOffDistanceFrets=350;//set distance that frets appear at

//Tablature to send to index
//note stuff
let lowETablature=    "1111111---------";
let ATablature=       "2222222---------";//make sure same length
let DTablature=       "3333333---------";
let GTablature=       "4444444---------";
let BTablature=       "5555555---------";
let highETablature=   "6666666---------";

//needed to export in order to draw didn't what to make export statement at bottom too long
export let noteManagerLowE= new classes.NoteManager(lowETablature);
export let noteManagerA= new classes.NoteManager(ATablature);
export let noteManagerD= new classes.NoteManager(DTablature);
export let noteManagerG= new classes.NoteManager(GTablature);
export let noteManagerB= new classes.NoteManager(BTablature);
export let noteManagerHighE= new classes.NoteManager(highETablature);


function setupUI()
{
    //bass
    let bassSlider=document.querySelector("#bass");
    let bassText=document.querySelector("#bassText");
    bassSlider.oninput=e=>{
        bassBiquad.gain.value = bassSlider.value;
        bassText.innerHTML=bassSlider.value;
    };
    let userbassSlider=document.querySelector("#userBass");
    let bassuserText=document.querySelector("#bassuserText");
    userbassSlider.oninput=e=>{
        userbassBiquad.gain.value = userbassSlider.value;
        bassuserText.innerHTML=userbassSlider.value;
    };

    //mid
    let midSlider=document.querySelector("#mid");
    let midText=document.querySelector("#midText");
    midSlider.oninput=e=>{
        midBiquad.gain.value = midSlider.value;
        midText.innerHTML=midSlider.value;
    };
    let usermidSlider=document.querySelector("#usermid");
    let miduserText=document.querySelector("#miduserText");
    usermidSlider.oninput=e=>{
        usermidBiquad.gain.value = usermidSlider.value;
        miduserText.innerHTML=usermidSlider.value;
    };

    //treble
    let trebleSlider=document.querySelector("#treble");
    let trebleText=document.querySelector("#trebleText");
    trebleSlider.oninput=e=>{
        trebleBiquad.gain.value = trebleSlider.value;
        trebleText.innerHTML=trebleSlider.value;
    };
    let usertrebleSlider=document.querySelector("#usertreble");
    let trebleuserText=document.querySelector("#trebleuserText");
    usertrebleSlider.oninput=e=>{
        usertrebleBiquad.gain.value = usertrebleSlider.value;
        trebleuserText.innerHTML=usertrebleSlider.value;
    };
    //mute
    let highpassSlider=document.querySelector("#highpass");
    let muteText=document.querySelector("#muteText");
    highpassSlider.oninput=e=>{
       highpassBiquad.frequency.value = highpassSlider.value;
       muteText.innerHTML=highpassSlider.value;
    };

    let userhighpassSlider=document.querySelector("#userhighpass");
    let muteuserText=document.querySelector("#muteuserText");
    userhighpassSlider.oninput=e=>{
       userhighpassBiquad.frequency.value = userhighpassSlider.value;
       muteuserText.innerHTML=userhighpassSlider.value;
    };
    //detune
    let detuneSlider=document.querySelector("#detune");
    let detuneText=document.querySelector("#detuneText");
    detuneSlider.oninput=e=>{
        bassBiquad.detune.value = detuneSlider.value;
        midBiquad.detune.value = detuneSlider.value;
        trebleBiquad.detune.value = detuneSlider.value;
        detuneText.innerHTML=detuneSlider.value;
    };

    let userdetuneSlider=document.querySelector("#userdetune");
    let detuneuserText=document.querySelector("#detuneuserText");
    userdetuneSlider.oninput=e=>{
       userbassBiquad.detune.value = userdetuneSlider.value;
        usermidBiquad.detune.value = userdetuneSlider.value;
       usertrebleBiquad.detune.value = userdetuneSlider.value;
       detuneuserText.innerHTML=userdetuneSlider.value;
    };

    //volume
    let volumeSlider=document.querySelector("#volume");
    let volumeText=document.querySelector("#volumeText");
    volumeSlider.oninput=e=>{
        gainNode.gain.value = volumeSlider.value;
        volumeText.innerHTML=volumeSlider.value;
    };
    let uservolumeSlider=document.querySelector("#uservolume");
    let volumeuserText=document.querySelector("#volumeuserText");
    uservolumeSlider.oninput=e=>{
        userGainNode.gain.value = uservolumeSlider.value;
        volumeuserText.innerHTML= uservolumeSlider.value;
    };

    //camera movement
    let cameraCheckBox=document.querySelector("#camera");
    cameraCheckBox.checked=false;
    cameraCheckBox.onchange=e=>{
        Params.cameramove=!Params.cameramove;
    };

    //enable user audio
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

    //draw rays
    let drawRaysCheckBox=document.querySelector("#drawRays");
    drawRaysCheckBox.checked=true;
    drawRaysCheckBox.onchange=e=>{
        Params.drawRays=!Params.drawRays;
    };

    //draw gradient on cube
    let cubeGradientBox=document.querySelector("#cubeGradient");
    cubeGradientBox.checked=false;
    cubeGradientBox.onchange=e=>{
        Params.cubeGradient=!Params.cubeGradient;
    };
    //drawnotes
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


    //filters
    let showNoiseBox=document.querySelector("#showNoise");
    showNoiseBox.checked=false;
    showNoiseBox.onchange=e=>{
        BitmapParams.showNoise=!BitmapParams.showNoise;
    };

    let showEmbossBox=document.querySelector("#showEmboss");
    showEmbossBox.checked=false;
    showEmbossBox.onchange=e=>{
        BitmapParams.showEmboss=!BitmapParams.showEmboss;
    };

    let invertColorsBox=document.querySelector("#invertColors");
    invertColorsBox.checked=false;
    invertColorsBox.onchange=e=>{
        BitmapParams.invertColors=!BitmapParams.invertColors;
    };

    let grayscaleBox=document.querySelector("#grayscale");
    grayscaleBox.checked=false;
    grayscaleBox.onchange=e=>{
        BitmapParams.grayscale=!BitmapParams.grayscale;
    };

    let sharpenBox=document.querySelector("#sharpen");
    sharpenBox.checked=false;
    sharpenBox.onchange=e=>{
        BitmapParams.sharpen=!BitmapParams.sharpen;
    };

    let brightnessBox=document.querySelector("#brightness");
    brightnessBox.checked=false;
    brightnessBox.onchange=e=>{
        BitmapParams.brightness=!BitmapParams.brightness;
    };

    let brightnessSlider=document.querySelector("#brightnessSlider");
    let brightnessText=document.querySelector("#brightnessText");
    brightnessSlider.oninput=e=>{
        BitmapParams.adjustment = brightnessSlider.value;
        brightnessText.innerHTML=brightnessSlider.value;
    };

    let thresholdBox=document.querySelector("#threshold");
    thresholdBox.checked=false;
    thresholdBox.onchange=e=>{
        BitmapParams.threshold=!BitmapParams.threshold;
    };

    let thresholdSlider=document.querySelector("#thresholdSlider");   
    let thresholdText=document.querySelector("#thresholdText");
    thresholdSlider.oninput=e=>{
        BitmapParams.thresholdMod = thresholdSlider.value;
        thresholdText.innerHTML=thresholdSlider.value;
    };
    setupTablature();
}

function setupTablature(){
    let lowEText=document.querySelector("#lowEText");
    lowEText.oninput=e=>{
        lowETablature=lowEText.value;
        noteManagerLowE= new classes.NoteManager(lowETablature);
    };

    let AText=document.querySelector("#Atext");
    AText.oninput=e=>{
        ATablature=AText.value;
        noteManagerA= new classes.NoteManager(ATablature);
    };
    let DText=document.querySelector("#Dtext");
    DText.oninput=e=>{
        DTablature=DText.value;
        noteManagerD= new classes.NoteManager(DTablature);
    };
    let GText=document.querySelector("#Gtext");
    GText.oninput=e=>{
        GTablature=GText.value;
        noteManagerG= new classes.NoteManager(GTablature);
    };
    let BText=document.querySelector("#Btext");
    BText.oninput=e=>{
        BTablature=BText.value;
        noteManagerB= new classes.NoteManager(BTablature);
    };
    let highEText=document.querySelector("#highEText");
    highEText.oninput=e=>{
        highETablature=highEText.value;
        noteManagerHighE= new classes.NoteManager(highETablature);
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
    
    let play=document.querySelector("#play");
    play.onclick=e=>{
        audioElement.play();
    };

    let trackSelect=document.querySelector("#trackSelect");
    trackSelect.onchange=e=>{
        audioElement.src=e.target.value;
        audioElement.play();    
    };

    let pause=document.querySelector("#pause");
    pause.onclick=e=>{
        audioElement.pause();
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

let p=document.querySelector("#time");
//also used to update when running
function setupTime(){
    let secCurrentTime=parseInt(audioElement.currentTime%60)+"";
    let secDurationTime=parseInt(audioElement.duration%60)+"";
    if(secCurrentTime.length==1)
    {
        secCurrentTime="0"+secCurrentTime;
    }
    if(secDurationTime.length==1)
    {
        secDurationTime="0"+secDurationTime;
    }

    p.innerHTML=parseInt(audioElement.currentTime/60)+":"+secCurrentTime+"/"+parseInt(audioElement.duration/60)+":"+secDurationTime;
}

export{setupTime,BitmapParams,Params,analyserNode,audioData,userAnalyserNode,useraudioData,boundaries,setupUI,setupUICanvas,setupAudio,setupUserAudio}