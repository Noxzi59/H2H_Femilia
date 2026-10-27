<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Robo Control Desktop

The desktop app keeps the current Robo Control React interface and opens it in
a native desktop window. In development, it starts the local YOLO service and
the Vite frontend for you. Object detection runs on this computer; the camera
dashboard does not need a cloud API key.

## Run the desktop app in development

From PowerShell:

```powershell
cd D:\Robot\webpage
npm install
npm run desktop
```

The desktop launcher uses `D:\Robot\.venv\Scripts\python.exe` and
`D:\Robot\vision_server.py`. Install the project Python dependencies first if
needed, from `D:\Robot`:

```powershell
python -m pip install -r requirements.txt
```

## Build a W

indows installer

```powershell
cd D:\Robot\webpage
npm run desktop:package
```

The installer is written to `webpage\release`. The installed desktop app
includes the React interface, vision server script, and YOLO weights. The
computer running the installer still needs Python with the packages in
`D:\Robot\requirements.txt`; set `ROBO_VISION_PYTHON` if Python is not on PATH.
When packaging on this computer, the launcher records the project `.venv`
interpreter path if that environment exists.

The existing browser mode is still available with `npm run dev`.
