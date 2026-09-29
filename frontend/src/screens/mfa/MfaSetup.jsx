import { useRef, useState } from "react";
import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";
import { apiRequest } from "../../services/api";

function MfaSetup({ userId, setCurrentScreen, setMfaOtpauthUrl }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestInFlight = useRef(false);

  const handleSetupMfa = async () => {
    if (!userId) {
      setErrorMessage("User information not found. Please register again.");
      return;
    }

    if (requestInFlight.current) return;

    try {
      requestInFlight.current = true;
      setLoading(true);
      setErrorMessage("");
      const data = await apiRequest("/mfa/setup", {
        method: "POST",
        body: JSON.stringify({
          userId,
        }),
      });

      setMfaOtpauthUrl(data.otpauthUrl);

      setCurrentScreen("authenticatorSetup");
    } catch (error) {
      console.error("MFA setup error:", error);
      setErrorMessage(error.message || "Unable to set up MFA.");
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

          {/* Security icon */}
          <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef1ff]">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L19 6V11C19 15.5 16.3 19.4 12 21C7.7 19.4 5 15.5 5 11V6L12 3Z"
                stroke="#3155e8"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              <path
                d="M9 12L11.2 14.2L15.5 9.8"
                stroke="#3155e8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <div className="mt-4 text-center">
            <h1 className="text-[22px] font-bold tracking-[-0.4px]">
              Set up Multi-Factor Auth
            </h1>

            <p className="mx-auto mt-2 max-w-[440px] text-[12px] leading-5 text-[#777b86]">
              Add an extra layer of security
              <br />
              to protect your account.
            </p>
          </div>

          <div className="mt-7 space-y-2">
            <div className="flex min-h-[46px] items-center gap-3 rounded-md border border-[#b8c7ff] bg-[#f7f9ff] px-3">
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[#3155e8]">
                <span className="h-2 w-2 rounded-full bg-[#3155e8]" />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-semibold text-[#333744]">Authenticator App</p>
                <p className="text-[9px] text-[#777b86]">(Google Authenticator / Authy)</p>
              </div>
            </div>
            <div className="flex min-h-[46px] items-center gap-3 rounded-md border border-[#e4e6ed] px-3">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#9da2b0]" />
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-semibold text-[#333744]">SMS Authentication</p>
                <p className="text-[9px] text-[#777b86]">Receive codes on your mobile</p>
              </div>
            </div>
            <div className="flex min-h-[46px] items-center gap-3 rounded-md border border-[#e4e6ed] px-3">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#9da2b0]" />
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-semibold text-[#333744]">Email Authentication</p>
                <p className="text-[9px] text-[#777b86]">Receive codes on your email</p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-md bg-[#fff1f2] px-3 py-2 text-center text-[10px] leading-4 text-red-600" role="alert">
              {errorMessage}
            </p>
          )}

          {/* Set Up MFA */}
          <button
            type="button"
            onClick={handleSetupMfa}
            disabled={loading}
            className="mt-7 h-[42px] w-full rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc]"
          >
            {loading ? "Setting up..." : "Continue"}
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

export default MfaSetup;
