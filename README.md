# Robo Control — Phase 1 Prototype

This project runs a pretrained Ultralytics YOLO model and OpenCV motion detector
on the local computer, and shows the annotated webcam stream in the React
dashboard. The dashboard is available as a desktop application and as a browser
development view.

## Setup

Use Python 3.10 or newer, then from `D:\Robot` run:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python vision_server.py
```

This installs Python dependencies and starts the local service. To open the
desktop application, use another PowerShell terminal:

```powershell
cd D:\Robot\webpage
npm install
npm run desktop
```

The desktop launcher starts both the Python YOLO service and the frontend
window. The camera preview shows YOLO boxes, OpenCV motion regions, object
labels, and left/center/right positions. To use the browser development view,
run `npm run dev` from `D:\Robot\webpage` instead.

To select another camera or model, start the service with options, for example:

```powershell
cd D:\Robot
python vision_server.py --camera 1 --model yolo11n.pt --confidence 0.45
```

## Modes in this prototype

- **STILL**: camera observes; YOLO and motion detection keep running.
- **MOVEMENT**: significant image motion has been observed. This is a vision
  state only; the service does not drive motors.

The automatic mode switch is a starting point. Camera shake, lighting changes,
and moving shadows can trigger motion; adjust `--motion-area` for your scene.
The first camera frames also teach MOG2 the background, so allow a moment for
the motion indicator to settle after starting.

## Options

For waving recognition, the next step is to track a detected person's
hand/body landmarks over time, then recognize repeated side-to-side hand
movement. Object detection alone does not identify that gesture. No cloud API
key is needed because inference runs on this computer.

## Build Windows desktop installer

From `D:\Robot\webpage`, run `npm run desktop:package`. The installer will be
created in `webpage\release`. The target computer needs Python and the packages
from `requirements.txt`; set `ROBO_VISION_PYTHON` if the Python command is not
on PATH.
