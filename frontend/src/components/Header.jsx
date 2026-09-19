function Header() {
  return (
    <header className="border-b border-[#e8e9ef] bg-white">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center px-5">
        <div className="flex items-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4338e8] text-white">
            <svg
              width="16"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 2L19 5V11C19 16 16.2 20.2 12 22C7.8 20.2 5 16 5 11V5L12 2Z"
                fill="currentColor"
              />

              <path
                d="M9 11.5L11 13.5L15.5 9"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="text-[15px] font-bold">
            SecureID
          </span>

        </div>
      </div>
    </header>
  );
}

export default Header;