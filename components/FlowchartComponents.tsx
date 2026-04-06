import React from 'react';

interface ResultRow {
  studentName: string;
  courseName: string;
  courseCode: string;
  courseId: string;
  score: number;
}

// Flowchart Node Component
export const FlowchartNode: React.FC<{
  label: string;
  icon: string;
  color: string;
  score?: number;
  badge?: string;
  level: number;
}> = ({ label, icon, color, score, badge, level }) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'from-green-400 to-green-600';
    if (s >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className={`animate-pop-in`} style={{ animationDelay: `${level * 100}ms` }}>
      <div className={`relative`}>
        <div className={`${color} rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform w-48`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white text-lg">
              <i className={`fas fa-${icon}`}></i>
            </div>
            <span className="text-white font-black text-sm">{label}</span>
          </div>
          {score !== undefined && (
            <div className={`bg-gradient-to-r ${getScoreColor(score)} text-white rounded-xl px-3 py-2 font-black text-center text-lg`}>
              {score.toFixed(1)}%
            </div>
          )}
          {badge && (
            <div className="mt-2 text-white text-xs font-bold opacity-90">{badge}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Flowchart Connector Line
export const FlowchartLine: React.FC<{ horizontal?: boolean }> = ({ horizontal = false }) => (
  <div className={`flex items-center justify-center animate-fade-in`}>
    {horizontal ? (
      <div className="h-1 w-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
    ) : (
      <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
    )}
  </div>
);

// Flowchart View Component
export const AssessmentFlowchartView: React.FC<{
  filteredResults: ResultRow[];
}> = ({ filteredResults }) => {
  // Build flowchart data
  const courseResults = new Map<string, any>();
  filteredResults.forEach(result => {
    if (!courseResults.has(result.courseId)) {
      courseResults.set(result.courseId, {
        courseName: result.courseName,
        courseCode: result.courseCode,
        students: []
      });
    }
    courseResults.get(result.courseId).students.push(result);
  });

  return (
    <div className="animate-fade-in bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2rem] p-8 border shadow-sm overflow-x-auto">
      {filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <i className="fas fa-inbox text-6xl mb-4 opacity-30 animate-bounce-slow"></i>
          <p className="text-gray-400 font-semibold text-lg">No results to display in flowchart</p>
        </div>
      ) : (
        <div className="space-y-12 min-w-max px-4">
          {/* Main hub */}
          <div className="flex justify-center">
            <FlowchartNode
              label="Assessment Results"
              icon="chart-bar"
              color="bg-gradient-to-br from-blue-500 to-blue-700"
              badge={`${filteredResults.length} Submissions`}
              level={0}
            />
          </div>

          <div className="flex justify-center">
            <FlowchartLine />
          </div>

          {/* Courses Level */}
          <div className="flex flex-wrap justify-center gap-12">
            {Array.from(courseResults.values()).map((courseData, courseIndex) => (
              <div key={courseIndex} className="flex flex-col items-center gap-4">
                <FlowchartNode
                  label={courseData.courseName}
                  icon="book"
                  color="bg-gradient-to-br from-indigo-500 to-indigo-700"
                  badge={courseData.courseCode}
                  level={1}
                />

                <FlowchartLine />

                {/* Students Level */}
                <div className="flex flex-wrap justify-center gap-8">
                  {courseData.students.map((student: any, studentIndex: number) => (
                    <div key={studentIndex} className="flex flex-col items-center gap-4">
                      <FlowchartNode
                        label={student.studentName}
                        icon="user"
                        color="bg-gradient-to-br from-cyan-500 to-cyan-700"
                        score={student.score}
                        level={2}
                      />
                      {studentIndex < courseData.students.length - 1 && (
                        <div className="text-gray-300 text-xl">•</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
