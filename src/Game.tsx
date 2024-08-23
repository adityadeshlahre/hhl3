import React, { useState, useEffect, useCallback, KeyboardEvent } from "react";

const columns = 6;
const rows = 5;
const numberPad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", "0", "#"];

const generateRandomCode = (length: number): number[] => {
  const code: number[] = [];
  for (let i = 0; i < length; i++) {
    code.push(Math.floor(Math.random() * 10));
  }
  return code;
};

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);
const lockPadCode: number[] = generateRandomCode(4);

const Game: React.FC = () => {
  const [revealedNumbers, setRevealedNumbers] = useState<Set<string | number>>(
    new Set()
  );
  const [lockPadCodeShow, setLockPadCodeShow] = useState<number[]>([]);
  const [finalPattern, setFinalPattern] = useState<number[][]>([]);
  const [userPattern, setUserPattern] = useState<number[][]>(
    Array.from({ length: columns }, () => [])
  );
  const [currentColumn, setCurrentColumn] = useState<number>(0);
  const [rounds, setRounds] = useState<number>(0);
  const [status, setStatus] = useState<string>(
    "STARTING...........(LOADING.........)"
  );
  const [highlightedCircle, setHighlightedCircle] = useState<number | null>(
    null
  );
  const [correctCircles, setCorrectCircles] = useState<Set<number>>(new Set());
  const [wrongCircles, setWrongCircles] = useState<Set<number>>(new Set());
  const [attempts, setAttempts] = useState<number>(rounds + 1);
  const [timeLeft, setTimeLeft] = useState<number>(150);

  useEffect(() => {
    startGame();
  }, [rounds]);

  const clearCanvas = () => {
    const circles = document.querySelectorAll(".circle");
    circles.forEach((circle) => {
      const circleId = parseInt(circle.id.split("-")[1], 10);
      if (!correctCircles.has(circleId)) {
        circle.className = "circle w-20 h-20 rounded-full bg-gray-500";
      }
    });

    finalPattern.forEach((pattern) => {
      pattern.forEach((circleId) => {
        const circle = document.getElementById(`circle-${circleId}`);
        if (circle && correctCircles.has(circleId)) {
          circle.className = "circle w-20 h-20 rounded-full bg-blue-500";
        }
      });
    });

    wrongCircles.forEach((circleId) => {
      const circle = document.getElementById(`circle-${circleId}`);
      if (circle) {
        circle.className = "circle w-20 h-20 rounded-full bg-red-500";
      }
    });
  };

  const flashRandomCircles = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        clearCanvas();
        const flashedCircles = new Set<number>();

        for (let j = 0; j < columns; j++) {
          let randomIndex;
          do {
            randomIndex = getRandomInt(rows) * columns + j;
          } while (flashedCircles.has(randomIndex));

          flashedCircles.add(randomIndex);
          const circle = document.getElementById(`circle-${randomIndex}`);
          if (circle)
            circle.className = "circle w-20 h-20 rounded-full bg-red-500";
        }
      }, i * 1000);
    }
  }, [finalPattern, correctCircles, wrongCircles]);

  const flashFinalPattern = useCallback(() => {
    const newPattern: number[][] = Array.from({ length: columns }, () => []);
    for (let col = 0; col < columns; col++) {
      const rowIndex = getRandomInt(rows);
      newPattern[col].push(rowIndex * columns + col);
    }
    setFinalPattern(newPattern);

    const allValidIndices = newPattern.flat();

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        clearCanvas();

        allValidIndices.forEach((index) => {
          const circle = document.getElementById(`circle-${index}`);
          if (circle)
            circle.className = "circle w-20 h-20 rounded-full bg-green-500";
        });
      }, i * 1000);
    }

    setTimeout(() => {
      clearCanvas();
      setStatus("ENTER THE PATTERN USING 'W' , 'S'  & 'Enter'.......!");
    }, 3000);
  }, [correctCircles, wrongCircles]);

  const startGame = useCallback(() => {
    setAttempts(rounds + 2);
    setTimeLeft(150);
    flashRandomCircles();
    setTimeout(flashFinalPattern, 6000);
  }, [flashFinalPattern, flashRandomCircles, rounds]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")} : ${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (status.includes("ENTER THE PATTERN")) {
        const key = event.key.toLowerCase();

        if (status === "HACK FAILED!!") {
          return;
        }

        if (key === "enter") {
          if (
            userPattern[currentColumn][0] === finalPattern[currentColumn][0]
          ) {
            setCorrectCircles((prev) => {
              const newCorrectCircles = new Set(prev);
              newCorrectCircles.add(userPattern[currentColumn][0]);
              return newCorrectCircles;
            });
            setCurrentColumn((prev: number) => prev + 1);

            if (currentColumn === finalPattern.length - 1) {
              const revealedDigit = lockPadCode[0];
              lockPadCode.shift();
              // setLockPadCodeShow((prev) => [...prev, lockPadCodeShow.length]);
              setLockPadCodeShow((prev) => [...prev, revealedDigit]);
              setRevealedNumbers((prev) => new Set(prev).add(revealedDigit));
              if (lockPadCode.length === 0) {
                setStatus("HACK SUCCESSFUL!!");
              } else {
                setStatus(`SIGNAL ${generateRandomCode(1)} CONNECTED!!`);
                setRounds((prev: number) => prev + 1);
                setCurrentColumn(0);
                setUserPattern(Array.from({ length: columns }, () => []));
                setCorrectCircles(new Set());
                setAttempts(rounds + 2);
              }
            }
          } else {
            const wrongCircleId = userPattern[currentColumn][0];
            const selectedCircle = document.getElementById(
              `circle-${userPattern[currentColumn][0]}`
            );

            if (attempts > 0) {
              if (selectedCircle)
                selectedCircle.className =
                  "circle w-20 h-20 rounded-full bg-orange-500";

              setWrongCircles((prev) => new Set(prev).add(wrongCircleId));
              setAttempts((prev) => prev - 1);
            } else {
              if (selectedCircle)
                selectedCircle.className =
                  "circle w-20 h-20 rounded-full bg-red-500";

              setWrongCircles((prev) => new Set(prev).add(wrongCircleId));
              setStatus("HACK FAILED!!");
              // setStatus("GAME OVER!! TOO MANY FAILED ATTEMPTS!!");
            }

            setTimeout(() => {
              clearCanvas();
              setRounds((prev: number) => prev + 1);
              setCurrentColumn(0);
              setUserPattern(Array.from({ length: columns }, () => []));
              setCorrectCircles(new Set());
              setWrongCircles(new Set());
              setAttempts(rounds + 2);
            }, 5000);
          }
        } else if (key === "w" || key === "s") {
          const updateUserPattern = [...userPattern];
          let newIndex =
            userPattern[currentColumn][0] || currentColumn * columns;
          // let newIndex = userPattern[currentColumn][0];
          // let newIndex = userPattern[currentColumn][0] || finalPattern[currentColumn][0];

          switch (key) {
            case "w":
              if (userPattern[currentColumn].length === 0) {
                newIndex = currentColumn;
              } else if (newIndex - columns >= 0) {
                newIndex -= columns;
              }
              break;
            case "s":
              if (userPattern[currentColumn].length === 0) {
                newIndex = currentColumn;
              } else if (newIndex + columns < columns * rows) {
                newIndex += columns;
              }
              break;
          }

          updateUserPattern[currentColumn] = [newIndex];
          setUserPattern(updateUserPattern);

          if (highlightedCircle !== null) {
            const previousCircle = document.getElementById(
              `circle-${highlightedCircle}`
            );
            if (
              previousCircle &&
              !correctCircles.has(highlightedCircle) &&
              !wrongCircles.has(highlightedCircle)
            )
              previousCircle.className =
                "circle w-20 h-20 rounded-full bg-gray-500";
          }

          setHighlightedCircle(newIndex);
          const newCircle = document.getElementById(`circle-${newIndex}`);
          if (newCircle)
            newCircle.className = "circle w-20 h-20 rounded-full bg-yellow-500";
        }
      }
    },
    [
      status,
      finalPattern,
      currentColumn,
      userPattern,
      highlightedCircle,
      correctCircles,
      wrongCircles,
      flashFinalPattern,
      flashRandomCircles,
      startGame,
      attempts,
    ]
  );

  useEffect(() => {
    const handleKeyDownWrapper = (event: Event) =>
      handleKeyDown(event as unknown as KeyboardEvent);

    document.addEventListener("keydown", handleKeyDownWrapper);
    return () => {
      document.removeEventListener("keydown", handleKeyDownWrapper);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (status.includes("STARTING") || status.includes("HACK SUCCESSFUL"))
      return;

    if (timeLeft <= 0) {
      setStatus("HACK FAILED!!");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  return (
    <div className="h-screen bg-gray-950 p-10">
      <div className="flex justify-center">
        <h1 className=" text-4xl font-bold text-gray-300">{status}</h1>
      </div>
      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-2 border-4 border-slate-500 justify-center text-gray-300 m-2 p-4">
          <div className="flex flex-col items-center text-gray-300 border-4 border-slate-500 p-4">
            <h2 className="text-2xl font-bold">CONECTION TIMEOUT</h2>
            <div className="text-4xl mt-4">{formatTime(timeLeft)}</div>
          </div>
          <div className="flex flex-col items-center text-gray-300 border-4 border-slate-500 p-4">
            <h2 className="text-2xl font-bold">ACCESS ATTEMPTS</h2>
            <div className="flex flex-row space-x-2 mt-4">
              {Array.from({ length: attempts }).map((_, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center w-12 h-12 text-2xl bg-red-600 border-2 border-slate-50"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center">
        <div className="flex flex-row items-center justify-center text-gray-300 border-4 border-slate-500 p-4">
          <div className="flex flex-col border-4 border-slate-500 items-center m-2">
            <h2 className="text-2xl font-bold">SIGNAL RECEPTER</h2>
            <div className="grid grid-cols-6 grid-rows-5 gap-2 m-8">
              {Array.from({ length: columns * rows }, (_, i) => {
                const isCorrect = correctCircles.has(i);
                const className = `circle w-20 h-20 rounded-full ${
                  isCorrect ? "bg-blue-500" : "bg-gray-500"
                }`;
                return (
                  <div key={i} className={className} id={`circle-${i}`}></div>
                );
              })}
            </div>
            {/* scrample counter */}
          </div>
          <div className="border-4 border-slate-500 text-gray-300 m-2">
            <div className="flex flex-col items-center m-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold">DECRYPTED DIGITS</h2>
                {/* <div id="lockpad" className="text-xl">
                  {lockPadCodeShow.join(" ")}
                </div> */}
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2">
                  {numberPad.map((num) => (
                    <div className="border-2 border-slate-50" key={num}>
                      <button
                        className={`w-16 h-16 text-2xl ${
                          revealedNumbers.has(num)
                            ? "bg-gray-200 text-gray-950"
                            : "bg-gray-950 text-gray-100"
                        }`}
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
                    {lockPadCodeShow.map((num) => (
                      <div className="border-2 border-slate-50">
                        <button
                          key={num}
                          className="w-12 h-12 text-2xl bg-gray-200 text-gray-950"
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
