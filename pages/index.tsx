import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import TrainingForm from "../components/TrainingForm";

type Day = {
  day: string,
  workout: string,
  mileage: number,
  originalText: string
};

type SavedDays = {
  day: Day,
  index: number
}


export default function Home(props : {apiKey: string}) {
  const [days, setDays] = useState<Day[]>([])
  const [savedDays, setSavedDays] = useState<SavedDays[]>([])

  const toggleSavedDay = (day: Day, index: number) => {
    const savedDay = savedDays.find(savedDay => savedDay.index === index)
    if (savedDay) {
      setSavedDays(savedDays.filter(savedDay => savedDay.index !== index))
    } else {
      setSavedDays([...savedDays, { day, index }])
    }
  }

  return (
    <PageWrapper>
      <TrainingForm onSubmit={setDays} savedDays={savedDays} apiKey={props.apiKey} />
      <ul className="list-none grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
        {days && days.map((day, index) => (
          <button key={index} className={`bg-gray-300 ${savedDays.find(savedDay => savedDay.index === index) && "bg-gray-400"} py-4 mb-4 lg:mb-0 shadow-2xl w-full flex content-center flex-col`} onClick={() => { toggleSavedDay(day, index) }}>
            <div className="font-bold text-lg w-full mb-2 text-center text-gray-600">{day.day}</div>
            <div className="text-gray-500 mx-4">{day.workout}</div>
          </button>
        ))}
      </ul>
      {days.length > 0 && (
        <div className="py-2 flex justify-between items-center mt-4 border-b border-t border-gray-700">
          <span className="font-bold text-gray-300">Total:</span>
          <span className="text-gray-400">{days.reduce((acc, day) => acc + (day.mileage || 0), 0)} Miles</span>
        </div>
      )}

    </PageWrapper>
  )
}


export function getStaticProps() {
  const apiKey = process.env.OPENAI_API_KEY
  return {
    props: {
      apiKey
    }
  }
}