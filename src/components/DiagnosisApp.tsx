'use client';

import { useState, useEffect, useCallback } from 'react';
import { questions } from '@/data/questions';
import { feedbackMessages } from '@/data/feedback';
import type { Stage } from '@/lib/types';
import { captureUtmParams, sendGAEvent } from '@/lib/analytics';
import IntroScreen from './IntroScreen';
import QuestionScreen from './QuestionScreen';
import FormScreen from './FormScreen';
import LoadingScreen from './LoadingScreen';
import ResultScreen from './ResultScreen';

type Screen = 'intro' | 'question' | 'form' | 'loading' | 'result';

export default function DiagnosisApp() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [itemScores, setItemScores] = useState<number[]>([]);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setUtmParams(captureUtmParams());
  }, []);

  const startDiagnosis = useCallback(() => {
    setScreen('question');
    sendGAEvent('diagnosis_start');
  }, []);

  const selectAnswer = useCallback((score: number, text: string) => {
    setTotalScore((prev) => prev + score);
    setUserAnswers((prev) => [...prev, text]);
    setItemScores((prev) => [...prev, score]);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setScreen('form');
      sendGAEvent('diagnosis_complete', { score: totalScore + score });
    }
  }, [currentQuestion, totalScore]);

  const showLoading = useCallback((name: string) => {
    setUserName(name);
    setScreen('loading');
  }, []);

  const showResult = useCallback(() => {
    setScreen('result');
  }, []);

  const restart = useCallback(() => {
    setScreen('intro');
    setCurrentQuestion(0);
    setTotalScore(0);
    setUserAnswers([]);
    setItemScores([]);
    setUserName('');
  }, []);

  const getStage = (): Stage => {
    if (totalScore <= 5) return 'seed';
    if (totalScore <= 11) return 'tree';
    return 'forest';
  };

  const getAnalysisGroups = () => {
    const excellent: { index: number; name: string; score: number; feedback: string }[] = [];
    const normal: typeof excellent = [];
    const lacking: typeof excellent = [];

    itemScores.forEach((score, index) => {
      const item = {
        index,
        name: feedbackMessages[index].name,
        score,
        feedback: feedbackMessages[index][score],
      };
      if (score === 2) excellent.push(item);
      else if (score === 1) normal.push(item);
      else lacking.push(item);
    });

    return { excellent, normal, lacking };
  };

  return (
    <div className="container">
      {screen === 'intro' && (
        <IntroScreen onStart={startDiagnosis} />
      )}

      {screen === 'question' && (
        <QuestionScreen
          question={questions[currentQuestion]}
          currentIndex={currentQuestion}
          totalCount={questions.length}
          onAnswer={selectAnswer}
        />
      )}

      {screen === 'form' && (
        <FormScreen
          totalScore={totalScore}
          userAnswers={userAnswers}
          itemScores={itemScores}
          utmParams={utmParams}
          onSubmitSuccess={showLoading}
        />
      )}

      {screen === 'loading' && (
        <LoadingScreen onComplete={showResult} />
      )}

      {screen === 'result' && (
        <ResultScreen
          totalScore={totalScore}
          stage={getStage()}
          analysisGroups={getAnalysisGroups()}
          userName={userName}
          onRestart={restart}
        />
      )}
    </div>
  );
}
