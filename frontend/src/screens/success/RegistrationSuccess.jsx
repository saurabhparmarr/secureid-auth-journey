import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";

function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171923]">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] items-center justify-center px-5 py-10">
        <section className="w-full max-w-[620px] rounded-xl border border-[#e4e6ed] bg-white px-6 py-8 shadow-[0_2px_12px_rgba(20,20,40,0.04)] sm:px-10">

          {/* Progress */}
          <div className="mb-8">
            <ProgressStepper activeStep={5} />
          </div>

          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf8f0]">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="#22a060"
                strokeWidth="2"
              />

              <path
                d="M8 12.2L10.6 14.8L16.2 9.3"
                stroke="#22a060"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <div className="mt-6 text-center">
            <h1 className="text-[22px] font-bold tracking-[-0.4px]">
              Registration successful
            </h1>

            <p className="mx-auto mt-2 max-w-[430px] text-[12px] leading-5 text-[#777b86]">
              Your SecureID account has been created and multi-factor
              authentication has been enabled.
            </p>
          </div>

          {/* Account Details */}
          <div className="mt-7 rounded-lg bg-[#fafbfe] p-5">
            <h2 className="text-[12px] font-semibold text-[#464955]">
              Account verified
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#858894]">
                  Email
                </span>

                <span className="text-[10px] font-semibold text-[#464955]">
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#858894]">
                  Mobile number
                </span>

                <span className="text-[10px] font-semibold text-[#464955]">
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#858894]">
                  MFA
                </span>

                <span className="text-[10px] font-semibold text-[#22a060]">
                  Enabled
                </span>
              </div>
            </div>
          </div>

          {/* Login */}
          <button
            type="button"
            className="mt-7 h-[42px] w-full rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc]"
          >
            Continue to Login
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

export default RegistrationSuccess;