import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  Volume2,
  RotateCcw,
  Award,
} from "lucide-react";
import { aiService } from "../services/api.js";
import { AudioPlayerBar } from "../components/AudioPlayerBar.jsx";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";

const SAMPLE_LECTURES = [
  {
    subject: "Computer Science",
    text: `Today we examine search heuristics and algorithmic complexity.
A heuristic is an approach to problem-solving that employs a practical method not guaranteed to be optimal, perfect, or rational, but nevertheless sufficient for reaching an immediate, short-term goal.
In pathfinding, Dijkstra's algorithm searches exhaustively, whereas the A* algorithm synthesizes the actual distance traveled with an admissible heuristic function h(n) to drastically prune the search tree.
Minimizing cognitive complexity during software maintenance prevents regression bugs.`,
  },
  {
    subject: "Human Biology",
    text: `Cellular respiration is a metabolic pathway that breaks down glucose and produces ATP.
The stages include glycolysis in the cytoplasm, the citric acid cycle in the mitochondrial matrix, and oxidative phosphorylation along the inner mitochondrial membrane.
Oxygen acts as the terminal electron acceptor, without which anaerobic fermentation commences, accumulating lactic acid.`,
  },
];

export function LectureHelper() {
  const [subject, setSubject] = useState("Computer Science");
  const [transcript, setTranscript] = useState(SAMPLE_LECTURES[0].text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const { isPlaying, isPaused, speak, pause, resume, stop } = useSpeechSynthesis();

  const handleProcess = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError(null);
    setQuizAnswers({});
    setSubmittedQuiz(false);
    stop();

    try {
      const res = await aiService.lecture({
        transcriptOrNotes: transcript,
        subject,
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Failed to process lecture notes.");
      }
    } catch (err) {
      setError(err.message || "Failed to analyze study notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (submittedQuiz) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const calculateScore = () => {
    if (!result?.quiz) return 0;
    return result.quiz.reduce((score, q, idx) => {
      return quizAnswers[idx] === q.correctAnswerIndex ? score + 1 : score;
    }, 0);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Interactive Accessible Study Companion</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Lecture & Video Study Helper
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Turn classroom transcripts and study notes into structured summaries, key concept breakdowns, and self-test quizzes.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="subject-input" className="text-xs font-bold uppercase text-slate-400">
              Subject:
            </label>
            <input
              id="subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science, Civics"
              className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-semibold focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Samples:</span>
            {SAMPLE_LECTURES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSubject(s.subject);
                  setTranscript(s.text);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 transition"
              >
                {s.subject}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={5}
          placeholder="Paste lecture transcript, video captions, or study material here..."
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-base leading-relaxed focus:outline-none focus:border-blue-500"
        />

        <div className="flex justify-end pt-2">
          <button
            onClick={handleProcess}
            disabled={loading || !transcript.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-blue-950 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Generating Study Companion..." : "Generate Summary & Quiz"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-sm font-medium"
        >
          {error}
        </div>
      )}

      {/* Generated Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary */}
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">{result.title}</h2>
              <button
                onClick={() => speak(result.summary)}
                aria-label="Listen to summary"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-base text-slate-200 leading-relaxed">{result.summary}</p>
          </div>

          {/* Key Points */}
          {result.keyPoints && result.keyPoints.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white">Core Concepts & Takeaways</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-950 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-200">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Terms Glossary */}
          {result.glossary && result.glossary.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white">Terminology Glossary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.glossary.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-sm font-extrabold text-blue-300 block mb-1">
                      {item.term}
                    </span>
                    <p className="text-xs text-slate-300 leading-normal">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Quiz */}
          {result.quiz && result.quiz.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/50 card-contrast shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Interactive Revision Quiz</h3>
                </div>

                {submittedQuiz && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 text-xs font-bold">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>
                      Score: {calculateScore()} / {result.quiz.length}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {result.quiz.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[qIdx];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctAnswerIndex;

                  return (
                    <div
                      key={qIdx}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <span className="text-sm font-bold text-slate-100 block">
                        Question {qIdx + 1}: {q.question}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnStyle = "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200";

                          if (submittedQuiz) {
                            if (optIdx === q.correctAnswerIndex) {
                              btnStyle = "bg-emerald-950 border-emerald-500 text-emerald-200 font-bold";
                            } else if (isOptionSelected) {
                              btnStyle = "bg-rose-950 border-rose-500 text-rose-200";
                            }
                          } else if (isOptionSelected) {
                            btnStyle = "bg-indigo-600 border-indigo-400 text-white font-bold";
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {submittedQuiz && optIdx === q.correctAnswerIndex && (
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                              {submittedQuiz && isOptionSelected && optIdx !== q.correctAnswerIndex && (
                                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {submittedQuiz && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                          <span className="font-bold text-indigo-400">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Submit button */}
              <div className="flex justify-end gap-3 pt-2">
                {submittedQuiz ? (
                  <button
                    onClick={() => {
                      setSubmittedQuiz(false);
                      setQuizAnswers({});
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSubmittedQuiz(true)}
                    disabled={Object.keys(quizAnswers).length === 0}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg"
                  >
                    Check Answers
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center">⚠️ {result.disclaimer}</p>
        </div>
      )}

      {result && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={speak}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          textToRead={`${result.title}. ${result.summary}`}
          title="Narrating Lecture Summary"
        />
      )}
    </div>
  );
}
