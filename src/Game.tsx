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
  }, [finalPattern, correctCircles]);

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
      setStatus("ENTER THE PATTERN USING 'W' , 'S' , & 'Enter'.......!");
    }, 3000);
  }, [correctCircles]);

  const startGame = useCallback(() => {
    flashRandomCircles();
    setTimeout(flashFinalPattern, 6000);
  }, [flashFinalPattern, flashRandomCircles]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (status.includes("ENTER THE PATTERN")) {
        const key = event.key.toLowerCase();

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
              setLockPadCodeShow((prev) => [...prev, lockPadCodeShow.length]);
              setRevealedNumbers((prev) => new Set(prev).add(revealedDigit));
              if (lockPadCode.length === 0) {
                setStatus("HACK SUCCESSFUL!!");
              } else {
                setStatus(`SIGNAL ${generateRandomCode(1)} CONNECTED!!`);
                setRounds((prev: number) => prev + 1);
                setCurrentColumn(0);
                setUserPattern(Array.from({ length: columns }, () => []));
                setCorrectCircles(new Set());
              }
            }
          } else {
            setStatus("HACK FAILED!!");
            const selectedCircle = document.getElementById(
              `circle-${userPattern[currentColumn][0]}`
            );
            if (selectedCircle)
              selectedCircle.className =
                "circle w-20 h-20 rounded-full bg-red-500";
            setTimeout(() => {
              setRounds((prev: number) => prev + 1);
              setCurrentColumn(0);
              setUserPattern(Array.from({ length: columns }, () => []));
              setCorrectCircles(new Set());
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
            if (previousCircle && !correctCircles.has(highlightedCircle))
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

  return (
    <div className=" h-screen bg-gray-950 p-10">
      <h3 className="text-gray-200">{status}</h3>
      <div className="flex flex-row border-4 justify-center  text-gray-200 m-2 p-4">
        <div className="flex flex-col items-center text-gray-200 border-4 border-slate-100 p-4">
          <h2 className="text-2xl font-bold">CONECTION TIMEOUT</h2>
          {/* todo add clock */}
        </div>
        <div className="flex flex-col items-center text-gray-200 border-4 border-slate-100 p-4">
          <h2 className="text-2xl font-bold">ACCESS ATTEMPTS</h2>
          {/* add blocks */}
        </div>
      </div>
      <div className="flex flex-row justify-center">
        <div className="flex flex-row items-center justify-center text-gray-200 border-4 border-slate-100 p-4">
          <div className="flex flex-col border-4 border-slate-200 items-center m-2">
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
          <div className="border-4 border-slate-100 text-gray-200 m-2">
            <div className="flex flex-col items-center m-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold">DECRYPTED DIGITS</h2>
                {/* <div id="lockpad" className="text-xl">
                  {lockPadCodeShow.join(" ")}
                </div> */}
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((num) => (
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
