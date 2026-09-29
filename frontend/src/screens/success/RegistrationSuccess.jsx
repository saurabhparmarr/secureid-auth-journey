import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";

function RegistrationSuccess({ setCurrentScreen }) {
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
              Account created!
            </h1>

            <p className="mx-auto mt-2 max-w-[430px] text-[12px] leading-5 text-[#777b86]">
              Your account has been created
              <br />
              successfully and MFA is enabled.
            </p>
          </div>

          {/* Account Details */}
          <div className="mx-auto mt-6 max-w-[300px] space-y-3">
            {["Email verified", "Mobile verified", "MFA enabled"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[11px] text-[#464955]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e7f7ed] text-[10px] font-bold text-[#22a060]" aria-hidden="true">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>

          {/* Login */}
          <button
            type="button"
            onClick={() => setCurrentScreen("login")}
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