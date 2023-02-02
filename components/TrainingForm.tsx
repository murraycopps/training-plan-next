import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Day = {
  day: string;
  workout: string;
  mileage: number;
  originalText: string;
};

type SavedDays = {
  day: Day;
  index: number;
};

function getDays(text: string) {
  const lines = text.split("\n");
  const result = [];

  for (const line of lines) {
    if (line) {
      const [day, workout] = line.split(": ");
      if (day && workout) {
        const [workoutType] = workout.split(" ").map((a) => a.toLowerCase());
        if (
          workoutType === "workout" ||
          workoutType === "track" ||
          workoutType === "hills" ||
          workoutType === "hill"
        ) {
          const workoutText = line.split(": ")[1] + ": " + line.split(": ")[2];
          const mileage = line.split(": ")[line.split(": ").length - 1];


          result.push({
            day: day.trim(),
            workout: workoutText.trim(),
            mileage: parseInt(mileage),
            originalText: line,
          });
        } else if (workoutType === "rest") {
          result.push({
            day: day.trim(),
            workout: workout.trim(),
            mileage: 0,
            originalText: line,
          });
        } else if (workoutType === "long" || workoutType === "Long") {
          const workoutText = line.split(": ")[1] + ": " + line.split(": ")[2];

          // create an array storing all the words in mileage and set mileage to the number in the array
          const mileageArray = line.split(" ");

          const mileage = mileageArray.find(
            (element) => !isNaN(Number(element))
          );
          if (!mileage) {
            result.push({
              day: day.trim(),
              workout: workoutText.trim(),
              mileage: 0,
              originalText: line,
            });
            continue;
          }

          result.push({
            day: day.trim(),
            workout: workoutText.trim(),
            mileage: parseInt(mileage),
            originalText: line,
          });
        } else {
          const mileageArray = line.split(" ");

          const mileage = parseInt(
            mileageArray.find((element) => !isNaN(Number(element))) || "0"
          );


          if (!mileage) return [];

          result.push({
            day: day.trim(),
            workout: workout.trim(),
            mileage: mileage,
            originalText: line,
          });
        }
      }
    }
  }
  return result;
}

export default function TrainingForm({
  onSubmit,
  savedDays,
  apiKey,
}: {
  onSubmit: Dispatch<SetStateAction<Day[]>>;
  savedDays: SavedDays[];
  apiKey: string;
}) {
  const [experience, setExperience] = useState("");
  const [age, setAge] = useState("");
  const [normalMilage, setNormalMilage] = useState("");
  const [targetRace, setTargetRace] = useState("");
  const [workouts, setWorkouts] = useState("");
  const [loaded, setLoaded] = useState(true);
  const [restDays, setRestDays] = useState("");

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!loaded) return alert("Please wait for the previous request to finish");

    // if any of the fields are empty, don't submit
    if (!experience || !age || !normalMilage || !targetRace || !workouts)
      return alert("Please fill out all fields");

    setLoaded(false);

    try {
      const prompt = `Please generate a seven-day running plan for a runner preparing for the ${targetRace} race. The runner has an experience level of ${experience} and an age of ${age}, and typically runs ${normalMilage} miles per week, including ${workouts}. The plan should aim to closely match the runner's normal mileage, with a maximum deviation of 20% off of ${normalMilage}. The format for workout days should be: "Monday: Track workout - 4x400 race pace, total x miles," where x is the total numbers of miles ran during the workou including warmup and cooldown. For non-workout days, including long runs, specify the mileage and pace in this format: "Monday: 11 miles, easy pace." The plan should list days from Monday to Sunday and specify the type of run for each day. ${
        savedDays
          ? "The plan already includes: " +
            savedDays.map((savedDay) => savedDay.day.originalText).join("\n")
          : ""
      } `;
      // Set the request parameters
      const params = {
        model: "text-davinci-003",
        prompt,
        max_tokens: 2048,
      };

      // Make the request
      const response = await axios.post(
        "https://api.openai.com/v1/completions",
        params,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      // Print the response text
      // console.log(response.data.choices[0].text);
      const days = getDays(response.data.choices[0].text);
      console.log(days);

      // add the saved days to the generated days
      for (const savedDay of savedDays) {
        days[savedDay.index] = savedDay.day;
      }

      // check if a day is repeated
      const daysSet = new Set();
      for (const day of days) {
        if (daysSet.has(day.day)) {
          console.log(`day.day is ${day.day} and should not be repeated`);
          handleSubmit(event);
          return;
        }
        daysSet.add(day.day);
      }

      const totalMileage = days.reduce(
        (acc, day) => acc + (day.mileage || 0),
        0
      );

      if (
        totalMileage > parseInt(normalMilage) * 1.2 ||
        totalMileage < parseInt(normalMilage) * 0.8
      ) {
        console.log(
          `totalMileage is ${totalMileage} and normalMilage is ${normalMilage}`
        );
        handleSubmit(event);
      } else if (days.length !== 7) {
        console.log(`days.length is ${days.length} and should be 7`);
        handleSubmit(event);
      } else {
        onSubmit(days);
        setLoaded(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-600 shadow-2xl rounded-lg px-8 pt-6 pb-6 mb-4"
      >
        {!loaded && (
          <div className="bg-gray-300 h-full w-full absolute top-0 left-0 z-50">
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className="text-xl font-bold mt-4 text-center text-gray-600">
                Loading...
              </p>
            </div>
          </div>
        )}
        <h1 className="text-4xl font-bold text-center mb-4">
          Generate Training Plan
        </h1>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Experience:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Age:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Normal Milage:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={normalMilage}
              onChange={(event) => setNormalMilage(event.target.value)}
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Target Race:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={targetRace}
              onChange={(event) => setTargetRace(event.target.value)}
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Workouts:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={workouts}
              onChange={(event) => setWorkouts(event.target.value)}
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Rest Days:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={restDays}
              onChange={(event) => setRestDays(event.target.value)}
            />
          </label>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="hover:bg-gray-800 bg-gray-400 text-gray-600 hover:text-gray-300 w-full mx-16 mt-4 py-4 rounded-lg"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}
