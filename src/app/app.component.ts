import {Component, OnInit} from '@angular/core';
// @ts-ignore
import {fabric} from 'fabric';
// @ts-ignore
import createTransition from "gl-transition";
// @ts-ignore
import createTexture from "gl-texture2d";
// @ts-ignore
import transitions from 'gl-transitions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

// EXAMPLES of transition implementation
// https://codesandbox.io/s/gl-transition-forked-dr8h0?file=/src/index.js
// https://www.npmjs.com/package/gl-transition


export class AppComponent implements OnInit {
  title = 'gl-test-app';
  canvas: fabric.Canvas | undefined;
  videos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  ];

  videoElements: any[] = [];

  constructor() {
  }


  ngOnInit(): void {
    this.canvas = new fabric.Canvas('canvas', {
      backgroundColor: '#000',
    });

    this.addNewVideoToCanvas(this.videos[0], this);
    this.addNewVideoToCanvas(this.videos[1], this);
    this.loop(this);
  }

  playVideos() {
    for (const videoElement of this.videoElements) {
      videoElement.play();
    }
    this.testTransitions();
  }


  private addNewVideoToCanvas(videoUrl: string, _this: any,): void {
    console.log('Add new video')
    const video: HTMLVideoElement = this.getVideoElement(videoUrl);
    video.addEventListener(
      'loadedmetadata',
      function () {
        video.width = this.videoWidth;
        video.height = this.videoHeight;
        video.muted = true;
        video.crossOrigin = 'anonymous';
        const fabVideo: any = new fabric.Image(video, {
          left: 0,
          top: 0,
          width: video.width,
          height: video.height,
          scaleX: 0.3,
          scaleY: 0.3,
          crossOrigin: 'anonymous'
        });
        _this.canvas.add(fabVideo);
        _this.videoElements.push(video);
      });
  }


  private getVideoElement(url: string): HTMLVideoElement {
    const videoElement = document.createElement('video');
    const source = document.createElement('source');
    source.src = url;
    source.type = 'video/mp4';
    videoElement.appendChild(source);
    return videoElement;
  }


  private loop(_this: any) {
    fabric.util.requestAnimFrame(function render() {
      // console.log('render');
      _this.canvas.requestRenderAll();
      fabric.util.requestAnimFrame(render);
    });
  }


  private testTransitions() {
    // const canvas = document.createElement('canvas');
    // document.body.appendChild(canvas);
    // canvas.width = 500;
    // canvas.height = 400;
    // canvas.style.position = 'absolute';
    // canvas.style.top = '0';
    // canvas.style.zIndex = '9999999';

    if (!this.canvas) {
      console.log("return");
      return};
    // const gl : any = this.canvas.getContext('webgl');  
    const gl : any = this.canvas.getContext();
    if (!gl) {
      console.log('No GL');
      return;
    }
    const canvasObjects = this.canvas.getObjects();
    Promise.all(canvasObjects).then((canvasVideos) => {
      // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 4, 4, -1]), // see a-big-triangle
        gl.STATIC_DRAW
      );
      gl.viewport(0, 0, 500, 500);

      const from = createTexture(gl, canvasVideos[0]);
      from.minFilter = gl.LINEAR;
      from.magFilter = gl.LINEAR;

      const to = createTexture(gl, canvasVideos[1]);
      to.minFilter = gl.LINEAR;
      to.magFilter = gl.LINEAR;

      const transition = createTransition(
        gl,
        transitions.find((t: any) => t.name === 'cube')
      ); // https://github.com/gl-transitions/gl-transitions/blob/master/transitions/cube.glsl
      if (!this.canvas) {
        console.log("return");
        return};
      transition.draw(5, from, to, this.canvas.width, this.canvas.height, {
        persp: 1.5,
        unzoom: 0.6,
      });
    });
  }
}
