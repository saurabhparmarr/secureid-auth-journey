import { useRef, useState } from "react";
import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";
import { apiRequest } from "../../services/api";

function MfaVerification({ userId, setCurrentScreen }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputRefs = useRef([]);
  const requestInFlight = useRef(false);

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
    const pastedCode = e.clipboardData.getData("text").replace(/\D/g, "");

    if (!pastedCode) return;

    e.preventDefault();
    setErrorMessage("");

    const updatedOtp = [...otp];
    pastedCode.slice(0, 6 - index).split("").forEach((digit, offset) => {
      updatedOtp[index + offset] = digit;
    });
    setOtp(updatedOtp);
    inputRefs.current[Math.min(index + pastedCode.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    if (requestInFlight.current) return;
    setErrorMessage("");

    const token = otp.join("");

    if (token.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit authentication code.");
      return;
    }

    if (!userId) {
      setErrorMessage("User information not found. Please register again.");
      return;
    }

    try {
      requestInFlight.current = true;
      setLoading(true);

      await apiRequest("/mfa/verify", {
        method: "POST",
        body: JSON.stringify({
          userId,
          token,
        }),
      });

      setCurrentScreen("success");
    } catch (error) {
      console.error("MFA verification error:", error);
      setErrorMessage(error.message || "MFA verification failed.");
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171923]">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] items-center justify-center px-5 py-10">
        <section className="w-full max-w-[620px] rounded-xl border border-[#e4e6ed] bg-white px-6 py-8 shadow-[0_2px_12px_rgba(20,20,40,0.04)] sm:px-10">

          {/* Progress */}
          <div className="mb-8">
            <ProgressStepper activeStep={4} />
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-[22px] font-bold tracking-[-0.4px]">
              Enter the 6-digit code
            </h1>

            <p className="mx-auto mt-2 max-w-[430px] text-[12px] leading-5 text-[#777b86]">
              Enter the code from your
              <br />
              authenticator app
            </p>
          </div>

          {/* OTP */}
          <div className="mt-8">
            <div className="flex justify-center gap-2 max-[380px]:gap-1 max-[340px]:gap-0.5">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  maxLength="1"
                  inputMode="numeric"
                  aria-label={`Authentication code digit ${index + 1}`}
                  value={value}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(index, e)}
                  className={`h-10 w-10 max-[380px]:h-9 max-[380px]:w-8 max-[340px]:w-7 rounded-md border text-center text-[16px] font-semibold outline-none focus:border-[#3155e8] ${
                    errorMessage
                      ? "border-red-400 bg-[#fff8f9] text-red-600"
                      : "border-[#dfe1e8]"
                  }`}
                />
              ))}
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-md bg-[#fff1f2] px-3 py-2 text-center">
                <p className="text-[10px] font-medium leading-4 text-red-600" role="alert">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Help */}
          {/* Verify */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="mt-7 h-[42px] w-full rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          {/* Footer */}
          <p className="mt-7 text-center text-[9px] text-[#a0a2aa]">
            © 2024 SecureID. All rights reserved.
          </p>

        </section>
      </main>
    </div>
  );
}

export default MfaVerification;