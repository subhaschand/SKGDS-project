
import React from 'react';
import { AssessmentResult, RecommendationType } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

interface Props {
  result: AssessmentResult;
  onReset: () => void;
}

const ResultView: React.FC<Props> = ({ result, onReset }) => {
  const chartData = result.breakdown.map(b => ({
    topic: b.topicName,
    score: b.percentage,
    full: 100
  }));

  return (
    <div className="space-y-10 pb-20">
      <div className="bg-white rounded-3xl p-10 shadow-xl border border-blue-50 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <i className="fas fa-award text-9xl text-blue-600"></i>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Assessment Completed!</h1>
        <div className="text-6xl font-black text-blue-600 mb-4">{result.percentage.toFixed(1)}%</div>
        <p className="text-gray-500 max-w-md mx-auto">
          We've analyzed your performance across {result.breakdown.length} topics. 
          See your knowledge footprint below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border shadow-sm h-[400px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-blue-500"></i>
            Knowledge Footprint
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="topic" />
              <Radar name="Student Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-orange-500"></i>
            Identified Knowledge Gaps
          </h3>
          <div className="space-y-4">
            {result.gaps.length > 0 ? result.gaps.map((gap, i) => {
              const topic = result.breakdown.find(b => b.topicId === gap.topicId);
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <div>
                    <h4 className="font-bold text-orange-900">{topic?.topicName}</h4>
                    <p className="text-sm text-orange-700">Needs significant improvement</p>
                  </div>
                  <div className="text-xl font-black text-orange-600">{gap.weaknessScore.toFixed(0)}%</div>
                </div>
              );
            }) : (
              <div className="p-8 text-center bg-green-50 rounded-xl text-green-700">
                <i className="fas fa-check-circle text-3xl mb-2"></i>
                <p>Excellent! No critical gaps detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {result.recommendations.length > 0 && (
        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-lightbulb text-yellow-500"></i>
            Personalized Learning Path
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendations.map(rec => (
              <a 
                key={rec.id} 
                href={rec.url} 
                target="_blank" 
                rel="noreferrer"
                className="group flex items-start gap-4 p-4 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center ${rec.type === RecommendationType.VIDEO ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  <i className={`fas ${rec.type === RecommendationType.VIDEO ? 'fa-play' : 'fa-file-alt'}`}></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 group-hover:text-blue-500 uppercase tracking-wider mb-1">
                    {rec.type} Resource
                  </div>
                  <h4 className="font-bold text-gray-800">{rec.description}</h4>
                  <p className="text-sm text-gray-500">Click to start learning</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <button 
          onClick={onReset}
          className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultView;
