declare var require: any;
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
var OrbitControls = require('three-orbit-controls')(THREE);

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  @ViewChild('rendererContainer') public rendererContainer: ElementRef;
  camera;
  renderer;
  scene;
  pointLight;
  controls;

  constructor() { }

  ngOnInit() {

  }

}

/*
  ngAfterViewInit() {

    let width = this.rendererContainer.nativeElement.offsetWidth;
    let height = this.rendererContainer.nativeElement.offsetHeight;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x505050);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);

    this.controls = new OrbitControls(this.camera);
    //this.controls.target = new THREE.Vector3(1, 1, 0);
    this.camera.position.set(1, 1, 5);

    let material = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
    material.transparent = true;
    material.opacity = 0.3;
    let material2 = new THREE.MeshBasicMaterial({ color: 0xccff33 });
    material2.transparent = true;
    material2.opacity = 0.3;

    let geometry = new THREE.BoxGeometry(2, 1, 1);
    let geometry2 = new THREE.BoxGeometry(1, 1, 1);
    let geometry3 = new THREE.BoxGeometry(1, 2, 1);

    let cube = new THREE.Mesh(geometry, material);
    let cube2 = new THREE.Mesh(geometry2, material2);
    let cube3 = new THREE.Mesh(geometry3, material2);

    cube2.position.set(1.5, 0, 0);
    cube3.position.y = 1.5;


    this.scene.add(cube);
    this.scene.add(cube2);
    this.scene.add(cube3);

    this.pointLight = new THREE.PointLight(0xffffff)
    this.pointLight.position.x = 10;
    this.pointLight.position.y = 20;
    this.pointLight.position.z = 40;

    this.camera.add(this.pointLight);

    this.scene.add(this.camera);

    this.controls.update();

    let animate = () => {
      requestAnimationFrame(animate);

      this.controls.update();

      this.renderer.render(this.scene, this.camera);

    };

    animate();


  }
  */