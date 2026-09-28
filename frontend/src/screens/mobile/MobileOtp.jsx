import { useEffect, useRef, useState } from "react";

import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";
import { apiRequest } from "../../services/api";

function MobileOtp({
  userId,
  challengeId,
  challengeExpiresAt,
  challengeStatus,
  autoSendInitialOtp,
  setAutoSendInitialOtp,
  setCurrentScreen,
  setChallengeId,
  setChallengeExpiresAt,
  setChallengeStatus,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(null);

  const inputRefs = useRef([]);
  const initialRequestStarted = useRef(false);

  useEffect(() => {
    if (!autoSendInitialOtp || initialRequestStarted.current) return;
    initialRequestStarted.current = true;
    setErrorMessage("");
    setAutoSendInitialOtp(false);

    const sendInitialSmsOtp = async () => {
      if (!userId) {
        setErrorMessage(
          "User information not found. Please register again."
        );
        return;
      }

      try {
        const data = await apiRequest("/send-sms-otp", {
          method: "POST",
          body: JSON.stringify({
            userId,
            resend: false,
          }),
        });

        setChallengeId(data.challengeId);
        setChallengeExpiresAt(data.challengeExpiresAt || null);
        setChallengeStatus("active");
        setErrorMessage("");

        console.log("SMS OTP sent.");
      } catch (error) {
        console.error("SMS OTP error:", error);

        setErrorMessage(
          error.message || "Unable to send SMS OTP."
        );
      }
    };

    sendInitialSmsOtp();
  }, [
    autoSendInitialOtp,
    setAutoSendInitialOtp,
    userId,
    setChallengeId,
    setChallengeExpiresAt,
    setChallengeStatus,
  ]);

  useEffect(() => {
    if (!challengeExpiresAt) {
      setSecondsRemaining(null);
      return undefined;
    }

    const updateCountdown = () => {
      setSecondsRemaining(
        Math.max(
          0,
          Math.ceil((new Date(challengeExpiresAt).getTime() - Date.now()) / 1000)
        )
      );
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [challengeExpiresAt]);

  useEffect(() => {
    if (secondsRemaining === 0 && challengeId) {
      setChallengeId(null);
      setChallengeStatus("expired");
      setErrorMessage("This OTP has expired. Please request a new OTP.");
    }
  }, [secondsRemaining, challengeId, setChallengeId, setChallengeStatus]);

  useEffect(() => {
    if (!challengeId && challengeStatus && challengeStatus !== "active") {
      const statusMessages = {
        expired: "This OTP has expired. Please request a new OTP.",
        attempts_exhausted:
          "Maximum verification attempts reached. Please request a new OTP.",
        invalidated: "This OTP is no longer valid. Please request a new OTP.",
        used: "This OTP has already been used. Please request a new OTP.",
        missing: "No active OTP. Please request a new OTP.",
      };
      setErrorMessage(statusMessages[challengeStatus] || "");
    }
  }, [challengeId, challengeStatus]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    setErrorMessage("");

    const digits = value.slice(0, 6 - index).split("");

    const updatedOtp = [...otp];

    digits.forEach((digit, offset) => {
      updatedOtp[index + offset] = digit;
    });

    setOtp(updatedOtp);

    const nextIndex = Math.min(index + digits.length, 5);

    if (digits.length) {
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      setErrorMessage("");

      const updatedOtp = [...otp];

      if (otp[index]) {
        updatedOtp[index] = "";
      } else if (index > 0) {
        updatedOtp[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      setOtp(updatedOtp);
    }
  };

  const handlePaste = (index, e) => {
    const pastedCode = e.clipboardData
      .getData("text")
      .replace(/\D/g, "");

    if (!pastedCode) return;

    e.preventDefault();

    setErrorMessage("");

    const updatedOtp = [...otp];

    pastedCode
      .slice(0, 6 - index)
      .split("")
      .forEach((digit, offset) => {
        updatedOtp[index + offset] = digit;
      });

    setOtp(updatedOtp);

    inputRefs.current[
      Math.min(index + pastedCode.length, 5)
    ]?.focus();
  };

  const handleVerify = async () => {
    setErrorMessage("");

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP.");
      return;
    }

    if (!challengeId) {
      setErrorMessage(
        "SMS OTP challenge not found. Please resend the OTP."
      );
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/verify-sms-otp", {
        method: "POST",
        body: JSON.stringify({
          challengeId,
          otp: enteredOtp,
        }),
      });

      setChallengeId(null);
      setChallengeExpiresAt(null);
      setChallengeStatus(null);
      setCurrentScreen("mfaSetup");
    } catch (error) {
      console.error("SMS verification error:", error);

      setErrorMessage(
        error.message || "Incorrect code. Please try again."
      );
      if (
        [
          "OTP_EXPIRED",
          "MAX_ATTEMPTS_EXCEEDED",
          "OTP_INVALIDATED",
          "OTP_ALREADY_USED",
          "CHALLENGE_NOT_FOUND",
        ].includes(error.reason)
      ) {
        setChallengeId(null);
        setChallengeExpiresAt(null);
        setChallengeStatus(
          error.reason === "OTP_EXPIRED"
            ? "expired"
            : error.reason === "MAX_ATTEMPTS_EXCEEDED"
              ? "attempts_exhausted"
              : error.reason === "OTP_ALREADY_USED"
                ? "used"
                : error.reason === "CHALLENGE_NOT_FOUND"
                  ? "missing"
                  : "invalidated"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId) {
      setErrorMessage(
        "User information not found. Please register again."
      );
      return;
    }

    try {
      setResending(true);
      setErrorMessage("");

      const data = await apiRequest("/send-sms-otp", {
        method: "POST",
        body: JSON.stringify({
          userId,
          resend: true,
        }),
      });

      setChallengeId(data.challengeId);
      setChallengeExpiresAt(data.challengeExpiresAt || null);
      setChallengeStatus("active");

      setOtp(["", "", "", "", "", ""]);

      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend SMS OTP error:", error);

      setErrorMessage(
        error.message || "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171923]">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] items-center justify-center px-5 py-10">
        <section className="w-full max-w-[620px] rounded-xl border border-[#e4e6ed] bg-white px-6 py-8 shadow-[0_2px_12px_rgba(20,20,40,0.04)] sm:px-10">

          <div className="mb-8">
            <ProgressStepper activeStep={3} />
          </div>

          <div className="text-center">
            <h1 className="text-[22px] font-bold tracking-[-0.4px]">
              Verify your mobile number
            </h1>

            <p className="mt-2 text-[12px] leading-5 text-[#777b86]">
              We have sent a verification code to your mobile number.
            </p>

            <p className="mt-1 text-[12px] font-semibold text-[#3d404a]">
              Verification code sent to your mobile
            </p>
          </div>

          <div className="mt-8">
            <label className="mb-3 block text-center text-[11px] font-semibold text-[#3d404a]">
              Enter OTP
            </label>

            <div className="flex justify-center gap-2">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(index, e)}
                  className={`h-11 w-10 rounded-md border text-center text-[16px] font-semibold outline-none ${
                    errorMessage
                      ? "border-red-400 text-red-600"
                      : "border-[#dfe1e8] focus:border-[#3155e8]"
                  }`}
                />
              ))}
            </div>

            {errorMessage && (
              <div className="mt-3 text-center">
                <p className="text-[10px] font-medium text-red-500">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          <p className="mt-5 text-center text-[10px] text-[#858894]">
            {secondsRemaining === null
              ? "OTP expiry information unavailable."
              : secondsRemaining === 0
                ? "OTP expired."
                : `OTP expires in ${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(secondsRemaining % 60).padStart(2, "0")}`}
          </p>

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="mt-7 h-[42px] w-full rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Mobile Number"}
          </button>

          <p className="mt-5 text-center text-[10px] text-[#858894]">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-[#3155e8] disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </p>

          <p className="mt-7 text-center text-[9px] text-[#a0a2aa]">
            © 2024 SecureID. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}

export default MobileOtp;