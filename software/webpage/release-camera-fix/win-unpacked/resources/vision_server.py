"""Local webcam + YOLO service for the Robo Control website."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import threading
import time
from typing import Any

import cv2
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from ultralytics import YOLO


class VisionService:
    def __init__(self, camera_index: int, model_path: str, confidence: float) -> None:
        self.camera_index = camera_index
        self.model_path = model_path
        self.confidence = confidence
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._jpeg: bytes | None = None
        self._status: dict[str, Any] = {
            "connected": False,
            "mode": "STILL",
            "motion_detected": False,
            "fps": 0,
            "objects": [],
            "error": None,
        }

    def start(self) -> None:
        self._thread = threading.Thread(target=self._run, name="local-yolo-camera", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=3)

    def snapshot(self) -> tuple[bytes | None, dict[str, Any]]:
        with self._lock:
            return self._jpeg, dict(self._status)

    def _set_error(self, message: str) -> None:
        with self._lock:
            self._status.update(connected=False, error=message)

    def _run(self) -> None:
        camera: cv2.VideoCapture | None = None
        try:
            model = YOLO(self.model_path)
            camera = cv2.VideoCapture(self.camera_index)
            if not camera.isOpened():
                self._set_error(
                    f"Could not open webcam {self.camera_index}. Check camera permissions or try another index."
                )
                return

            background = cv2.createBackgroundSubtractorMOG2(
                history=300, varThreshold=32, detectShadows=False
            )
            frame_count = 0
            previous_time = time.perf_counter()
            fps = 0.0

            while not self._stop.is_set():
                ok, frame = camera.read()
                if not ok:
                    self._set_error("Webcam frame could not be read.")
                    time.sleep(0.2)
                    continue

                frame_count += 1
                now = time.perf_counter()
                delta = now - previous_time
                if delta > 0:
                    frame_fps = 1.0 / delta
                    fps = frame_fps if fps == 0 else fps * 0.85 + frame_fps * 0.15
                previous_time = now

                mask = background.apply(frame)
                mask = cv2.GaussianBlur(mask, (5, 5), 0)
                _, mask = cv2.threshold(mask, 200, 255, cv2.THRESH_BINARY)
                mask = cv2.morphologyEx(
                    mask,
                    cv2.MORPH_OPEN,
                    cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)),
                )
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                moving = [contour for contour in contours if cv2.contourArea(contour) >= 1800]
                motion_detected = bool(moving)

                result = model.predict(frame, conf=self.confidence, verbose=False)[0]
                annotated = result.plot()
                objects: list[dict[str, Any]] = []
                boxes = result.boxes
                if boxes is not None:
                    frame_width = frame.shape[1]
                    for box in boxes:
                        x1, y1, x2, y2 = (float(v) for v in box.xyxy[0].tolist())
                        class_id = int(box.cls[0].item())
                        center_x = (x1 + x2) / 2
                        objects.append(
                            {
                                "label": model.names[class_id],
                                "confidence": round(float(box.conf[0].item()), 3),
                                "position": "left" if center_x < frame_width / 3 else "right" if center_x > frame_width * 2 / 3 else "center",
                                "box": [round(x1), round(y1), round(x2), round(y2)],
                            }
                        )

                for contour in moving:
                    x, y, width, height = cv2.boundingRect(contour)
                    cv2.rectangle(annotated, (x, y), (x + width, y + height), (255, 180, 0), 2)

                mode = "MOVEMENT" if motion_detected else "STILL"
                cv2.rectangle(annotated, (0, 0), (annotated.shape[1], 74), (20, 20, 20), -1)
                cv2.putText(annotated, f"MODE: {mode}", (16, 30), cv2.FONT_HERSHEY_SIMPLEX,
                            0.8, (0, 210, 255) if motion_detected else (70, 220, 100), 2, cv2.LINE_AA)
                cv2.putText(annotated, "MOTION DETECTED" if motion_detected else "Observing scene",
                            (16, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (245, 245, 245), 1, cv2.LINE_AA)
                cv2.putText(annotated, f"{fps:.1f} FPS", (annotated.shape[1] - 120, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (245, 245, 245), 1, cv2.LINE_AA)

                encoded, buffer = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 82])
                if not encoded:
                    continue
                status = {
                    "connected": True,
                    "mode": mode,
                    "motion_detected": motion_detected,
                    "fps": round(fps, 1),
                    "objects": objects,
                    "error": None,
                    "frame": frame_count,
                }
                with self._lock:
                    self._jpeg = buffer.tobytes()
                    self._status = status
        except Exception as exc:  # surfaced in the browser status panel
            self._set_error(f"Vision service error: {exc}")
        finally:
            if camera is not None:
                camera.release()


def create_app(
    camera_index: int,
    model_path: str,
    confidence: float,
    web_directory: str | None = None,
) -> FastAPI:
    vision = VisionService(camera_index, model_path, confidence)
    app = FastAPI(title="Robo Control Local Vision")

    @app.on_event("startup")
    def start_vision() -> None:
        vision.start()

    @app.on_event("shutdown")
    def stop_vision() -> None:
        vision.stop()

    @app.get("/api/vision/status")
    def vision_status() -> JSONResponse:
        _, status = vision.snapshot()
        status["web_ui"] = bool(web_directory)
        return JSONResponse(status)

    @app.get("/api/vision/video")
    def vision_video() -> StreamingResponse:
        def frames():
            while True:
                jpeg, _ = vision.snapshot()
                if jpeg:
                    yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
                time.sleep(0.04)

        return StreamingResponse(
            frames(), media_type="multipart/x-mixed-replace; boundary=frame"
        )

    @app.websocket("/ws/vision")
    async def vision_updates(socket: WebSocket) -> None:
        await socket.accept()
        try:
            while True:
                _, status = vision.snapshot()
                status["web_ui"] = bool(web_directory)
                await socket.send_text(json.dumps(status))
                await asyncio.sleep(0.25)
        except WebSocketDisconnect:
            return

    if web_directory and os.path.isfile(os.path.join(web_directory, "index.html")):
        assets_directory = os.path.join(web_directory, "assets")
        if os.path.isdir(assets_directory):
            from fastapi.staticfiles import StaticFiles

            app.mount("/assets", StaticFiles(directory=assets_directory), name="assets")

        @app.get("/")
        def frontend() -> FileResponse:
            return FileResponse(os.path.join(web_directory, "index.html"))

    return app


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--camera", type=int, default=0)
parser.add_argument("--model", default="yolo11n.pt")
parser.add_argument("--confidence", type=float, default=0.35)
parser.add_argument("--web-dir", default=None)
args, _ = parser.parse_known_args()
app = create_app(args.camera, args.model, args.confidence, args.web_dir)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
