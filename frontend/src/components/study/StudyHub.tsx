import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SubjectStudyTree, TopicDetail, Question } from '../../types';
import { api } from '../../api/client';
import { TopicMap } from './TopicMap';
import { QuestionDrill } from './QuestionDrill';
import { MaterialViewer } from './MaterialViewer';

interface StudyHubProps {
  userId: number;
}

export const StudyHub: React.FC<StudyHubProps> = ({ userId }) => {
  const [tree, setTree] = useState<SubjectStudyTree | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDrillTopic, setActiveDrillTopic] = useState<TopicDetail | null>(null);
  const [drillQuestions, setDrillQuestions] = useState<Question[]>([]);
  const [viewingMaterialTopic, setViewingMaterialTopic] = useState<TopicDetail | null>(null);

  const loadTree = async () => {
    setLoading(true);
    try {
      // Default to subject 1 (Operating Systems)
      const data = await api.getStudyTree(1, userId);
      setTree(data);
    } catch (err) {
      console.error("Failed to load study tree:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [userId]);

  const handleStartDrill = async (topic: TopicDetail) => {
    setLoading(true);
    try {
      const questions = await api.getTopicQuestions(topic.id);
      setDrillQuestions(questions);
      setActiveDrillTopic(topic);
    } catch (err) {
      console.error("Failed to load topic questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishDrill = () => {
    setActiveDrillTopic(null);
    setDrillQuestions([]);
    loadTree();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      {/* Active Drill View or Topic Map View */}
      {activeDrillTopic ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveDrillTopic(null)}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Topic Breakdown</span>
          </button>

          <QuestionDrill
            userId={userId}
            topicName={activeDrillTopic.name}
            topicId={activeDrillTopic.id}
            questions={drillQuestions}
            onFinish={handleFinishDrill}
          />
        </div>
      ) : (
        <TopicMap
          tree={tree}
          loading={loading}
          onStartDrill={handleStartDrill}
          onViewMaterial={(topic) => setViewingMaterialTopic(topic)}
        />
      )}

      {/* Formula Sheet & Material Viewer Modal */}
      {viewingMaterialTopic && (
        <MaterialViewer
          materials={viewingMaterialTopic.materials}
          topicName={viewingMaterialTopic.name}
          onClose={() => setViewingMaterialTopic(null)}
        />
      )}
    </div>
  );
};
