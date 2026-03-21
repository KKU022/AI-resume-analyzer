import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import InterviewSession from '@/lib/db/models/InterviewSession';

type ApiError = {
  error: string;
  code?: string;
};

function jsonError(status: number, payload: ApiError) {
  return NextResponse.json(payload, { status });
}

// Interview question templates by role and difficulty
const INTERVIEW_QUESTIONS: Record<string, Record<string, string[]>> = {
  'Software Engineer': {
    beginner: [
      'Walk me through a project you built. What was the most challenging part?',
      'Explain the difference between async and await in JavaScript.',
      'What is RESTful API design? Can you give an example?',
    ],
    intermediate: [
      'Design a system that handles 1 million concurrent users. What are the key considerations?',
      'How would you optimize database queries in a large-scale application?',
      'Describe your approach to debugging a production issue you cannot reproduce locally.',
    ],
    advanced: [
      'How would you architect a microservices system for a social media platform?',
      'Explain your approach to system design trade-offs between consistency and availability.',
      'Walk us through your experience with distributed systems challenges and solutions.',
    ],
  },
  'Product Manager': {
    beginner: [
      'Tell us about a product you use daily and how you would improve it.',
      'Walk me through your process for gathering customer feedback.',
      'How do you prioritize features when you have limited resources?',
    ],
    intermediate: [
      'How would you measure success for a new feature launch?',
      'Describe your approach to making trade-offs between technical debt and feature velocity.',
      'Walk us through how you would launch a product in a completely new market.',
    ],
    advanced: [
      'Design a strategy to enter a market dominated by two established competitors.',
      'How would you structure your organization for rapid experimentation at scale?',
      'Walk us through your approach to building a data-driven product culture.',
    ],
  },
  'Data Scientist': {
    beginner: [
      'Explain what overfitting is and how you would prevent it.',
      'Walk me through your process for cleaning and preparing data.',
      'What is cross-validation and why is it important?',
    ],
    intermediate: [
      'How would you approach a problem with severely imbalanced data?',
      'Describe your experience with feature engineering. Give a concrete example.',
      'Walk us through your approach to selecting between multiple models.',
    ],
    advanced: [
      'Design a real-time anomaly detection system for production. What are the key challenges?',
      'How would you handle a situation where your model performs differently in production vs training?',
      'Describe your approach to building an ML system that continuously improves.',
    ],
  },
  'Default': {
    beginner: [
      'Tell us about yourself and your professional background.',
      'What attracted you to this role and company?',
      'Describe a time you overcame a significant challenge.',
    ],
    intermediate: [
      'Walk us through your approach to solving complex problems.',
      'How do you stay updated with industry trends and new technologies?',
      'Describe your experience working in cross-functional teams.',
    ],
    advanced: [
      'How would you approach a high-impact project with ambiguous requirements?',
      'Describe your leadership philosophy and how you drive team performance.',
      'Walk us through your long-term vision for your career and growth.',
    ],
  },
};

// Scoring logic based on answer quality
function scoreAnswer(question: string, answer: string): { score: number; feedback: string } {
  const answerLength = answer.trim().split(' ').length;

  // Minimum answer length check
  if (answerLength < 15) {
    return {
      score: 20,
      feedback: 'Your answer was too brief. Aim for detailed, specific examples with context.',
    };
  }

  // Check for structural indicators
  const hasExample = /example|specifically|such as|like|project|built/i.test(answer);
  const hasMetrics = /\d+%?|improved|increased|decreased|reduced|grew/i.test(answer);
  const hasReflection = /learned|realized|thought|reflection|insight|hindsight/i.test(answer);

  let score = 50; // Base score
  let feedback = '';

  if (hasExample) {
    score += 15;
    feedback += 'Good use of specific examples. ';
  } else {
    feedback += 'Consider adding concrete examples to your answer. ';
  }

  if (hasMetrics) {
    score += 15;
    feedback += 'Great use of metrics and measurable outcomes. ';
  } else {
    feedback += 'Try to include quantifiable results or metrics. ';
  }

  if (hasReflection) {
    score += 10;
    feedback += 'Excellent self-reflection and learning mindset. ';
  } else {
    feedback += 'Share what you learned or would do differently. ';
  }

  // Adjust for length
  if (answerLength > 150) {
    score += 15;
    feedback += 'Comprehensive response with good depth. ';
  } else if (answerLength < 50) {
    score -= 10;
    feedback += 'Try to provide more detail in your response. ';
  }

  // Cap score
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    feedback: feedback.trim() || 'Good effort. Focus on structure (situation, action, result).',
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, { error: 'Unauthorized' });
    }

    await connectDB();

    // Fetch recent interview sessions
    const sessions = await InterviewSession.find({
      userId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch best score
    const best = await InterviewSession.findOne({
      userId: session.user.id,
    })
      .sort({ overallScore: -1 })
      .select('overallScore role')
      .lean();

    return NextResponse.json({
      sessions,
      bestScore: best?.overallScore || 0,
      bestRole: best?.role || 'Not Started',
    });
  } catch (error: unknown) {
    console.error('Interview fetch error:', error);
    return jsonError(500, { error: 'Failed to fetch interview data' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, { error: 'Unauthorized' });
    }

    const body = await request.json();
    const { role = 'Default', difficulty = 'intermediate' } = body;

    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return jsonError(400, { error: 'Invalid difficulty level' });
    }

    await connectDB();

    // Get questions for the role
    const questions = INTERVIEW_QUESTIONS[role] || INTERVIEW_QUESTIONS['Default'];
    const difficultyQuestions = questions[difficulty as keyof typeof questions] || [];

    // Randomly select 3 questions
    const selectedQuestions = difficultyQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((question, index) => ({
        questionId: `q${index + 1}`,
        question,
        category: getDynamicCategory(question),
      }));

    // Create new interview session
    const interviewSession = await InterviewSession.create({
      userId: session.user.id,
      role,
      difficulty,
      totalQuestions: selectedQuestions.length,
      answers: [],
    });

    return NextResponse.json({
      sessionId: interviewSession._id,
      role,
      difficulty,
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
    });
  } catch (error: unknown) {
    console.error('Interview creation error:', error);
    return jsonError(500, { error: 'Failed to start interview' });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, { error: 'Unauthorized' });
    }

    const body = await request.json();
    const { sessionId, questionId, question, userAnswer } = body;

    if (!sessionId || !questionId || !question || !userAnswer) {
      return jsonError(400, { error: 'Missing required fields' });
    }

    await connectDB();

    // Find the interview session
    const interviewSession = await InterviewSession.findOne({
      _id: sessionId,
      userId: session.user.id,
    });

    if (!interviewSession) {
      return jsonError(404, { error: 'Interview session not found' });
    }

    // Score the answer
    const { score, feedback } = scoreAnswer(question, userAnswer);

    // Add answer to session
    interviewSession.answers.push({
      questionId,
      question,
      category: getDynamicCategory(question),
      userAnswer,
      score,
      feedback,
      timestamp: new Date(),
    } as any);

    // Calculate overall score
    if (interviewSession.answers.length > 0) {
      const totalScore = (interviewSession.answers as any[]).reduce((sum, ans) => sum + ans.score, 0);
      interviewSession.overallScore = Math.round(totalScore / interviewSession.answers.length);
    }

    // If all questions answered, mark as completed
    if (interviewSession.answers.length === interviewSession.totalQuestions) {
      interviewSession.completedAt = new Date();
    }

    await interviewSession.save();

    return NextResponse.json({
      score,
      feedback,
      overallScore: interviewSession.overallScore,
      progressCount: interviewSession.answers.length,
      totalQuestions: interviewSession.totalQuestions,
      isComplete: interviewSession.answers.length === interviewSession.totalQuestions,
    });
  } catch (error: unknown) {
    console.error('Answer submission error:', error);
    return jsonError(500, { error: 'Failed to submit answer' });
  }
}

function getDynamicCategory(question: string): string {
  if (/system|architecture|design|scale/.test(question)) return 'System Design';
  if (/technical|code|implement|algorithm/.test(question)) return 'Technical';
  if (/team|lead|communication|culture/.test(question)) return 'Leadership';
  if (/challenge|overcome|problem|difficult/.test(question)) return 'Behavioral';
  if (/why|interested|attracted|role/.test(question)) return 'Motivation';
  return 'General';
}
