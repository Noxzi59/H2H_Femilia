# Bill of Materials ʕ•́ᴥ•̀ʔっ

Every single component, fastener, sensor, and tool required to construct, wire, and flash an autonomous vision- and distance-avoidance quadruped robot is cataloged here. 

Review the power requirements and safety instructions before soldering or assembling any mechanical joints.

---

> [!CAUTION]
> **CRITICAL SERVO WARNING (╯°□°)╯︵ ┻━┻**  
> You **MUST** purchase genuine **180-degree rotation MG90S** servos with metal gears. 
> - Standard 360-degree (continuous rotation) servos **will not work** because they lack closed-loop angular feedback.
> - Plastic-gear SG90 servos will strip their teeth under the torque load of a walking gait on day one.
> - **DO NOT attach servo horns** to the body linkages until all 8 servos are electrically centered to $90^\circ$ (1500 $\mu\text{s}$ pulse width) via software! Forcing a bound servo horn will incinerate the internal H-bridge driver. (ಠ_ಠ)

---

## 1. Core Actuation & Motion System (ง •̀_•́)ง

| Item | Qty | Notes & Specifications |
| :--- | :--- | :--- |
| **MG90S 180° Metal-Gear Micro Servos** | 8 (buy 10 for spares) | Hip roll and knee pitch actuators. Operating torque: $\ge 1.8\text{ kg}\cdot\text{cm}$ at 4.8V. Must include standard cross/single servo horns. |
| **PCA9685 16-Channel 12-Bit PWM Driver** | 1 | Communicates via I2C (`SDA`, `SCL`). Powers servos off a dedicated terminal block, isolating motor voltage spikes from logic lines. |
| **1000 µF 16V Low-ESR Electrolytic Capacitor** | 1 | Soldered across the servo power rail (`V+` and `GND`) on the PCA9685. Essential for absorbing inrush current spikes when all 8 legs articulate. |

---

## 2. Compute, Vision & Perception Stack (⊙_⊙)

| Item | Qty | Notes & Specifications |
| :--- | :--- | :--- |
| **ESP32-S3-CAM Development Board** | 1 | Dual-core Xtensa LX7, 8MB PSRAM, Wi-Fi 4 + BLE 5.0. Vector instructions accelerate TinyML edge vision. |
| **OV2640 or OV5640 Camera Sensor Module** | 1 | Standard 68mm flexible flat cable (FFC). $65^\circ$ to $120^\circ$ FOV lens for object/line classification and web streaming. |
| **VL53L0X or VL53L1X Time-of-Flight (ToF) Sensor** | 1 or 2 | I2C distance ranging ($940\text{ nm}$ VCSEL laser). Millimeter accuracy up to 2 meters. Placed forward-facing in the chest or snout. |
| *(Alternative)* **HC-SR04P / RCWL-1601 Ultrasonic Sensor** | 1 | Only use the 3.3V-tolerant version (`HC-SR04P`). Standard 5V HC-SR04 will damage ESP32 GPIO inputs! |
| **USB-to-UART Serial Adapter (FTDI / CH340)** | 1 | Required if using bare ESP32-CAM boards lacking an onboard USB-C bridge. |

> [!WARNING]
> **RIBBON CABLE FRAGILITY (¬_¬)**  
> The camera FFC ribbon is extremely delicate. Never crease, pinch, or sharply bend the cable during installation into the 3D-printed skull. Always unlock the plastic zero-insertion-force (ZIF) socket latch before inserting or removing the ribbon!

---

## 3. Micro-Expressions & Voice Interface ( ˘ ³˘)♥

| Item | Qty | Notes & Specifications |
| :--- | :--- | :--- |
| **0.96" SSD1306 I2C OLED Display (128×64)** | 1 | 4-Pin interface (`VCC`, `GND`, `SCL`, `SDA`). Mounts in the front head slot to display dynamic eye animations and operational status. |
| **INMP441 I2S Omnidirectional MEMS Microphone** | 1 | Digital audio sampling over I2S. Far cleaner SNR than analog electret mics; used for voice triggers and sound localization. |
| **MAX98357A I2S 3W Mono Amplifier Module** | 1 (Optional) | Converts digital I2S audio directly into a speaker drive without external DACs or pre-amps. |
| **8Ω 1W–2W Miniature Speaker (20–28mm)** | 1 (Optional) | Compact speaker driver for voice feedback, beeps, chirps, and audio alerts. |

---

## 4. Power Architecture & Voltage Regulation ⚡(╯°□°)╯

| Item | Qty | Notes & Specifications |
| :--- | :--- | :--- |
| **7.4V 2S Li-ion Battery (Bambu Lab 14500 800mAh or 2× 18650 cells)** | 1 pack | Provides 7.4V nominal (8.4V fully charged). Minimum discharge rating: 5C (continuous 4A output). |
| **High-Efficiency DC-DC Step-Down Buck Converter (MP1584EN or XL4015)** | 1 | Converts 7.4V down to a stable 5.0V. Must deliver **3A continuous (4A–5A surge)**. Do NOT rely on linear regulators (e.g., LM7805 or AMS1117). |
| **KCD1 Mini Rocker Switch (SPST, 2-Pin)** | 1 | Main physical power cutoff. Snaps into the top chassis cutout. Rated for at least 3A DC. |
| **XH2.54 2-Pin Female Pigtail Cable** | 2 | Plugs directly into 2S balance/discharge leads without cutting factory connectors. |
| **2S Lithium Battery Balance Charger / Type-C 2S BMS Module** | 1 | Dedicated balance charging circuit for 7.4V packs. |

> [!DANGER]
> **LITHIUM BATTERY HAZARD (ง'̀-'́)ง**  
> - **NEVER** solder directly onto lithium cell terminals unless using a dedicated battery tab spot welder.  
> - **NEVER** connect raw 7.4V battery power to the ESP32 $5\text{V}$ pin or the servo rail. You will instantly destroy all attached microchips and servos.  
> - Always place a fast-blow inline fuse ($3\text{A}$ to $4\text{A}$) on the positive battery lead.

---

## 5. Fasteners, Frame & Wiring Hardware 🔩(•̀ᴗ•́)و

| Item | Qty | Usage / Application |
| :--- | :--- | :--- |
| **M2 × 5mm Self-Tapping Screws (Countersunk/Pan)** | ~40 | Joins all 3D printed frame components, leg shells, OLED brackets, and servo clamps. |
| **M2.5 × 5mm Machine Screws** | 10 | Secures the plastic servo horns onto the output splines of the MG90S metal shafts. |
| **22 AWG Flexible Silicone Hookup Wire (Red/Black)** | 1 spool each | Main high-current power and ground buses between battery, switch, buck converter, and PCA9685. |
| **30 AWG Flexible Silicone Wire (Multi-Color)** | 1 kit | Low-current signal routing (I2C, I2S, PWM signals). Flexible insulation prevents leg movement binding. |
| **Dual-Wall Polyolefin Heat-Shrink Assortment** | 1 box | Insulates all soldered battery leads, switch pins, power buses, and spliced connections. |
| **Micro Nylon Zip Ties (100mm × 2.5mm)** | 1 pack | Essential for harness strain relief along articulating hip and shoulder joints. |

---

## 6. 3D Printed Structural Components ┏(-_-)┓

Print all structural components using **PLA+**, **PETG**, or **ABS** with a minimum of **3 perimeters/walls** and **25–30% infill** (gyroid or grid) for torsional rigidity:

| Part Name | Qty | Notes |
| :--- | :--- | :--- |
| **Main Body Lower Chassis Tub** | 1 | Houses battery, buck converter, PCA9685, and primary wiring loom. |
| **Chassis Top Deck / Shell** | 1 | Houses the KCD1 rocker switch and OLED front display. |
| **Articulated Head / Sensor Pod** | 1 | Houses ESP32-S3-CAM, camera lens holder, and ToF distance sensor. |
| **Upper Leg Segments (Coxa / Femur)** | 4 | Attaches directly to hip servo horns. Requires high tensile layer adhesion. |
| **Lower Leg Segments (Tibia)** | 4 | Articulates with knee servos; accepts TPU rubber slip pads on foot tips. |
| **TPU Foot Pads (Flexible 95A)** | 4 (Optional) | Printed in TPU or cut from silicone rubber to prevent slipping on smooth surfaces. |

---

## 7. Bench Tools & Assembly Consumables (🔧_🔧)

| Item | Purpose |
| :--- | :--- |
| **Temperature-Controlled Soldering Station** | High heat transfer for thick 22 AWG power wires without burning PCB pads. |
| **63/37 Rosin-Core Leaded (or SAC305 Lead-Free) Solder (0.6–0.8 mm)** | Clean, reliable solder flow on compact SMD pin headers and OLED breakout boards. |
| **No-Clean Flux Pen** | Ensures rapid wetting on miniature header pins and ground planes. |
| **Digital Multimeter (DMM)** | **MANDATORY:** Verify the buck converter output reads **strictly 5.0V** before plugging in the ESP32! |
| **Precision Screwdriver Set (PH0, PH1, Torx)** | Driving self-tapping M2 screws into 3D prints without stripping plastic pilot holes. |
| **Micro Flush Wire Cutters (Hakko CHP-170 or equivalent)** | Clean wire trimming and cutting zip ties flush against joints. |

---

## 8. Critical Failure Prevention & Assembly Checklist (ಠ_ಠ)

1. **Verify Buck Output Before Connection:**  
   Before connecting the step-down buck converter to the PCA9685 or ESP32 board, hook up the battery, turn on the power switch, and measure the output with a multimeter. Adjust the onboard potentiometer until the output reads **exactly $5.0\text{V} \pm 0.1\text{V}$**. Out-of-the-box converters often come pre-adjusted to $12\text{V}$ or more! (⊙_☉)

2. **Zero All Servos Electronically First:**  
   Connect all 8 servos to the PCA9685 running a calibration sketch that continuously writes a neutral $90^\circ$ signal. Only *then* press the plastic leg horns onto the brass gear splines at a perpendicular $90^\circ$ orientation. Doing this mechanically by hand without power will cause immediate joint misalignment and motor stall during the first boot sequence.

3. **Isolate Logic Grounds & Power Rails:**  
   The ESP32 logic rail runs at $3.3\text{V}$. The PCA9685 signal logic lines (`VCC`) should be powered from the ESP32's $3.3\text{V}$ pin, while the servo motor power terminal (`V+`) must connect directly to the buck converter's $5.0\text{V}$ line. Both grounds (`GND`) **must be tied together** to create a unified reference plane.

4. **Address Brownout Resets (`Brownout detector was triggered`):**  
   If the ESP32 restarts every time the legs begin to step, your 5V rail is sagging under servo inrush current. Ensure the **1000 µF capacitor** is installed directly across the servo power terminals, verify your buck converter is rated for $\ge 3\text{A}$ continuous, and confirm your battery pack can discharge at least $4\text{A}$.