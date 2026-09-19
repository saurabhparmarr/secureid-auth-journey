function ProgressStepper({ activeStep }) {
  return (
    <div className="flex items-center justify-center">

      {[1, 2, 3, 4, 5].map((step, index) => (
        <div key={step} className="flex items-center">

          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold ${
              activeStep === step
                ? "bg-[#2449df] text-white"
                : "border border-[#dfe2eb] bg-white text-[#8e929d]"
            }`}
          >
            {step}
          </div>

          {index < 4 && (
            <div className="h-px w-10 bg-[#e2e4eb] sm:w-16" />
          )}

        </div>
      ))}

    </div>
  );
}

export default ProgressStepper;