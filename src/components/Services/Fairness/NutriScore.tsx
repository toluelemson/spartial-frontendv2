import React from "react";
import "../../../MIConfusion.css";

interface NutriScoreProps {
  ageScore?: string;
  genderScore?: string;
}

const NutriScore: React.FC<NutriScoreProps> = ({ ageScore, genderScore }) => {
  const scores = ["A", "B", "C", "D", "E"];

  return (
    <div className="nutri-score-container">
      {genderScore && (
        <div className="nutri-score-row">
          {/* <span>Gender: </span> */}
          {scores.map((score) => (
            <div
              key={`gender-${score}`}
              className={`nutri-score-item nutri-score-${score} ${
                score === genderScore ? "highlight" : ""
              }`}
            >
              {score}
            </div>
          ))}
        </div>
      )}
      {ageScore && (
        <div className="nutri-score-row">
          {/* <span>Age: </span> */}
          {scores.map((score) => (
            <div
              key={`age-${score}`}
              className={`nutri-score-item nutri-score-${score} ${
                score === ageScore ? "highlight" : ""
              }`}
            >
              {score}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NutriScore;
