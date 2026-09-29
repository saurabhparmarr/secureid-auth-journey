import { useState } from "react";
import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";
import { QRCodeSVG } from "qrcode.react";

function AuthenticatorSetup({ userId, otpauthUrl, setCurrentScreen }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [showSetupKey, setShowSetupKey] = useState(false);

  const handleContinue = () => {
    if (!userId || !otpauthUrl) {
      setErrorMessage(
        "Authenticator setup information not found. Please try again."
      );
      return;
    }

    setErrorMessage("");
    setCurrentScreen("mfaVerification");
  };
  const setupKey = otpauthUrl
    ? new URLSearchParams(otpauthUrl.split("?")[1] || "").get("secret")
    : null;

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
              Scan QR Code
            </h1>

            <p className="mx-auto mt-2 max-w-[430px] text-[12px] leading-5 text-[#777b86]">
              Open your authenticator app and
              <br />
              scan this QR code
            </p>
          </div>

          {/* Real QR Code */}
          <div className="mx-auto mt-7 flex h-40 w-40 max-w-full items-center justify-center rounded-lg border border-[#e1e3e9] bg-white">
            {otpauthUrl ? (
              <QRCodeSVG
                value={otpauthUrl}
                size={128}
                level="M"
              />
            ) : (
              <p className="px-3 text-center text-[10px] text-red-500">
                QR code unavailable
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSetupKey((visible) => !visible)}
            disabled={!setupKey}
            className="mx-auto mt-5 block text-[10px] font-semibold text-[#3155e8] disabled:opacity-50"
          >
            {showSetupKey ? "Hide setup key" : "Can't scan? Enter setup key"}
          </button>

          {showSetupKey && setupKey && (
            <p className="mt-3 break-all rounded-md bg-[#fafbfe] px-3 py-2 text-center font-mono text-[11px] tracking-[1px] text-[#464955]">
              {setupKey}
            </p>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-md bg-[#fff1f2] px-3 py-2 text-center text-[10px] leading-4 text-red-600" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={() => setCurrentScreen("mfaSetup")}
              className="h-[42px] flex-1 rounded-md border border-[#e1e3e9] bg-white text-[12px] font-semibold text-[#464955] transition hover:bg-[#f8f9fc]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="h-[42px] flex-1 rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc]"
            >
              Continue
            </button>
          </div>

          {/* Footer */}
          <p className="mt-7 text-center text-[9px] text-[#a0a2aa]">
            © 2024 SecureID. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AuthenticatorSetup;