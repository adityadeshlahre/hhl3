import React, { useState, useEffect, useCallback, KeyboardEvent } from "react";

const columns = 6;
const rows = 5;

const generateRandomCode = (length: number): number[] => {
  const code: number[] = [];
  for (let i = 0; i < length; i++) {
    code.push(Math.floor(Math.random() * 10));
  }
  return code;
};

const Game: React.FC = () => {
  const [lockPadCode, setLockPadCode] = useState<number[]>(
    generateRandomCode(4)
  );
  const [finalPattern, setFinalPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    startGame();
  }, []);

  const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

  const flashRandomCircles = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const circles = document.querySelectorAll(".circle");
        circles.forEach(
          (circle) =>
            (circle.className = "circle w-20 h-20 rounded-full bg-gray-500")
        );
        for (let j = 0; j < 5; j++) {
          const randomIndex = getRandomInt(columns * rows);
          circles[randomIndex].className =
            "circle w-20 h-20 rounded-full bg-red-500";
        }
      }, i * 1000);
    }
  }, []);

  const flashFinalPattern = useCallback(() => {
    const newPattern: number[] = [];
    for (let i = 0; i < 5; i++) {
      newPattern.push(getRandomInt(columns * rows));
    }
    setFinalPattern(newPattern);

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const circles = document.querySelectorAll(".circle");
        circles.forEach(
          (circle) =>
            (circle.className = "circle w-20 h-20 rounded-full bg-gray-500")
        );
        newPattern.forEach((index) => {
          circles[index].className =
            "circle w-20 h-20 rounded-full bg-green-500";
        });
      }, i * 1000 + 5000);
    }

    setTimeout(() => {
      setStatus("Enter the pattern using WASD keys and Enter");
    }, 8000);
  }, []);

  const startGame = useCallback(() => {
    flashRandomCircles();
    setTimeout(flashFinalPattern, 5000);
  }, [flashFinalPattern, flashRandomCircles]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (status.includes("Enter the pattern")) {
        const key = event.key.toLowerCase();
        const currentCircle = document.getElementById(
          `circle-${finalPattern[currentStep]}`
        );

        if (key === "enter") {
          if (userPattern[currentStep] === finalPattern[currentStep]) {
            if (currentCircle) currentCircle.className = "circle bg-blue-500";
            setCurrentStep((prev) => prev + 1);

            if (currentStep === finalPattern.length - 1) {
              lockPadCode.shift();
              if (lockPadCode.length === 0) {
                setStatus("Hack Successful!");
              } else {
                startGame();
              }
            }
          } else {
            setStatus("Hack Failed!");
          }
        } else {
          const updateUserPattern = [...userPattern];
          let newIndex = userPattern[currentStep];

          switch (key) {
            case "w":
              if (newIndex - columns >= 0) newIndex -= columns;
              break;
            case "a":
              if (newIndex % columns !== 0) newIndex -= 1;
              break;
            case "s":
              if (newIndex + columns < columns * rows) newIndex += columns;
              break;
            case "d":
              if (newIndex % columns !== columns - 1) newIndex += 1;
              break;
          }

          updateUserPattern[currentStep] = newIndex;
          setUserPattern(updateUserPattern);

          if (currentCircle) currentCircle.className = "circle bg-gray-500";
          const newCircle = document.getElementById(`circle-${newIndex}`);
          if (newCircle) newCircle.className = "circle bg-red-500";
        }
      }
    },
    [status, finalPattern, currentStep, userPattern]
  );

  useEffect(() => {
    const handleKeyDownWrapper = (event: Event) =>
      handleKeyDown(event as unknown as KeyboardEvent);

    document.addEventListener("keydown", handleKeyDownWrapper);
    return () => {
      document.removeEventListener("keydown", handleKeyDownWrapper);
    };
  }, [handleKeyDown]);

  return (
    <div className=" h-screen bg-neutral-900 p-10">
      <div className="flex flex-row border-8 items-center justify-center text-gray-200 m-2 p-4">
        <div className="flex flex-col items-center text-gray-200 border-8 border-slate-100 p-4">
          <h2 className="text-2xl font-bold">CONECTION : TIMEOUT</h2>
          {/* todo add clock */}
        </div>
        <div className="flex flex-col items-center text-gray-200 border-8 border-slate-100 p-4">
          <h2 className="text-2xl font-bold">ACCESS ATTEMPTS</h2>
          {/* add blocks */}
        </div>
      </div>
      <div className="flex flex-row items-center justify-center">
        <div className="flex flex-row items-center justify-center text-gray-200 border-8 border-slate-100 p-4">
          <div className="flex flex-col border-8 border-slate-200 items-center m-2">
            <h2 className="text-2xl font-bold">SIGNAL : RECEPTER</h2>
            <div className="grid grid-cols-6 gap-2 m-8">
              {Array.from({ length: columns * rows }, (_, i) => (
                <div
                  key={i}
                  className="circle w-20 h-20 rounded-full bg-gray-500"
                  id={`circle-${i}`}
                ></div>
              ))}
            </div>
            {/* scrample counter */}
          </div>
          <div className="border-8 border-slate-100 text-gray-200 m-2">
            <div className="flex flex-col items-center m-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold">DECRYPTED DIGITS</h2>
                <div id="lockpad" className="text-xl">
                  {lockPadCode.join(" ")}
                </div>
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((num) => (
                    <div className="border-2 border-slate-50">
                      <button
                        key={num}
                        className="w-16 h-16 text-2xl text-gray-100 rounded-md"
                      >
                        {num}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center m-4">
              <div className="mt-2">
                <div className="border-2 border-slate-50 pt-6 pb-6 pr-2 pl-2">
                  <div className="grid grid-cols-4 gap-2">
                    {lockPadCode.map((num) => (
                      <div className="border-2 border-slate-50">
                        <button
                          key={num}
                          className="w-12 h-12 text-2xl text-gray-100 rounded-md"
                        >
                          {num}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
