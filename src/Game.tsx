import React, { useState, useEffect, useCallback, KeyboardEvent } from "react";

const size = 6;

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
          const randomIndex = getRandomInt(size * size);
          circles[randomIndex].className =
            "circle w-20 h-20 rounded-full bg-red-500";
        }
      }, i * 1000);
    }
  }, []);

  const flashFinalPattern = useCallback(() => {
    const newPattern: number[] = [];
    for (let i = 0; i < 5; i++) {
      newPattern.push(getRandomInt(size * size));
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
              if (newIndex - size >= 0) newIndex -= size;
              break;
            case "a":
              if (newIndex % size !== 0) newIndex -= 1;
              break;
            case "s":
              if (newIndex + size < size * size) newIndex += size;
              break;
            case "d":
              if (newIndex % size !== size - 1) newIndex += 1;
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
    <div className="flex flex-row items-center justify-center h-screen bg-neutral-900">
      <div className="flex flex-row items-center justify-center border-8 border-slate-100">
        <div className="flex flex-col border-8 border-slate-200 items-center m-2">
          <div className="grid grid-cols-6 gap-2 m-8">
            {Array.from({ length: size * size }, (_, i) => (
              <div
                key={i}
                className="circle w-20 h-20 rounded-full bg-gray-500"
                id={`circle-${i}`}
              ></div>
            ))}
          </div>
        </div>
        <div className="border-8 border-slate-100 text-gray-200  m-2">
          <div className="flex flex-col items-center m-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">LockPad</h2>
              <div id="lockpad" className="text-xl">
                {lockPadCode.join(" ")}
              </div>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((num) => (
                  <button
                    key={num}
                    className="w-16 h-16 text-2xl text-gray-50 bg-gradient-to-r from-gray-100 to-gray-200 opacity-20 rounded-md"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 text-lg">{status}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
