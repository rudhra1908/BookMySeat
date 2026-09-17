import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "./services/api";
import "./QRScanner.css";

function QRScanner({ token, onSuccess, onClose }) {
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);
  const startingRef = useRef(false);

  const [scannerReady, setScannerReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    "Position the student's BookingPass QR inside the frame."
  );
  const [success, setSuccess] = useState(false);
  const [starting, setStarting] = useState(true);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;

    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (err) {
      console.warn("QR scanner stop warning:", err);
    }

    try {
      scanner.clear();
    } catch (err) {
      console.warn("QR scanner clear warning:", err);
    }
  };

  const chooseCamera = async () => {
    const cameras = await Html5Qrcode.getCameras();

    if (!cameras || cameras.length === 0) {
      throw new Error("No camera was found on this device.");
    }

    const rearCamera = cameras.find((camera) =>
      /back|rear|environment|facing/i.test(camera.label || "")
    );

    return (rearCamera || cameras[0]).id;
  };

  const startScanner = async () => {
    if (startingRef.current) return;

    startingRef.current = true;

    await stopScanner();

    if (!mountedRef.current) {
      startingRef.current = false;
      return;
    }

    setStarting(true);
    setScannerReady(false);
    setCameraError("");
    setError("");
    setSuccess(false);
    setMessage("Requesting camera access...");

    const reader = document.getElementById("bookmyseat-qr-reader");

    if (!reader) {
      startingRef.current = false;
      return;
    }

    reader.innerHTML = "";

    try {
      /*
       * Do NOT use:
       * facingMode: { exact: "environment" }
       *
       * That can throw OverconstrainedError on desktops
       * and on devices without a rear camera.
       *
       * We first ask the browser for available cameras and
       * prefer a rear/environment camera when one exists.
       */
      const cameraId = await chooseCamera();

      const scanner = new Html5Qrcode(
        "bookmyseat-qr-reader",
        { verbose: false }
      );

      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(
              Math.min(viewfinderWidth, viewfinderHeight) * 0.70
            );

            return {
              width: Math.max(210, Math.min(size, 330)),
              height: Math.max(210, Math.min(size, 330)),
            };
          },
          aspectRatio: 1,
          disableFlip: false,
          videoConstraints: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: "environment" },
          },
        },
        async (decodedText) => {
          if (
            !mountedRef.current ||
            processingRef.current
          ) {
            return;
          }

          processingRef.current = true;
          setError("");
          setMessage("QR detected. Verifying reservation...");

          try {
            let qrData;

            try {
              qrData = JSON.parse(decodedText);
            } catch {
              throw new Error(
                "Invalid BookMySeat QR code. Please scan the student's BookingPass QR code."
              );
            }

            const reservationId =
              qrData?.reservationId ||
              qrData?.reservation?._id ||
              qrData?.reservation?.id;

            if (!reservationId || reservationId === "UNKNOWN") {
              throw new Error(
                "This QR code does not contain a valid BookMySeat reservation."
              );
            }

            const response =
              await api.adminCheckInReservation(
                reservationId,
                token
              );

            if (!mountedRef.current) return;

            await stopScanner();

            if (!mountedRef.current) return;

            setSuccess(true);
            setScannerReady(false);
            setMessage(
              response?.message ||
              "Student checked in successfully."
            );

            if (typeof onSuccess === "function") {
              onSuccess(response?.reservation || null);
            }
          } catch (scanError) {
            console.error("QR check-in error:", scanError);

            if (!mountedRef.current) return;

            setError(
              scanError?.message ||
              "Unable to verify this QR code."
            );
            setMessage("Scan another valid BookMySeat QR code.");
            processingRef.current = false;
          }
        },
        () => {
          /*
           * Normal decode failures are ignored.
           * html5-qrcode keeps scanning continuously.
           */
        }
      );

      if (!mountedRef.current) return;

      setStarting(false);
      setScannerReady(true);
      setCameraError("");
      setMessage(
        "Position the student's BookingPass QR inside the frame."
      );
    } catch (err) {
      console.error("Unable to start QR scanner:", err);

      if (!mountedRef.current) return;

      setStarting(false);
      setScannerReady(false);

      const name = err?.name || "";
      const text = String(err?.message || err || "");

      if (
        name === "NotAllowedError" ||
        /permission|notallowed/i.test(text)
      ) {
        setCameraError(
          "Camera permission was denied. Allow camera access in your browser and try again."
        );
      } else if (
        name === "NotFoundError" ||
        /no camera|camera.*found/i.test(text)
      ) {
        setCameraError(
          "No usable camera was found on this device."
        );
      } else if (
        name === "NotReadableError" ||
        /notreadable|could not start/i.test(text)
      ) {
        setCameraError(
          "The camera is being used by another application. Close other camera apps or tabs and try again."
        );
      } else if (
        name === "SecurityError" ||
        /secure context|https/i.test(text)
      ) {
        setCameraError(
          "Camera access requires HTTPS or localhost. Open BookMySeat through a secure connection."
        );
      } else {
        setCameraError(
          "Unable to access the camera. Check browser permission and try again."
        );
      }

      setError(
        "Camera unavailable."
      );
      setMessage("Camera could not be started.");
    } finally {
      startingRef.current = false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    processingRef.current = false;

    startScanner();

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [token]);

  const handleClose = async () => {
    await stopScanner();

    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleRetry = async () => {
    processingRef.current = false;
    await startScanner();
  };

  return (
    <div
      className="qr-scanner-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Digital Check-In"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="qr-scanner-container">
        <header className="qr-scanner-header">
          <div className="qr-header-brand">
            <div className="qr-brand-mark">B</div>

            <div className="qr-brand-copy">
              <span>BOOKMYSEAT</span>
              <h1>Digital Check-In</h1>
            </div>
          </div>

          <div className="qr-header-actions">
            <div
              className={`qr-live-badge ${
                scannerReady ? "active" : ""
              }`}
            >
              <i />
              {scannerReady ? "SCANNING" : "READY"}
            </div>

            <button
              type="button"
              className="qr-close-button"
              onClick={handleClose}
              aria-label="Close scanner"
            >
              <span>×</span>
            </button>
          </div>
        </header>

        <section className="qr-intro">
          <div className="qr-intro-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect
                x="8"
                y="8"
                width="8"
                height="8"
                rx="1.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M11 11h2v2h-2z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="qr-intro-copy">
            <span>LIBRARY ACCESS</span>
            <strong>Scan Student Pass</strong>
            <p>
              Scan the QR code displayed on the student's
              BookMySeat digital access pass.
            </p>
          </div>
        </section>

        <section className="qr-camera-section">
          <div className="qr-camera-shell">
            <div
              id="bookmyseat-qr-reader"
              className="qr-camera"
            />

            {!success && !cameraError && (
              <div className="qr-camera-ui">
                <div className="qr-frame">
                  <span className="qr-corner tl" />
                  <span className="qr-corner tr" />
                  <span className="qr-corner bl" />
                  <span className="qr-corner br" />
                  <span className="qr-scan-line" />
                </div>

                <div className="qr-camera-chip">
                  <i />
                  {starting
                    ? "INITIALIZING CAMERA"
                    : "ALIGN QR CODE"}
                </div>
              </div>
            )}

            {starting && !cameraError && !success && (
              <div className="qr-camera-loading">
                <div className="qr-loading-ring" />
                <strong>Starting camera</strong>
                <span>Please allow camera access if prompted.</span>
              </div>
            )}

            {cameraError && (
              <div className="qr-camera-error">
                <div className="qr-error-symbol">!</div>
                <strong>Camera unavailable</strong>
                <p>{cameraError}</p>

                <button
                  type="button"
                  className="qr-retry-button"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
              </div>
            )}

            {success && (
              <div className="qr-success">
                <div className="qr-success-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M5 12.5l4 4L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <span>CHECK-IN VERIFIED</span>
                <strong>Student Checked In</strong>
                <p>{message}</p>
              </div>
            )}
          </div>

          <div
            className={`qr-status ${
              success
                ? "success"
                : error || cameraError
                  ? "error"
                  : ""
            }`}
          >
            <div className="qr-status-icon">
              {success ? "✓" : error || cameraError ? "!" : "•"}
            </div>

            <div>
              <strong>
                {success
                  ? "Check-in completed"
                  : error || cameraError
                    ? "Camera unavailable"
                    : scannerReady
                      ? "Scanner is ready"
                      : "Preparing scanner"}
              </strong>

              <span>{message}</span>
            </div>
          </div>

          {error && !cameraError && !success && (
            <div className="qr-error-bar">
              <span>!</span>
              <div>
                <strong>Scan failed</strong>
                <p>{error}</p>
              </div>
            </div>
          )}
        </section>

        <section className="qr-security-row">
          <div className="qr-security-item">
            <span className="qr-security-icon">✓</span>
            <div>
              <small>VERIFICATION</small>
              <strong>Instant</strong>
            </div>
          </div>

          <div className="qr-divider" />

          <div className="qr-security-item">
            <span className="qr-security-icon">⌁</span>
            <div>
              <small>ACCESS</small>
              <strong>Secure</strong>
            </div>
          </div>

          <div className="qr-divider" />

          <div className="qr-security-item">
            <span className="qr-security-icon">◈</span>
            <div>
              <small>SYSTEM</small>
              <strong>BookMySeat</strong>
            </div>
          </div>
        </section>

        <footer className="qr-scanner-footer">
          <span>
            <i />
            SECURE DIGITAL CHECK-IN
          </span>

          <small>
            Present student's BookingPass QR
          </small>
        </footer>
      </div>
    </div>
  );
}

export default QRScanner;
