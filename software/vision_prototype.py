"""Webcam prototype: YOLO object detection + OpenCV motion/state display.

Run with: python vision_prototype.py
Press q to quit; press s to toggle STILL / MOVEMENT manually.

MOVEMENT is only a perception/demo state in this prototype. No motor commands
are sent; add hardware control only after testing the vision decisions safely.
"""

from __future__ import annotations

import argparse
import time

import cv2
from ultralytics import YOLO


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--camera", type=int, default=0, help="Webcam device index (default: 0)")
    parser.add_argument("--model", default="yolo11n.pt", help="Ultralytics model or weights path")
    parser.add_argument("--confidence", type=float, default=0.35, help="YOLO confidence threshold")
    parser.add_argument("--motion-area", type=int, default=1800, help="Minimum changed-pixel contour area")
    parser.add_argument("--infer-every", type=int, default=3, help="Run YOLO every N frames")
    parser.add_argument("--start-moving", action="store_true", help="Start in MOVEMENT mode")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.infer_every < 1:
        raise ValueError("--infer-every must be at least 1")

    print(f"Loading YOLO model: {args.model}")
    model = YOLO(args.model)
    camera = cv2.VideoCapture(args.camera)
    if not camera.isOpened():
        raise RuntimeError(
            f"Could not open camera {args.camera}. Try --camera 1, and check camera permissions."
        )

    # MOG2 models a mostly stationary background and marks moving foreground.
    background = cv2.createBackgroundSubtractorMOG2(
        history=300, varThreshold=32, detectShadows=False
    )
    mode = "MOVEMENT" if args.start_moving else "STILL"
    frame_number = 0
    last_detections = None
    last_detection_time = 0.0
    fps = 0.0
    previous_time = time.perf_counter()
    print("Camera ready. Press q to quit; press s to toggle STILL / MOVEMENT.")

    try:
        while True:
            ok, frame = camera.read()
            if not ok:
                print("Camera frame could not be read; stopping.")
                break

            frame_number += 1
            now = time.perf_counter()
            elapsed = now - previous_time
            if elapsed > 0:
                instantaneous_fps = 1.0 / elapsed
                fps = instantaneous_fps if fps == 0 else 0.85 * fps + 0.15 * instantaneous_fps
            previous_time = now

            # Motion mask: blur and threshold to suppress small sensor noise.
            motion_mask = background.apply(frame)
            motion_mask = cv2.GaussianBlur(motion_mask, (5, 5), 0)
            _, motion_mask = cv2.threshold(motion_mask, 200, 255, cv2.THRESH_BINARY)
            motion_mask = cv2.morphologyEx(
                motion_mask,
                cv2.MORPH_OPEN,
                cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)),
            )
            contours, _ = cv2.findContours(
                motion_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            moving_regions = [
                contour for contour in contours if cv2.contourArea(contour) >= args.motion_area
            ]
            motion_detected = bool(moving_regions)

            # Switch automatically on movement; pressing s remains available
            # for demonstrating both modes even when the scene is still.
            if mode == "STILL" and motion_detected:
                mode = "MOVEMENT"
            elif mode == "MOVEMENT" and not motion_detected:
                mode = "STILL"

            # Run the model periodically to keep the display responsive.
            if (frame_number - 1) % args.infer_every == 0 or last_detections is None:
                result = model.predict(frame, conf=args.confidence, verbose=False)[0]
                last_detections = result.plot()
                last_detection_time = now

            display = last_detections.copy() if last_detections is not None else frame.copy()
            # Indicate when detections are cached from a recent frame.
            detection_age = max(0.0, now - last_detection_time)
            for contour in moving_regions:
                x, y, width, height = cv2.boundingRect(contour)
                cv2.rectangle(display, (x, y), (x + width, y + height), (255, 180, 0), 2)

            mode_color = (50, 210, 80) if mode == "STILL" else (0, 180, 255)
            cv2.rectangle(display, (0, 0), (display.shape[1], 78), (25, 25, 25), -1)
            cv2.putText(display, f"MODE: {mode}", (16, 30), cv2.FONT_HERSHEY_SIMPLEX,
                        0.8, mode_color, 2, cv2.LINE_AA)
            motion_text = "MOTION DETECTED" if motion_detected else "No significant motion"
            cv2.putText(display, motion_text, (16, 59), cv2.FONT_HERSHEY_SIMPLEX,
                        0.55, (245, 245, 245), 1, cv2.LINE_AA)
            cv2.putText(display, f"FPS {fps:.1f} | YOLO frame age {detection_age:.1f}s",
                        (max(16, display.shape[1] - 370), 30), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, (245, 245, 245), 1, cv2.LINE_AA)
            cv2.imshow("Robot Vision Prototype", display)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q") or key == 27:
                break
            if key == ord("s"):
                mode = "MOVEMENT" if mode == "STILL" else "STILL"
    finally:
        camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
