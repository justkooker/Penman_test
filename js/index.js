"use strict";

const drone = document.getElementById("drone");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");

let animationFrame;
let isFlying = false;
let lastX = window.innerWidth / 2 - drone.clientWidth / 2;
let lastY = window.innerHeight / 2 - drone.clientHeight / 2;
let previousTimestamp = null;
let data = [];
let currentIndex = 0;


const scaleFactor = 0.003;

async function loadData() {
  const response = await fetch("data.json");
  data = await response.json();
}

function moveDrone(timestamp) {
  if (!isFlying || data.length === 0) return;

  if (previousTimestamp === null) {
    previousTimestamp = timestamp;
  }


  if (currentIndex >= data.length - 1) {
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    isFlying = false;

    return;
  }

  const { speed, direction, timestamp: currentTimestamp } = data[currentIndex];
  const { timestamp: nextTimestamp } = data[currentIndex + 1];

  let timeDiff = (nextTimestamp - currentTimestamp) / 1000;
  if (timeDiff <= 0) {
    currentIndex++;
    moveDrone(timestamp);
    return;
  }

  let speedInMs = speed / 3.6;
  let distance = speedInMs * (timestamp - previousTimestamp) / 1000;
  let distanceInPixels = distance * 100 * scaleFactor;


  let angle = (90 - direction) * (Math.PI / 180);

  lastX += Math.cos(angle) * distanceInPixels;
  lastY += Math.sin(angle) * distanceInPixels;

  lastX = Math.max(0, Math.min(lastX, window.innerWidth - drone.clientWidth));
  lastY = Math.max(0, Math.min(lastY, window.innerHeight - drone.clientHeight));


  drone.style.transform = `translate(${lastX}px, ${lastY}px) rotate(${direction}deg)`;

  if ((timestamp - previousTimestamp) / 1000 >= timeDiff) {
    currentIndex++;
    previousTimestamp = timestamp;
  }


  animationFrame = requestAnimationFrame(moveDrone);
}

window.addEventListener("load", () => {
  drone.style.transform = `translate(${lastX}px, ${lastY}px)`; 
});

startBtn.addEventListener("click", async () => {
  if (!isFlying) {
    isFlying = true;
    previousTimestamp = null;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    lastX = window.innerWidth / 2 - drone.clientWidth / 2; 
    lastY = window.innerHeight / 2 - drone.clientHeight / 2;
    currentIndex = 0;
    await loadData();
    animationFrame = requestAnimationFrame(moveDrone);
  }
});

stopBtn.addEventListener("click", () => {
  isFlying = false;
  cancelAnimationFrame(animationFrame);
  startBtn.style.display = 'block';
  stopBtn.style.display = 'none';
  lastX = window.innerWidth / 2 - drone.clientWidth / 2;
  lastY = window.innerHeight / 2 - drone.clientHeight / 2;
  drone.style.transform = `translate(${lastX}px, ${lastY}px)`;
});
