import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";

function MfaSetup() {
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
              Set up multi-factor authentication
            </h1>

            <p className="mx-auto mt-2 max-w-[440px] text-[12px] leading-5 text-[#777b86]">
              Add an extra layer of security to your account by setting up
              an authenticator app.
            </p>
          </div>

          {/* Security icon */}
          <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef1ff]">
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
            >
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

          {/* Information */}
          <div className="mt-7 rounded-lg bg-[#fafbfe] p-5">
            <h2 className="text-[12px] font-semibold text-[#464955]">
              Why enable MFA?
            </h2>

            <p className="mt-2 text-[11px] leading-5 text-[#777b86]">
              MFA helps protect your account even if your password is
              compromised.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-[#6d707b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3155e8]" />
                <span>Use an authenticator app</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#6d707b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3155e8]" />
                <span>Scan the QR code during setup</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#6d707b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3155e8]" />
                <span>Verify the generated security code</span>
              </div>
            </div>
          </div>

          {/* Continue */}
          <button
            type="button"
            className="mt-7 h-[42px] w-full rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc]"
          >
            Set Up MFA
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