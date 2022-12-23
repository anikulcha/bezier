const config = {
    waveSpeed : 1,
    wavesToBlade : 4,
    curvesNum : 13,
    framesToMove : 120
}

class waveNoise{
    constructor (){
        this.waveSet = []
    }
    addWaves(requiredWaves){
        for(let i = 0; i < requiredWaves; ++i){
            let randomAngle = Math.random() * 360;
            this.waveSet.push(randomAngle);
        }
    }
    getWave(){
        let blendedWave = 0;
        for(let e of this.waveSet){
            blendedWave += Math.sin(e / 180 * Math.PI);
        }
        return (blendedWave / this.waveSet.length + 1) / 2;
    }
    update(){
        this.waveSet.forEach((e, i) => {
            let r = Math.random() * (i + 1) * config.waveSpeed;
            this.waveSet[i] = (e + r) % 360;
        })
    }
}

class Animation {
    constructor (){
        this.cnv = null;
        this.ctx = null;
        this.size = {width: 0, height: 0, cx: 0, cy: 0};
        this.controls = [];
        this.controlsNum = 3;
        this.framesCounter = 0;
        this.type4Start = 0;
        this.type4End = 0;
    }
    init(){
        this.createCanvas();
        this.createControls();
        this.updateAnimation();

    }
    createCanvas(){
        this.cnv = document.createElement('canvas');
        this.ctx = this.cnv.getContext('2d');
        this.setCanvasSize();
        document.body.appendChild(this.cnv);
        window.addEventListener('resize', () => this.setCanvasSize());
    }
    setCanvasSize(){
        this.size.width = this.cnv.width = window.innerWidth; // window.innerWidth
        this.size.height = this.cnv.height = window.innerHeight; // window.innerHeight
        this.size.cx = this.size.width / 2;
        this.size.cy = this.size.height / 2;
    }
    createControls(){
        for(let i = 0; i < this.controlsNum + config.curvesNum; ++i){
            let control = new waveNoise();
            control.addWaves(config.wavesToBlade);
            this.controls.push(control);

        }
    }
    updateCurves(){
        let c = this.controls;
        let _controlX1 = c[0].getWave() * this.size.width; 
        let _controlY1 = c[1].getWave() * this.size.height; 
        let _controlX2 = c[2].getWave() * this.size.width; 
        for(let i = 0; i < config.curvesNum; ++i){
            let _controlY2 = c[3 + i].getWave(); 
            let paramCurve = {
                startX : 0,
                startY : this.getYPlacementType(this.type4Start, i),
                controlX1: _controlX1,
                controlY1: _controlY1,
                controlX2: _controlX2,
                controlY2: _controlY2 * this.size.height,
                endX: this.size.width,
                endY: this.getYPlacementType(this.type4End, i),
                alpha : _controlY2
            }
            this.drawCurve(paramCurve)
        }
        
    }
    drawCurve({startX, startY, controlX1, controlY1, controlX2, controlY2, endX, endY, alpha}){
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.bezierCurveTo(controlX1,controlY1, controlX2, controlY2, endX, endY);
        this.ctx.stroke();
    }
    updateCanvas(){
        this.ctx.fillStyle = `rgb(22, 22, 55)`;
        this.ctx.fillRect(0, 0, this.size.width, this.size.height);
    }
    updateControls(){
        this.controls.forEach(e => e.update());
    }
    getYPlacementType(type, i){
        if(type > .6){
            // config.curvesNum += 1;
            return this.size.height / config.curvesNum * i;
        } else if(type > .4){
            return this.size.height;
        } else if(type > .2){
            return this.size.cy;
        } else{
            return 0;
        }
    }
    updateFrameCounter(){
        this.framesCounter = (this.framesCounter + 1) % config.framesToMove;
        if(this.framesCounter === 0){
            this.type4Start = Math.random();
            this.type4End = Math.random()
        }
    }
    updateAnimation(){
        this.updateFrameCounter();
        this.updateCanvas();
        this.updateCurves();
        this.updateControls();
        window.requestAnimationFrame(() => this.updateAnimation())
    }
}

window.onload = () => {new Animation().init()}