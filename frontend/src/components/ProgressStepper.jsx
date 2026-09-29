function ProgressStepper({ activeStep }) {
  return (
    <div className="flex items-center justify-center">

      {[1, 2, 3, 4, 5].map((step, index) => (
        <div key={step} className="flex items-center">

          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold ${
              step <= activeStep
                ? "bg-[#2449df] text-white"
                : "border border-[#dfe2eb] bg-white text-[#8e929d]"
            }`}
          >
            {step}
          </div>

          {index < 4 && (
            <div
              className={`h-px w-6 sm:w-10 lg:w-16 ${
                step < activeStep ? "bg-[#2449df]" : "bg-[#e2e4eb]"
              } max-[380px]:w-5`}
            />
          )}

        </div>
      ))}

    </div>
  );
}

export default ProgressStepper;