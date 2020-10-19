import * as edsLIB from './edsLIB.js';
import {Params}  from './setup.js';
import {ctx} from  "./index.js";
//Demo for 2.5D from the coding train so a lot of the structure and code of 2.5D stuff is based on that
//Redone to suit my needs also uses my personal library functions instead of p5.js like normalize2D etc.
//https://www.youtube.com/watch?v=TOEi6T2mtHo
//left redundant to note class
let cutOffDistancePlaySound=350;

class Boundary{
    constructor(vecA,vecB){
        this.a=vecA;
        this.b=vecB;
    }

    draw(ctx)
    {
        edsLIB.drawLine(ctx, this.a.x, this.a.y, this.b.x, this.b.y,1,"white");
    }
}

class Note{
    constructor(vecA,vecB,noteInt){
        this.a=vecA;
        this.b=vecB;
        this.noteInt=noteInt;
    }

    draw(ctx)
    {
        edsLIB.drawLine(ctx, this.a.x, this.a.y, this.b.x, this.b.y,1,"red");
    }
}

class NoteManager{
    constructor(tablature){
        this.noteIntBuffer=this.createNoteIntBuffer(tablature);
        this.drawQueue=[];
        this.createNotes(this.noteIntBuffer);
    }
    //simply converts tablature to numbers so can be used in typed array
    createNoteIntBuffer(tablature)
    {
        //converts to ascii
        let asciiBufferToFill=new Int8Array(tablature.length);
        for(let i=0;i<tablature.length;i++)
        {
            asciiBufferToFill[i]=tablature.charCodeAt(i);
            //remove redundant
            if(!(48<=asciiBufferToFill[i]&&57>=asciiBufferToFill[i]))//0-9
            {
                asciiBufferToFill[i]=0;//null in ascii
            }
        }
        return asciiBufferToFill;
    }
    createNotes(noteIntBuffer){
        //create a new note and push to drawQueue
        for(let i=0; i<noteIntBuffer.length;i++)
        {
            let noteInt=noteIntBuffer[i];
            let vertA=new edsLIB.Vector2(255+(noteInt-49)*20,-i*48);
            let vertB=new edsLIB.Vector2(255+(noteInt-49)*20+10,-i*48);
            let note= new Note(vertA,vertB,noteInt);
            this.drawQueue.push(note);
        }
    }

    move(deltaTime)
    {
        for(let i=0;i<this.drawQueue.length;i++)
        {
            this.drawQueue[i].a.y+=deltaTime;
            this.drawQueue[i].b.y+=deltaTime;
            if(this.drawQueue[i].a.y>=cutOffDistancePlaySound)
            {
                //audioElement = document.querySelector('audio');//this where audio is played set at certain time
                //audioElement.currentTime=this.drawQueue[i].noteInt-20;
                this.drawQueue.splice(i,1);
            }
        }
    }

    draw(ctx)
    {

        for(let i=0;i<this.drawQueue.length;i++)
        {
            if(this.drawQueue[i].noteInt!=0)
            {
                this.drawQueue[i].draw(ctx);
            }
        }
    }
}

class Ray2D{//takes in two vector2
    constructor(pos,dir)
    {
        this.pos=pos;
        this.dir=dir;
    }
    lookAt(x,y){//sets dir based on values inputted
        this.dir.x=x-this.pos.x;
        this.dir.y=y-this.pos.y;
        this.dir= edsLIB.normalize2D(this.dir);
    }

    draw(ctx){
            edsLIB.drawLine(ctx,this.pos.x,this.pos.y,this.pos.x+this.dir.x,this.pos.y+this.dir.y,1,"white");
    }
    cast(bound){     
        //pertinant data points
        let x1=bound.a.x;
        let y1=bound.a.y;
        let x2=bound.b.x;
        let y2=bound.b.y;

        let x3=this.pos.x;
        let y3=this.pos.y;
        let x4=this.pos.x+this.dir.x;
        let y4=this.pos.y+this.dir.y;

        //basic intersection check
        let den=((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
        if(den==0){//just incase parrallel/den=0
            return;
        }
        let t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/den;
        let u=-((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3))/den;
        if(t>0&&t<1&& u>0)
        {
            let pt=new edsLIB.Vector2(0,0);
            pt.x=x1+t*(x2-x1);
            pt.y=y1+t*(y2-y1);
            return pt;
        }
        return;
        
    }
}
let increment=135;//straight up at 90fov is 135
class Camera
{
    constructor(pos,fov,rayIncrem)
    {
        this.rayIncrem=rayIncrem;
        this.fov=fov;
        this.pos=pos;
        this.rays=[];
        for(let i=-this.fov/2;i<this.fov;i+=this.rayIncrem){
            let ang=i*(Math.PI/180); ;
            let dir=new edsLIB.Vector2((Math.sin(ang) +  Math.cos(ang)),(Math.cos(ang) - Math.sin(ang)));
            dir= edsLIB.normalize2D(dir);
            this.rays.push(new Ray2D(this.pos,dir));
        }
    }
    move(pos)
    {
        this.pos=pos;
    }
    look(bounds){
        let view=[];
        let i=0;
        for(let ray of this.rays)
        {
            let closest=null;
            let record=Infinity;
            for(let bound of  bounds){
                if(bound.noteInt!=0){//make sure not blank note
                    let pt=ray.cast(bound);
                    if(pt){
                        let d= edsLIB.distanceBetweenVectors(this.pos,pt);
                        if(record>d){
                            record=d;
                            closest=pt;
                        }
                    }
                }
            }
            if(closest&&Params.drawRays){
                edsLIB.drawLine(ctx,this.pos.x,this.pos.y,closest.x,closest.y,1,"white");
            }
            view[i]=record;
            i++;
        }
        return view;
    }
    drawRays(ctx)
    {
        this.rays=[];
        for(let i=-this.fov/2;i<this.fov/2;i+=this.rayIncrem){
            let ang=(i+increment)*(Math.PI/180); 
            let dir=new edsLIB.Vector2((Math.sin(ang) +  Math.cos(ang)),(Math.cos(ang) - Math.sin(ang)));
            dir= edsLIB.normalize2D(dir);
            dir.x=dir.x*20;
            dir.y=dir.y*20;
            this.rays.push(new Ray2D(this.pos,dir)); 
        }
        for(let ray of this.rays)
        {
            ray.draw(ctx);
        }
    }
}
export{Boundary,Note,NoteManager,Ray2D,Camera}